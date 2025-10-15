"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Search, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import type { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ProductsTableProps {
  products: Product[];
  isLoading?: boolean;
  onDelete: (id: string) => Promise<void>;
  onBulkDelete: (ids: string[]) => Promise<void>;
  onStatusChange: (id: string, status: 'draft' | 'published' | 'archived') => Promise<void>;
}

export function ProductsTable({ products, isLoading, onDelete, onBulkDelete, onStatusChange }: ProductsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>(''); // Explicitly type and initialize as empty string
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && typeof product.category === 'object' && product.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key as keyof Product];
    const bValue = b[sortConfig.key as keyof Product];

    if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
    if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadgeVariant = (is_active: boolean) => {
    return is_active ? 'default' : 'secondary';
  };

  const getStatusText = (is_active: boolean) => {
    return is_active ? 'published' : 'draft';
  };

  const formatCurrency = (cents: number, currency: string = 'UGX') => {
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                disabled
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-10 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
              </TableHead>
              <TableHead>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </TableHead>
              <TableHead>
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </TableHead>
              <TableHead>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </TableHead>
              <TableHead>
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </TableHead>
              <TableHead>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </TableHead>
              <TableHead>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </TableHead>
              <TableHead className="text-right">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse ml-auto"></div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="h-5 bg-gray-200 rounded w-5 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-8 bg-gray-200 rounded w-8 ml-auto animate-pulse"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  const handleSelectProduct = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(productId => productId !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === sortedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(sortedProducts.map(product => product.id));
    }
  };

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (productToDelete) {
      try {
        await onDelete(productToDelete);
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handleBulkDeleteClick = async () => {
    if (selectedProducts.length > 0) {
      try {
        await onBulkDelete(selectedProducts);
        setSelectedProducts([]);
      } catch (error) {
        console.error('Failed to delete products:', error);
      }
    }
  };

  const handleStatusChangeClick = async (id: string, status: 'draft' | 'published' | 'archived') => {
    try {
      await onStatusChange(id, status);
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  return (
    <>
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              {selectedProducts.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDeleteClick}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedProducts.length})
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={selectedProducts.length === sortedProducts.length && sortedProducts.length > 0}
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                <div className="flex items-center">
                  Product
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('price_cents')}>
                <div className="flex items-center">
                  Price
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('stock')}>
                <div className="flex items-center">
                  Stock
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                <div className="flex items-center">
                  Created
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              sortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectedProducts.includes(product.id) || false}
                      onChange={() => handleSelectProduct(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="relative h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.jpg';
                            }}
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.category && typeof product.category === 'object' ? product.category.name : 'Uncategorized'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {product.sku}
                  </TableCell>
                  <TableCell>
                    {product.compare_at_price_cents && product.compare_at_price_cents > product.price_cents ? (
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatCurrency(product.price_cents, product.currency)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(product.compare_at_price_cents, product.currency)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">
                        {formatCurrency(product.price_cents, product.currency)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-16 rounded-full bg-gray-200">
                        <div 
                          className={`h-full ${
                            product.stock === 0 
                              ? 'bg-red-500' 
                              : product.stock < 10 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (product.stock / (product.stock + 10)) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{product.stock}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(product.is_active)}>
                      {getStatusText(product.is_active)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.created_at
                      ? format(new Date(product.created_at), 'MMM d, yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/products/${product.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChangeClick(
                            product.id, 
                            product.is_active ? 'draft' : 'published'
                          )}
                        >
                          {product.is_active ? 'Unpublish' : 'Publish'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDelete(product.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}