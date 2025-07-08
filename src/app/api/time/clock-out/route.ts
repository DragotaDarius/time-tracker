import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';

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

    // Find active session
    const { data: activeSession, error: sessionError } = await supabase
      .from('work_sessions')
      .select('id, start_time, project_id, notes')
      .eq('user_id', user.id)
      .is('end_time', null)
      .single();

    if (sessionError) {
      if (sessionError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No active session found' },
          { status: 404 }
        );
      }
      console.error('Error finding active session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to find active session' },
        { status: 500 }
      );
    }

    if (!activeSession) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 404 }
      );
    }

    // End the session
    const endTime = new Date().toISOString();
    const { data: updatedSession, error: updateError } = await supabase
      .from('work_sessions')
      .update({
        end_time: endTime,
      })
      .eq('id', activeSession.id)
      .select(`
        id,
        user_id,
        project_id,
        start_time,
        end_time,
        notes,
        is_billable,
        created_at
      `)
      .single();

    if (updateError) {
      console.error('Error ending work session:', updateError);
      return NextResponse.json(
        { error: 'Failed to end work session' },
        { status: 500 }
      );
    }

    // Calculate duration
    const startTime = new Date(activeSession.start_time);
    const endTimeDate = new Date(endTime);
    const durationMs = endTimeDate.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    return NextResponse.json({
      message: 'Work session ended successfully',
      session: updatedSession,
      duration: {
        milliseconds: durationMs,
        hours: durationHours,
        formatted: `${Math.floor(durationHours)}h ${Math.floor((durationHours % 1) * 60)}m`,
        formattedWithSeconds: `${Math.floor(durationHours).toString().padStart(2, '0')}:${Math.floor((durationHours % 1) * 60).toString().padStart(2, '0')}:${Math.floor((durationMs % (1000 * 60)) / 1000).toString().padStart(2, '0')}`,
      },
    });

  } catch (error) {
    console.error('Clock-out API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 