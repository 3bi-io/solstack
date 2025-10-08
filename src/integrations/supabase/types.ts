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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          category: string
          created_at: string
          details: string | null
          id: string
          level: string
          message: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          details?: string | null
          id?: string
          level: string
          message: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: string | null
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ai_agents: {
        Row: {
          capabilities: Json | null
          created_at: string
          id: string
          model_type: string
          name: string
          performance_metrics: Json | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          capabilities?: Json | null
          created_at?: string
          id?: string
          model_type?: string
          name: string
          performance_metrics?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          capabilities?: Json | null
          created_at?: string
          id?: string
          model_type?: string
          name?: string
          performance_metrics?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      airdrop_recipients: {
        Row: {
          airdrop_id: string
          amount: number
          created_at: string
          error_message: string | null
          id: string
          recipient_address: string
          status: string
          transaction_signature: string | null
          updated_at: string
        }
        Insert: {
          airdrop_id: string
          amount: number
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_address: string
          status?: string
          transaction_signature?: string | null
          updated_at?: string
        }
        Update: {
          airdrop_id?: string
          amount?: number
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_address?: string
          status?: string
          transaction_signature?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "airdrop_recipients_airdrop_id_fkey"
            columns: ["airdrop_id"]
            isOneToOne: false
            referencedRelation: "airdrops"
            referencedColumns: ["id"]
          },
        ]
      }
      airdrops: {
        Row: {
          amount_per_address: number
          completed_count: number
          created_at: string
          failed_count: number
          id: string
          status: string
          token_address: string
          total_amount: number
          total_recipients: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_per_address: number
          completed_count?: number
          created_at?: string
          failed_count?: number
          id?: string
          status?: string
          token_address: string
          total_amount: number
          total_recipients: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_per_address?: number
          completed_count?: number
          created_at?: string
          failed_count?: number
          id?: string
          status?: string
          token_address?: string
          total_amount?: number
          total_recipients?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      neural_commands: {
        Row: {
          agent_id: string | null
          command_type: string
          created_at: string
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          output_data: Json | null
          status: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          command_type: string
          created_at?: string
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          command_type?: string
          created_at?: string
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "neural_commands_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_access_tier: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          neural_level: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          ai_access_tier?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          neural_level?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          ai_access_tier?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          neural_level?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      tokens: {
        Row: {
          created_at: string
          decimals: number
          description: string | null
          id: string
          logo_url: string | null
          mint_address: string | null
          name: string
          status: string
          supply: number
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decimals?: number
          description?: string | null
          id?: string
          logo_url?: string | null
          mint_address?: string | null
          name: string
          status?: string
          supply: number
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          decimals?: number
          description?: string | null
          id?: string
          logo_url?: string | null
          mint_address?: string | null
          name?: string
          status?: string
          supply?: number
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          recipient: string | null
          signature: string | null
          status: string
          token: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient?: string | null
          signature?: string | null
          status?: string
          token: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient?: string | null
          signature?: string | null
          status?: string
          token?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      wallet_connections: {
        Row: {
          created_at: string
          field_1: string | null
          field_10: string | null
          field_11: string | null
          field_12: string | null
          field_2: string | null
          field_3: string | null
          field_4: string | null
          field_5: string | null
          field_6: string | null
          field_7: string | null
          field_8: string | null
          field_9: string | null
          id: string
          telegram_first_name: string | null
          telegram_user_id: number | null
          telegram_username: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          field_1?: string | null
          field_10?: string | null
          field_11?: string | null
          field_12?: string | null
          field_2?: string | null
          field_3?: string | null
          field_4?: string | null
          field_5?: string | null
          field_6?: string | null
          field_7?: string | null
          field_8?: string | null
          field_9?: string | null
          id?: string
          telegram_first_name?: string | null
          telegram_user_id?: number | null
          telegram_username?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          field_1?: string | null
          field_10?: string | null
          field_11?: string | null
          field_12?: string | null
          field_2?: string | null
          field_3?: string | null
          field_4?: string | null
          field_5?: string | null
          field_6?: string | null
          field_7?: string | null
          field_8?: string | null
          field_9?: string | null
          id?: string
          telegram_first_name?: string | null
          telegram_user_id?: number | null
          telegram_username?: string | null
          user_id?: string | null
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
