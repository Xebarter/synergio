import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Product } from '@/types/database.types';
import { getProducts, getProductById } from '@/app/actions/product-actions';

interface ProductsResponse {
  data: Product[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useProducts({
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
} = {}) {
  const queryClient = useQueryClient();
  const queryKey = ['products', { page, limit, categoryId, featured, active }];

  // Fetch paginated products with filters
  const { 
    data: productsData, 
    isLoading, 
    error 
  } = useQuery<ProductsResponse>({
    queryKey,
    queryFn: () => 
      getProducts({ 
        page, 
        limit, 
        categoryId, 
        featured, 
        active 
      }) as Promise<ProductsResponse>,
  });

  // Fetch a single product
  const useProduct = (id: string) => {
    return useQuery<Product>({
      queryKey: ['product', id],
      queryFn: () => getProductById(id) as Promise<Product>,
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Prefetch the next page
  const prefetchNextPage = useCallback((nextPage: number) => {
    queryClient.prefetchQuery({
      queryKey: ['products', { 
        page: nextPage, 
        limit, 
        categoryId, 
        featured, 
        active 
      }],
      queryFn: () => getProducts({ 
        page: nextPage, 
        limit, 
        categoryId, 
        featured, 
        active 
      }),
    });
  }, [categoryId, featured, active, limit, queryClient]);

  return {
    products: productsData?.data || [],
    pagination: {
      page,
      limit,
      total: productsData?.count || 0,
      totalPages: productsData?.totalPages || 1,
    },
    isLoading,
    error,
    useProduct,
    prefetchNextPage,
  };
}

// Hook for featured products
export function useFeaturedProducts(limit: number = 4) {
  return useProducts({ 
    featured: true, 
    active: true, 
    limit 
  });
}

// Hook for products by category
export function useProductsByCategory(categoryId: string, limit?: number) {
  return useProducts({ 
    categoryId, 
    active: true, 
    limit 
  });
}
