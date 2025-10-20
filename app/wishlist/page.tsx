"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/lib/wishlist-store';
import { Heart, ArrowRight, ShoppingBag, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg p-4 space-y-4">
                <div className="aspect-square bg-gray-200 rounded-md"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
          <p className="text-gray-600 mb-8">
            You haven't added any products to your wishlist yet. Start exploring our collection!
          </p>
          <Button onClick={() => router.push('/products')}>
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Wishlist</h1>
          <p className="text-gray-600">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>
        <Button
          variant="outline"
          onClick={clearWishlist}
          className="mt-4 md:mt-0"
          disabled={items.length === 0}
        >
          Clear Wishlist
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
          >
            <button
              onClick={() => removeFromWishlist(item.id)}
              className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Remove from wishlist"
            >
              <X className="h-4 w-4 text-gray-700" />
            </button>
            
            <Link href={`/products/${item.slug}`} className="block">
              <div className="aspect-square bg-gray-100 relative">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">{item.name}</h3>
                <p className="text-lg font-semibold text-gray-900">
                  ${item.price.toFixed(2)}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={cn(
                    'text-sm',
                    item.inStock ? 'text-green-600' : 'text-red-600'
                  )}>
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </Link>

            <div className="p-4 pt-0">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  if (item.inStock) {
                    addItem({
                      id: item.productId,
                      productId: item.productId,
                      title: item.name,
                      price: item.price,
                      image: item.image,
                      quantity: 1,
                    });
                  }
                }}
                disabled={!item.inStock}
              >
                <ShoppingBag className="h-4 w-4" />
                {item.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
