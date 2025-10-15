import React, { memo } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: {
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
  };
  showQuickAdd?: boolean;
  showWishlist?: boolean;
  className?: string;
}

function ProductCard({ 
  product, 
  showQuickAdd = true, 
  showWishlist = true, 
  className 
}: ProductCardProps) {
  const { addItem } = useCartStore();
  
  const price = product.price_cents / 100;
  const comparePrice = product.compare_at_price_cents ? product.compare_at_price_cents / 100 : null;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const imageUrl = product.thumbnail || product.images[0] || 'https://placehold.co/300x300?text=No+Image';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: price,
      image: imageUrl,
    });
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 micro-interaction h-full flex flex-col",
      className
    )}>
      <div className="relative flex-grow">
        {/* Product Image */}
        <Link href={`/products/${product.slug}`} prefetch={false} className="block h-full">
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <ProductImage
              src={imageUrl}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 360px) 50vw, (max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            />
            
            {/* Overlay on hover - only show when image is loaded */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
            
            {/* Quick view button */}
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm"
            >
              <Eye className="h-4 w-4" />
            </Button>
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
          {product.stock === 0 && (
            <Badge variant="outline" className="bg-white/90 text-gray-700 text-xs">Out of Stock</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        {showWishlist && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm"
          >
            <Heart className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CardContent className="p-3 sm:p-4 flex-grow flex flex-col">
        {/* Product Title */}
        <Link href={`/products/${product.slug}`} prefetch={false}>
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3 sm:h-4 sm:w-4",
                  i < Math.floor(product.rating_average)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">({product.rating_count})</span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3 mt-auto">
          <span className="font-bold text-base sm:text-lg text-gray-900">
            UGX {price.toLocaleString()}
          </span>
          {comparePrice && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">
              UGX {comparePrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        {showQuickAdd && (
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            size="sm"
            className={cn(
              "w-full micro-interaction text-xs sm:text-sm py-2",
              product.stock === 0 
                ? "opacity-50 cursor-not-allowed" 
                : "gradient-primary text-white hover:opacity-90"
            )}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            <span className="whitespace-nowrap">
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export { ProductCard };