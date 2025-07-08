export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          subdomain: string | null;
          settings: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subdomain?: string | null;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subdomain?: string | null;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          organization_id: string | null;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'manager' | 'employee';
          timezone: string;
          settings: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'manager' | 'employee';
          timezone?: string;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'manager' | 'employee';
          timezone?: string;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          client_name: string | null;
          hourly_rate: number | null;
          budget_hours: number | null;
          status: 'active' | 'completed' | 'archived';
          color: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          client_name?: string | null;
          hourly_rate?: number | null;
          budget_hours?: number | null;
          status?: 'active' | 'completed' | 'archived';
          color?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          client_name?: string | null;
          hourly_rate?: number | null;
          budget_hours?: number | null;
          status?: 'active' | 'completed' | 'archived';
          color?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      work_sessions: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          start_time: string;
          end_time: string | null;
          notes: string | null;
          is_billable: boolean;
          hourly_rate: number | null;
          calendar_event_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          start_time: string;
          end_time?: string | null;
          notes?: string | null;
          is_billable?: boolean;
          hourly_rate?: number | null;
          calendar_event_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          start_time?: string;
          end_time?: string | null;
          notes?: string | null;
          is_billable?: boolean;
          hourly_rate?: number | null;
          calendar_event_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      breaks: {
        Row: {
          id: string;
          session_id: string;
          break_type: 'lunch' | 'short' | 'personal' | 'meeting';
          start_time: string;
          end_time: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          break_type: 'lunch' | 'short' | 'personal' | 'meeting';
          start_time: string;
          end_time?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          break_type?: 'lunch' | 'short' | 'personal' | 'meeting';
          start_time?: string;
          end_time?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          description: string | null;
          estimated_hours: number | null;
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to: string | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          description?: string | null;
          estimated_hours?: number | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          description?: string | null;
          estimated_hours?: number | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assigned_to?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']; 