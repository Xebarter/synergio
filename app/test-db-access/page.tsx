'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestDBAccess() {
  const [status, setStatus] = useState<string>('Checking database access...');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const testDBAccess = async () => {
      try {
        setStatus('Attempting to access products table...');
        
        // Try to access the products table
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(1);

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        setStatus('Successfully accessed database');
        setResults({
          message: 'Database access successful',
          rowCount: data?.length || 0,
          sampleData: data
        });
      } catch (err) {
        console.error('DB Access Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('Failed to access database');
      }
    };

    testDBAccess();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Database Access Test</h1>
      <div className="p-4 rounded-lg bg-gray-100">
        <p className="font-medium">{status}</p>
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
            <p>Error: {error}</p>
          </div>
        )}
        {results && (
          <div className="mt-2 p-2 bg-green-100 text-green-800 rounded">
            <p>Results: {JSON.stringify(results, null, 2)}</p>
          </div>
        )}
      </div>
    </div>
  );
}