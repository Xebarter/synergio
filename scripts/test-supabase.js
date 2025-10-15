const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('Testing Supabase connection...');

// Check if environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
  process.exit(1);
}

console.log('✅ Environment variables are set');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

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

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try a simple query to test connection
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Error connecting to database:', error.message);
      console.error('Error details:', error);
      process.exit(1);
    }

    console.log('✅ Successfully connected to Supabase database');
    console.log('Test query completed successfully');
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

testConnection();