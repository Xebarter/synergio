'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Try to get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }
        
        // Try a simple database query
        const { data, error: queryError } = await supabase
          .from('products')
          .select('count')
          .limit(1);
          
        if (queryError) {
          throw new Error(`Query error: ${queryError.message}`);
        }
        
        setConnectionStatus('✅ Successfully connected to Supabase');
      } catch (err) {
        console.error('Connection test failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setConnectionStatus('❌ Failed to connect to Supabase');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className="p-4 rounded-lg bg-gray-100">
        <p className="font-medium">{connectionStatus}</p>
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
            <p>Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}