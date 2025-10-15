-- Add missing columns to products table
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS weight NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS is_taxable BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS requires_shipping BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Update the products table to handle the new schema
-- Ensure all required columns have default values
ALTER TABLE public.products 
  ALTER COLUMN price SET DEFAULT 0,
  ALTER COLUMN stock_quantity SET DEFAULT 0,
  ALTER COLUMN is_active SET DEFAULT true,
  ALTER COLUMN is_featured SET DEFAULT false;

-- Create an index for better performance on category lookups
CREATE INDEX IF NOT EXISTS idx_products_category_id_name ON public.products(category_id, name);

-- Create a function to get category ID by name
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
