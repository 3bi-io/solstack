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
      analytics_snapshots: {
        Row: {
          cost_savings: number | null
          created_at: string
          failed_transactions: number | null
          id: string
          snapshot_date: string
          successful_transactions: number | null
          total_airdrops: number | null
          total_fees_paid: number | null
          total_tokens_launched: number | null
          total_transactions: number | null
          total_volume: number | null
          user_id: string
        }
        Insert: {
          cost_savings?: number | null
          created_at?: string
          failed_transactions?: number | null
          id?: string
          snapshot_date: string
          successful_transactions?: number | null
          total_airdrops?: number | null
          total_fees_paid?: number | null
          total_tokens_launched?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          user_id: string
        }
        Update: {
          cost_savings?: number | null
          created_at?: string
          failed_transactions?: number | null
          id?: string
          snapshot_date?: string
          successful_transactions?: number | null
          total_airdrops?: number | null
          total_fees_paid?: number | null
          total_tokens_launched?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: Json | null
          rate_limit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: Json | null
          rate_limit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json | null
          rate_limit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_usage_logs: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          id: string
          method: string
          response_time_ms: number | null
          status_code: number
          user_id: string
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint: string
          id?: string
          method: string
          response_time_ms?: number | null
          status_code: number
          user_id: string
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          method?: string
          response_time_ms?: number | null
          status_code?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      bridge_transactions: {
        Row: {
          amount: number
          created_at: string
          fee_amount: number
          from_chain: string
          from_token: string
          id: string
          output_amount: number
          status: string
          to_chain: string
          to_token: string
          transaction_signature: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string
          fee_amount: number
          from_chain: string
          from_token: string
          id?: string
          output_amount: number
          status?: string
          to_chain: string
          to_token: string
          transaction_signature: string
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string
          fee_amount?: number
          from_chain?: string
          from_token?: string
          id?: string
          output_amount?: number
          status?: string
          to_chain?: string
          to_token?: string
          transaction_signature?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      bundle_wallets: {
        Row: {
          allocated_amount: number
          bundle_id: string
          created_at: string
          error_message: string | null
          id: string
          status: string
          transaction_signature: string | null
          updated_at: string
          wallet_address: string
          wallet_name: string | null
        }
        Insert: {
          allocated_amount: number
          bundle_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          status?: string
          transaction_signature?: string | null
          updated_at?: string
          wallet_address: string
          wallet_name?: string | null
        }
        Update: {
          allocated_amount?: number
          bundle_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          status?: string
          transaction_signature?: string | null
          updated_at?: string
          wallet_address?: string
          wallet_name?: string | null
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
          bundle_config: Json
          bundle_name: string
          created_at: string
          distribution_strategy: string
          error_message: string | null
          executed_at: string | null
          id: string
          status: string
          total_amount: number
          total_wallets: number
          transaction_signatures: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bundle_config?: Json
          bundle_name: string
          created_at?: string
          distribution_strategy?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          status?: string
          total_amount: number
          total_wallets: number
          transaction_signatures?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bundle_config?: Json
          bundle_name?: string
          created_at?: string
          distribution_strategy?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          status?: string
          total_amount?: number
          total_wallets?: number
          transaction_signatures?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      market_analysis: {
        Row: {
          ai_model: string
          analysis_result: Json
          analysis_type: string
          confidence_level: string | null
          created_at: string
          id: string
          market_data: Json
          price_prediction: number | null
          sentiment_score: number | null
          token_address: string
          token_symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model: string
          analysis_result: Json
          analysis_type: string
          confidence_level?: string | null
          created_at?: string
          id?: string
          market_data: Json
          price_prediction?: number | null
          sentiment_score?: number | null
          token_address: string
          token_symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model?: string
          analysis_result?: Json
          analysis_type?: string
          confidence_level?: string | null
          created_at?: string
          id?: string
          market_data?: Json
          price_prediction?: number | null
          sentiment_score?: number | null
          token_address?: string
          token_symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      merkle_airdrops: {
        Row: {
          claimed_count: number | null
          created_at: string
          id: string
          merkle_root: string
          merkle_tree: Json
          status: string
          token_address: string
          total_amount: number
          total_recipients: number
          updated_at: string
          user_id: string
        }
        Insert: {
          claimed_count?: number | null
          created_at?: string
          id?: string
          merkle_root: string
          merkle_tree: Json
          status?: string
          token_address: string
          total_amount: number
          total_recipients: number
          updated_at?: string
          user_id: string
        }
        Update: {
          claimed_count?: number | null
          created_at?: string
          id?: string
          merkle_root?: string
          merkle_tree?: Json
          status?: string
          token_address?: string
          total_amount?: number
          total_recipients?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      merkle_claims: {
        Row: {
          amount: number
          claimed: boolean | null
          claimed_at: string | null
          created_at: string
          id: string
          merkle_airdrop_id: string
          proof: Json
          recipient_address: string
          transaction_signature: string | null
        }
        Insert: {
          amount: number
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string
          id?: string
          merkle_airdrop_id: string
          proof: Json
          recipient_address: string
          transaction_signature?: string | null
        }
        Update: {
          amount?: number
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string
          id?: string
          merkle_airdrop_id?: string
          proof?: Json
          recipient_address?: string
          transaction_signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merkle_claims_merkle_airdrop_id_fkey"
            columns: ["merkle_airdrop_id"]
            isOneToOne: false
            referencedRelation: "merkle_airdrops"
            referencedColumns: ["id"]
          },
        ]
      }
      multisig_transactions: {
        Row: {
          created_at: string
          creator_id: string
          executed_at: string | null
          id: string
          multisig_wallet_id: string
          signatures: Json | null
          status: string
          transaction_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          executed_at?: string | null
          id?: string
          multisig_wallet_id: string
          signatures?: Json | null
          status?: string
          transaction_data: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          executed_at?: string | null
          id?: string
          multisig_wallet_id?: string
          signatures?: Json | null
          status?: string
          transaction_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "multisig_transactions_multisig_wallet_id_fkey"
            columns: ["multisig_wallet_id"]
            isOneToOne: false
            referencedRelation: "multisig_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      multisig_wallets: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          signers: string[]
          threshold: number
          updated_at: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          signers: string[]
          threshold: number
          updated_at?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          signers?: string[]
          threshold?: number
          updated_at?: string
          wallet_address?: string
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
      referral_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          reward_type: string
          reward_value: number
          updated_at: string
          user_id: string
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          reward_type?: string
          reward_value?: number
          updated_at?: string
          user_id: string
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          reward_type?: string
          reward_value?: number
          updated_at?: string
          user_id?: string
          uses_count?: number
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code_id: string
          referred_id: string
          referrer_id: string
          reward_amount: number | null
          reward_claimed: boolean | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code_id: string
          referred_id: string
          referrer_id: string
          reward_amount?: number | null
          reward_claimed?: boolean | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code_id?: string
          referred_id?: string
          referrer_id?: string
          reward_amount?: number | null
          reward_claimed?: boolean | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_airdrops: {
        Row: {
          airdrop_id: string | null
          amount_per_address: number
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          processed_at: string | null
          recipient_addresses: string[]
          scheduled_for: string
          status: string
          token_address: string
          user_id: string
        }
        Insert: {
          airdrop_id?: string | null
          amount_per_address: number
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          recipient_addresses: string[]
          scheduled_for: string
          status?: string
          token_address: string
          user_id: string
        }
        Update: {
          airdrop_id?: string | null
          amount_per_address?: number
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          recipient_addresses?: string[]
          scheduled_for?: string
          status?: string
          token_address?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_airdrops_airdrop_id_fkey"
            columns: ["airdrop_id"]
            isOneToOne: false
            referencedRelation: "airdrops"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          created_at: string
          decimals: number
          description: string | null
          discord: string | null
          extensions: Json | null
          id: string
          logo_url: string | null
          metadata_uri: string | null
          mint_address: string | null
          name: string
          revoke_freeze_authority: boolean | null
          revoke_mint_authority: boolean | null
          status: string
          supply: number
          symbol: string
          telegram: string | null
          twitter: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          decimals?: number
          description?: string | null
          discord?: string | null
          extensions?: Json | null
          id?: string
          logo_url?: string | null
          metadata_uri?: string | null
          mint_address?: string | null
          name: string
          revoke_freeze_authority?: boolean | null
          revoke_mint_authority?: boolean | null
          status?: string
          supply: number
          symbol: string
          telegram?: string | null
          twitter?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          decimals?: number
          description?: string | null
          discord?: string | null
          extensions?: Json | null
          id?: string
          logo_url?: string | null
          metadata_uri?: string | null
          mint_address?: string | null
          name?: string
          revoke_freeze_authority?: boolean | null
          revoke_mint_authority?: boolean | null
          status?: string
          supply?: number
          symbol?: string
          telegram?: string | null
          twitter?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
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
          input_method: string | null
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
          input_method?: string | null
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
          input_method?: string | null
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
