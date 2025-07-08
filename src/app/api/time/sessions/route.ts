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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const projectId = searchParams.get('project_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    // Build query
    let query = supabase
      .from('work_sessions')
      .select(`
        id,
        user_id,
        project_id,
        start_time,
        end_time,
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
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add filters
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (dateFrom) {
      query = query.gte('start_time', dateFrom);
    }

    if (dateTo) {
      query = query.lte('start_time', dateTo);
    }

    const { data: sessions, error: sessionsError } = await query;

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    // Calculate durations and format data
    const formattedSessions = sessions?.map(session => {
      let duration = null;
      let isActive = false;

      if (session.end_time) {
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time);
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        
        duration = {
          milliseconds: durationMs,
          hours: durationHours,
          formatted: `${Math.floor(durationHours)}h ${Math.floor((durationHours % 1) * 60)}m`,
          formattedWithSeconds: `${Math.floor(durationHours).toString().padStart(2, '0')}:${Math.floor((durationHours % 1) * 60).toString().padStart(2, '0')}:${Math.floor((durationMs % (1000 * 60)) / 1000).toString().padStart(2, '0')}`,
        };
      } else {
        isActive = true;
        const startTime = new Date(session.start_time);
        const now = new Date();
        const durationMs = now.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        
        duration = {
          milliseconds: durationMs,
          hours: durationHours,
          formatted: `${Math.floor(durationHours)}h ${Math.floor((durationHours % 1) * 60)}m`,
          formattedWithSeconds: `${Math.floor(durationHours).toString().padStart(2, '0')}:${Math.floor((durationHours % 1) * 60).toString().padStart(2, '0')}:${Math.floor((durationMs % (1000 * 60)) / 1000).toString().padStart(2, '0')}`,
        };
      }

      return {
        ...session,
        duration,
        isActive,
      };
    }) || [];

    return NextResponse.json({
      sessions: formattedSessions,
      total: formattedSessions.length,
      hasMore: formattedSessions.length === limit,
    });

  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 