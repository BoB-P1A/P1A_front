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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      evaluation_requests: {
        Row: {
          assignee_id: string | null
          company_id: string
          created_at: string
          id: string
          notes: string | null
          request_date: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          notes?: string | null
          request_date?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          request_date?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_charts: {
        Row: {
          company_id: string
          created_at: string
          id: string
          image_data: string | null
          phase: string
          storage_path: string | null
          task_name: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          image_data?: string | null
          phase: string
          storage_path?: string | null
          task_name?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          image_data?: string | null
          phase?: string
          storage_path?: string | null
          task_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      flow_tables: {
        Row: {
          activity: string | null
          company_id: string
          created_at: string
          data_items: string | null
          id: string
          location: string | null
          phase: string
          responsible_person: string | null
          security_measures: string | null
          step_number: number | null
          task_id: string | null
          updated_at: string
        }
        Insert: {
          activity?: string | null
          company_id: string
          created_at?: string
          data_items?: string | null
          id?: string
          location?: string | null
          phase: string
          responsible_person?: string | null
          security_measures?: string | null
          step_number?: number | null
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          activity?: string | null
          company_id?: string
          created_at?: string
          data_items?: string | null
          id?: string
          location?: string | null
          phase?: string
          responsible_person?: string | null
          security_measures?: string | null
          step_number?: number | null
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_tables_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_tables_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "processing_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      improvements: {
        Row: {
          company_id: string
          created_at: string
          id: string
          improvement_plan: string | null
          related_law: string | null
          risk_factor: string | null
          source_id: string
          source_type: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          improvement_plan?: string | null
          related_law?: string | null
          risk_factor?: string | null
          source_id: string
          source_type: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          improvement_plan?: string | null
          related_law?: string | null
          risk_factor?: string | null
          source_id?: string
          source_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "improvements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_tasks: {
        Row: {
          company_id: string
          created_at: string
          department: string | null
          id: string
          personal_info_items: string | null
          purpose: string | null
          responsible_person: string | null
          retention_period: string | null
          task_name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          department?: string | null
          id?: string
          personal_info_items?: string | null
          purpose?: string | null
          responsible_person?: string | null
          retention_period?: string | null
          task_name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          department?: string | null
          id?: string
          personal_info_items?: string | null
          purpose?: string | null
          responsible_person?: string | null
          retention_period?: string | null
          task_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processing_tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      protection_lifecycle: {
        Row: {
          company_id: string
          created_at: string
          evaluation_item: string
          evidence: string | null
          field: string
          files: Json | null
          id: string
          item_code: string
          status: string | null
          task_id: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          evaluation_item: string
          evidence?: string | null
          field: string
          files?: Json | null
          id?: string
          item_code: string
          status?: string | null
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          evaluation_item?: string
          evidence?: string | null
          field?: string
          files?: Json | null
          id?: string
          item_code?: string
          status?: string | null
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "protection_lifecycle_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protection_lifecycle_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "processing_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_evaluations: {
        Row: {
          category: string
          code: string
          company_id: string
          created_at: string
          evidence: string | null
          files: Json | null
          id: string
          question: string
          status: string | null
          system_name: string
          updated_at: string
        }
        Insert: {
          category: string
          code: string
          company_id: string
          created_at?: string
          evidence?: string | null
          files?: Json | null
          id?: string
          question: string
          status?: string | null
          system_name: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          company_id?: string
          created_at?: string
          evidence?: string | null
          files?: Json | null
          id?: string
          question?: string
          status?: string | null
          system_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technical_evaluations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "evaluator"
        | "developer"
        | "privacy-team"
        | "planning-team"
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
      app_role: [
        "admin",
        "user",
        "evaluator",
        "developer",
        "privacy-team",
        "planning-team",
      ],
    },
  },
} as const
