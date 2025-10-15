'use server';

import { createClient } from '@/lib/supabase/server';
import { Product, ProductInsert, ProductUpdate } from '@/types/database.types';

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'product-images';

// Function to validate image URLs
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    // If it's already a full URL, it's valid
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return true;
    }
    
    // If it's a relative path, it's valid
    if (url.startsWith('/')) {
      return true;
    }
    
    return false;
  } catch (e) {
    return false;
  }
}

// Cache for product data
const productCache = new Map();

export async function getProducts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  // Process products to ensure both images and image fields are handled properly
  const processedProducts = data.map(product => ({
    ...product,
    // Ensure images is always an array
    images: Array.isArray(product.images) ? product.images : [],
    // Ensure image is always a string or null
    image: product.image || null,
  }));

  // Combine images from both sources if needed
  const finalProducts = processedProducts.map(product => {
    // Filter out invalid image URLs and ensure we have valid ones
    const validImages = product.images.filter(isValidImageUrl);
    if (product.image && isValidImageUrl(product.image)) {
      // Add the single image to the images array if it's not already there
      if (!validImages.includes(product.image)) {
        validImages.unshift(product.image);
      }
    }
    
    return {
      ...product,
      images: validImages
    };
  });

  return finalProducts as Product[];
}

export async function getProductById(id: string) {
  // Check cache first
  const cachedProduct = productCache.get(id);
  if (cachedProduct) {
    return cachedProduct;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    // If the error is because no product was found, return null instead of throwing
    if (error.code === 'PGRST116' || error.message.includes('Results contain 0 rows')) {
      return null;
    }
    console.error(`Error fetching product by ID ${id}:`, error);
    throw error;
  }

  if (!data) {
    return null;
  }

  // Process product to ensure both images and image fields are handled properly
  const processedProduct = {
    ...data,
    // Ensure images is always an array
    images: Array.isArray(data.images) ? data.images : [],
    // Ensure image is always a string or null
    image: data.image || null,
  };

  // Filter out invalid image URLs and ensure we have valid ones
  const validImages = processedProduct.images.filter(isValidImageUrl);
  if (processedProduct.image && isValidImageUrl(processedProduct.image)) {
    // Add the single image to the images array if it's not already there
    if (!validImages.includes(processedProduct.image)) {
      validImages.unshift(processedProduct.image);
    }
  }

  const finalProduct = {
    ...processedProduct,
    images: validImages
  } as Product;

  // Cache the product for 5 minutes
  productCache.set(id, finalProduct);
  setTimeout(() => {
    productCache.delete(id);
  }, 5 * 60 * 1000); // 5 minutes

  return finalProduct;
}

export async function getProductBySlug(slug: string) {
  // Check cache first
  const cachedProduct = productCache.get(`slug-${slug}`);
  if (cachedProduct) {
    return cachedProduct;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    // If the error is because no product was found, return null instead of throwing
    if (error.code === 'PGRST116' || error.message.includes('Results contain 0 rows')) {
      return null;
    }
    console.error(`Error fetching product by slug ${slug}:`, error);
    throw error;
  }

  if (!data) {
    return null;
  }

  // Process product to ensure both images and image fields are handled properly
  const processedProduct = {
    ...data,
    // Ensure images is always an array
    images: Array.isArray(data.images) ? data.images : [],
    // Ensure image is always a string or null
    image: data.image || null,
  };

  // Filter out invalid image URLs and ensure we have valid ones
  const validImages = processedProduct.images.filter(isValidImageUrl);
  if (processedProduct.image && isValidImageUrl(processedProduct.image)) {
    // Add the single image to the images array if it's not already there
    if (!validImages.includes(processedProduct.image)) {
      validImages.unshift(processedProduct.image);
    }
  }

  const finalProduct = {
    ...processedProduct,
    images: validImages
  } as Product;

  // Cache the product for 5 minutes
  productCache.set(`slug-${slug}`, finalProduct);
  setTimeout(() => {
    productCache.delete(`slug-${slug}`);
  }, 5 * 60 * 1000); // 5 minutes

  return finalProduct;
}

export async function createProduct(productData: ProductInsert) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  // Clear cache when creating a new product
  productCache.clear();

  return data as Product;
}

export async function updateProduct(idOrSlug: string, updates: ProductUpdate) {
  const supabase = createClient();
  
  // Try to update by ID first
  let { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', idOrSlug)
    .select()
    .single();

  // If not found by ID, try by slug
  if (error && (error.code === 'PGRST116' || error.message.includes('Results contain 0 rows'))) {
    ({ data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('slug', idOrSlug)
      .select()
      .single());
  }

  if (error) {
    console.error(`Error updating product ${idOrSlug}:`, error);
    throw error;
  }

  // Clear cache when updating a product
  productCache.clear();

  return data as Product;
}

export async function deleteProduct(idOrSlug: string) {
  const supabase = createClient();
  
  // Try to delete by ID first
  let { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', idOrSlug)
    .select()
    .single();

  // If not found by ID, try by slug
  if (error && (error.code === 'PGRST116' || error.message.includes('Results contain 0 rows'))) {
    ({ data, error } = await supabase
      .from('products')
      .delete()
      .eq('slug', idOrSlug)
      .select()
      .single());
  }

  if (error) {
    console.error(`Error deleting product ${idOrSlug}:`, error);
    throw error;
  }

  // Clear cache when deleting a product
  productCache.clear();

  return data as Product;
}