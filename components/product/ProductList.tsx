"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  slug: string;
  price_cents: number;
  compare_at_price_cents?: number;
  images: string[];
  thumbnail?: string;
  rating_average: number;
  rating_count: number;
  is_featured?: boolean;
  stock: number;
}

interface ProductListProps {
  products: Product[];
  className?: string;
}

export function ProductList({ products, className }: ProductListProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    
    const price = product.price_cents / 100;
    const imageUrl = product.thumbnail || product.images[0] || 'https://via.placeholder.com/300x300?text=No+Image';
    
    addItem({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: price,
      image: imageUrl,
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {products.map((product) => {
        const price = product.price_cents / 100;
        const comparePrice = product.compare_at_price_cents ? product.compare_at_price_cents / 100 : null;
        const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
        const imageUrl = product.thumbnail || product.images[0] || 'https://via.placeholder.com/300x300?text=No+Image';

        return (
          <Card key={product.id} className="flex flex-col sm:flex-row overflow-hidden hover:shadow-lg transition-shadow">
            {/* Product Image */}
            <div className="relative sm:w-48 h-48 flex-shrink-0">
              <Link href={`/products/${product.slug}`}>
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
              
              {/* Badges */}
              <div className="absolute top-2 left-2 space-y-1">
                {product.is_featured && (
                  <Badge className="bg-warm-500 text-white text-xs">Featured</Badge>
                )}
                {discount > 0 && (
                  <Badge className="bg-accent-500 text-white text-xs">-{discount}%</Badge>
                )}
              </div>
            </div>
            
            {/* Product Details */}
            <div className="flex-grow p-4 flex flex-col">
              <div className="flex-grow">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-semibold text-lg text-gray-900 hover:text-primary-600 transition-colors">
                    {product.title}
                  </h3>
                </Link>
                
                {/* Rating */}
                <div className="flex items-center space-x-1 my-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(product.rating_average)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.rating_count})</span>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  Experience premium quality with this exceptional product. Perfect for your needs and designed for optimal performance.
                </p>
              </div>
              
              {/* Price and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg text-gray-900">
                    UGX {price.toLocaleString()}
                  </span>
                  {comparePrice && (
                    <span className="text-sm text-gray-500 line-through">
                      UGX {comparePrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={product.stock === 0}
                    size="sm"
                    className={cn(
                      product.stock === 0 
                        ? "opacity-50 cursor-not-allowed" 
                        : "gradient-primary text-white hover:opacity-90"
                    )}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  
                  <Button size="sm" variant="outline">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}