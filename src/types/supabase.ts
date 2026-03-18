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
      contracts: {
        Row: {
          contract_date: string
          contract_number: string
          created_at: string
          customer_id: string | null
          id: string
          services: string
          status: string
          storage_path: string | null
          terms: string | null
          total: number
        }
        Insert: {
          contract_date: string
          contract_number: string
          created_at?: string
          customer_id?: string | null
          id?: string
          services: string
          status?: string
          storage_path?: string | null
          terms?: string | null
          total: number
        }
        Update: {
          contract_date?: string
          contract_number?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          services?: string
          status?: string
          storage_path?: string | null
          terms?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_communications: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          note: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          note: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_communications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_services: {
        Row: {
          created_at: string
          customer_id: string
          frequency: string
          id: string
          service_day: string | null
          service_type: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          frequency?: string
          id?: string
          service_day?: string | null
          service_type: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          frequency?: string
          id?: string
          service_day?: string | null
          service_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_services_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
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
          service_day: string | null
          service_frequency: string | null
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
          service_day?: string | null
          service_frequency?: string | null
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
          service_day?: string | null
          service_frequency?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string
          hours: number | null
          id: string
          name: string
          notes: string | null
          purchase_date: string | null
          type: string
          warranty_expiry: string | null
        }
        Insert: {
          created_at?: string
          hours?: number | null
          id?: string
          name: string
          notes?: string | null
          purchase_date?: string | null
          type: string
          warranty_expiry?: string | null
        }
        Update: {
          created_at?: string
          hours?: number | null
          id?: string
          name?: string
          notes?: string | null
          purchase_date?: string | null
          type?: string
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          id: string
          notes: string | null
          receipt_path: string | null
          vendor: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          receipt_path?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          receipt_path?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      follow_up_reminders: {
        Row: {
          completed_at: string | null
          created_at: string
          customer_id: string | null
          id: string
          is_completed: boolean
          note: string
          prospect_name: string | null
          prospect_phone: string | null
          reminder_date: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          is_completed?: boolean
          note: string
          prospect_name?: string | null
          prospect_phone?: string | null
          reminder_date: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          is_completed?: boolean
          note?: string
          prospect_name?: string | null
          prospect_phone?: string | null
          reminder_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
          sms_sent_at: string | null
          stripe_checkout_session_id: string | null
          stripe_checkout_url: string | null
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
          sms_sent_at?: string | null
          stripe_checkout_session_id?: string | null
          stripe_checkout_url?: string | null
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
          sms_sent_at?: string | null
          stripe_checkout_session_id?: string | null
          stripe_checkout_url?: string | null
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
          is_rescheduled: boolean
          job_type: string
          last_sync_attempt: string | null
          notes: string | null
          original_date: string | null
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
          is_rescheduled?: boolean
          job_type?: string
          last_sync_attempt?: string | null
          notes?: string | null
          original_date?: string | null
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
          is_rescheduled?: boolean
          job_type?: string
          last_sync_attempt?: string | null
          notes?: string | null
          original_date?: string | null
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
      maintenance_log: {
        Row: {
          cost: number | null
          created_at: string
          date: string
          equipment_id: string
          id: string
          next_due_date: string | null
          next_due_hours: number | null
          notes: string | null
          type: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          date: string
          equipment_id: string
          id?: string
          next_due_date?: string | null
          next_due_hours?: number | null
          notes?: string | null
          type: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          date?: string
          equipment_id?: string
          id?: string
          next_due_date?: string | null
          next_due_hours?: number | null
          notes?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_log_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
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
          customer_id: string | null
          deleted_at: string | null
          file_size: number | null
          height: number | null
          id: string
          job_id: string | null
          mime_type: string | null
          notes: string | null
          photo_type: string
          sent_at: string | null
          sent_to_customer: boolean | null
          storage_path: string
          thumbnail_path: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          job_id?: string | null
          mime_type?: string | null
          notes?: string | null
          photo_type: string
          sent_at?: string | null
          sent_to_customer?: boolean | null
          storage_path: string
          thumbnail_path?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          job_id?: string | null
          mime_type?: string | null
          notes?: string | null
          photo_type?: string
          sent_at?: string | null
          sent_to_customer?: boolean | null
          storage_path?: string
          thumbnail_path?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_id: string | null
          customer_name: string
          id: string
          items: Json
          notes: string | null
          quote_date: string
          quote_number: string
          status: string
          total: number
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_name: string
          id?: string
          items: Json
          notes?: string | null
          quote_date: string
          quote_number: string
          status?: string
          total: number
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_id?: string | null
          customer_name?: string
          id?: string
          items?: Json
          notes?: string | null
          quote_date?: string
          quote_number?: string
          status?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
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
      seasonal_messages: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          name: string
          subject: string
        }
        Insert: {
          body: string
          category: string
          created_at?: string
          id?: string
          name: string
          subject: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
        }
        Relationships: []
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
