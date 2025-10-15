# Supabase Integration for Product Management

This document outlines how Supabase has been integrated into the application for product management, including database setup, storage configuration, and API implementation.

## Table of Contents
1. [Database Schema](#database-schema)
2. [Storage Configuration](#storage-configuration)
3. [API Endpoints](#api-endpoints)
4. [Client-Side Hooks](#client-side-hooks)
5. [Components](#components)
6. [Environment Variables](#environment-variables)
7. [Setup Instructions](#setup-instructions)

## Database Schema

The following tables are used for product management:

### `products` Table
- `id` (uuid, primary key)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)
- `name` (text, required)
- `description` (text)
- `price` (numeric, required)
- `sale_price` (numeric, nullable)
- `sku` (text, required, unique)
- `stock_quantity` (integer, required)
- `is_featured` (boolean, default: false)
- `is_active` (boolean, default: true)
- `category_id` (uuid, required, foreign key to categories)
- `brand` (text, nullable)
- `images` (text[], array of image URLs)
- `tags` (text[], array of tags)
- `specifications` (jsonb, for additional product specs)
- `slug` (text, required, unique)

### `categories` Table
- `id` (uuid, primary key)
- `name` (text, required)
- `slug` (text, required, unique)
- `description` (text)
- `parent_id` (uuid, nullable, self-referential)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

## Storage Configuration

A Supabase storage bucket named `product-images` is used to store product images. The storage is configured with the following rules:

- Public access for reading images
- Authenticated users with appropriate permissions can upload/delete images
- Images are organized in folders by product ID

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `GET /api/products/[id]` - Get a single product by ID
- `PATCH /api/products/[id]` - Update a product
- `DELETE /api/products/[id]` - Delete a product

### Product Images
- `POST /api/products/[id]/images` - Upload an image for a product
- `DELETE /api/products/[id]/images?url=[imageUrl]` - Delete a product image

## Client-Side Hooks

### `useProducts`
A React Query hook that provides methods for CRUD operations on products:

```typescript
const {
  products,        // List of all products
  isLoading,       // Loading state
  error,          // Error state
  useProduct,     // Hook to fetch a single product
  createProduct,  // Mutation to create a product
  updateProduct,  // Mutation to update a product
  deleteProduct,  // Mutation to delete a product
  uploadProductImage,    // Upload a product image
  deleteProductImage,    // Delete a product image
} = useProducts();
```

## Components

### `ProductForm`
A form component for creating and editing products with image upload support.

### `ProductList`
A table component for displaying and managing products with sorting, filtering, and bulk actions.

### `ImageUploader`
A drag-and-drop component for uploading product images.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Storage
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=product-images
```

## Setup Instructions

1. **Set up Supabase**
   - Create a new project at https://supabase.com/
   - Set up the database schema by running the SQL from `supabase/migrations/001_initial_schema.sql`
   - Create a storage bucket named `product-images`
   - Update the storage policies to allow public read access and authenticated write access

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Update the Supabase credentials in `.env.local`

3. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr @supabase/auth-helpers-nextjs react-dropzone
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```

5. **Access the Admin Dashboard**
   - Navigate to `/admin/products` to manage products

## Best Practices

1. **Image Optimization**
   - Use the `next/image` component for optimized image loading
   - Consider implementing image transformations with Supabase Storage

2. **Error Handling**
   - Always handle errors from Supabase operations
   - Show user-friendly error messages

3. **Performance**
   - Use pagination for large product lists
   - Implement infinite scrolling for better UX

4. **Security**
   - Use Row Level Security (RLS) in Supabase
   - Validate all user inputs on the server
   - Implement proper authentication and authorization

## Troubleshooting

- **CORS Issues**: Ensure your Supabase project has the correct CORS origins configured
- **Permission Denied**: Check your RLS policies in Supabase
- **Image Upload Failures**: Verify storage bucket permissions and file size limits

## Future Improvements

1. Implement product variants
2. Add inventory management
3. Support for product reviews and ratings
4. Bulk import/export functionality
5. Advanced search and filtering options
