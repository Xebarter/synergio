-- SQL script to add missing columns to the products table
-- Based on the Prisma schema in prisma/schema.prisma

-- Add name column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add title column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add description column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add price column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);

-- Add price_cents column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price_cents INTEGER;

-- Add sku column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sku TEXT;

-- Add stock column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Add image column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image TEXT;

-- Add category column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add slug column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add created_at column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add user_id column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Note: The following columns would require additional setup for foreign key constraints
-- and are related to relationships in the Prisma schema:
-- - user (foreign key to users table)
-- - orderItems (related to order_items table)

-- If you want to add the user_id foreign key constraint, you would need to run:
-- ALTER TABLE products 
-- ADD CONSTRAINT fk_user 
-- FOREIGN KEY (user_id) 
-- REFERENCES users(id);