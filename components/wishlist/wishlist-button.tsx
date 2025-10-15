"use client";

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/lib/wishlist-store';

interface WishlistButtonProps {
  productId: string;
  variant?: 'icon' | 'text';
  className?: string;
  iconSize?: number;
  showText?: boolean;
}

export function WishlistButton({
  productId,
  variant = 'icon',
  className,
  iconSize = 20,
  showText = true,
}: WishlistButtonProps) {
  const { items, addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const isInWishlistState = isInWishlist(productId);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentItem = items.find(item => item.productId === productId);
    
    if (currentItem) {
      removeFromWishlist(currentItem.id);
    } else {
      // You'll need to pass the product details when using this component
      // Example: onAddToWishlist({ productId, name, price, image, slug })
      console.warn('Product details not provided for wishlist');
    }
  };

  if (variant === 'text') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleWishlistClick}
        className={cn(
          'flex items-center gap-2 text-sm',
          isInWishlistState ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-gray-900',
          className
        )}
      >
        <Heart
          className={cn(
            'h-4 w-4',
            isInWishlistState ? 'fill-current' : 'fill-none'
          )}
          size={iconSize}
        />
        {showText && (
          <span>{isInWishlistState ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleWishlistClick}
      className={cn(
        'rounded-full hover:bg-gray-100',
        isInWishlistState ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-gray-900',
        className
      )}
      aria-label={isInWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={cn(
          'h-5 w-5',
          isInWishlistState ? 'fill-current' : 'fill-none'
        )}
        size={iconSize}
      />
    </Button>
  );
}
