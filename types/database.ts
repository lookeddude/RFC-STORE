/**
 * RFC Store — Supabase Database Types
 *
 * Auto-generated from Supabase project efmwddxzsdiexzmyccvk
 * Phase 4: Razorpay + Invoices + Legal
 *
 * To regenerate: npx supabase gen types typescript --project-id efmwddxzsdiexzmyccvk > types/database.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          label: string
          line1: string
          line2: string | null
          phone: string
          postal_code: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          label?: string
          line1: string
          line2?: string | null
          phone: string
          postal_code: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string
          line1?: string
          line2?: string | null
          phone?: string
          postal_code?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          unit_price: number
          updated_at: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          unit_price: number
          updated_at?: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          updated_at?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          autoplay: boolean
          created_at: string
          description: string | null
          desktop_image_alt: string | null
          desktop_image_url: string | null
          eyebrow: string | null
          heading: string
          id: string
          internal_name: string
          mobile_image_alt: string | null
          mobile_image_url: string | null
          overlay_strength: string
          pause_on_hover: boolean
          primary_button_text: string | null
          primary_button_url: string | null
          published_at: string | null
          secondary_button_text: string | null
          secondary_button_url: string | null
          slide_duration: number
          sort_order: number
          status: string
          tablet_image_alt: string | null
          tablet_image_url: string | null
          text_alignment: string
          text_position: string
          transition_speed: string
          transition_style: string
          updated_at: string
        }
        Insert: {
          autoplay?: boolean
          created_at?: string
          description?: string | null
          desktop_image_alt?: string | null
          desktop_image_url?: string | null
          eyebrow?: string | null
          heading?: string
          id?: string
          internal_name: string
          mobile_image_alt?: string | null
          mobile_image_url?: string | null
          overlay_strength?: string
          pause_on_hover?: boolean
          primary_button_text?: string | null
          primary_button_url?: string | null
          published_at?: string | null
          secondary_button_text?: string | null
          secondary_button_url?: string | null
          slide_duration?: number
          sort_order?: number
          status?: string
          tablet_image_alt?: string | null
          tablet_image_url?: string | null
          text_alignment?: string
          text_position?: string
          transition_speed?: string
          transition_style?: string
          updated_at?: string
        }
        Update: {
          autoplay?: boolean
          created_at?: string
          description?: string | null
          desktop_image_alt?: string | null
          desktop_image_url?: string | null
          eyebrow?: string | null
          heading?: string
          id?: string
          internal_name?: string
          mobile_image_alt?: string | null
          mobile_image_url?: string | null
          overlay_strength?: string
          pause_on_hover?: boolean
          primary_button_text?: string | null
          primary_button_url?: string | null
          published_at?: string | null
          secondary_button_text?: string | null
          secondary_button_url?: string | null
          slide_duration?: number
          sort_order?: number
          status?: string
          tablet_image_alt?: string | null
          tablet_image_url?: string | null
          text_alignment?: string
          text_position?: string
          transition_speed?: string
          transition_style?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: string
          low_threshold: number | null
          quantity: number
          reserved: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          id?: string
          low_threshold?: number | null
          quantity?: number
          reserved?: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          id?: string
          low_threshold?: number | null
          quantity?: number
          reserved?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: true
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          id: string
          invoice_data: Json
          invoice_number: string
          issued_at: string
          order_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_data: Json
          invoice_number?: string
          issued_at?: string
          order_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invoice_data?: Json
          invoice_number?: string
          issued_at?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name_snapshot: string
          quantity: number
          sku_snapshot: string | null
          unit_price_snapshot: number
          variant_id: string | null
          variant_name_snapshot: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name_snapshot: string
          quantity: number
          sku_snapshot?: string | null
          unit_price_snapshot: number
          variant_id?: string | null
          variant_name_snapshot?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name_snapshot?: string
          quantity?: number
          sku_snapshot?: string | null
          unit_price_snapshot?: number
          variant_id?: string | null
          variant_name_snapshot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_state: string | null
          cgst_amount: number | null
          cod_fee: number
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string
          discount_amount: number
          id: string
          idempotency_key: string | null
          igst_amount: number | null
          notes: string | null
          order_number: string
          payment_amount: number | null
          payment_method: string
          payment_provider: string | null
          payment_reference: string | null
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          sgst_amount: number | null
          shipping_address: Json
          shipping_amount: number
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number | null
          total_amount: number
          tracking_courier: string | null
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_state?: string | null
          cgst_amount?: number | null
          cod_fee?: number
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          discount_amount?: number
          id?: string
          idempotency_key?: string | null
          igst_amount?: number | null
          notes?: string | null
          order_number?: string
          payment_amount?: number | null
          payment_method?: string
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          sgst_amount?: number | null
          shipping_address: Json
          shipping_amount?: number
          status?: string
          subtotal: number
          tax_amount?: number
          tax_rate?: number | null
          total_amount: number
          tracking_courier?: string | null
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_state?: string | null
          cgst_amount?: number | null
          cod_fee?: number
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          discount_amount?: number
          id?: string
          idempotency_key?: string | null
          igst_amount?: number | null
          notes?: string | null
          order_number?: string
          payment_amount?: number | null
          payment_method?: string
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          sgst_amount?: number | null
          shipping_address?: Json
          shipping_amount?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number | null
          total_amount?: number
          tracking_courier?: string | null
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          order_id: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id: string
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_tokens_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_primary: boolean | null
          product_id: string
          sort_order: number | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          product_id: string
          sort_order?: number | null
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          product_id?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json | null
          compare_at_price: number | null
          created_at: string
          id: string
          is_available: boolean | null
          name: string
          price: number
          product_id: string
          sku: string
        }
        Insert: {
          attributes?: Json | null
          compare_at_price?: number | null
          created_at?: string
          id?: string
          is_available?: boolean | null
          name: string
          price: number
          product_id: string
          sku: string
        }
        Update: {
          attributes?: Json | null
          compare_at_price?: number | null
          created_at?: string
          id?: string
          is_available?: boolean | null
          name?: string
          price?: number
          product_id?: string
          sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category_id: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          is_new_arrival: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          short_description: string | null
          slug: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          base_price: number
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          short_description?: string | null
          slug: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          short_description?: string | null
          slug?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          attempt_count: number
          created_at: string
          error_message: string | null
          id: string
          initiated_at: string | null
          order_id: string
          processed_at: string | null
          razorpay_payment_id: string
          razorpay_refund_id: string | null
          reason: string
          status: string
        }
        Insert: {
          amount: number
          attempt_count?: number
          created_at?: string
          error_message?: string | null
          id?: string
          initiated_at?: string | null
          order_id: string
          processed_at?: string | null
          razorpay_payment_id: string
          razorpay_refund_id?: string | null
          reason?: string
          status?: string
        }
        Update: {
          amount?: number
          attempt_count?: number
          created_at?: string
          error_message?: string | null
          id?: string
          initiated_at?: string | null
          order_id?: string
          processed_at?: string | null
          razorpay_payment_id?: string
          razorpay_refund_id?: string | null
          reason?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          key: string
          label: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          label?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          label?: string | null
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string
          provider: string
        }
        Insert: {
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed_at?: string
          provider?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string
          provider?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_razorpay_payment: {
        Args: {
          p_order_id: string
          p_payment_amount: number
          p_razorpay_payment_id: string
          p_razorpay_signature: string
        }
        Returns: Json
      }
      create_order_atomic: {
        Args: {
          p_cod_fee?: number
          p_currency?: string
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_discount_amount?: number
          p_idempotency_key?: string
          p_items: Json
          p_notes?: string
          p_payment_method?: string
          p_shipping_address: Json
          p_shipping_amount: number
          p_subtotal: number
          p_tax_amount: number
          p_total_amount: number
          p_user_id: string
        }
        Returns: Json
      }
      create_order_pending: {
        Args: {
          p_currency: string
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_discount_amount?: number
          p_idempotency_key: string
          p_items: Json
          p_notes?: string
          p_payment_method?: string
          p_shipping_address: Json
          p_shipping_amount: number
          p_subtotal: number
          p_tax_amount: number
          p_total_amount: number
          p_user_id: string
        }
        Returns: Json
      }
      generate_invoice_number: { Args: never; Returns: string }
      generate_order_number: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      merge_guest_cart: {
        Args: { p_items: Json; p_user_id: string }
        Returns: Json
      }
      set_default_address: {
        Args: { p_address_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
