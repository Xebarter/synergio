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

// Define the categories based on what's used in the application
const categories = [
  {
    "name": "Phones & Tablets",
    "description": "Smartphones, tablets, wearables and accessories"
  },
  {
    "name": "Computers",
    "description": "Laptops, desktops, accessories and components"
  },
  {
    "name": "Home & Kitchen",
    "description": "Home appliances, kitchenware and furniture"
  },
  {
    "name": "Fashion",
    "description": "Clothing, shoes and accessories"
  },
  {
    "name": "Beauty & Health",
    "description": "Beauty products, skincare and health supplements"
  },
  {
    "name": "Sports & Outdoors",
    "description": "Sports equipment, outdoor gear and fitness products"
  },
  {
    "name": "Groceries",
    "description": "Food, beverages and household supplies"
  },
  {
    "name": "Toys & Games",
    "description": "Toys, games and baby products"
  },
  {
    "name": "Automotive",
    "description": "Car parts, accessories and industrial equipment"
  },
  {
    "name": "Garden & Tools",
    "description": "Gardening supplies, tools and outdoor furniture"
  },
  {
    "name": "Office",
    "description": "Office equipment, furniture and stationery"
  },
  {
    "name": "Arts & Crafts",
    "description": "Art supplies, crafts and musical instruments"
  },
  {
    "name": "Travel",
    "description": "Luggage, travel accessories and lifestyle products"
  },
  {
    "name": "Services",
    "description": "Consulting, repair and training services"
  }
];

async function seedCategories() {
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

  console.log('Seeding categories...');

  try {
    // Transform categories to our category format
    const categoriesToInsert = categories.map(category => ({
      name: category.name,
      description: category.description,
      slug: generateSlug(category.name)
    }));

    console.log('Inserting categories into database...');

    // Insert categories into the database
    const { data, error } = await supabase
      .from('categories')
      .insert(categoriesToInsert);

    if (error) {
      console.error('Error inserting categories:', error.message);
      console.error('Error details:', error);
      process.exit(1);
    }

    console.log(`Successfully inserted ${categoriesToInsert.length} categories into the database`);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedCategories();