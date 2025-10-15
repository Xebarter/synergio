import { useWishlistStore } from './wishlist-store';

export function useWishlist() {
  const { items, addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  const toggleWishlistItem = (product: {
    productId: string;
    name: string;
    price: number;
    image: string;
    slug: string;
    inStock: boolean;
  }) => {
    if (isInWishlist(product.productId)) {
      const item = items.find(item => item.productId === product.productId);
      if (item) {
        removeFromWishlist(item.id);
      }
    } else {
      addToWishlist({
        ...product,
        productId: product.productId,
      });
    }
  };

  return {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlistItem,
    wishlistCount: items.length,
  };
}
