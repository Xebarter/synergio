-- SQL snippet to enable CRUD operations on products table without authentication
-- WARNING: This removes security protections and should only be used in development environments

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.products;

-- Create new policies that allow all operations for all users
CREATE POLICY "Enable read access for all users" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.products
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.products
  FOR DELETE USING (true);

-- If you want to completely disable RLS for the products table, uncomment the following line:
-- ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;