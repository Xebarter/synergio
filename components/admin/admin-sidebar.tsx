"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChartBar as BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Chrome as Home, 
  ArrowLeft, 
  Warehouse, 
  RefreshCcw, 
  Tag, 
  TrendingUp, 
  FileText,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const navigationItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package, badge: 234 },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, badge: 12 },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/admin/returns', label: 'Returns', icon: RefreshCcw, badge: 3 },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      // On mobile, toggle the mobile menu
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      // On desktop, toggle the collapsed state
      setIsCollapsed(!isCollapsed);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile menu toggle button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleSidebar}
          className="bg-white shadow-md rounded-lg"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Collapsible Desktop Toggle Button */}
      {!isCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="hidden lg:flex fixed top-4 left-64 z-40 bg-white shadow-md rounded-lg ml-2 transition-all duration-300"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-30 h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link 
              href="/admin" 
              className={cn(
                "flex items-center space-x-2",
                isCollapsed && "justify-center w-full"
              )}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              {!isCollapsed && (
                <div>
                  <span className="text-lg font-bold text-gray-900">Synergio</span>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              )}
            </Link>
            
            {!isCollapsed && (
              <Link href="/">
                <Button variant="ghost" size="sm" title="Back to Store">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2 overflow-y-auto h-full pb-20">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? pathname === item.href
              : pathname?.startsWith(item.href) && item.href !== '/admin';
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start micro-interaction group",
                    isCollapsed ? "px-2 justify-center" : "px-4",
                    isActive && "bg-primary-50 text-primary-700 border-primary-200"
                  )}
                >
                  <Icon className={cn(
                    "transition-colors",
                    isCollapsed ? "h-5 w-5" : "mr-3 h-5 w-5",
                    isActive ? "text-primary-600" : "text-gray-500 group-hover:text-gray-700"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge 
                          variant={isActive ? "default" : "secondary"} 
                          className={cn(
                            "ml-auto text-xs",
                            isActive 
                              ? "bg-primary-100 text-primary-700" 
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          {!isCollapsed && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Powered by Synergio v1.0
              </p>
            </div>
          )}
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="w-full flex justify-center"
              title="Expand sidebar"
            >
              <ChevronLeft className="h-5 w-5 rotate-180" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}