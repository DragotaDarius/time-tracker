import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  organizationName: z.string().min(1, 'Organization name is required'),
  organizationSubdomain: z.string().min(1, 'Organization subdomain is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(req: NextRequest) {
  try {
    console.log('Signup API called');
    const body = await req.json();
    console.log('Request body:', body);
    const validatedData = signupSchema.parse(body);
    console.log('Validated data:', validatedData);
    
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    // Check if user already exists
    const { data: currentUser } = await supabase.auth.getUser();
    if (currentUser.user) {
      return NextResponse.json(
        { error: 'User already authenticated' },
        { status: 400 }
      );
    }

    // Check if organization subdomain is available
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('subdomain', validatedData.organizationSubdomain)
      .single();

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization subdomain already taken' },
        { status: 400 }
      );
    }

    // Use service role client for privileged actions
    console.log('Creating service role client...');
    const serviceRoleClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    console.log('Service role client created');

    // Check if user already exists
    console.log('Checking if user already exists...');
    let authData;
    let isExistingUser = false;
    
    try {
      const { data: existingUserData } = await serviceRoleClient.auth.admin.listUsers();
      const userExists = existingUserData.users.find(user => user.email === validatedData.email);
      
      if (userExists) {
        console.log('User already exists, using existing user');
        authData = { user: userExists };
        isExistingUser = true;
      } else {
        console.log('User does not exist, creating new user...');
        // Create user account using service role (bypasses email confirmation)
        const { data: newUserData, error: authError } = await serviceRoleClient.auth.admin.createUser({
          email: validatedData.email,
          password: validatedData.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: validatedData.fullName,
          },
        });

        if (authError) {
          console.error('User creation error:', authError);
          return NextResponse.json(
            { error: authError.message },
            { status: 400 }
          );
        }

        if (!newUserData.user) {
          return NextResponse.json(
            { error: 'Failed to create user account' },
            { status: 500 }
          );
        }

        authData = newUserData;
      }
    } catch (error) {
      console.error('Error checking/creating user:', error);
      return NextResponse.json(
        { error: 'Failed to check or create user account' },
        { status: 500 }
      );
    }

    console.log('User ID:', authData.user.id, 'Existing user:', isExistingUser);

    // Create organization
    console.log('Creating organization...');
    const { data: organization, error: orgError } = await serviceRoleClient
      .from('organizations')
      .insert({
        name: validatedData.organizationName,
        subdomain: validatedData.organizationSubdomain,
      })
      .select()
      .single();
    console.log('Organization result:', { organization, orgError });

    if (orgError) {
      console.error('Organization creation error:', orgError);
      // Clean up the created user if organization creation fails
      await serviceRoleClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create organization', details: orgError.message },
        { status: 500 }
      );
    }

    // Set organization_id in user metadata
    await serviceRoleClient.auth.admin.updateUserById(authData.user.id, {
      user_metadata: {
        organization_id: organization.id,
      },
    });

    // Create user profile with retry logic
    console.log('Creating user profile...');
    const profileData = {
      id: authData.user.id,
      organization_id: organization.id,
      email: validatedData.email,
      full_name: validatedData.fullName,
      role: 'admin', // First user is admin
    };
    console.log('Profile data:', profileData);
    
    // Check if user profile already exists
    console.log('Checking if user profile already exists...');
    const { data: existingProfile } = await serviceRoleClient
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    let profileError = null;
    
    if (existingProfile) {
      console.log('User profile already exists, skipping creation');
    } else {
      // Add a small delay to ensure user is fully committed
      console.log('Waiting 1 second for user to be fully committed...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify user exists in auth.users before creating profile
      console.log('Verifying user exists in auth.users...');
      const { data: userCheck, error: userCheckError } = await serviceRoleClient.auth.admin.getUserById(authData.user.id);
      
      if (userCheckError || !userCheck.user) {
        console.error('User verification failed:', userCheckError);
        profileError = userCheckError || new Error('User not found in auth.users');
      } else {
        console.log('User verified, creating profile...');
        // Create user profile (user should be immediately available with service role)
        const { error } = await serviceRoleClient
          .from('user_profiles')
          .insert(profileData);
        
        profileError = error;
        console.log('Profile creation result:', { profileError });
      }
    }
    
    console.log('Profile result:', { profileError });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Clean up if profile creation fails
      await serviceRoleClient.auth.admin.deleteUser(authData.user.id);
      await serviceRoleClient.from('organizations').delete().eq('id', organization.id);
      return NextResponse.json(
        { error: 'Failed to create user profile', details: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: authData.user.id,
        email: validatedData.email,
        full_name: validatedData.fullName,
        organization_id: organization.id,
        role: 'admin',
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 