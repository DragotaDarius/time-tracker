'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Square, Users, FolderOpen, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import LiveTimer from '@/components/LiveTimer';

interface Session {
  id: string;
  start_time: string;
  end_time?: string;
  notes?: string;
  duration?: {
    formatted: string;
    formattedWithSeconds: string;
    hours: number;
  };
  isActive?: boolean;
  projects?: {
    id: string;
    name: string;
    color: string;
  };
}

interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: string;
}

export default function DashboardPage() {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isClockInLoading, setIsClockInLoading] = useState(false);
  const [isClockOutLoading, setIsClockOutLoading] = useState(false);
  const [todayHours, setTodayHours] = useState(0);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentSession();
      fetchRecentSessions();
      fetchProjects();
      fetchTodayHours();
    }
  }, [isAuthenticated]);

  const fetchCurrentSession = async () => {
    try {
      const response = await fetch('/api/time/current-session');
      const data = await response.json();
      setCurrentSession(data.session);
    } catch (error) {
      console.error('Error fetching current session:', error);
    }
  };

  const fetchRecentSessions = async () => {
    try {
      const response = await fetch('/api/time/sessions?limit=5');
      const data = await response.json();
      setRecentSessions(data.sessions);
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTodayHours = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/time/sessions?date_from=${today}`);
      const data = await response.json();
      
      const totalHours = data.sessions.reduce((acc: number, session: Session) => {
        return acc + (session.duration?.hours || 0);
      }, 0);
      
      setTodayHours(totalHours);
    } catch (error) {
      console.error('Error fetching today hours:', error);
    }
  };

  const handleClockIn = async () => {
    setIsClockInLoading(true);
    try {
      const response = await fetch('/api/time/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        await fetchCurrentSession();
        await fetchRecentSessions();
        await fetchTodayHours();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to clock in');
      }
    } catch (error) {
      console.error('Error clocking in:', error);
      alert('Failed to clock in');
    } finally {
      setIsClockInLoading(false);
    }
  };

  const handleClockOut = async () => {
    setIsClockOutLoading(true);
    try {
      const response = await fetch('/api/time/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Session ended! Duration: ${data.duration.formatted}`);
        setCurrentSession(null);
        await fetchRecentSessions();
        await fetchTodayHours();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to clock out');
      }
    } catch (error) {
      console.error('Error clocking out:', error);
      alert('Failed to clock out');
    } finally {
      setIsClockOutLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {profile?.full_name || user?.email}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayHours.toFixed(1)}h</div>
            {currentSession ? (
              <div className="mt-2">
                <LiveTimer startTime={currentSession.start_time} className="text-sm" />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No active session
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {projects.length} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              View team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Weekly summary
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Tracking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Session */}
        <Card>
          <CardHeader>
            <CardTitle>Current Session</CardTitle>
            <CardDescription>
              {currentSession ? 'You are currently working' : 'No active session'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentSession ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {currentSession.projects?.name || 'No project assigned'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Started at {new Date(currentSession.start_time).toLocaleTimeString()}
                    </p>
                  </div>
                  <LiveTimer startTime={currentSession.start_time} />
                </div>
                {currentSession.notes && (
                  <p className="text-sm text-gray-600">{currentSession.notes}</p>
                )}
                <Button 
                  onClick={handleClockOut} 
                  disabled={isClockOutLoading}
                  className="w-full"
                  variant="destructive"
                >
                  {isClockOutLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Stopping...
                    </div>
                  ) : (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Stop Session
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Ready to start working?</p>
                <Button 
                  onClick={handleClockIn} 
                  disabled={isClockInLoading}
                  className="w-full"
                >
                  {isClockInLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Starting...
                    </div>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Session
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your latest work sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">
                        {session.projects?.name || 'No project'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(session.start_time).toLocaleDateString()} - {session.duration?.formatted}
                      </p>
                    </div>
                    <Badge variant={session.isActive ? "default" : "secondary"}>
                      {session.isActive ? 'Active' : 'Completed'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">No recent sessions</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" onClick={() => router.push('/projects')}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Projects
              </Button>
              <Button variant="outline" onClick={() => router.push('/users')}>
                <Users className="h-4 w-4 mr-2" />
                Team
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Reports
              </Button>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
} 