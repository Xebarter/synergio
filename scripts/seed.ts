import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Define the product type based on what FakeStoreAPI returns
interface FakeStoreProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

async function seedProducts() {
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

  console.log('Fetching products from FakeStoreAPI...');

  try {
    // Fetch products from FakeStoreAPI
    const response = await fetch('https://fakestoreapi.com/products');
    const fakeStoreProducts: FakeStoreProduct[] = await response.json();

    console.log(`Fetched ${fakeStoreProducts.length} products from FakeStoreAPI`);

    // Transform FakeStoreAPI products to our product format
    const productsToInsert = fakeStoreProducts.map(product => ({
      title: product.title,
      description: product.description,
      price: product.price,
      currency: 'USD',
      category: product.category,
      subcategory: null,
      images: [product.image],
      specifications: {},
      minimum_order: 1,
      in_stock: true,
      featured: Math.random() > 0.7, // Randomly feature 30% of products
      tags: [],
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
      process.exit(1);
    }

    console.log(`Successfully inserted ${productsToInsert.length} products into the database`);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedProducts();