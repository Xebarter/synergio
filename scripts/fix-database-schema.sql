-- This script contains SQL commands to fix the database schema to match the expected structure
-- Run these commands in your Supabase SQL editor

-- Add missing columns to the products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS compare_at_price_cents INTEGER CHECK (compare_at_price_cents >= 0),
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS weight_grams INTEGER,
ADD COLUMN IF NOT EXISTS is_taxable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS requires_shipping BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Update existing records to ensure required fields are populated
UPDATE public.products 
SET currency = 'USD' 
WHERE currency IS NULL;

-- Add NOT NULL constraints where needed
ALTER TABLE public.products 
ALTER COLUMN currency SET NOT NULL;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Create or replace the function to get category ID by name
CREATE OR REPLACE FUNCTION public.get_category_id(category_name TEXT)
RETURNS UUID AS $$
DECLARE
  category_id UUID;
BEGIN
  SELECT id INTO category_id FROM public.categories WHERE name = category_name LIMIT 1;
  RETURN category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_category_id(TEXT) TO authenticated;