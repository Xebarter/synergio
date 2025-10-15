export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  children?: Category[];
  product_count?: number;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  price_cents: number;
  compare_at_price_cents?: number;
  cost_cents?: number;
  currency: string;
  category_id?: string;
  brand_id?: string;
  images: string[];
  thumbnail?: string;
  gallery?: any;
  attributes?: any;
  tags: string[];
  stock: number;
  track_quantity: boolean;
  allow_backorder: boolean;
  requires_shipping: boolean;
  weight_grams?: number;
  dimensions?: any;
  is_active: boolean;
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
  rating_average: number;
  rating_count: number;
  view_count: number;
  sort_order: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
  category?: Category;
  brand?: Brand;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website?: string;
  is_active: boolean;
  metadata?: any;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  financial_status: 'pending' | 'authorized' | 'paid' | 'partially_paid' | 'refunded' | 'partially_refunded' | 'voided';
  fulfillment_status: 'unfulfilled' | 'partial' | 'fulfilled';
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  shipping_address: any;
  billing_address: any;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  tags: string[];
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  body: string;
  photos: string[];
  helpful_count: number;
  is_verified: boolean;
  is_featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}