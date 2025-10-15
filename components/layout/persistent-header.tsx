"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  User, 
  Bell, 
  Settings,
  LogOut,
  Package,
  MessageSquare,
  Heart,
  ChevronDown,
  Menu,
  X,
  PanelLeft
} from 'lucide-react';
import { CartButton } from "@/components/cart/cart-button";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface User {
  name: string;
  email: string;
  role: string;
  points: number;
  avatar?: string;
}

interface PersistentHeaderProps {
  user?: User;
  onExpandSidebar?: () => void;
  onCollapseSidebar?: () => void;
}

export function PersistentHeader({ user, onExpandSidebar, onCollapseSidebar }: PersistentHeaderProps) {
  const { totalItems } = useCartStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 h-16 z-40 transition-all duration-300",
      isScrolled 
        ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-lg' 
        : 'bg-white/90 backdrop-blur-lg border-b border-gray-100/50 shadow-sm'
    )}>
      <div className="h-full flex items-center justify-between px-6 lg:px-8">
        {/* Mobile menu toggle */}
        <div className="lg:hidden mr-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Sidebar toggle for desktop */}
        <div className="hidden lg:block mr-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => {
              console.log("Sidebar toggle button clicked");
              if (onExpandSidebar) {
                console.log("Calling onExpandSidebar");
                onExpandSidebar();
              } else {
                console.log("onExpandSidebar is not defined");
              }
            }}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:block flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors" />
            <Input
              type="text"
              placeholder="Search products, orders, customers..."
              className="pl-12 pr-4 py-2.5 w-full bg-gray-50/80 border-gray-200 hover:bg-white focus:bg-white focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:border-primary-500 transition-all duration-200 text-sm rounded-xl shadow-sm"
            />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden xl:inline-flex items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Mobile Search Trigger */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="pt-16">
              <SheetHeader>
                <SheetTitle>Search Products</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search products, brands, or categories..."
                    className="pl-10 pr-4 py-3 w-full bg-gray-50 border-gray-200 focus:bg-white focus-visible:ring-2 focus-visible:ring-primary-500/20"
                    onChange={(e) => {
                      // Here you would typically call an API endpoint
                      // to fetch search results
                      console.log('Searching for:', e.target.value);
                    }}
                  />
                </div>
              </div>
              
              {/* Mobile search results */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Recent Searches</h3>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Search className="h-4 w-4 mr-2" />
                    Wireless Mouse
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Search className="h-4 w-4 mr-2" />
                    Gaming Keyboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Search className="h-4 w-4 mr-2" />
                    Bluetooth Headphones
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-gray-100 rounded-xl transition-colors group"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                <Badge className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-medium border-2 border-white shadow-sm animate-pulse">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-lg border border-gray-200">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Badge variant="secondary" className="text-xs">3 New</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="flex items-start space-x-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">New order received</p>
                    <p className="text-xs text-gray-500 mt-1">Order #SYN-2024-0012 from John Doe</p>
                    <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start space-x-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Payment confirmed</p>
                    <p className="text-xs text-gray-500 mt-1">UGX 245,000 payment processed</p>
                    <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start space-x-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Low stock alert</p>
                    <p className="text-xs text-gray-500 mt-1">Wireless Mouse running low</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary-600 font-medium cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wishlist */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-gray-100 rounded-xl transition-colors group"
            aria-label="Wishlist"
            asChild
          >
            <Link href="/wishlist">
              <Heart className="h-5 w-5 text-gray-600 group-hover:text-red-500 transition-colors" />
            </Link>
          </Button>

          {/* Cart */}
          <CartButton />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Account"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-lg border border-gray-200">
              <DropdownMenuLabel className="flex items-center space-x-3 p-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                  <p className="text-xs text-gray-500 truncate">admin@synergio.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span>Profile & Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                <Settings className="h-4 w-4 text-gray-600" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                <Package className="h-4 w-4 text-gray-600" />
                <span>Order Management</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                <MessageSquare className="h-4 w-4 text-gray-600" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-red-50 text-red-600 rounded-lg">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Add search results dropdown for desktop */}
      <div className="hidden lg:block absolute left-0 right-0 top-full mt-2 z-50">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform transition-all duration-200 ease-in-out opacity-0 scale-95 translate-y-2 pointer-events-none">
          <div className="p-4">
            <p className="text-sm text-gray-500">Try searching for products, orders, or customers</p>
          </div>
        </div>
      </div>
    </header>
  );
}
