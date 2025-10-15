/*
  Complete Supabase Setup for E-commerce Application
  ==================================================
  
  This script sets up all necessary tables, relationships, storage, and policies
  for a full-featured e-commerce platform.
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create updated_at column update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  admin_permissions text[] DEFAULT '{}',
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text,
  icon text,
  color text,
  sort_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  seo_title text,
  seo_description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO public
  USING (is_active = true);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  website text,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Brands policies
CREATE POLICY "Brands are publicly readable"
  ON brands FOR SELECT
  TO public
  USING (is_active = true);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  compare_at_price_cents integer CHECK (compare_at_price_cents >= 0),
  cost_cents integer CHECK (cost_cents >= 0),
  currency text DEFAULT 'USD' NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  images text[] DEFAULT '{}',
  thumbnail text,
  gallery jsonb DEFAULT '[]',
  attributes jsonb DEFAULT '{}',
  tags text[] DEFAULT '{}',
  stock integer DEFAULT 0 CHECK (stock >= 0),
  track_quantity boolean DEFAULT true,
  allow_backorder boolean DEFAULT false,
  requires_shipping boolean DEFAULT true,
  weight_grams integer,
  dimensions jsonb,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  seo_title text,
  seo_description text,
  rating_average decimal(2,1) DEFAULT 0,
  rating_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for products
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_title_gin ON products USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_tags_gin ON products USING gin(tags);

-- Create trigger for products updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title text NOT NULL,
  sku text UNIQUE NOT NULL,
  barcode text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  compare_at_price_cents integer CHECK (compare_at_price_cents >= 0),
  cost_cents integer CHECK (cost_cents >= 0),
  stock integer DEFAULT 0 CHECK (stock >= 0),
  track_quantity boolean DEFAULT true,
  allow_backorder boolean DEFAULT false,
  weight_grams integer,
  dimensions jsonb,
  image_url text,
  attributes jsonb DEFAULT '{}',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on product_variants
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Product variants policies
CREATE POLICY "Product variants are publicly readable"
  ON product_variants FOR SELECT
  TO public
  USING (is_active = true);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  type text DEFAULT 'manual' CHECK (type IN ('manual', 'automated')),
  conditions jsonb DEFAULT '{}',
  sort_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Collections policies
CREATE POLICY "Collections are publicly readable"
  ON collections FOR SELECT
  TO public
  USING (is_active = true);

-- Collection products junction table
CREATE TABLE IF NOT EXISTS collection_products (
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (collection_id, product_id)
);

-- Enable RLS on collection_products
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

-- Collection products policies
CREATE POLICY "Collection products are publicly readable"
  ON collection_products FOR SELECT
  TO public
  USING (true);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email text,
  guest_phone text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  financial_status text DEFAULT 'pending' CHECK (financial_status IN ('pending', 'authorized', 'paid', 'partially_paid', 'refunded', 'partially_refunded', 'voided')),
  fulfillment_status text DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled')),
  subtotal_cents integer NOT NULL CHECK (subtotal_cents >= 0),
  discount_cents integer DEFAULT 0 CHECK (discount_cents >= 0),
  shipping_cents integer DEFAULT 0 CHECK (shipping_cents >= 0),
  tax_cents integer DEFAULT 0 CHECK (tax_cents >= 0),
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  currency text DEFAULT 'USD' NOT NULL,
  shipping_address jsonb NOT NULL,
  billing_address jsonb NOT NULL,
  payment_method text,
  payment_reference text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  notes text,
  tags text[] DEFAULT '{}',
  shipping_method jsonb,
  tracking_numbers text[] DEFAULT '{}',
  discount_codes text[] DEFAULT '{}',
  tax_details jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  cancelled_at timestamptz,
  cancel_reason text,
  processed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trigger for orders updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  total_price_cents integer NOT NULL CHECK (total_price_cents >= 0),
  product_snapshot jsonb NOT NULL,
  fulfillment_status text DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'fulfilled', 'returned')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Order items policies
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()
  ));

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text NOT NULL,
  photos text[] DEFAULT '{}',
  helpful_count integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_response text,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Function to update product ratings
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE products
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating::numeric), 0)
      FROM reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
      AND status = 'approved'
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
      AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating product ratings
CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Users can read approved reviews"
  ON reviews FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Users can manage own reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text DEFAULT 'My Wishlist',
  description text,
  is_default boolean DEFAULT false,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on wishlists
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Wishlists policies
CREATE POLICY "Users can manage own wishlists"
  ON wishlists FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Wishlist items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(wishlist_id, product_id, variant_id)
);

-- Enable RLS on wishlist_items
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Wishlist items policies
CREATE POLICY "Users can manage own wishlist items"
  ON wishlist_items FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM wishlists WHERE wishlists.id = wishlist_id AND wishlists.user_id = auth.uid()
  ));

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing')),
  company text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  region text NOT NULL,
  postal_code text,
  country text NOT NULL DEFAULT 'US',
  phone text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Addresses policies
CREATE POLICY "Users can manage own addresses"
  ON addresses FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('fixed_amount', 'percentage', 'free_shipping')),
  value_cents integer CHECK (value_cents >= 0),
  percentage decimal(5,2) CHECK (percentage BETWEEN 0 AND 100),
  minimum_amount_cents integer CHECK (minimum_amount_cents >= 0),
  maximum_uses integer CHECK (maximum_uses > 0),
  uses_count integer DEFAULT 0 CHECK (uses_count >= 0),
  uses_per_customer integer CHECK (uses_per_customer > 0),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  applicable_products uuid[] DEFAULT '{}',
  applicable_categories uuid[] DEFAULT '{}',
  applicable_collections uuid[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Coupons policies
CREATE POLICY "Active coupons are readable by authenticated users"
  ON coupons FOR SELECT
  TO authenticated
  USING (is_active = true AND starts_at <= now() AND (ends_at IS NULL OR ends_at >= now()));

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
  done bool := false;
BEGIN
  WHILE NOT done LOOP
    new_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
    
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
      done := true;
    END IF;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access to Product Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'product-images');

CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'product-images');

CREATE POLICY "Public Access to Avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'avatars');