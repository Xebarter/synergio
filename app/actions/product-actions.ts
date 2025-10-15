'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Product, ProductInsert } from '@/types/database.types';
import { storageService } from '@/lib/utils/storage';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type ProductsResponse = {
  data: Product[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Helper function to safely parse form data
function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return value ? value.toString() : '';
}

// Helper function to safely parse JSON
function safeJsonParse<T = Record<string, unknown>>(value: string | null | undefined): T {
  if (!value) return {} as T;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    console.error(`Error parsing JSON:`, e);
    return {} as T;
  }
}

// Helper function to create slug from string
function createSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Fetches all products with optional filtering and pagination
 */
export async function getProducts({
  page = 1,
  limit = 10,
  categoryId,
  featured,
  active,
}: {
  page?: number;
  limit?: number;
  categoryId?: string;
  featured?: boolean;
  active?: boolean;
} = {}): Promise<ProductsResponse> {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  try {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
      
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }
    
    if (active !== undefined) {
      query = query.eq('is_active', active);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: data as Product[],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
}

/**
 * Fetches a single product by ID
 */
export async function getProductById(id: string): Promise<Product> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!data) throw new Error('Product not found');
    
    return data as Product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw new Error('Failed to fetch product');
  }
}

/**
 * Creates a new product
 */
export async function createProduct(formData: FormData): Promise<ApiResponse<{ productId: string }>> {
  const supabase = createClient();
  
  try {
    // Extract and validate required fields
    const name = getFormValue(formData, 'name');
    const category_id = getFormValue(formData, 'category_id');
    const price = parseFloat(getFormValue(formData, 'price'));
    
    if (!name || !category_id || isNaN(price)) {
      throw new Error('Missing required fields');
    }

    // Prepare product data
    const productData: ProductInsert = {
      name,
      description: getFormValue(formData, 'description') || null,
      price,
      sale_price: (() => {
        const value = getFormValue(formData, 'sale_price');
        return value && !isNaN(parseFloat(value)) ? parseFloat(value) : null;
      })(),
      sku: getFormValue(formData, 'sku') || undefined,
      stock_quantity: parseInt(getFormValue(formData, 'stock_quantity')) || 0,
      is_featured: formData.get('is_featured') === 'on',
      is_active: formData.get('is_active') !== 'off',
      category_id,
      brand: getFormValue(formData, 'brand') || null,
      tags: (getFormValue(formData, 'tags') || '')
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
      specifications: safeJsonParse(formData.get('specifications')?.toString() || '{}'),
      slug: createSlug(getFormValue(formData, 'slug') || name),
      images: []
    };

    // Create the product
    const { data: product, error: createError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
      
    if (createError) throw createError;
    if (!product) throw new Error('Failed to create product');

    // Handle image uploads if any
    const imageFiles = formData.getAll('images') as File[];
    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(async (file) => {
        const fileName = storageService.generateUniqueFileName(file, `products/${product.id}/`);
        const { url } = await storageService.uploadFile(file, fileName);
        return url;
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      // Update product with image URLs
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: uploadedImages })
        .eq('id', product.id);
        
      if (updateError) throw updateError;
    }
    
    revalidatePath('/admin/products');
    revalidatePath('/products');
    
    return { 
      success: true, 
      data: { productId: product.id } 
    };
  } catch (error) {
    console.error('Error in createProduct:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create product' 
    };
  }
}

/**
 * Updates an existing product
 */
export async function updateProduct(
  id: string, 
  formData: FormData
): Promise<ApiResponse<undefined>> {
  const supabase = createClient();
  
  try {
    // Get existing product
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    if (!existingProduct) throw new Error('Product not found');
    
    // Prepare updated data
    const updatedData: Partial<Product> = {
      name: getFormValue(formData, 'name') || existingProduct.name,
      description: getFormValue(formData, 'description') || null,
      price: parseFloat(getFormValue(formData, 'price')) || existingProduct.price,
      sale_price: (() => {
        const value = getFormValue(formData, 'sale_price');
        return value && !isNaN(parseFloat(value)) ? parseFloat(value) : null;
      })(),
      sku: getFormValue(formData, 'sku') || existingProduct.sku,
      stock_quantity: parseInt(getFormValue(formData, 'stock_quantity')) || existingProduct.stock_quantity,
      is_featured: formData.get('is_featured') === 'on',
      is_active: formData.get('is_active') !== 'off',
      category_id: getFormValue(formData, 'category_id') || existingProduct.category_id,
      brand: getFormValue(formData, 'brand') || null,
      tags: (getFormValue(formData, 'tags') || '')
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
      specifications: safeJsonParse(formData.get('specifications')?.toString() || '{}'),
      slug: createSlug(getFormValue(formData, 'slug') || existingProduct.name)
    };
    
    // Update the product
    const { error: updateError } = await supabase
      .from('products')
      .update(updatedData)
      .eq('id', id);
      
    if (updateError) throw updateError;
    
    // Handle new image uploads if any
    const imageFiles = formData.getAll('images') as File[];
    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(async (file) => {
        const fileName = storageService.generateUniqueFileName(file, `products/${id}/`);
        const { url } = await storageService.uploadFile(file, fileName);
        return url;
      });
      
      const uploadedImages = await Promise.all(uploadPromises);
      
      // Update product with new image URLs
      const updatedImages = [...(existingProduct.images || []), ...uploadedImages];
      const { error: imageUpdateError } = await supabase
        .from('products')
        .update({ images: updatedImages })
        .eq('id', id);
        
      if (imageUpdateError) throw imageUpdateError;
    }
    
    revalidatePath('/admin/products');
    revalidatePath(`/products/${id}`);
    revalidatePath('/products');
    
    return { success: true };
  } catch (error) {
    console.error('Error in updateProduct:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update product' 
    };
  }
}

/**
 * Deletes a product and its associated images
 */
export async function deleteProduct(id: string): Promise<ApiResponse<undefined>> {
  const supabase = createClient();
  
  try {
    // Get product to delete its images
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('images')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Delete associated images if any
    if (product?.images?.length) {
      const deletePromises = (product.images as string[]).map(async (url) => {
        try {
          const urlObj = new URL(url);
          const pathParts = urlObj.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1];
          const storagePath = `products/${id}/${fileName}`;
          await storageService.deleteFile(storagePath);
        } catch (error) {
          console.error(`Error deleting image ${url}:`, error);
          // Continue with other images even if one fails
        }
      });
      
      await Promise.all(deletePromises);
    }
    
    // Delete the product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (deleteError) throw deleteError;
    
    revalidatePath('/admin/products');
    revalidatePath('/products');
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete product' 
    };
  }
}

/**
 * Toggles a product's featured status
 */
export async function toggleFeatured(
  id: string, 
  isFeatured: boolean
): Promise<ApiResponse<undefined>> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_featured: !isFeatured })
      .eq('id', id);
      
    if (error) throw error;
    
    revalidatePath('/admin/products');
    revalidatePath(`/products/${id}`);
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Error in toggleFeatured:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update featured status' 
    };
  }
}

/**
 * Toggles a product's active status
 */
export async function toggleActive(
  id: string, 
  isActive: boolean
): Promise<ApiResponse<undefined>> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !isActive })
      .eq('id', id);
      
    if (error) throw error;
    
    revalidatePath('/admin/products');
    revalidatePath(`/products/${id}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error in toggleActive:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update active status' 
    };
  }
}
