const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function listProducts() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }

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

  console.log('Fetching products from database...');

  try {
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('Error fetching products:', error.message);
      process.exit(1);
    }

    console.log(`Total products in database: ${count}`);
    console.log(`Displaying first 10 products:`);
    
    const productsToShow = data.slice(0, 10);
    
    productsToShow.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Price: $${product.price}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   In Stock: ${product.in_stock ? 'Yes' : 'No'}`);
      console.log(`   Featured: ${product.featured ? 'Yes' : 'No'}`);
      if (product.images && product.images.length > 0) {
        console.log(`   Image URL: ${product.images[0]}`);
      } else {
        console.log(`   Image URL: None`);
      }
    });
    
    if (data.length === 0) {
      console.log("No products found in the database.");
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listProducts();