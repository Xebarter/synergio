const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkDatabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );

  console.log('Checking database access...');

  try {
    // Try to access the users table first to see if we can access any table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (usersError) {
      console.error('Error accessing users table:', usersError.message);
    } else {
      console.log('Successfully accessed users table');
    }

    // Try to list all tables
    console.log('Attempting to list tables...');
    
    // Try a raw SQL query to get table information
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables');

    if (tablesError) {
      console.error('Error getting tables:', tablesError.message);
    } else {
      console.log('Available tables:', tables);
    }

    // Try to get table information from information_schema
    const { data: tableInfo, error: tableInfoError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tableInfoError) {
      console.error('Error getting table info:', tableInfoError.message);
    } else {
      console.log('Tables in public schema:');
      tableInfo.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
  } catch (error) {
    console.error('Database check failed:', error);
    process.exit(1);
  }
}

checkDatabase();