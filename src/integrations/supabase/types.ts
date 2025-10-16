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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          published_at: string | null
          slug: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          consultant_id: string | null
          created_at: string | null
          id: string
          property_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          consultant_id?: string | null
          created_at?: string | null
          id?: string
          property_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          consultant_id?: string | null
          created_at?: string | null
          id?: string
          property_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      consultant_subscriptions: {
        Row: {
          consultant_id: string | null
          created_at: string | null
          end_date: string
          id: string
          start_date: string
          subscription_type: Database["public"]["Enums"]["subscription_type"]

        }
        Insert: {
          consultant_id?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          start_date: string
          subscription_type: Database["public"]["Enums"]["subscription_type"]

        }
        Update: {
          consultant_id?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          start_date?: string
          subscription_type?: Database["public"]["Enums"]["subscription_type"] 
        }
        Relationships: [
          {
            foreignKeyName: "consultant_subscriptions_consultant_id_fkey"

            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["id"]
          },
        ]
      }
      consultants: {
        Row: {
          created_at: string | null
          expertise: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          expertise: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          expertise?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      customer_subscriptions: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          start_date: string
          subscription_type: Database["public"]["Enums"]["subscription_type"]

          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          start_date: string
          subscription_type: Database["public"]["Enums"]["subscription_type"]

          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          start_date?: string
          subscription_type?: Database["public"]["Enums"]["subscription_type"] 
          user_id?: string
        }
        Relationships: []
      }
      faq: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          message: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          message: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string
          name?: string | null
        }
        Relationships: []
      }
      gallery: {
        Row: {
          category: Database["public"]["Enums"]["gallery_category"]
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["gallery_category"]
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["gallery_category"]
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      installment_plans: {
        Row: {
          booking_id: string
          created_at: string | null
          id: string
          next_payment_amount: number | null
          next_payment_date: string | null
          status: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          total_paid: number
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          id?: string
          next_payment_amount?: number | null
          next_payment_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          total_paid?: number
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          id?: string
          next_payment_amount?: number | null
          next_payment_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          total_amount?: number
          total_paid?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      leadership_team: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          role: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          role: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          role?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          source: string | null
          status: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          source?: string | null
          status?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          source?: string | null
          status?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          installment_plan_id: string
          notes: string | null
          payment_date: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          installment_plan_id: string
          notes?: string | null
          payment_date?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          installment_plan_id?: string
          notes?: string | null
          payment_date?: string
        }
        Relationships: []
      }
      payment_links: {
        Row: {
          created_at: string | null
          id: string
          link_url: string
          section_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          link_url: string
          section_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          link_url?: string
          section_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      progress_timeline: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          image_url: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          image_url?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          created_at: string | null
          description: string | null
          featured_image: string | null
          id: string
          images: string[] | null
          installment_available: boolean | null
          location: string | null
          price_max: number
          price_min: number
          progress: Database["public"]["Enums"]["property_progress"]
          size_max: number
          size_min: number
          status: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at: string | null
          videos: string[] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          featured_image?: string | null
          id?: string
          images?: string[] | null
          installment_available?: boolean | null
          location?: string | null
          price_max: number
          price_min: number
          progress?: Database["public"]["Enums"]["property_progress"]
          size_max: number
          size_min: number
          status?: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at?: string | null
          videos?: string[] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          featured_image?: string | null
          id?: string
          images?: string[] | null
          installment_available?: boolean | null
          location?: string | null
          price_max?: number
          price_min?: number
          progress?: Database["public"]["Enums"]["property_progress"]
          size_max?: number
          size_min?: number
          status?: Database["public"]["Enums"]["property_status"]
          title?: string
          updated_at?: string | null
          videos?: string[] | null
        }
        Relationships: []
      }
      property_bookings: {
        Row: {
          created_at: string | null
          id: string
          property_id: string
          total_price: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id: string
          total_price: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string
          total_price?: number
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          id: string
          last_request: string | null
          request_count: number | null
          user_id: string
        }
        Insert: {
          id?: string
          last_request?: string | null
          request_count?: number | null
          user_id: string
        }
        Update: {
          id?: string
          last_request?: string | null
          request_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      site_visit_bookings: {
        Row: {
          created_at: string | null
          email: string
          follow_up_status: string | null
          id: string
          message: string | null
          name: string
          phone: string
          preferred_date: string
          preferred_time: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          follow_up_status?: string | null
          id?: string
          message?: string | null
          name: string
          phone: string
          preferred_date: string
          preferred_time: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          follow_up_status?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string
          preferred_date?: string
          preferred_time?: string
          user_id?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          client_company: string | null
          client_name: string | null
          client_photo_url: string | null
          client_title: string | null
          created_at: string | null
          customer_name: string
          featured: boolean | null
          id: string
          message: string
          property_id: string | null
          rating: number | null
          status: string | null
          testimonial_text: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          client_company?: string | null
          client_name?: string | null
          client_photo_url?: string | null
          client_title?: string | null
          created_at?: string | null
          customer_name: string
          featured?: boolean | null
          id?: string
          message: string
          property_id?: string | null
          rating?: number | null
          status?: string | null
          testimonial_text?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          client_company?: string | null
          client_name?: string | null
          client_photo_url?: string | null
          client_title?: string | null
          created_at?: string | null
          customer_name?: string
          featured?: boolean | null
          id?: string
          message?: string
          property_id?: string | null
          rating?: number | null
          status?: string | null
          testimonial_text?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      gallery_category:
        | "interior"
        | "exterior"
        | "amenities"
        | "location"
        | "Drone Shots"
        | "Allocation Events"
        | "Construction"
        | "Events"
      payment_status: "On Track" | "Overdue" | "Completed" | "Paid in Full" | "Behind"
      property_progress:
        | "Planned"
        | "Foundation"
        | "Structure"
        | "Finishing"
        | "Completed"
      property_status: "Available" | "Sold Out" | "Coming Soon" | "reserved" | "sold"
      subscription_type: "monthly" | "yearly"
      user_role: "admin" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">
]


export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]
]["Tables"] &

        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Vi
ews"])

    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Table
s"] &

      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["View
s"])[TableName] extends {

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
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]
["Tables"]

    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables
"][TableName] extends {

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
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]
["Tables"]

    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables
"][TableName] extends {

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
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]][
"Enums"]

    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
[EnumName]

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
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]
]["CompositeTypes"]

    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["Compo
siteTypes"][CompositeTypeName]

  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeType
s"]

    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]

    : never

export const Constants = {
  public: {
    Enums: {
      gallery_category: [
        "interior",
        "exterior",
        "amenities",
        "location",
        "Drone Shots",
        "Allocation Events",
        "Construction",
        "Events",
      ],
      payment_status: ["On Track", "Overdue", "Completed", "Paid in Full", "Behind"],
      property_progress: [
        "Planned",
        "Foundation",
        "Structure",
        "Finishing",
        "Completed",
      ],
      property_status: ["Available", "Sold Out", "Coming Soon", "reserved", "sold"],
      subscription_type: ["monthly", "yearly"],
      user_role: ["admin", "client"],
    },
  },
} as const
