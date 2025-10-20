"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Grid3X3, 
  Heart, 
  User, 
  ChevronDown, 
  ChevronRight, 
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/store';

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
  product_count?: number;
}

interface SubcategoryItem {
  name: string;
  items: string[];
}

interface NewCategory {
  name: string;
  subcategories: SubcategoryItem[];
}

interface User {
  name: string;
  email: string;
  role: string;
  points: number;
  avatar?: string;
}

interface PersistentSidebarProps {
  user?: User;
  categories?: Category[];
  className?: string;
}

const newCategories: NewCategory[] = [
  {
    "name": "Phones & Tablets",
    "subcategories": [
      { "name": "Smartphones", "items": ["Android", "iPhone", "Feature", "Refurb"] },
      { "name": "Tablets", "items": ["Android", "iPad", "Kids", "Keyboards"] },
      { "name": "Wearables", "items": ["Smartwatch", "Fitness", "Glasses"] },
      { "name": "Accessories", "items": ["Cases", "Protectors", "Power Banks", "Cables", "Earphones", "Cards", "Mounts"] }
    ]
  },
  {
    "name": "Computers",
    "subcategories": [
      { "name": "Computers", "items": ["Laptops", "Desktops", "Mini PC", "All-in-One"] },
      { "name": "Accessories", "items": ["Keyboards", "Monitors", "Drives", "Bags", "Printers"] },
      { "name": "Networking", "items": ["Routers", "Modems", "Switches", "Cables"] },
      { "name": "Photography", "items": ["Cameras", "Drones", "Lenses", "Bags"] },
      { "name": "Audio & Video", "items": ["Headphones", "Speakers", "Mics", "Home Theatre"] },
      { "name": "Gaming", "items": ["Consoles", "Controllers", "Headsets", "Accessories"] }
    ]
  },
  {
    "name": "Home & Kitchen",
    "subcategories": [
      { "name": "Appliances", "items": ["Fridges", "Washers", "Microwaves", "Cookers"] },
      { "name": "Kitchenware", "items": ["Cookware", "Bakeware", "Cutlery", "Blenders"] },
      { "name": "Décor", "items": ["Wall Art", "Clocks", "Rugs", "Lighting"] },
      { "name": "Furniture", "items": ["Sofas", "Tables", "Beds", "Cabinets"] }
    ]
  },
  {
    "name": "Fashion",
    "subcategories": [
      { "name": "Men", "items": ["Shirts", "Jeans", "Jackets", "Shoes"] },
      { "name": "Women", "items": ["Dresses", "Tops", "Pants", "Shoes"] },
      { "name": "Kids", "items": ["Boys", "Girls", "Baby", "Shoes"] },
      { "name": "Accessories", "items": ["Glasses", "Belts", "Scarves", "Jewelry"] }
    ]
  },
  {
    "name": "Beauty & Health",
    "subcategories": [
      { "name": "Beauty", "items": ["Makeup", "Brushes", "Fragrances", "Nails"] },
      { "name": "Skincare", "items": ["Creams", "Lotions", "Sunscreen", "Masks"] },
      { "name": "Hair Care", "items": ["Shampoo", "Treatments", "Wigs", "Tools"] },
      { "name": "Health", "items": ["Vitamins", "Wellness", "First Aid", "Hygiene"] }
    ]
  },
  {
    "name": "Sports & Outdoors",
    "subcategories": [
      { "name": "Sports", "items": ["Football", "Basketball", "Tennis", "Gear"] },
      { "name": "Fitness", "items": ["Treadmills", "Weights", "Yoga"] },
      { "name": "Outdoor", "items": ["Tents", "Backpacks", "Hiking", "Bottles"] }
    ]
  },
  {
    "name": "Groceries",
    "subcategories": [
      { "name": "Food", "items": ["Rice", "Pasta", "Oils", "Spices"] },
      { "name": "Beverages", "items": ["Tea", "Coffee", "Drinks", "Water"] },
      { "name": "Snacks", "items": ["Biscuits", "Chocolates", "Chips", "Nuts"] },
      { "name": "Supplies", "items": ["Cleaning", "Detergent", "Paper"] }
    ]
  },
  {
    "name": "Toys & Games",
    "subcategories": [
      { "name": "Baby", "items": ["Diapers", "Food", "Bottles", "Clothing"] },
      { "name": "Baby Gear", "items": ["Strollers", "Car Seats", "Carriers"] },
      { "name": "Toys", "items": ["Educational", "Figures", "Puzzles", "RC Toys"] }
    ]
  },
  {
    "name": "Automotive",
    "subcategories": [
      { "name": "Car Items", "items": ["Electronics", "Care", "Tires", "Fluids"] },
      { "name": "Industrial", "items": ["Power Tools", "Safety", "Equipment"] }
    ]
  },
  {
    "name": "Garden & Tools",
    "subcategories": [
      { "name": "Gardening", "items": ["Seeds", "Pots", "Watering", "Soil"] },
      { "name": "Tools", "items": ["Hand", "Power", "Storage"] },
      { "name": "Outdoor", "items": ["Furniture", "BBQ", "Lighting"] }
    ]
  },
  {
    "name": "Office",
    "subcategories": [
      { "name": "Equipment", "items": ["Printers", "Shredders", "Projectors"] },
      { "name": "Furniture", "items": ["Desks", "Chairs", "Cabinets"] },
      { "name": "Stationery", "items": ["Notebooks", "Pens", "Files", "Paper"] }
    ]
  },
  {
    "name": "Arts & Crafts",
    "subcategories": [
      { "name": "Supplies", "items": ["Paints", "Canvases", "Drawing", "Paper"] },
      { "name": "Crafts", "items": ["Sewing", "Beads", "DIY Kits"] },
      { "name": "Music", "items": ["Guitars", "Drums", "Studio"] }
    ]
  },
  {
    "name": "Travel",
    "subcategories": [
      { "name": "Luggage", "items": ["Suitcases", "Backpacks", "Duffels", "Pouches"] },
      { "name": "Accessories", "items": ["Pillows", "Bottles", "Adapters"] },
      { "name": "Lifestyle", "items": ["Glasses", "Watches", "Trackers"] }
    ]
  },
  {
    "name": "Services",
    "subcategories": [
      { "name": "Home", "items": ["Cleaning", "Repairs", "Plumbing"] },
      { "name": "Beauty", "items": ["Hair", "Massage", "Makeup"] },
      { "name": "Other", "items": ["Photography", "Printing", "IT Support"] }
    ]
  }
];

const sampleCategories: Category[] = [
  { id: '1', name: 'Phones & Tablets', slug: 'phones-tablets', product_count: 150 },
  { id: '2', name: 'Electronics', slug: 'electronics', product_count: 245 },
  { id: '3', name: 'Home & Kitchen', slug: 'home-kitchen', product_count: 180 },
];

export function PersistentSidebar({ user, categories = sampleCategories, className }: PersistentSidebarProps) {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState<number | null>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Products', icon: Grid3X3 },
    { href: '/b2b', label: 'B2B', icon: Grid3X3 },
  ];

  return (
    <>
      {/* Mobile menu toggle - only visible on mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-md border border-gray-200"
        >
          {isMobileMenuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
        </button>
      </div>

      {/* Expand button - visible when sidebar is collapsed on desktop */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="hidden lg:block absolute top-4 left-4 z-50 p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-md border border-gray-200"
          title="Expand sidebar"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
      )}

      {/* Sidebar */}
      <div className={cn(
        "h-screen w-72 bg-gradient-to-b from-white via-white to-gray-50 border-r border-gray-200/50 shadow-lg overflow-y-auto",
        "transform transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isMobileMenuOpen ? "fixed inset-0 z-30 translate-x-0" : "hidden lg:block lg:translate-x-0",
        isCollapsed && "lg:hidden",
        className
      )}>
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm p-4 border-b border-gray-100 z-20">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">Synergio</span>
                <p className="text-xs text-gray-500">Shop Smart</p>
              </div>
            </Link>
            {/* Collapse button - visible on desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight 
                className={cn(
                  "h-5 w-5 text-gray-700 transition-transform duration-200",
                  isCollapsed ? "rotate-0" : "rotate-180"
                )} 
              />
            </button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="p-3 space-y-2 border-b border-gray-100">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
            
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-blue-50 text-blue-700 shadow-sm" 
                      : "hover:bg-gray-100 text-gray-900"
                  )}
                >
                  <Icon className={cn("mr-3 h-5 w-5", isActive ? "" : "text-gray-700")} />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Categories */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center mb-3 px-2">
            <Grid3X3 className="h-4 w-4 mr-2 text-gray-600" />
            <span className="font-semibold text-gray-900 text-sm">Browse</span>
          </div>
          
          <div className="space-y-1">
            {newCategories.map((category, index) => (
              <div key={index} className="group">
                <button
                  onClick={() => setActiveCategory(activeCategory === index ? null : index)}
                  onMouseEnter={() => setHoveredCategory(index)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200",
                    activeCategory === index || hoveredCategory === index
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <span className="text-sm font-medium truncate">{category.name}</span>
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-transform duration-200",
                      activeCategory === index ? "rotate-90 text-blue-600" : "text-gray-400"
                    )}
                  />
                </button>

                {/* Submenu */}
                {activeCategory === index && (
                  <div className="mt-1 ml-2 pl-2 border-l-2 border-gray-200 space-y-1">
                    {category.subcategories.map((subcategory, subIndex) => (
                      <div key={subIndex}>
                        <p className="text-xs font-semibold text-gray-800 px-2 py-1.5 uppercase tracking-wide">
                          {subcategory.name}
                        </p>
                        <div className="space-y-0.5">
                          {subcategory.items.map((item, itemIndex) => (
                            <button
                              key={itemIndex}
                              className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-150 font-medium"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Account & Support */}
        <div className="p-3 border-b border-gray-100 space-y-2">
          <Link href="/support" onClick={() => setIsMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start rounded-lg hover:bg-gray-100">
              <Heart className="mr-3 h-5 w-5 text-gray-700" />
              <span className="text-sm font-medium text-gray-900">Support</span>
            </Button>
          </Link>
          <Link href="/account" onClick={() => setIsMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start rounded-lg hover:bg-gray-100">
              <User className="mr-3 h-5 w-5 text-gray-700" />
              <span className="text-sm font-medium text-gray-900">Account</span>
            </Button>
          </Link>
        </div>

        {/* Footer Badge */}
        <div className="p-3">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-900 font-medium">✨ Free shipping on orders over $50</p>
          </div>
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
