# Supabase Setup

This directory contains the Supabase database migrations and setup scripts for the Synergio e-commerce platform.

## Directory Structure

- `migrations/` - Database migration files
  - `001_initial_schema.sql` - Initial database schema setup

## Setup Instructions

### 1. Prerequisites

- A Supabase account (https://supabase.com/)
- A new Supabase project created
- Supabase CLI installed (optional, for local development)

### 2. Database Setup

1. **Using Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Create a new query and paste the contents of `migrations/001_initial_schema.sql`
   - Run the query to set up the database schema

2. **Using Supabase CLI (Recommended for Development)**
   ```bash
   # Install Supabase CLI (if not already installed)
   npm install -g supabase
   
   # Login to your Supabase account
   supabase login
   
   # Link your local project to your Supabase project
   supabase link --project-ref your-project-ref
   
   # Push migrations to Supabase
   supabase db push
   ```

### 3. Storage Setup

The migration script will create a storage bucket named `product-images`. You may need to:

1. Go to the Storage section in your Supabase dashboard
2. Verify that the `product-images` bucket exists
3. Adjust the bucket policies if needed

### 4. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Storage
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=product-images
```

### 5. Testing the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/admin/products` to test the product management functionality

## Development Workflow

### Creating New Migrations

1. Create a new migration file with a sequential number:
   ```bash
   touch supabase/migrations/002_descriptive_name.sql
   ```

2. Add your SQL changes to the new migration file

3. Test the migration locally:
   ```bash
   supabase db reset
   ```

4. Push changes to Supabase:
   ```bash
   supabase db push
   ```

### Seeding the Database

For development, you may want to seed your database with sample data. Create a new migration file:

```sql
-- supabase/migrations/002_seed_data.sql

-- Insert sample categories
INSERT INTO public.categories (name, slug, description)
VALUES 
  ('Electronics', 'electronics', 'Electronic devices and accessories'),
  ('Clothing', 'clothing', 'Fashion and apparel'),
  ('Home & Kitchen', 'home-kitchen', 'Home essentials and kitchenware');

-- Insert sample products
INSERT INTO public.products (
  name, 
  description, 
  price, 
  sku, 
  stock_quantity, 
  category_id,
  slug
)
SELECT 
  'Sample Product ' || i,
  'This is a sample product description ' || i,
  99.99 + (i * 10),
  'SKU-' || LPAD(i::text, 6, '0'),
  100,
  (SELECT id FROM public.categories ORDER BY RANDOM() LIMIT 1),
  'sample-product-' || i
FROM generate_series(1, 20) AS i;
```

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Ensure RLS policies are correctly set up
   - Verify that the authenticated user has the necessary permissions

2. **Connection Issues**
   - Double-check your Supabase URL and API keys
   - Ensure your network allows connections to Supabase

3. **Storage Upload Failures**
   - Verify that the storage bucket exists
   - Check that the bucket policies allow the intended operations

## Production Considerations

1. **Backup Your Database**
   - Set up regular backups in the Supabase dashboard
   - Consider enabling Point-in-Time Recovery (PITR) for critical data

2. **Monitoring**
   - Set up alerts for database performance issues
   - Monitor API usage and storage consumption

3. **Security**
   - Regularly rotate your API keys
   - Review and update RLS policies as needed
   - Enable 2FA for your Supabase account

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/initializing)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
