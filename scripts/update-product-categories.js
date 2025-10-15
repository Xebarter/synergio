const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function updateProductCategories() {
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

  console.log('Fetching categories...');

  try {
    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError.message);
      process.exit(1);
    }

    console.log(`Found ${categories.length} categories`);

    // Get all products that don't have category_id set
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, category')
      .is('category_id', null);

    if (productsError) {
      console.error('Error fetching products:', productsError.message);
      process.exit(1);
    }

    console.log(`Found ${products.length} products without category_id`);

    // Create a map of category names to IDs
    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category.name] = category.id;
    });

    // Map common FakeStoreAPI categories to our categories
    const categoryMapping = {
      "men's clothing": 'Fashion',
      "women's clothing": 'Fashion',
      "jewelery": 'Fashion', // This is how it's spelled in FakeStoreAPI
      "electronics": 'Computers'
    };

    // Update each product with the appropriate category_id
    let updatedCount = 0;
    for (const product of products) {
      if (!product.category) {
        console.log(`Skipping product ${product.id} - no category specified`);
        continue;
      }

      // Map FakeStoreAPI categories to our categories
      const categoryName = categoryMapping[product.category] || product.category;
      
      // Find the category ID
      const categoryId = categoryMap[categoryName];
      
      if (!categoryId) {
        console.log(`No matching category found for product ${product.id} with category "${product.category}" (mapped to "${categoryName}")`);
        continue;
      }

      // Update the product
      const { error: updateError } = await supabase
        .from('products')
        .update({ category_id: categoryId })
        .eq('id', product.id);

      if (updateError) {
        console.error(`Error updating product ${product.id}:`, updateError.message);
      } else {
        console.log(`Updated product ${product.id} with category "${categoryName}" (${categoryId})`);
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} products with category_id`);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
}

updateProductCategories();