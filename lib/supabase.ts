import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          role: 'user' | 'admin' | 'super_admin';
          admin_permissions: string[];
          preferences: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: 'user' | 'admin' | 'super_admin';
          admin_permissions?: string[];
          preferences?: any;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: 'user' | 'admin' | 'super_admin';
          admin_permissions?: string[];
          preferences?: any;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          parent_id: string | null;
          image_url: string | null;
          icon: string | null;
          color: string | null;
          sort_order: number;
          is_featured: boolean;
          is_active: boolean;
          seo_title: string | null;
          seo_description: string | null;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          parent_id?: string | null;
          image_url?: string | null;
          icon?: string | null;
          color?: string | null;
          sort_order?: number;
          is_featured?: boolean;
          is_active?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          metadata?: any;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          sku: string;
          title: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          price_cents: number;
          compare_at_price_cents: number | null;
          cost_cents: number | null;
          currency: string;
          category_id: string | null;
          brand_id: string | null;
          images: string[];
          thumbnail: string | null;
          gallery: any;
          attributes: any;
          tags: string[];
          stock: number;
          track_quantity: boolean;
          allow_backorder: boolean;
          requires_shipping: boolean;
          weight_grams: number | null;
          dimensions: any;
          is_active: boolean;
          is_featured: boolean;
          seo_title: string | null;
          seo_description: string | null;
          rating_average: number;
          rating_count: number;
          view_count: number;
          sort_order: number;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          title: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          price_cents: number;
          compare_at_price_cents?: number | null;
          cost_cents?: number | null;
          currency?: string;
          category_id?: string | null;
          brand_id?: string | null;
          images?: string[];
          thumbnail?: string | null;
          gallery?: any;
          attributes?: any;
          tags?: string[];
          stock?: number;
          track_quantity?: boolean;
          allow_backorder?: boolean;
          requires_shipping?: boolean;
          weight_grams?: number | null;
          dimensions?: any;
          is_active?: boolean;
          is_featured?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          rating_average?: number;
          rating_count?: number;
          view_count?: number;
          sort_order?: number;
          metadata?: any;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          status: string;
          financial_status: string;
          fulfillment_status: string;
          subtotal_cents: number;
          discount_cents: number;
          shipping_cents: number;
          tax_cents: number;
          total_cents: number;
          currency: string;
          shipping_address: any;
          billing_address: any;
          payment_method: string | null;
          payment_reference: string | null;
          notes: string | null;
          tags: string[];
          metadata: any;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}