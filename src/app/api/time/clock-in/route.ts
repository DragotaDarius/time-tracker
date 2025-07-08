import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';
import { z } from 'zod';

const clockInSchema = z.object({
  project_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if user already has an active session
    const { data: activeSession, error: sessionCheckError } = await supabase
      .from('work_sessions')
      .select('id, start_time')
      .eq('user_id', user.id)
      .is('end_time', null)
      .single();

    if (sessionCheckError && sessionCheckError.code !== 'PGRST116') {
      console.error('Error checking active session:', sessionCheckError);
      return NextResponse.json(
        { error: 'Failed to check active session' },
        { status: 500 }
      );
    }

    if (activeSession) {
      return NextResponse.json(
        { error: 'You already have an active session' },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validatedData = clockInSchema.parse(body);

    // If project_id is provided, verify it belongs to the organization
    if (validatedData.project_id) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', validatedData.project_id)
        .eq('organization_id', profile.organization_id)
        .single();

      if (projectError || !project) {
        return NextResponse.json(
          { error: 'Project not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Create new work session
    const { data: session, error: createError } = await supabase
      .from('work_sessions')
      .insert({
        user_id: user.id,
        project_id: validatedData.project_id,
        start_time: new Date().toISOString(),
        notes: validatedData.notes,
        is_billable: true,
      })
      .select(`
        id,
        user_id,
        project_id,
        start_time,
        notes,
        is_billable,
        created_at
      `)
      .single();

    if (createError) {
      console.error('Error creating work session:', createError);
      return NextResponse.json(
        { error: 'Failed to start work session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Work session started successfully',
      session,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Clock-in API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 