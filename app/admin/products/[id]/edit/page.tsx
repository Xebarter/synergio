"use client";

import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ProductForm } from '@/components/admin/products/product-form';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Category as BaseCategory } from '@/types';

// Extend the Category type to include items property
interface Category extends BaseCategory {
  children?: Category[];
  items?: string[];
}

// Updated categories to match those in persistent-sidebar.tsx with subcategories
const categories: Category[] = [
  {
    "id": "1",
    "name": "Phones & Tablets",
    "slug": "phones-tablets",
    "sort_order": 1,
    "is_featured": true,
    "is_active": true,
    "created_at": new Date().toISOString(),
    "updated_at": new Date().toISOString(),
    "children": [
      { 
        "id": "1-1",
        "name": "Smartphones", 
        "slug": "phones-tablets-smartphones",
        "sort_order": 1,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Android", "iPhone", "Feature", "Refurb"] 
      } as Category,
      { 
        "id": "1-2",
        "name": "Tablets", 
        "slug": "phones-tablets-tablets",
        "sort_order": 2,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Android", "iPad", "Kids", "Keyboards"] 
      } as Category,
      { 
        "id": "1-3",
        "name": "Wearables", 
        "slug": "phones-tablets-wearables",
        "sort_order": 3,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Smartwatch", "Fitness", "Glasses"] 
      } as Category,
      { 
        "id": "1-4",
        "name": "Accessories", 
        "slug": "phones-tablets-accessories",
        "sort_order": 4,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Cases", "Protectors", "Power Banks", "Cables", "Earphones", "Cards", "Mounts"] 
      } as Category
    ]
  },
  {
    "id": "2",
    "name": "Computers",
    "slug": "computers",
    "sort_order": 2,
    "is_featured": true,
    "is_active": true,
    "created_at": new Date().toISOString(),
    "updated_at": new Date().toISOString(),
    "children": [
      { 
        "id": "2-1",
        "name": "Computers", 
        "slug": "computers-computers",
        "sort_order": 1,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Laptops", "Desktops", "Mini PC", "All-in-One"] 
      } as Category,
      { 
        "id": "2-2",
        "name": "Accessories", 
        "slug": "computers-accessories",
        "sort_order": 2,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Keyboards", "Monitors", "Drives", "Bags", "Printers"] 
      } as Category,
      { 
        "id": "2-3",
        "name": "Networking", 
        "slug": "computers-networking",
        "sort_order": 3,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Routers", "Modems", "Switches", "Cables"] 
      } as Category,
      { 
        "id": "2-4",
        "name": "Photography", 
        "slug": "computers-photography",
        "sort_order": 4,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Cameras", "Drones", "Lenses", "Bags"] 
      } as Category,
      { 
        "id": "2-5",
        "name": "Audio & Video", 
        "slug": "computers-audio-video",
        "sort_order": 5,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Headphones", "Speakers", "Mics", "Home Theatre"] 
      } as Category,
      { 
        "id": "2-6",
        "name": "Gaming", 
        "slug": "computers-gaming",
        "sort_order": 6,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Consoles", "Controllers", "Headsets", "Accessories"] 
      } as Category
    ]
  },
  {
    "id": "3",
    "name": "Home & Kitchen",
    "slug": "home-kitchen",
    "sort_order": 3,
    "is_featured": true,
    "is_active": true,
    "created_at": new Date().toISOString(),
    "updated_at": new Date().toISOString(),
    "children": [
      { 
        "id": "3-1",
        "name": "Appliances", 
        "slug": "home-kitchen-appliances",
        "sort_order": 1,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Fridges", "Washers", "Microwaves", "Cookers"] 
      } as Category,
      { 
        "id": "3-2",
        "name": "Kitchenware", 
        "slug": "home-kitchen-kitchenware",
        "sort_order": 2,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Cookware", "Bakeware", "Cutlery", "Blenders"] 
      } as Category,
      { 
        "id": "3-3",
        "name": "Décor", 
        "slug": "home-kitchen-decor",
        "sort_order": 3,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Wall Art", "Clocks", "Rugs", "Lighting"] 
      } as Category,
      { 
        "id": "3-4",
        "name": "Furniture", 
        "slug": "home-kitchen-furniture",
        "sort_order": 4,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Sofas", "Tables", "Beds", "Cabinets"] 
      } as Category
    ]
  },
  {
    "id": "4",
    "name": "Fashion",
    "slug": "fashion",
    "sort_order": 4,
    "is_featured": true,
    "is_active": true,
    "created_at": new Date().toISOString(),
    "updated_at": new Date().toISOString(),
    "children": [
      { 
        "id": "4-1",
        "name": "Men", 
        "slug": "fashion-men",
        "sort_order": 1,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Shirts", "Jeans", "Jackets", "Shoes"] 
      } as Category,
      { 
        "id": "4-2",
        "name": "Women", 
        "slug": "fashion-women",
        "sort_order": 2,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Dresses", "Tops", "Pants", "Shoes"] 
      } as Category,
      { 
        "id": "4-3",
        "name": "Kids", 
        "slug": "fashion-kids",
        "sort_order": 3,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Boys", "Girls", "Baby", "Shoes"] 
      } as Category,
      { 
        "id": "4-4",
        "name": "Accessories", 
        "slug": "fashion-accessories",
        "sort_order": 4,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Glasses", "Belts", "Scarves", "Jewelry"] 
      } as Category
    ]
  },
  {
    "id": "5",
    "name": "Beauty & Health",
    "slug": "beauty-health",
    "sort_order": 5,
    "is_featured": true,
    "is_active": true,
    "created_at": new Date().toISOString(),
    "updated_at": new Date().toISOString(),
    "children": [
      { 
        "id": "5-1",
        "name": "Beauty", 
        "slug": "beauty-health-beauty",
        "sort_order": 1,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Makeup", "Brushes", "Fragrances", "Nails"] 
      } as Category,
      { 
        "id": "5-2",
        "name": "Skincare", 
        "slug": "beauty-health-skincare",
        "sort_order": 2,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Creams", "Lotions", "Sunscreen", "Masks"] 
      } as Category,
      { 
        "id": "5-3",
        "name": "Hair Care", 
        "slug": "beauty-health-hair-care",
        "sort_order": 3,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Shampoo", "Treatments", "Wigs", "Tools"] 
      } as Category,
      { 
        "id": "5-4",
        "name": "Health", 
        "slug": "beauty-health-health",
        "sort_order": 4,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Vitamins", "Wellness", "First Aid", "Hygiene"] 
      } as Category
    ]
  },
  {
    "id": "6",
    "name": "Sports & Outdoors",
    "slug": "sports-outdoors",
    "sort_order": 6,
    "is_featured": true,
    "is_active": true,
    "created_at": new Date().toISOString(),
    "updated_at": new Date().toISOString(),
    "children": [
      { 
        "id": "6-1",
        "name": "Sports", 
        "slug": "sports-outdoors-sports",
        "sort_order": 1,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Football", "Basketball", "Tennis", "Gear"] 
      } as Category,
      { 
        "id": "6-2",
        "name": "Fitness", 
        "slug": "sports-outdoors-fitness",
        "sort_order": 2,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Treadmills", "Weights", "Yoga"] 
      } as Category,
      { 
        "id": "6-3",
        "name": "Outdoor", 
        "slug": "sports-outdoors-outdoor",
        "sort_order": 3,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Tents", "Backpacks", "Hiking", "Bottles"] 
      } as Category
    ]
  },
  {
    "id": "7",
    "name": "Groceries",
    "slug": "groceries",
    "sort_order": 7,
    "is_featured": true,
    "is_active": true,
    "created_at": new Date().toISOString(),
    "updated_at": new Date().toISOString(),
    "children": [
      { 
        "id": "7-1",
        "name": "Food", 
        "slug": "groceries-food",
        "sort_order": 1,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Rice", "Pasta", "Oils", "Spices"] 
      } as Category,
      { 
        "id": "7-2",
        "name": "Beverages", 
        "slug": "groceries-beverages",
        "sort_order": 2,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Tea", "Coffee", "Drinks", "Water"] 
      } as Category,
      { 
        "id": "7-3",
        "name": "Snacks", 
        "slug": "groceries-snacks",
        "sort_order": 3,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Biscuits", "Chocolates", "Chips", "Nuts"] 
      } as Category,
      { 
        "id": "7-4",
        "name": "Supplies", 
        "slug": "groceries-supplies",
        "sort_order": 4,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Cleaning", "Detergent", "Paper"] 
      } as Category
    ]
  },
  {
    "id": "8",
    "name": "Toys & Games",
    "slug": "toys-games",
    "sort_order": 8,
    "is_featured": true,
    "is_active": true,
    "created_at": new Date().toISOString(),
    "updated_at": new Date().toISOString(),
    "children": [
      { 
        "id": "8-1",
        "name": "Baby", 
        "slug": "toys-games-baby",
        "sort_order": 1,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Diapers", "Food", "Bottles", "Clothing"] 
      } as Category,
      { 
        "id": "8-2",
        "name": "Baby Gear", 
        "slug": "toys-games-baby-gear",
        "sort_order": 2,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Strollers", "Car Seats", "Carriers"] 
      } as Category,
      { 
        "id": "8-3",
        "name": "Toys", 
        "slug": "toys-games-toys",
        "sort_order": 3,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Educational", "Figures", "Puzzles", "RC Toys"] 
      } as Category
    ]
  },
  {
    "id": "9",
    "name": "Automotive",
    "slug": "automotive",
    "sort_order": 9,
    "is_featured": true,
    "is_active": true,
    "created_at": new Date().toISOString(),
    "updated_at": new Date().toISOString(),
    "children": [
      { 
        "id": "9-1",
        "name": "Car Items", 
        "slug": "automotive-car-items",
        "sort_order": 1,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Electronics", "Care", "Tires", "Fluids"] 
      } as Category,
      { 
        "id": "9-2",
        "name": "Industrial", 
        "slug": "automotive-industrial",
        "sort_order": 2,
        "is_featured": true,
        "is_active": true,
        "created_at": new Date().toISOString(),
        "updated_at": new Date().toISOString(),
        "items": ["Power Tools", "Safety", "Equipment"] 
      } as Category
    ]
  },
  {
    "id": "10",
    "name": "Garden & Tools",
    "slug": "garden-tools",
    "sort_order": 10,
    "is_featured": true,
    "is_active": true,
    "created_at": new Date().toISOString(),
    "updated_at": new Date().toISOString(),
    "children": [
      { "name": "Gardening", "items": ["Seeds", "Pots", "Watering", "Soil"] },
      { "name": "Tools", "items": ["Hand", "Power", "Storage"] },
      { "name": "Outdoor", "items": ["Furniture", "BBQ", "Lighting"] }
    ]
  },
  {
    "id": "11",
    "name": "Office",
    "slug": "office",
    "sort_order": 11,
    "is_featured": true,
    "is_active": true,
    "created_at": new Date().toISOString(),
    "updated_at": new Date().toISOString(),
    "subcategories": [
      { "name": "Equipment", "items": ["Printers", "Shredders", "Projectors"] },
      { "name": "Furniture", "items": ["Desks", "Chairs", "Cabinets"] },
      { "name": "Stationery", "items": ["Notebooks", "Pens", "Files", "Paper"] }
    ]
  },
  {
    "id": "12",
    "name": "Arts & Crafts",
    "slug": "arts-crafts",
    "sort_order": 12,
    "is_featured": true,
    "is_active": true,
    "created_at": new Date().toISOString(),
    "updated_at": new Date().toISOString(),
    "subcategories": [
      { "name": "Supplies", "items": ["Paints", "Canvases", "Drawing", "Paper"] },
      { "name": "Crafts", "items": ["Sewing", "Beads", "DIY Kits"] },
      { "name": "Music", "items": ["Guitars", "Drums", "Studio"] }
    ]
  },
  {
    "id": "13",
    "name": "Travel",
    "slug": "travel",
    "sort_order": 13,
    "is_featured": true,
    "is_active": true,
    "created_at": new Date().toISOString(),
    "updated_at": new Date().toISOString(),
    "subcategories": [
      { "name": "Luggage", "items": ["Suitcases", "Backpacks", "Duffels", "Pouches"] },
      { "name": "Accessories", "items": ["Pillows", "Bottles", "Adapters"] },
      { "name": "Lifestyle", "items": ["Glasses", "Watches", "Trackers"] }
    ]
  },
  {
    "id": "14",
    "name": "Services",
    "slug": "services",
    "sort_order": 14,
    "is_featured": true,
    "is_active": true,
    "created_at": new Date().toISOString(),
    "updated_at": new Date().toISOString(),
    "subcategories": [
      { "name": "Consulting", "items": ["Business", "Tech", "Marketing"] },
      { "name": "Repairs", "items": ["Phone", "Computer", "Appliance"] },
      { "name": "Training", "items": ["Courses", "Workshops", "Coaching"] }
    ]
  }
];

// Updated currencies to match those in persistent-header.tsx
const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'R₣' },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const supabase = createClient();

  useEffect(() => {
    const fetchProduct = async () => {
      // Add null check for params
      if (!params || !params.id) {
        console.error('No product ID provided');
        router.push('/admin/products');
        return;
      }
      
      try {
        console.log('Fetching product with ID:', params.id);
        
        // Fetch category mapping
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name');
          
        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        } else {
          // Create mapping from category names to IDs
          const map: Record<string, string> = {};
          categories.forEach(frontendCategory => {
            const dbCategory = categoriesData.find((c: any) => c.name === frontendCategory.name);
            if (dbCategory) {
              map[frontendCategory.id] = dbCategory.id;
              // Also map category name directly to ID for backward compatibility
              map[frontendCategory.name] = dbCategory.id;
            }
          });
          setCategoryMap(map);
        }
        
        // First get the product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id as string)
          .single();

        if (productError) throw productError;
        
        // Then get variants if they exist
        const { data: variantsData, error: variantsError } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', params.id as string);

        if (variantsError && variantsError.code !== 'PGRST116') { // PGRST116 is "no rows found"
          throw variantsError;
        }

        // Combine product and variants data
        const fullProductData = {
          ...productData,
          variants: variantsData || []
        };

        setProduct(fullProductData);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: 'Error',
          description: 'Failed to load product data',
          variant: 'destructive',
        });
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id, toast, router]);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      // Add null check for params
      if (!params || !params.id) {
        throw new Error('No product ID provided');
      }
      
      // Check if product exists 
      const { data: existingProduct, error: fetchError } = await supabase
        .from('products')
        .select('id')
        .eq('id', params.id as string)
        .single();

      if (fetchError || !existingProduct) {
        throw new Error('Product not found');
      }

      // Get category ID - handle various possible inputs
      let categoryId = null;
      
      // If formData.category is already a valid UUID, use it directly
      if (typeof formData.category === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.category)) {
        categoryId = formData.category;
      } 
      // If categoryMap has a mapping for this category, use it
      else if (categoryMap && categoryMap[formData.category]) {
        categoryId = categoryMap[formData.category];
      } 
      // Try to look up category by name in the database
      else if (typeof formData.category === 'string') {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', formData.category)
          .single();
          
        if (!categoryError && categoryData) {
          categoryId = categoryData.id;
        } else {
          console.warn('Category not found, setting to null:', formData.category);
        }
      }

      // Prepare update data with fields matching the database schema
      const updateData: any = {
        title: formData.name,
        description: formData.description,
        price_cents: Math.round(formData.price * 100), // Convert price to cents
        compare_at_price_cents: formData.compareAtPrice ? Math.round(formData.compareAtPrice * 100) : null,
        cost_cents: formData.costPerItem ? Math.round(formData.costPerItem * 100) : null,
        sku: formData.sku,
        stock: formData.inventory,
        images: formData.images,
        is_active: formData.status === 'published',
        is_featured: formData.isFeatured || false,
        category_id: categoryId, // This will be null if no valid category is found
        tags: formData.tags || [],
        currency: formData.currency || 'USD',
        weight_grams: formData.weight ? Math.round(formData.weight * 1000) : null, // Convert kg to grams
        requires_shipping: formData.requiresShipping !== undefined ? formData.requiresShipping : true,
        is_taxable: formData.isTaxable !== undefined ? formData.isTaxable : true,
        brand: formData.brand || null,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      // Now update the product
      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', params.id as string)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        // Provide more detailed error message
        if (updateError.code === '23503') { // Foreign key violation
          throw new Error(`Invalid category. Please select a valid category.`);
        } else if (updateError.code === '23505') { // Unique violation
          throw new Error(`SKU already exists. Please use a unique SKU.`);
        } else {
          throw new Error(`Failed to update product: ${updateError.message}`);
        }
      }

      // Handle variants if they exist
      if (formData.variants?.length > 0) {
        const { error: variantError } = await supabase
          .from('product_variants')
          .upsert(
            formData.variants.map((variant: any) => ({
              ...variant,
              product_id: params.id as string,
              price_cents: Math.round(variant.price * 100), // Convert price to cents
              compare_at_price_cents: variant.compareAtPrice ? Math.round(variant.compareAtPrice * 100) : null,
              cost_cents: variant.costPerItem ? Math.round(variant.costPerItem * 100) : null,
              updated_at: new Date().toISOString()
            })),
            { onConflict: 'id' }
          );

        if (variantError) {
          console.error('Variant update error:', variantError);
          throw new Error(`Failed to update variants: ${variantError.message}`);
        }
      }

      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });

      router.push('/admin/products');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {product && (
        <ProductForm
          initialData={product}
          categories={categories}
          currencies={currencies}
          categoryMapping={categoryMap}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}