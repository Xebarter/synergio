const supabaseModule = require('@supabase/supabase-js');
require('dotenv').config();

// Define the product type based on what FakeStoreAPI returns
async function seedProducts() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = supabaseModule.createClient(
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

  console.log('Fetching products from FakeStoreAPI...');

  try {
    // Fetch products from FakeStoreAPI
    const response = await fetch('https://fakestoreapi.com/products');
    const fakeStoreProducts = await response.json();

    console.log(`Fetched ${fakeStoreProducts.length} products from FakeStoreAPI`);

    // Transform FakeStoreAPI products to our product format
    const productsToInsert = fakeStoreProducts.map(product => ({
      name: product.title,
      description: product.description,
      price: product.price,
      image: product.image || null,
      category: product.category,
      stock: Math.floor(Math.random() * 100) + 1, // Random stock between 1-100
      sku: `FS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, // Generate random SKU
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    console.log('Inserting products into database...');

    // Insert products into the database
    const { data, error } = await supabase
      .from('products')
      .insert(productsToInsert);

    if (error) {
      console.error('Error inserting products:', error.message);
      console.error('Error details:', error);
      process.exit(1);
    }

    console.log(`Successfully inserted ${productsToInsert.length} products into the database`);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedProducts();