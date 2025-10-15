"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, Image as ImageIcon, ArrowLeft } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  compareAtPrice: z.coerce.number().optional(),
  costPerItem: z.coerce.number().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  inventory: z.coerce.number().min(0, 'Inventory must be a positive number'),
  weight: z.coerce.number().min(0, 'Weight must be a positive number').optional(),
  status: z.enum(['draft', 'published', 'archived']),
  isTaxable: z.boolean().default(true),
  requiresShipping: z.boolean().default(true),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  subcategoryItem: z.string().optional(),
  currency: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  variants: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Variant name is required'),
    price: z.coerce.number().min(0, 'Price must be a positive number'),
    sku: z.string().optional(),
    inventory: z.coerce.number().min(0, 'Inventory must be a positive number'),
    options: z.record(z.string(), z.string()),
  })).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface SubcategoryItem {
  name: string;
  items: string[];
}

interface SubcategoryItem {
  name: string;
  items: string[];
}

interface CategoryMapping {
  [frontendId: string]: string; // Maps frontend category ID to database category UUID
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface ProductFormProps {
  initialData?: any | null;
  categories: Category[];
  categoryMapping: CategoryMapping;
  currencies?: Currency[];
  onSubmit: (data: ProductFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function ProductForm({ initialData, categories, currencies = [], categoryMap = {}, onSubmit, isSubmitting }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [variants, setVariants] = useState<any[]>(initialData?.variants || []);
  const [newTag, setNewTag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialData?.category || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialData?.subcategory || '');
  const [selectedSubcategoryItem, setSelectedSubcategoryItem] = useState<string>(initialData?.subcategoryItem || '');

  const defaultValues: Partial<ProductFormValues> = {
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price ?? 0,
    compareAtPrice: initialData?.compareAtPrice ?? 0,
    costPerItem: initialData?.costPerItem ?? 0,
    sku: initialData?.sku ?? '',
    barcode: initialData?.barcode ?? '',
    inventory: initialData?.inventory ?? 0,
    weight: initialData?.weight ?? 0,
    status: initialData?.status ?? 'draft',
    isTaxable: initialData?.isTaxable ?? true,
    requiresShipping: initialData?.requiresShipping ?? true,
    category: initialData?.category ?? (categories.length > 0 ? categories[0].id : ''),
    subcategory: initialData?.subcategory ?? '',
    subcategoryItem: initialData?.subcategoryItem ?? '',
    currency: initialData?.currency ?? (currencies.length > 0 ? currencies[0].code : 'USD'),
    tags: initialData?.tags ?? [],
    images: initialData?.images ?? [],
    variants: initialData?.variants ?? [],
  };

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const status = watch('status');
  const currency = watch('currency');
  const category = watch('category');
  const subcategory = watch('subcategory');
  const [hasVariants, setHasVariants] = useState(initialData?.variants?.length > 0 || false);
  const tags = watch('tags', []);

  // Get the selected category object
  const selectedCategoryObj = categories.find(cat => cat.id === category) || categories[0];
  
  // Get subcategories for the selected category
  const subcategories = selectedCategoryObj?.subcategories || [];
  
  // Get items for the selected subcategory
  const selectedSubcategoryObj = subcategories.find(sub => sub.name === subcategory);
  const subcategoryItems = selectedSubcategoryObj?.items || [];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setIsLoading(true);

    try {
      // In a real app, you would upload the image to a storage service
      // and get back a URL. For now, we'll just use a placeholder.
      const newImages = Array.from(e.target.files).map(file =>
        URL.createObjectURL(file)
      );

      setImages(prev => [...prev, ...newImages]);
      setValue('images', [...images, ...newImages]);

      toast({
        title: 'Success',
        description: 'Images uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    setValue('images', newImages);
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      const updatedTags = [...(tags || []), newTag.trim()];
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = (tags || []).filter(tag => tag !== tagToRemove);
    setValue('tags', updatedTags);
  };

  const addVariant = () => {
    const newVariant = {
      id: `variant-${Date.now()}`,
      name: `Variant ${variants.length + 1}`,
      price: 0,
      sku: '',
      inventory: 0,
      options: {},
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariant = (id: string, updates: Partial<any>) => {
    setVariants(variants.map(variant =>
      variant.id === id ? { ...variant, ...updates } : variant
    ));
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter(variant => variant.id !== id));
  };

  const onSubmitHandler = async (data: ProductFormValues) => {
    try {
      // Pass the data as is to the parent component
      // The parent component will handle the category mapping properly
      await onSubmit({
        ...data,
        images,
        variants: hasVariants ? variants : [],
      });

      toast({
        title: 'Success',
        description: initialData ? 'Product updated successfully' : 'Product created successfully',
      });

      if (!initialData) {
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get the symbol for the current currency
  const getCurrencySymbol = () => {
    if (currencies.length === 0) return '$';
    const current = currencies.find(c => c.code === currency);
    return current ? current.symbol : currencies[0].symbol;
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setValue('category', categoryId);
    setValue('subcategory', '');
    setValue('subcategoryItem', '');
    setSelectedSubcategory('');
    setSelectedSubcategoryItem('');
  };

  // Handle subcategory change
  const handleSubcategoryChange = (subcategoryName: string) => {
    setValue('subcategory', subcategoryName);
    setValue('subcategoryItem', '');
    setSelectedSubcategory(subcategoryName);
    setSelectedSubcategoryItem('');
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin/products')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {initialData ? 'Edit Product' : 'Create Product'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {initialData ? 'Update your product details' : 'Add a new product to your store'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/products')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Premium T-Shirt"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Product description..."
                  className="min-h-[120px]"
                  {...register('description')}
                />
              </div>

              <div className="space-y-4">
                <Label>Media</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-md overflow-hidden border">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <label
                    className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary transition-colors"
                    htmlFor="image-upload"
                  >
                    <div className="text-center p-4">
                      <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <span className="mt-2 block text-sm text-gray-600">
                        Add Image
                      </span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={isLoading}
                      />
                    </div>
                  </label>
                </div>
                {errors.images && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.images.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={(value) => setValue('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.name} ({curr.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {getCurrencySymbol()}
                      </span>
                    </div>
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      )}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.price.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Compare-at price</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {getCurrencySymbol()}
                      </span>
                    </div>
                    <Controller
                      name="compareAtPrice"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="compareAtPrice"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                        />
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    To show a reduced price, move the product's price to Compare-at price.
                    Enter a lower value into Price.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPerItem">Cost per item</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {getCurrencySymbol()}
                    </span>
                  </div>
                  <Controller
                    name="costPerItem"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="costPerItem"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-10"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                      />
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Customers won't see this.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                  <Input
                    id="sku"
                    placeholder="e.g. T-SHIRT-BLK"
                    {...register('sku')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode (ISBN, UPC, GTIN, etc.)</Label>
                  <Input
                    id="barcode"
                    placeholder="e.g. 123456789012"
                    {...register('barcode')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inventory">Quantity *</Label>
                <Controller
                  name="inventory"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="inventory"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
                {errors.inventory && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.inventory.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <div className="relative">
                  <Controller
                    name="weight"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                      />
                    )}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">kg</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>
                Add variants if this product comes in multiple versions, like different sizes or colors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-variants"
                    checked={hasVariants}
                    onCheckedChange={(checked) => setHasVariants(checked)}
                  />
                  <Label htmlFor="has-variants">This product has multiple options, like different sizes or colors</Label>
                </div>

                {hasVariants && (
                  <div className="space-y-4">
                    <div className="border rounded-md p-4 space-y-4">
                      {variants.map((variant, index) => (
                        <div key={variant.id} className="border rounded p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{variant.name}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariant(variant.id as string)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Price</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={variant.price}
                                onChange={(e) =>
                                  updateVariant(variant.id as string, {
                                    price: parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>SKU</Label>
                              <Input
                                value={variant.sku || ''}
                                onChange={(e) =>
                                  updateVariant(variant.id as string, {
                                    sku: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Quantity</Label>
                              <Input
                                type="number"
                                min="0"
                                value={variant.inventory}
                                onChange={(e) =>
                                  updateVariant(variant.id as string, {
                                    inventory: parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={addVariant}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Variant
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setValue('status', value as 'draft' | 'published' | 'archived')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isTaxable"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="is-taxable"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="is-taxable">Charge tax on this product</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="requiresShipping"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="requires-shipping"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="requires-shipping">This is a physical product</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {subcategories.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select
                    value={subcategory}
                    onValueChange={handleSubcategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((sub, index) => (
                        <SelectItem key={index} value={sub.name}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {subcategoryItems.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subcategoryItem">Subcategory Item</Label>
                  <Select
                    value={selectedSubcategoryItem}
                    onValueChange={(value) => {
                      setValue('subcategoryItem', value);
                      setSelectedSubcategoryItem(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory item" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategoryItems.map((item, index) => (
                        <SelectItem key={index} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-10">
                  {(tags || []).map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    className="flex-1 min-w-[100px] outline-none text-sm"
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                    onKeyUp={addTag}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Press Enter to add a tag
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}