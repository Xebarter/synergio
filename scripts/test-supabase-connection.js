const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Anon Key in .env file');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔌 Testing Supabase connection...');
    
    // Test auth endpoint
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Supabase auth error:', authError.message);
    } else {
      console.log('✅ Successfully connected to Supabase Auth');
    }

    // Test database connection through Supabase
    const { data, error } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename')
      .limit(5);

    if (error) {
      console.error('❌ Supabase database error:', error.message);
      console.log('\nThis might be expected if no tables exist yet.');
    } else {
      console.log('✅ Successfully connected to Supabase database');
      if (data && data.length > 0) {
        console.log('\nFound tables:');
        data.forEach(table => {
          console.log(`- ${table.schemaname}.${table.tablename}`);
        });
      } else {
        console.log('\nNo tables found. Your database is empty.');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testConnection();
