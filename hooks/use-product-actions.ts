'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { createProduct, updateProduct, deleteProduct, toggleFeatured, toggleActive } from '@/app/actions/product-actions';

export function useProductActions() {
  const { toast } = useToast();
  const router = useRouter();

  const handleCreateProduct = useCallback(async (formData: FormData) => {
    try {
      const result = await createProduct(formData);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Product created successfully',
        });
        router.push(`/admin/products/${result.data?.productId}`);
        router.refresh();
      } else {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create product',
        variant: 'destructive',
      });
      throw error;
    }
  }, [router, toast]);

  const handleUpdateProduct = useCallback(async (id: string, formData: FormData) => {
    try {
      const result = await updateProduct(id, formData);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
        router.refresh();
      } else {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update product',
        variant: 'destructive',
      });
      throw error;
    }
  }, [router, toast]);

  const handleDeleteProduct = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return { success: false, error: 'Deletion cancelled' };
    }
    
    try {
      const result = await deleteProduct(id);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Product deleted successfully',
        });
        router.push('/admin/products');
        router.refresh();
      } else {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete product',
        variant: 'destructive',
      });
      throw error;
    }
  }, [router, toast]);

  const handleToggleFeatured = useCallback(async (id: string, isCurrentlyFeatured: boolean) => {
    try {
      const result = await toggleFeatured(id, isCurrentlyFeatured);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `Product ${isCurrentlyFeatured ? 'removed from' : 'added to'} featured`,
        });
        router.refresh();
      } else {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update featured status',
        variant: 'destructive',
      });
      throw error;
    }
  }, [router, toast]);

  const handleToggleActive = useCallback(async (id: string, isCurrentlyActive: boolean) => {
    try {
      const result = await toggleActive(id, isCurrentlyActive);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `Product marked as ${isCurrentlyActive ? 'inactive' : 'active'}`,
        });
        router.refresh();
      } else {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update active status',
        variant: 'destructive',
      });
      throw error;
    }
  }, [router, toast]);

  return {
    createProduct: handleCreateProduct,
    updateProduct: handleUpdateProduct,
    deleteProduct: handleDeleteProduct,
    toggleFeatured: handleToggleFeatured,
    toggleActive: handleToggleActive,
  };
}
