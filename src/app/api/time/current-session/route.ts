import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
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

    // Find active session
    const { data: activeSession, error: sessionError } = await supabase
      .from('work_sessions')
      .select(`
        id,
        user_id,
        project_id,
        start_time,
        notes,
        is_billable,
        hourly_rate,
        created_at,
        projects (
          id,
          name,
          color
        )
      `)
      .eq('user_id', user.id)
      .is('end_time', null)
      .single();

    if (sessionError) {
      if (sessionError.code === 'PGRST116') {
        return NextResponse.json({
          session: null,
          isActive: false,
        });
      }
      console.error('Error finding active session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to find active session' },
        { status: 500 }
      );
    }

    if (!activeSession) {
      return NextResponse.json({
        session: null,
        isActive: false,
      });
    }

    // Calculate current duration
    const startTime = new Date(activeSession.start_time);
    const now = new Date();
    const durationMs = now.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    const sessionWithDuration = {
      ...activeSession,
      duration: {
        milliseconds: durationMs,
        hours: durationHours,
        formatted: `${Math.floor(durationHours)}h ${Math.floor((durationHours % 1) * 60)}m`,
        formattedWithSeconds: `${Math.floor(durationHours).toString().padStart(2, '0')}:${Math.floor((durationHours % 1) * 60).toString().padStart(2, '0')}:${Math.floor((durationMs % (1000 * 60)) / 1000).toString().padStart(2, '0')}`,
      },
      isActive: true,
    };

    return NextResponse.json({
      session: sessionWithDuration,
      isActive: true,
    });

  } catch (error) {
    console.error('Current session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 