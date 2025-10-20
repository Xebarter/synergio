"use client";

import React from 'react';
import { ProductCard } from '@/components/product/product-card';
import { ProductList } from './ProductList';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: any[];
  className?: string;
  showQuickAdd?: boolean;
  showWishlist?: boolean;
  viewMode?: 'grid' | 'list';
}

function ProductGrid({ 
  products, 
  className, 
  showQuickAdd = true, 
  showWishlist = true,
  viewMode = 'grid'
}: ProductGridProps) {
  if (viewMode === 'list') {
    return <ProductList products={products} className={className} />;
  }

  return (
    <div className={cn(
      "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6",
      className
    )}>
      {products.map((product, index) => (
        <div 
          key={product.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ProductCard 
            product={product}
            showQuickAdd={showQuickAdd}
            showWishlist={showWishlist}
          />
        </div>
      ))}
    </div>
  );
}

export { ProductGrid };