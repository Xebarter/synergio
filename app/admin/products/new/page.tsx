"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ProductForm } from '@/components/admin/products/product-form';
import { createClient } from '@/lib/supabase/client';

// Updated categories to match those in persistent-sidebar.tsx with subcategories
const categories = [
  {
    "id": "1",
    "name": "Phones & Tablets",
    "subcategories": [
      { "name": "Smartphones", "items": ["Android", "iPhone", "Feature", "Refurb"] },
      { "name": "Tablets", "items": ["Android", "iPad", "Kids", "Keyboards"] },
      { "name": "Wearables", "items": ["Smartwatch", "Fitness", "Glasses"] },
      { "name": "Accessories", "items": ["Cases", "Protectors", "Power Banks", "Cables", "Earphones", "Cards", "Mounts"] }
    ]
  },
  {
    "id": "2",
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
    "id": "3",
    "name": "Home & Kitchen",
    "subcategories": [
      { "name": "Appliances", "items": ["Fridges", "Washers", "Microwaves", "Cookers"] },
      { "name": "Kitchenware", "items": ["Cookware", "Bakeware", "Cutlery", "Blenders"] },
      { "name": "Décor", "items": ["Wall Art", "Clocks", "Rugs", "Lighting"] },
      { "name": "Furniture", "items": ["Sofas", "Tables", "Beds", "Cabinets"] }
    ]
  },
  {
    "id": "4",
    "name": "Fashion",
    "subcategories": [
      { "name": "Men", "items": ["Shirts", "Jeans", "Jackets", "Shoes"] },
      { "name": "Women", "items": ["Dresses", "Tops", "Pants", "Shoes"] },
      { "name": "Kids", "items": ["Boys", "Girls", "Baby", "Shoes"] },
      { "name": "Accessories", "items": ["Glasses", "Belts", "Scarves", "Jewelry"] }
    ]
  },
  {
    "id": "5",
    "name": "Beauty & Health",
    "subcategories": [
      { "name": "Beauty", "items": ["Makeup", "Brushes", "Fragrances", "Nails"] },
      { "name": "Skincare", "items": ["Creams", "Lotions", "Sunscreen", "Masks"] },
      { "name": "Hair Care", "items": ["Shampoo", "Treatments", "Wigs", "Tools"] },
      { "name": "Health", "items": ["Vitamins", "Wellness", "First Aid", "Hygiene"] }
    ]
  },
  {
    "id": "6",
    "name": "Sports & Outdoors",
    "subcategories": [
      { "name": "Sports", "items": ["Football", "Basketball", "Tennis", "Gear"] },
      { "name": "Fitness", "items": ["Treadmills", "Weights", "Yoga"] },
      { "name": "Outdoor", "items": ["Tents", "Backpacks", "Hiking", "Bottles"] }
    ]
  },
  {
    "id": "7",
    "name": "Groceries",
    "subcategories": [
      { "name": "Food", "items": ["Rice", "Pasta", "Oils", "Spices"] },
      { "name": "Beverages", "items": ["Tea", "Coffee", "Drinks", "Water"] },
      { "name": "Snacks", "items": ["Biscuits", "Chocolates", "Chips", "Nuts"] },
      { "name": "Supplies", "items": ["Cleaning", "Detergent", "Paper"] }
    ]
  },
  {
    "id": "8",
    "name": "Toys & Games",
    "subcategories": [
      { "name": "Baby", "items": ["Diapers", "Food", "Bottles", "Clothing"] },
      { "name": "Baby Gear", "items": ["Strollers", "Car Seats", "Carriers"] },
      { "name": "Toys", "items": ["Educational", "Figures", "Puzzles", "RC Toys"] }
    ]
  },
  {
    "id": "9",
    "name": "Automotive",
    "subcategories": [
      { "name": "Car Items", "items": ["Electronics", "Care", "Tires", "Fluids"] },
      { "name": "Industrial", "items": ["Power Tools", "Safety", "Equipment"] }
    ]
  },
  {
    "id": "10",
    "name": "Garden & Tools",
    "subcategories": [
      { "name": "Gardening", "items": ["Seeds", "Pots", "Watering", "Soil"] },
      { "name": "Tools", "items": ["Hand", "Power", "Storage"] },
      { "name": "Outdoor", "items": ["Furniture", "BBQ", "Lighting"] }
    ]
  },
  {
    "id": "11",
    "name": "Office",
    "subcategories": [
      { "name": "Equipment", "items": ["Printers", "Shredders", "Projectors"] },
      { "name": "Furniture", "items": ["Desks", "Chairs", "Cabinets"] },
      { "name": "Stationery", "items": ["Notebooks", "Pens", "Files", "Paper"] }
    ]
  },
  {
    "id": "12",
    "name": "Arts & Crafts",
    "subcategories": [
      { "name": "Supplies", "items": ["Paints", "Canvases", "Drawing", "Paper"] },
      { "name": "Crafts", "items": ["Sewing", "Beads", "DIY Kits"] },
      { "name": "Music", "items": ["Guitars", "Drums", "Studio"] }
    ]
  },
  {
    "id": "13",
    "name": "Travel",
    "subcategories": [
      { "name": "Luggage", "items": ["Suitcases", "Backpacks", "Duffels", "Pouches"] },
      { "name": "Accessories", "items": ["Pillows", "Bottles", "Adapters"] },
      { "name": "Lifestyle", "items": ["Glasses", "Watches", "Trackers"] }
    ]
  },
  {
    "id": "14",
    "name": "Services",
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
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$'},
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'R₣' },
];

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const supabase = createClient();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
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
      } catch (error) {
        console.error('Error setting up category mapping:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      // Get category ID - handle various possible inputs
      let categoryId = null;
      
      // If formData.category is already a valid UUID, use it directly
      if (typeof formData.category === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.category)) {
        categoryId = formData.category;
      } 
      // If categoryMap exists and has a mapping for this category, use it
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

      // Create the product with fields matching the database schema
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert({
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
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Failed to create product: ${insertError.message}`);
      }

      // Handle variants if they exist
      if (formData.variants?.length > 0) {
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(
            formData.variants.map((variant: any) => ({
              ...variant,
              product_id: newProduct.id,
              price_cents: Math.round(variant.price * 100), // Convert price to cents
              compare_at_price_cents: variant.compareAtPrice ? Math.round(variant.compareAtPrice * 100) : null,
              cost_cents: variant.costPerItem ? Math.round(variant.costPerItem * 100) : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
          );

        if (variantError) {
          console.error('Variant insert error:', variantError);
          throw new Error(`Failed to create variants: ${variantError.message}`);
        }
      }

      toast({
        title: 'Success',
        description: 'Product created successfully',
      });

      // Redirect to products list
      router.push('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <ProductForm
        categories={categories}
        currencies={currencies}
        categoryMap={categoryMap}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}