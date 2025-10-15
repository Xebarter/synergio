-- SQL migration to update products table structure to match the newer schema
-- This reconciles the differences between the old and new schema definitions

-- Add missing columns to the products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS price_cents INTEGER CHECK (price_cents >= 0),
ADD COLUMN IF NOT EXISTS compare_at_price_cents INTEGER CHECK (compare_at_price_cents >= 0),
ADD COLUMN IF NOT EXISTS cost_cents INTEGER CHECK (cost_cents >= 0),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'UGX',
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS thumbnail TEXT,
ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS track_quantity BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_backorder BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_shipping BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS weight_grams INTEGER,
ADD COLUMN IF NOT EXISTS dimensions JSONB,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS rating_average DECIMAL(2,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update existing records to ensure required fields are populated
-- Move data from name to title
UPDATE public.products 
SET title = name 
WHERE title IS NULL AND name IS NOT NULL;

-- Set default values for new required fields
UPDATE public.products 
SET slug = LOWER(REPLACE(name, ' ', '-')) 
WHERE slug IS NULL AND name IS NOT NULL;

UPDATE public.products 
SET price_cents = CAST(price * 100 AS INTEGER) 
WHERE price_cents IS NULL AND price IS NOT NULL;

UPDATE public.products 
SET currency = 'UGX' 
WHERE currency IS NULL;

-- Add NOT NULL constraints where needed
ALTER TABLE public.products 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN slug SET NOT NULL,
ALTER COLUMN price_cents SET NOT NULL,
ALTER COLUMN currency SET NOT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_title ON public.products(title);
CREATE INDEX IF NOT EXISTS idx_products_short_description ON public.products(short_description);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_thumbnail ON public.products(thumbnail);
CREATE INDEX IF NOT EXISTS idx_products_track_quantity ON public.products(track_quantity);
CREATE INDEX IF NOT EXISTS idx_products_requires_shipping ON public.products(requires_shipping);
CREATE INDEX IF NOT EXISTS idx_products_weight_grams ON public.products(weight_grams);
CREATE INDEX IF NOT EXISTS idx_products_seo_title ON public.products(seo_title);
CREATE INDEX IF NOT EXISTS idx_products_rating_average ON public.products(rating_average);
CREATE INDEX IF NOT EXISTS idx_products_rating_count ON public.products(rating_count);
CREATE INDEX IF NOT EXISTS idx_products_view_count ON public.products(view_count);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON public.products(sort_order);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at column
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update RLS policies to match new schema
-- First drop existing policies
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.products;
DROP POLICY IF EXISTS "Enable update for all users" ON public.products;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.products;

-- Create new policies that allow all operations for all users
CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for all users" ON public.products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.products
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.products
  FOR DELETE USING (true);