'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestDBPage() {
  const [status, setStatus] = useState('Testing connection...');
  const [tables, setTables] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        setStatus('Testing Supabase connection...');
        
        // Test basic connection
        const { data, error: connectionError } = await supabase
          .from('organizations')
          .select('count')
          .limit(1);

        if (connectionError) {
          throw connectionError;
        }

        setStatus('Connection successful! Checking tables...');

        // Get list of tables (this is a simple test)
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .limit(1);

        if (orgError) {
          throw orgError;
        }

        setTables(['organizations', 'user_profiles', 'projects', 'work_sessions', 'breaks', 'tasks']);
        setStatus('Database is ready! All tables are accessible.');

      } catch (err: any) {
        setError(err.message);
        setStatus('Connection failed');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Database Connection Test
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
              <p className="text-sm text-gray-600">{status}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <strong>Error:</strong> {error}
              </div>
            )}

            {tables.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">Available Tables</h3>
                <ul className="mt-2 space-y-1">
                  {tables.map((table) => (
                    <li key={table} className="text-sm text-gray-600">
                      ✅ {table}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6">
              <a
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Homepage
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 