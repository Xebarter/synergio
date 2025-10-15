const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkProductsTable() {
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

  console.log('Checking products table structure...');

  try {
    // Try to get table information
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error accessing products table:', error.message);
      console.error('This might mean the table does not exist or there is a permission issue');
      
      // Let's try to list all tables
      console.log('Attempting to list all available tables...');
      
      // Try a different approach to see what tables exist
      const { data: tables, error: tablesError } = await supabase
        .from('products')
        .select('id,name,description,price,sku,stock,image,created_at,updated_at')
        .limit(1)
        .maybeSingle();

      if (tablesError) {
        console.error('Error with basic query:', tablesError.message);
      } else {
        console.log('Basic query successful, sample data:', tables);
      }
      
      process.exit(1);
    }

    console.log('Successfully accessed products table');
    console.log('Sample row structure:', data?.[0] || 'No data found');
    
    // Show what columns we can see
    if (data && data.length > 0) {
      console.log('Available columns:');
      Object.keys(data[0]).forEach(key => {
        console.log(`  - ${key}`);
      });
    }
  } catch (error) {
    console.error('Failed to check table structure:', error);
    process.exit(1);
  }
}

checkProductsTable();