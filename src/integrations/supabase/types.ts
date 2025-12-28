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
          action: string
          category: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          level: string | null
          message: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          category?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          level?: string | null
          message?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          category?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          level?: string | null
          message?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      airdrop_recipients: {
        Row: {
          airdrop_id: string
          amount: number
          created_at: string
          id: string
          status: string
          tx_signature: string | null
          updated_at: string
          wallet_address: string
        }
        Insert: {
          airdrop_id: string
          amount?: number
          created_at?: string
          id?: string
          status?: string
          tx_signature?: string | null
          updated_at?: string
          wallet_address: string
        }
        Update: {
          airdrop_id?: string
          amount?: number
          created_at?: string
          id?: string
          status?: string
          tx_signature?: string | null
          updated_at?: string
          wallet_address?: string
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
          created_at: string
          id: string
          name: string
          status: string
          token_address: string
          token_symbol: string | null
          total_amount: number
          total_recipients: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: string
          token_address: string
          token_symbol?: string | null
          total_amount?: number
          total_recipients?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: string
          token_address?: string
          token_symbol?: string | null
          total_amount?: number
          total_recipients?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bridge_transactions: {
        Row: {
          amount: number
          created_at: string
          from_chain: string
          from_token: string
          id: string
          output_amount: number
          status: string
          to_chain: string
          to_token: string
          transaction_signature: string | null
          tx_signature: string | null
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          from_chain?: string
          from_token: string
          id?: string
          output_amount: number
          status?: string
          to_chain?: string
          to_token: string
          transaction_signature?: string | null
          tx_signature?: string | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          from_chain?: string
          from_token?: string
          id?: string
          output_amount?: number
          status?: string
          to_chain?: string
          to_token?: string
          transaction_signature?: string | null
          tx_signature?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      bundle_wallets: {
        Row: {
          amount: number
          bundle_id: string
          created_at: string
          id: string
          status: string
          tx_signature: string | null
          updated_at: string
          wallet_address: string
        }
        Insert: {
          amount?: number
          bundle_id: string
          created_at?: string
          id?: string
          status?: string
          tx_signature?: string | null
          updated_at?: string
          wallet_address: string
        }
        Update: {
          amount?: number
          bundle_id?: string
          created_at?: string
          id?: string
          status?: string
          tx_signature?: string | null
          updated_at?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_wallets_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
        ]
      }
      bundles: {
        Row: {
          bundle_name: string
          created_at: string
          distribution_strategy: string
          id: string
          status: string
          token_address: string | null
          total_amount: number
          total_wallets: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bundle_name: string
          created_at?: string
          distribution_strategy?: string
          id?: string
          status?: string
          token_address?: string | null
          total_amount?: number
          total_wallets?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bundle_name?: string
          created_at?: string
          distribution_strategy?: string
          id?: string
          status?: string
          token_address?: string | null
          total_amount?: number
          total_wallets?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      farm_positions: {
        Row: {
          apy: number
          auto_compound_enabled: boolean | null
          auto_compound_threshold: number | null
          created_at: string
          farm_id: string
          farm_name: string
          id: string
          last_compound_at: string | null
          lock_end_at: string | null
          lock_period: number
          pending_rewards: number | null
          rewards_earned: number
          staked_amount: number
          staked_at: string | null
          status: string
          token: string
          unlock_date: string | null
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          apy?: number
          auto_compound_enabled?: boolean | null
          auto_compound_threshold?: number | null
          created_at?: string
          farm_id: string
          farm_name: string
          id?: string
          last_compound_at?: string | null
          lock_end_at?: string | null
          lock_period?: number
          pending_rewards?: number | null
          rewards_earned?: number
          staked_amount?: number
          staked_at?: string | null
          status?: string
          token: string
          unlock_date?: string | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          apy?: number
          auto_compound_enabled?: boolean | null
          auto_compound_threshold?: number | null
          created_at?: string
          farm_id?: string
          farm_name?: string
          id?: string
          last_compound_at?: string | null
          lock_end_at?: string | null
          lock_period?: number
          pending_rewards?: number | null
          rewards_earned?: number
          staked_amount?: number
          staked_at?: string | null
          status?: string
          token?: string
          unlock_date?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      farm_transactions: {
        Row: {
          amount: number
          created_at: string
          farm_id: string
          farm_name: string
          id: string
          status: string
          token: string | null
          transaction_signature: string | null
          transaction_signature_old: string | null
          transaction_type: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          farm_id: string
          farm_name: string
          id?: string
          status?: string
          token?: string | null
          transaction_signature?: string | null
          transaction_signature_old?: string | null
          transaction_type: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          farm_id?: string
          farm_name?: string
          id?: string
          status?: string
          token?: string | null
          transaction_signature?: string | null
          transaction_signature_old?: string | null
          transaction_type?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      portfolio_allocations: {
        Row: {
          created_at: string
          deviation_threshold: number
          id: string
          is_active: boolean
          target_percentage: number
          token_mint: string | null
          token_symbol: string
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          deviation_threshold?: number
          id?: string
          is_active?: boolean
          target_percentage?: number
          token_mint?: string | null
          token_symbol: string
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          deviation_threshold?: number
          id?: string
          is_active?: boolean
          target_percentage?: number
          token_mint?: string | null
          token_symbol?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      portfolio_snapshots: {
        Row: {
          created_at: string
          id: string
          snapshot_date: string
          sol_balance: number
          sol_price_usd: number
          token_count: number
          total_value_usd: number
          user_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          snapshot_date: string
          sol_balance?: number
          sol_price_usd?: number
          token_count?: number
          total_value_usd?: number
          user_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: string
          snapshot_date?: string
          sol_balance?: number
          sol_price_usd?: number
          token_count?: number
          total_value_usd?: number
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          condition: string
          created_at: string
          id: string
          is_active: boolean
          notification_sent: boolean | null
          target_price: number
          token_symbol: string
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string
          id?: string
          is_active?: boolean
          notification_sent?: boolean | null
          target_price: number
          token_symbol: string
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          id?: string
          is_active?: boolean
          notification_sent?: boolean | null
          target_price?: number
          token_symbol?: string
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rebalancing_history: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          rebalance_type: string
          status: string
          total_value_usd: number
          trades_executed: number
          user_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          rebalance_type: string
          status?: string
          total_value_usd?: number
          trades_executed?: number
          user_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          rebalance_type?: string
          status?: string
          total_value_usd?: number
          trades_executed?: number
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      referral_clicks: {
        Row: {
          clicked_at: string
          conversion_date: string | null
          converted: boolean | null
          id: string
          ip_address: string | null
          referral_id: string
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string
          conversion_date?: string | null
          converted?: boolean | null
          id?: string
          ip_address?: string | null
          referral_id: string
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string
          conversion_date?: string | null
          converted?: boolean | null
          id?: string
          ip_address?: string | null
          referral_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_clicks_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referrer_email: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referrer_email: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referrer_email?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          created_at: string
          decimals: number
          description: string | null
          id: string
          image_url: string | null
          is_verified: boolean | null
          mint_address: string | null
          name: string
          symbol: string
          telegram: string | null
          total_supply: number | null
          twitter: string | null
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          created_at?: string
          decimals?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          mint_address?: string | null
          name: string
          symbol: string
          telegram?: string | null
          total_supply?: number | null
          twitter?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string
          decimals?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          mint_address?: string | null
          name?: string
          symbol?: string
          telegram?: string | null
          total_supply?: number | null
          twitter?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          amount_usd: number | null
          created_at: string
          from_token: string | null
          id: string
          metadata: Json | null
          recipient: string | null
          signature: string | null
          status: string
          to_token: string | null
          token: string | null
          tx_signature: string | null
          type: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount?: number
          amount_usd?: number | null
          created_at?: string
          from_token?: string | null
          id?: string
          metadata?: Json | null
          recipient?: string | null
          signature?: string | null
          status?: string
          to_token?: string | null
          token?: string | null
          tx_signature?: string | null
          type: string
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          amount_usd?: number | null
          created_at?: string
          from_token?: string | null
          id?: string
          metadata?: Json | null
          recipient?: string | null
          signature?: string | null
          status?: string
          to_token?: string | null
          token?: string | null
          tx_signature?: string | null
          type?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_tracking: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          page_url: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          visited_at: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          page_url: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visited_at?: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          page_url?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visited_at?: string
        }
        Relationships: []
      }
      wallet_connections: {
        Row: {
          connected_at: string
          created_at: string
          id: string
          input_method: string | null
          is_active: boolean
          telegram_first_name: string | null
          telegram_user_id: string
          telegram_username: string | null
          wallet_address: string
        }
        Insert: {
          connected_at?: string
          created_at?: string
          id?: string
          input_method?: string | null
          is_active?: boolean
          telegram_first_name?: string | null
          telegram_user_id: string
          telegram_username?: string | null
          wallet_address: string
        }
        Update: {
          connected_at?: string
          created_at?: string
          id?: string
          input_method?: string | null
          is_active?: boolean
          telegram_first_name?: string | null
          telegram_user_id?: string
          telegram_username?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      yield_optimization_history: {
        Row: {
          amount: number | null
          amount_moved: number
          apy_gain: number | null
          created_at: string
          from_apy: number
          from_farm_id: string
          from_farm_name: string
          gas_cost: number
          id: string
          new_apy: number | null
          old_apy: number | null
          status: string
          to_apy: number
          to_farm_id: string
          to_farm_name: string
          token: string
          transaction_signature: string | null
          tx_signature: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          amount_moved: number
          apy_gain?: number | null
          created_at?: string
          from_apy: number
          from_farm_id: string
          from_farm_name: string
          gas_cost?: number
          id?: string
          new_apy?: number | null
          old_apy?: number | null
          status?: string
          to_apy: number
          to_farm_id: string
          to_farm_name: string
          token: string
          transaction_signature?: string | null
          tx_signature?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          amount_moved?: number
          apy_gain?: number | null
          created_at?: string
          from_apy?: number
          from_farm_id?: string
          from_farm_name?: string
          gas_cost?: number
          id?: string
          new_apy?: number | null
          old_apy?: number | null
          status?: string
          to_apy?: number
          to_farm_id?: string
          to_farm_name?: string
          token?: string
          transaction_signature?: string | null
          tx_signature?: string | null
          user_id?: string
        }
        Relationships: []
      }
      yield_optimizer_settings: {
        Row: {
          auto_compound_enabled: boolean
          check_interval_hours: number
          created_at: string
          id: string
          is_enabled: boolean
          last_optimization_at: string | null
          max_gas_cost: number
          min_apy_difference: number
          notification_enabled: boolean
          risk_tolerance: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_compound_enabled?: boolean
          check_interval_hours?: number
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_optimization_at?: string | null
          max_gas_cost?: number
          min_apy_difference?: number
          notification_enabled?: boolean
          risk_tolerance?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_compound_enabled?: boolean
          check_interval_hours?: number
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_optimization_at?: string | null
          max_gas_cost?: number
          min_apy_difference?: number
          notification_enabled?: boolean
          risk_tolerance?: string | null
          updated_at?: string
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
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
