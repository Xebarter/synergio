const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Function to generate a slug from a string
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Define the product type based on what FakeStoreAPI returns
async function seedProducts() {
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

  console.log('Fetching products from FakeStoreAPI...');

  try {
    // Fetch products from FakeStoreAPI
    const response = await fetch('https://fakestoreapi.com/products');
    const fakeStoreProducts = await response.json();

    console.log(`Fetched ${fakeStoreProducts.length} products from FakeStoreAPI`);

    // Transform FakeStoreAPI products to our product format
    // Only include fields that we know exist in the database
    const productsToInsert = fakeStoreProducts.map(product => ({
      title: product.title, // Map title to the title column
      name: product.title, // Also include name for compatibility
      description: product.description,
      price: product.price,
      price_cents: Math.round(product.price * 100), // Convert price to cents
      image: product.image || null,
      category: product.category || null,
      stock: Math.floor(Math.random() * 100) + 1, // Random stock between 1-100
      sku: `FS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, // Generate random SKU
      slug: generateSlug(product.title), // Generate slug from title
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