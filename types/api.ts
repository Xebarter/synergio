import { Role } from "@prisma/client";
import { z } from "zod";

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
};

// User Types
export type UserSession = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
};

// Customer Types
export const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export type CustomerData = z.infer<typeof customerSchema>;

// Product Types
export const productSchema = z.object({
  // Required fields
  title: z.string().min(2, "Title is required"),
  priceCents: z.number().int().min(0, "Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  
  // Optional fields with defaults
  sku: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  compareAtPriceCents: z.number().int().min(0).optional(),
  costCents: z.number().int().min(0).optional(),
  currency: z.string().default('USD'),
  
  // Relations
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  
  // Arrays with defaults
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  
  // Boolean flags with defaults
  trackQuantity: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  requiresShipping: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  
  // Optional fields
  weightGrams: z.number().int().min(0).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  
  // JSON fields with defaults
  attributes: z.record(z.any()).default({}),
  metadata: z.record(z.any()).default({}),
  
  // Fields that are managed by the server
  id: z.string().optional(),
  slug: z.string().optional(),
  userId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ProductData = z.infer<typeof productSchema>;

// Order Types
export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive"),
});

export const orderSchema = z.object({
  customerId: z.string(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]).default("PENDING"),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export type OrderData = z.infer<typeof orderSchema>;

// Search & Pagination
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  customerId: z.string().optional(),
});

export type PaginationOptions = z.infer<typeof paginationSchema>;
