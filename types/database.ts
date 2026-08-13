/**
 * RFC Store — Database Type Stubs
 *
 * This file will be replaced by Supabase auto-generated types in Phase 2+.
 * Run: npx supabase gen types typescript --project-id efmwddxzsdiexzmyccvk > types/database.ts
 *
 * The Database type structure below is a placeholder that matches the
 * expected Supabase generated type shape so the codebase compiles
 * correctly before the schema is fully built out.
 *
 * Phase 2 will implement the actual tables and regenerate this file.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Supabase Database type.
 * Replace with auto-generated output from `supabase gen types typescript` in Phase 2.
 */
export interface Database {
  public: {
    Tables: {
      /**
       * User profiles — extends Supabase auth.users
       * Planned Phase 2 implementation
       */
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: "customer" | "admin" | "super_admin";
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "admin" | "super_admin";
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      /**
       * Product categories
       * Planned Phase 2 implementation
       */
      categories: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      /**
       * Products
       * Planned Phase 2 implementation
       */
      products: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          category_id: string | null;
          base_price: number;
          compare_at_price: number | null;
          is_active: boolean;
          is_featured: boolean;
          is_new_arrival: boolean;
          is_bestseller: boolean;
          tags: string[];
          meta_title: string | null;
          meta_description: string | null;
        };
        Insert: {
          name: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          category_id?: string | null;
          base_price: number;
          compare_at_price?: number | null;
          is_active?: boolean;
          is_featured?: boolean;
          is_new_arrival?: boolean;
          is_bestseller?: boolean;
          tags?: string[];
          meta_title?: string | null;
          meta_description?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          short_description?: string | null;
          category_id?: string | null;
          base_price?: number;
          compare_at_price?: number | null;
          is_active?: boolean;
          is_featured?: boolean;
          is_new_arrival?: boolean;
          is_bestseller?: boolean;
          tags?: string[];
          updated_at?: string;
          meta_title?: string | null;
          meta_description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      /**
       * Saved shipping addresses
       */
      addresses: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          label: string;
          full_name: string;
          phone: string;
          line1: string;
          line2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default: boolean;
        };
        Insert: {
          user_id: string;
          label?: string;
          full_name: string;
          phone: string;
          line1: string;
          line2?: string | null;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          is_default?: boolean;
        };
        Update: {
          label?: string;
          full_name?: string;
          phone?: string;
          line1?: string;
          line2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      /**
       * Orders
       */
      orders: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          order_number: string;
          user_id: string | null;
          status: string;
          payment_status: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_address: Json | null;
          subtotal: number;
          shipping_amount: number;
          tax_amount: number;
          discount_amount: number;
          total_amount: number;
          currency: string;
          notes: string | null;
          metadata: Json | null;
        };
        Insert: {
          order_number: string;
          user_id?: string | null;
          status?: string;
          payment_status?: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_address?: Json | null;
          subtotal: number;
          shipping_amount?: number;
          tax_amount?: number;
          discount_amount?: number;
          total_amount: number;
          currency?: string;
        };
        Update: {
          status?: string;
          payment_status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      /**
       * Order Items (with snapshot fields)
       */
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name_snapshot: string;
          variant_name_snapshot: string | null;
          sku_snapshot: string | null;
          unit_price_snapshot: number;
          quantity: number;
          line_total: number;
          metadata: Json | null;
        };
        Insert: {
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name_snapshot: string;
          variant_name_snapshot?: string | null;
          sku_snapshot?: string | null;
          unit_price_snapshot: number;
          quantity: number;
          line_total: number;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      /**
       * Product Variants
       */
      product_variants: {
        Row: {
          id: string;
          created_at: string;
          product_id: string;
          name: string;
          sku: string;
          price: number;
          compare_at_price: number | null;
          attributes: Record<string, string>;
          is_available: boolean;
        };
        Insert: {
          product_id: string;
          name: string;
          sku: string;
          price: number;
          compare_at_price?: number | null;
          attributes?: Record<string, string>;
          is_available?: boolean;
        };
        Update: {
          name?: string;
          sku?: string;
          price?: number;
          compare_at_price?: number | null;
          attributes?: Record<string, string>;
          is_available?: boolean;
        };
        Relationships: [];
      };
      /**
       * Product Images
       */
      product_images: {
        Row: {
          id: string;
          created_at: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
        };
        Insert: {
          product_id: string;
          url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
        };
        Update: {
          url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
        };
        Relationships: [];
      };
      /**
       * Store Settings (key-value)
       */
      store_settings: {
        Row: {
          key: string;
          value: string | null;
          label: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: string | null;
          label?: string | null;
        };
        Update: {
          value?: string | null;
          label?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      /**
       * Inventory
       */
      inventory: {
        Row: {
          id: string;
          updated_at: string;
          variant_id: string;
          quantity: number;
          reserved: number;
          low_threshold: number;
        };
        Insert: {
          variant_id: string;
          quantity?: number;
          reserved?: number;
          low_threshold?: number;
        };
        Update: {
          quantity?: number;
          reserved?: number;
          low_threshold?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "customer" | "admin" | "super_admin";
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded";
    };
    CompositeTypes: Record<string, never>;
  };
}

/** Convenience type for Supabase table rows */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

/** Convenience type for Supabase table insert payloads */
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

/** Convenience type for Supabase table update payloads */
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

/** Convenience type for Supabase enums */
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
