import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database';

// Lazy initialization to avoid build-time errors
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient<Database>>, {
  get(target, prop) {
    if (!browserClient) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        throw new Error('Supabase URL and API key are required');
      }
      
      browserClient = createBrowserClient<Database>(url, key);
    }
    return browserClient[prop as keyof typeof browserClient];
  }
});

export const createServerSupabaseClient = (cookies: any) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase URL and API key are required');
  }
  
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookies.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookies.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}; 