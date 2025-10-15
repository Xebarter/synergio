"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/store";
import Link from "next/link";

export function CartButton() {
  const { totalItems } = useCartStore();

  return (
    <Link href="/cart" className="relative group">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative hover:bg-gray-100 rounded-xl transition-colors group"
        aria-label={`Cart (${totalItems} items)`}
      >
        <ShoppingCart className="h-5 w-5 text-gray-700 group-hover:text-primary-600 transition-colors" />
        {totalItems > 0 && (
          <Badge
            variant="secondary"
            className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center bg-primary-600 text-white text-xs font-medium border-2 border-white shadow-sm animate-pulse"
          >
            {totalItems > 99 ? '99+' : totalItems}
          </Badge>
        )}
      </Button>
    </Link>
  );
}
