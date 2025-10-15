const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testInsert() {
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

  console.log('Testing minimal product insert...');

  try {
    // Try inserting a very minimal product record
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: 'Test Product',
        price: 9.99
      });

    if (error) {
      console.error('Error inserting test product:', error.message);
      console.error('Error details:', error);
      
      // Try with just one field
      console.log('Trying with only name field...');
      const { data: data2, error: error2 } = await supabase
        .from('products')
        .insert({
          name: 'Test Product'
        });
      
      if (error2) {
        console.error('Error inserting with only name:', error2.message);
      } else {
        console.log('Successfully inserted with only name field');
      }
      
      process.exit(1);
    }

    console.log('Successfully inserted test product');
  } catch (error) {
    console.error('Failed to insert test product:', error);
    process.exit(1);
  }
}

testInsert();