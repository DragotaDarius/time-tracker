import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    console.log('[Login API] Request received');
    const body = await req.json();
    console.log('[Login API] Request body:', body);
    const validatedData = loginSchema.parse(body);
    console.log('[Login API] Validated data:', validatedData);
    
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });
    console.log('[Login API] Auth result:', { data, error });

    if (error) {
      console.error('[Login API] Auth error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    if (!data.user) {
      console.error('[Login API] No user returned after auth');
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Get user profile
    console.log('[Login API] Getting user profile for user ID:', data.user.id);
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    console.log('[Login API] Profile query result:', { profile, profileError });

    if (profileError) {
      console.error('[Login API] Profile error details:', profileError);
      return NextResponse.json(
        { error: 'User profile not found', details: profileError.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile.full_name,
        organization_id: profile.organization_id,
        role: profile.role,
      },
      session: data.session,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[Login API] Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Login API] Internal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 