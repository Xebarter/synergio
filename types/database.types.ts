export type Product = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  sku: string | null;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  category_id: string;
  brand: string | null;
  images: string[];
  image: string | null; // Single image column from Fake Store API
  specifications: Record<string, unknown>;
  tags: string[];
  slug: string;
};

type ProductBase = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export type ProductInsert = {
  name: string;
  description?: string | null;
  price: number;
  sale_price?: number | null;
  sku?: string | null;
  stock_quantity?: number;
  is_featured?: boolean;
  is_active?: boolean;
  category_id: string;
  brand?: string | null;
  images?: string[];
  image?: string | null; // Single image column from Fake Store API
  specifications?: Record<string, unknown>;
  tags?: string[];
  slug: string;
};

export type ProductUpdate = Partial<ProductInsert> & { id: string };

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
};