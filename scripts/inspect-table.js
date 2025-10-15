const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function inspectTable() {
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

  console.log('Inspecting products table...');

  try {
    // Try to get column information by selecting all columns from a non-existent row
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error inspecting table:', error.message);
      process.exit(1);
    }

    if (data) {
      console.log('Table structure:');
      Object.keys(data).forEach(key => {
        console.log(`  - ${key}: ${typeof data[key]}`);
      });
    } else {
      console.log('Table exists but is empty');
      
      // Try to get table info from information schema
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'products');

      if (columnsError) {
        console.error('Error getting column info:', columnsError.message);
      } else {
        console.log('Available columns:');
        columns.forEach(column => {
          console.log(`  - ${column.column_name}: ${column.data_type}`);
        });
      }
    }
  } catch (error) {
    console.error('Failed to inspect table:', error);
    process.exit(1);
  }
}

inspectTable();