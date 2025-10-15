'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save, X } from 'lucide-react';
import { Product, ProductInsert } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ImageUploader, ImagePreview } from '@/components/product/ImageUploader';

const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  sale_price: z.coerce.number().min(0, 'Sale price must be a positive number').optional().nullable(),
  sku: z.string().min(1, 'SKU is required'),
  stock_quantity: z.coerce.number().int().min(0, 'Stock quantity must be a non-negative integer'),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  category_id: z.string().min(1, 'Category is required'),
  brand: z.string().optional().nullable(),
  tags: z.string().optional().transform(val => 
    val ? val.split(',').map(tag => tag.trim()).filter(Boolean) : []
  ),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmitAction: (data: ProductInsert) => Promise<void>;
  isSubmitting: boolean;
  categories: { id: string; name: string }[];
}

export function ProductForm({
  product,
  onSubmit,
  isSubmitting,
  categories,
}: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [isRemovingImage, setIsRemovingImage] = useState<Record<string, boolean>>({});
  
  const defaultValues: Partial<ProductFormValues> = {
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    sale_price: product?.sale_price || null,
    sku: product?.sku || '',
    stock_quantity: product?.stock_quantity || 0,
    is_featured: product?.is_featured || false,
    is_active: product?.is_active ?? true,
    category_id: product?.category_id || '',
    brand: product?.brand || '',
    tags: product?.tags?.join(', ') || '',
    specifications: product?.specifications || {},
    slug: product?.slug || '',
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (product?.images) {
      setImages(product.images);
    }
  }, [product]);

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      // Generate slug from name if not provided
      const slug = data.slug || slugify(data.name);
      
      const productData: ProductInsert = {
        ...data,
        images,
        tags: Array.isArray(data.tags) ? data.tags : (data.tags as string).split(',').map(tag => tag.trim()).filter(Boolean),
        specifications: data.specifications || {},
        slug,
      };
      
      await onSubmitAction(productData);
      
      toast({
        title: 'Success',
        description: product ? 'Product updated successfully' : 'Product created successfully',
      });
      
      if (!product) {
        form.reset();
        setImages([]);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = (result: any) => {
    setImages(prev => [...prev, result.url]);
    toast({
      title: 'Success',
      description: 'Image uploaded successfully',
    });
  };

  const handleImageUploadError = (error: Error) => {
    console.error('Image upload error:', error);
    toast({
      title: 'Error',
      description: 'Failed to upload image. Please try again.',
      variant: 'destructive',
    });
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (!product?.id) {
      // If this is a new product, just remove from local state
      setImages(prev => prev.filter(img => img !== imageUrl));
      return;
    }

    try {
      setIsRemovingImage(prev => ({ ...prev, [imageUrl]: true }));
      
      const response = await fetch(`/api/products/${product.id}/images?url=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
      
      setImages(prev => prev.filter(img => img !== imageUrl));
      toast({
        title: 'Success',
        description: 'Image removed successfully',
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRemovingImage(prev => ({ ...prev, [imageUrl]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Enter product name"
                  className={form.formState.errors.name ? 'border-red-500' : ''}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Enter product description"
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...form.register('price')}
                    className={form.formState.errors.price ? 'border-red-500' : ''}
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="sale_price">Sale Price</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    {...form.register('sale_price')}
                  />
                  {form.formState.errors.sale_price && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.sale_price.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    {...form.register('sku')}
                    className={form.formState.errors.sku ? 'border-red-500' : ''}
                  />
                  {form.formState.errors.sku && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.sku.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    {...form.register('stock_quantity')}
                    className={form.formState.errors.stock_quantity ? 'border-red-500' : ''}
                  />
                  {form.formState.errors.stock_quantity && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.stock_quantity.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category_id">Category *</Label>
                  <select
                    id="category_id"
                    {...form.register('category_id')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.category_id && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.category_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" {...form.register('brand')} />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  {...form.register('tags')}
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate tags with commas
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Product Images</Label>
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {images.map((image, index) => (
                    <ImagePreview
                      key={index}
                      src={image}
                      alt={`Product image ${index + 1}`}
                      onRemove={() => handleRemoveImage(image)}
                      isRemoving={isRemovingImage[image]}
                      className="h-32"
                    />
                  ))}
                </div>
              )}
              <ImageUploader
                productId={product?.id || 'new'}
                onUploadSuccess={handleImageUpload}
                onUploadError={handleImageUploadError}
                multiple={true}
              />
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_featured">Featured</Label>
                  <p className="text-xs text-muted-foreground">
                    Show this product in featured section
                  </p>
                </div>
                <Switch
                  id="is_featured"
                  checked={form.watch('is_featured')}
                  onCheckedChange={(checked) =>
                    form.setValue('is_featured', checked, { shouldDirty: true })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Show this product on the store
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={form.watch('is_active')}
                  onCheckedChange={(checked) =>
                    form.setValue('is_active', checked, { shouldDirty: true })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {product ? 'Update Product' : 'Create Product'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
