"use client"

import React from 'react';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function CartSidebar() {
  const { items, totalItems, totalPrice, isOpen, toggleCart, updateQuantity, removeItem } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={toggleCart}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out",
        "flex flex-col"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span className="font-semibold text-lg">Shopping Cart</span>
            {totalItems > 0 && (
              <Badge variant="secondary">{totalItems}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={toggleCart}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-4">Add some products to get started!</p>
              <Button onClick={toggleCart}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 animate-fade-in">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">{item.title}</h4>
                    <p className="text-sm text-gray-600">UGX {item.price.toLocaleString()}</p>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-sm">UGX {(item.price * item.quantity).toLocaleString()}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 h-auto p-0 mt-1"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>UGX {totalPrice.toLocaleString()}</span>
            </div>
            
            <div className="space-y-2">
              <Button size="lg" className="w-full gradient-primary text-white micro-interaction">
                Checkout
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={toggleCart}>
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}