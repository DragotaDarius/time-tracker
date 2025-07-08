'use client';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children, session }: { children: ReactNode; session?: Session }) {
  return (
    <SessionProvider session={session}>
      <SessionContextProvider supabaseClient={supabase} initialSession={session}>
        {children}
      </SessionContextProvider>
    </SessionProvider>
  );
} 