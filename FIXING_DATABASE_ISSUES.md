# Fixing Database Schema Issues

This document explains how to resolve the database schema issues that are causing errors in your application.

## Issues Identified

1. **UUID Error**: `invalid input syntax for type uuid: "men's clothing"` - This happens when trying to insert a string into a UUID field
2. **Schema Cache Errors**: `Could not find the 'compare_at_price' column of 'products' in the schema cache` - Indicates missing columns in the database
3. **Database Connection Issues**: Connection timeout when trying to connect to the database

## Solutions

### 1. Fix Database Connection

First, ensure your DATABASE_URL in the `.env` file is correct. It should not have the `db.` prefix:

```
# Correct format:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_PROJECT_ID.supabase.co:5432/postgres

# Incorrect format (what was in your file):
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres
```

We've already fixed this in your `.env` file.

### 2. Update Database Schema

Since we can't directly connect to your database, you'll need to manually run the SQL commands in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/fix-database-schema.sql` into the editor
4. Run the commands

These commands will:
- Add missing columns to the products table
- Set default values where needed
- Refresh the schema cache

### 3. Category Mapping Fix

We've updated both the new product creation and edit product pages to properly handle category mapping:

- The code now checks if the category value is already a valid UUID
- If not, it looks up the category ID by name in the database
- If the category isn't found, it sets the category_id to null instead of passing an invalid string

### 4. Prisma Schema Update

We've updated the Prisma schema (`prisma/schema.prisma`) to match the actual database structure. After running the SQL commands above, you should generate a new Prisma client:

```bash
npx prisma generate
```

## Testing the Fix

1. After running the SQL commands in your Supabase dashboard, try creating or editing a product again
2. When selecting a category, the system should now properly map the frontend category to the database category ID
3. The schema cache errors should be resolved

## Additional Notes

- The "men's clothing" error occurred because the system was trying to insert this string directly into the category_id field, which expects a UUID
- Always ensure that foreign key fields receive the correct data type (UUID for IDs)
- When working with categories, make sure the category names in your frontend match exactly with those in the database