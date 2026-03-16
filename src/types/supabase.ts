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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string
          property_address: string
          property_city: string | null
          property_location: unknown
          property_size: string | null
          property_state: string | null
          property_zip: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone: string
          property_address: string
          property_city?: string | null
          property_location?: unknown
          property_size?: string | null
          property_state?: string | null
          property_zip?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string
          property_address?: string
          property_city?: string | null
          property_location?: unknown
          property_size?: string | null
          property_state?: string | null
          property_zip?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          customer_id: string
          deleted_at: string | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          job_id: string | null
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_status: string
          stripe_payment_intent_id: string | null
          stripe_payment_status: string | null
          subtotal: number
          tax: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string | null
          customer_id: string
          deleted_at?: string | null
          due_date: string
          id?: string
          invoice_date?: string
          invoice_number: string
          job_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string
          stripe_payment_intent_id?: string | null
          stripe_payment_status?: string | null
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          created_at?: string | null
          customer_id?: string
          deleted_at?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          job_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string
          stripe_payment_intent_id?: string | null
          stripe_payment_status?: string | null
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_end_time: string | null
          actual_price: number | null
          actual_start_time: string | null
          completion_notes: string | null
          created_at: string | null
          customer_id: string
          customer_instructions: string | null
          deleted_at: string | null
          estimated_price: number | null
          id: string
          last_sync_attempt: string | null
          notes: string | null
          recurring_schedule_id: string | null
          scheduled_date: string
          scheduled_time_end: string | null
          scheduled_time_start: string | null
          service_type: string
          status: string
          sync_status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_price?: number | null
          actual_start_time?: string | null
          completion_notes?: string | null
          created_at?: string | null
          customer_id: string
          customer_instructions?: string | null
          deleted_at?: string | null
          estimated_price?: number | null
          id?: string
          last_sync_attempt?: string | null
          notes?: string | null
          recurring_schedule_id?: string | null
          scheduled_date: string
          scheduled_time_end?: string | null
          scheduled_time_start?: string | null
          service_type: string
          status?: string
          sync_status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_price?: number | null
          actual_start_time?: string | null
          completion_notes?: string | null
          created_at?: string | null
          customer_id?: string
          customer_instructions?: string | null
          deleted_at?: string | null
          estimated_price?: number | null
          id?: string
          last_sync_attempt?: string | null
          notes?: string | null
          recurring_schedule_id?: string | null
          scheduled_date?: string
          scheduled_time_end?: string | null
          scheduled_time_start?: string | null
          service_type?: string
          status?: string
          sync_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_recurring_schedule_id_fkey"
            columns: ["recurring_schedule_id"]
            isOneToOne: false
            referencedRelation: "recurring_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_queue: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          last_error: string | null
          max_retries: number | null
          payload: Json
          processed_at: string | null
          retry_count: number | null
          status: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          last_error?: string | null
          max_retries?: number | null
          payload: Json
          processed_at?: string | null
          retry_count?: number | null
          status?: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          last_error?: string | null
          max_retries?: number | null
          payload?: Json
          processed_at?: string | null
          retry_count?: number | null
          status?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          file_size: number | null
          height: number | null
          id: string
          job_id: string
          mime_type: string | null
          photo_type: string
          sent_at: string | null
          sent_to_customer: boolean | null
          storage_path: string
          thumbnail_path: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          job_id: string
          mime_type?: string | null
          photo_type: string
          sent_at?: string | null
          sent_to_customer?: boolean | null
          storage_path: string
          thumbnail_path?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          photo_type?: string
          sent_at?: string | null
          sent_to_customer?: boolean | null
          storage_path?: string
          thumbnail_path?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_schedules: {
        Row: {
          created_at: string | null
          customer_id: string
          customer_instructions: string | null
          end_date: string | null
          estimated_price: number | null
          frequency: string
          id: string
          is_active: boolean | null
          last_generated_date: string | null
          notes: string | null
          pause_reason: string | null
          paused_at: string | null
          preferred_time: string | null
          service_type: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          customer_instructions?: string | null
          end_date?: string | null
          estimated_price?: number | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_generated_date?: string | null
          notes?: string | null
          pause_reason?: string | null
          paused_at?: string | null
          preferred_time?: string | null
          service_type: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          customer_instructions?: string | null
          end_date?: string | null
          estimated_price?: number | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_generated_date?: string | null
          notes?: string | null
          pause_reason?: string | null
          paused_at?: string | null
          preferred_time?: string | null
          service_type?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_schedules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          email: string | null
          id: string
          location: string | null
          name: string
          rating: number
          review_body: string
          service: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name: string
          rating: number
          review_body: string
          service?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name?: string
          rating?: number
          review_body?: string
          service?: string | null
          status?: string
        }
        Relationships: []
      }
      schedule_skips: {
        Row: {
          created_at: string | null
          id: string
          reason: string | null
          recurring_schedule_id: string
          skip_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason?: string | null
          recurring_schedule_id: string
          skip_date: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string | null
          recurring_schedule_id?: string
          skip_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_skips_recurring_schedule_id_fkey"
            columns: ["recurring_schedule_id"]
            isOneToOne: false
            referencedRelation: "recurring_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
