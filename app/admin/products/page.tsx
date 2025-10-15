"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProductsTable } from '@/components/admin/products/products-table';
import { useToast } from '@/hooks/use-toast';
import { Plus, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Product, Category } from '@/types';

// Define a type for the Supabase product response
interface SupabaseProduct {
  id: string;
  sku: string;
  title: string;
  slug: string;
  description?: string;
  price_cents: number;
  compare_at_price_cents?: number;
  currency: string;
  images: string[];
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  category?: {
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            sku,
            title,
            slug,
            description,
            price_cents,
            compare_at_price_cents,
            currency,
            images,
            stock,
            is_active,
            is_featured,
            category:categories(name),
            created_at,
            updated_at
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        // Transform data to match the expected Product interface
        const transformedProducts = (data || []).map((product: any) => {
          // Create a category object that matches the Category interface if category data exists
          let category: Category | undefined;
          if (product.category?.name) {
            category = {
              id: '', // We don't have the category ID from this query
              name: product.category.name,
              slug: '', // We don't have the category slug from this query
              sort_order: 0,
              is_featured: false,
              is_active: true,
              created_at: '', // We don't have the category created_at from this query
              updated_at: '' // We don't have the category updated_at from this query
            };
          }

          return {
            id: product.id,
            sku: product.sku,
            title: product.title,
            slug: product.slug,
            description: product.description || undefined,
            price_cents: product.price_cents,
            compare_at_price_cents: product.compare_at_price_cents || undefined,
            currency: product.currency,
            images: product.images || [],
            stock: product.stock,
            is_active: product.is_active,
            is_featured: product.is_featured,
            tags: [],
            track_quantity: true,
            allow_backorder: false,
            requires_shipping: true,
            rating_average: 0,
            rating_count: 0,
            view_count: 0,
            sort_order: 0,
            category_id: category?.id,
            category,
            created_at: product.created_at,
            updated_at: product.updated_at
          };
        }) as Product[];

        setProducts(transformedProducts);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to fetch products');
        toast({
          title: 'Error',
          description: 'Failed to load products. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [supabase, toast]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setProducts(products.filter(product => product.id !== id));
      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      });
    } catch (err: any) {
      console.error('Error deleting product:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids);

      if (error) {
        throw new Error(error.message);
      }

      setProducts(products.filter(product => !ids.includes(product.id)));
      toast({
        title: 'Success',
        description: `${ids.length} product(s) deleted successfully`
      });
    } catch (err: any) {
      console.error('Error deleting products:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete products. Please try again.',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const handleStatusChange = async (id: string, status: 'draft' | 'published' | 'archived') => {
    try {
      const is_active = status === 'published';
      
      const { error } = await supabase
        .from('products')
        .update({ 
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setProducts(products.map(product =>
        product.id === id ? { ...product, is_active } : product
      ));
      
      toast({
        title: 'Success',
        description: 'Product status updated successfully'
      });
    } catch (err: any) {
      console.error('Error updating product status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update product status. Please try again.',
        variant: 'destructive'
      });
      throw err;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Products</h1>
              <p className="text-muted-foreground">
                Manage your products and inventory
              </p>
            </div>
            <Button 
              onClick={() => router.push('/admin/products/new')}
              className="w-full md:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Products</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your products and inventory
            </p>
          </div>
          <Button 
            onClick={() => router.push('/admin/products/new')}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <ProductsTable
          products={products}
          isLoading={isLoading}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}