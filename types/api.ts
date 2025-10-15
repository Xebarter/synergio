import { UserRole } from "@prisma/client";
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
  role: UserRole;
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
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  sku: z.string().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  image: z.string().optional(),
  category: z.string().optional(),
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
});

export type PaginationOptions = z.infer<typeof paginationSchema>;
