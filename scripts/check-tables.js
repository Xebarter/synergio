const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('Checking database tables...');

// Check if environment variables are set
if (!process.env.SUPABASE_URL) {
  console.error('❌ SUPABASE_URL is not set');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
  process.exit(1);
}

console.log('✅ Environment variables are set');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

async function checkTables() {
  try {
    console.log('Checking if products table exists...');
    
    // List all tables
    const { data: tables, error: tablesError } = await supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (tablesError) {
      console.error('❌ Error accessing products table:', tablesError.message);
      console.error('This might mean the table does not exist or there is a permission issue');
      
      // Try to list all tables to see what's available
      console.log('Attempting to list all available tables...');
      
      // For Supabase, we need to check the information schema
      process.exit(1);
    }

    console.log('✅ Successfully accessed products table');
    console.log(`Found ${tables?.length || 0} rows in products table`);
    
  } catch (error) {
    console.error('❌ Failed to check tables:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

checkTables();