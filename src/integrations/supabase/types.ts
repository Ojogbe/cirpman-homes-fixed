export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
        Relationships: [
          {
            foreignKeyName: "installment_plans_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "property_bookings"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "payment_history_installment_plan_id_fkey"
            columns: ["installment_plan_id"]
            isOneToOne: false
            referencedRelation: "installment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
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
        Relationships: [
          {
            foreignKeyName: "property_bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "site_visit_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        | "drone_shots"
        | "allocation_events"
        | "construction"
        | "other_events"
      payment_status: "On Track" | "Behind Schedule" | "Paid in Full"
      property_progress: "Planned" | "In Progress" | "Completed"
      property_status: "Available" | "Reserved" | "Sold"
      user_role: "client" | "admin"
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
    Enums: {
      gallery_category: [
        "drone_shots",
        "allocation_events",
        "construction",
        "other_events",
      ],
      payment_status: ["On Track", "Behind Schedule", "Paid in Full"],
      property_progress: ["Planned", "In Progress", "Completed"],
      property_status: ["Available", "Reserved", "Sold"],
      user_role: ["client", "admin"],
    },
  },
} as const
