-- Phase 1: Create Missing Database Tables

-- 1. Create referral_codes table for referral program
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text UNIQUE NOT NULL,
  reward_type text NOT NULL DEFAULT 'percentage',
  reward_value numeric NOT NULL DEFAULT 10,
  uses_count integer NOT NULL DEFAULT 0,
  max_uses integer,
  is_active boolean NOT NULL DEFAULT true,
  expire_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral_codes
CREATE POLICY "Users can view their own referral codes"
ON public.referral_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes"
ON public.referral_codes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral codes"
ON public.referral_codes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own referral codes"
ON public.referral_codes FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all referral codes"
ON public.referral_codes FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Create multisig_wallets table
CREATE TABLE public.multisig_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  name text NOT NULL,
  wallet_address text NOT NULL,
  threshold integer NOT NULL DEFAULT 2,
  signers jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.multisig_wallets ENABLE ROW LEVEL SECURITY;

-- RLS policies for multisig_wallets
CREATE POLICY "Users can view their own multisig wallets"
ON public.multisig_wallets FOR SELECT
USING (auth.uid() = creator_id);

CREATE POLICY "Users can create multisig wallets"
ON public.multisig_wallets FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own multisig wallets"
ON public.multisig_wallets FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own multisig wallets"
ON public.multisig_wallets FOR DELETE
USING (auth.uid() = creator_id);

CREATE POLICY "Admins can view all multisig wallets"
ON public.multisig_wallets FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Create multisig_transactions table for transaction proposals
CREATE TABLE public.multisig_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  multisig_wallet_id uuid NOT NULL REFERENCES public.multisig_wallets(id) ON DELETE CASCADE,
  proposer_id uuid NOT NULL,
  transaction_type text NOT NULL,
  recipient text,
  amount numeric,
  token_address text,
  description text,
  signatures jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'pending',
  tx_signature text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.multisig_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for multisig_transactions
CREATE POLICY "Users can view transactions for their multisig wallets"
ON public.multisig_transactions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.multisig_wallets mw
  WHERE mw.id = multisig_transactions.multisig_wallet_id
  AND mw.creator_id = auth.uid()
));

CREATE POLICY "Users can create transactions for their multisig wallets"
ON public.multisig_transactions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.multisig_wallets mw
  WHERE mw.id = multisig_transactions.multisig_wallet_id
  AND mw.creator_id = auth.uid()
));

CREATE POLICY "Users can update transactions for their multisig wallets"
ON public.multisig_transactions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.multisig_wallets mw
  WHERE mw.id = multisig_transactions.multisig_wallet_id
  AND mw.creator_id = auth.uid()
));

CREATE POLICY "Admins can view all multisig transactions"
ON public.multisig_transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Create market_analysis table for AI analysis results
CREATE TABLE public.market_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  token_address text NOT NULL,
  token_symbol text NOT NULL,
  analysis_type text NOT NULL DEFAULT 'general',
  ai_model text NOT NULL DEFAULT 'grok',
  market_data jsonb,
  analysis_result jsonb,
  sentiment_score numeric,
  price_prediction text,
  confidence_level text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.market_analysis ENABLE ROW LEVEL SECURITY;

-- RLS policies for market_analysis
CREATE POLICY "Anyone can view market analysis"
ON public.market_analysis FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create market analysis"
ON public.market_analysis FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own market analysis"
ON public.market_analysis FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete market analysis"
ON public.market_analysis FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Create api_keys table for enterprise API access
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,
  scopes jsonb NOT NULL DEFAULT '["read"]',
  rate_limit integer NOT NULL DEFAULT 1000,
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS policies for api_keys
CREATE POLICY "Users can view their own API keys"
ON public.api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys"
ON public.api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
ON public.api_keys FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
ON public.api_keys FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all API keys"
ON public.api_keys FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Create api_usage_logs table for tracking API usage
CREATE TABLE public.api_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer,
  response_time_ms integer,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for api_usage_logs
CREATE POLICY "Users can view logs for their API keys"
ON public.api_usage_logs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.api_keys ak
  WHERE ak.id = api_usage_logs.api_key_id
  AND ak.user_id = auth.uid()
));

CREATE POLICY "System can insert API usage logs"
ON public.api_usage_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all API usage logs"
ON public.api_usage_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Create merkle_airdrops table for gas-efficient airdrops
CREATE TABLE public.merkle_airdrops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  token_address text NOT NULL,
  token_symbol text,
  merkle_root text NOT NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  total_recipients integer NOT NULL DEFAULT 0,
  recipients_data jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.merkle_airdrops ENABLE ROW LEVEL SECURITY;

-- RLS policies for merkle_airdrops
CREATE POLICY "Users can view their own merkle airdrops"
ON public.merkle_airdrops FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own merkle airdrops"
ON public.merkle_airdrops FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own merkle airdrops"
ON public.merkle_airdrops FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own merkle airdrops"
ON public.merkle_airdrops FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all merkle airdrops"
ON public.merkle_airdrops FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Create merkle_claims table for tracking claims
CREATE TABLE public.merkle_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airdrop_id uuid NOT NULL REFERENCES public.merkle_airdrops(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  amount numeric NOT NULL,
  proof jsonb NOT NULL,
  claimed boolean NOT NULL DEFAULT false,
  claimed_at timestamptz,
  tx_signature text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.merkle_claims ENABLE ROW LEVEL SECURITY;

-- RLS policies for merkle_claims
CREATE POLICY "Anyone can view merkle claims"
ON public.merkle_claims FOR SELECT
USING (true);

CREATE POLICY "Users can create claims for their airdrops"
ON public.merkle_claims FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.merkle_airdrops ma
  WHERE ma.id = merkle_claims.airdrop_id
  AND ma.user_id = auth.uid()
));

CREATE POLICY "System can update claim status"
ON public.merkle_claims FOR UPDATE
USING (true);

-- Create indexes for performance
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_multisig_wallets_creator_id ON public.multisig_wallets(creator_id);
CREATE INDEX idx_multisig_transactions_wallet_id ON public.multisig_transactions(multisig_wallet_id);
CREATE INDEX idx_market_analysis_token_address ON public.market_analysis(token_address);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_usage_logs_api_key_id ON public.api_usage_logs(api_key_id);
CREATE INDEX idx_merkle_airdrops_user_id ON public.merkle_airdrops(user_id);
CREATE INDEX idx_merkle_claims_airdrop_id ON public.merkle_claims(airdrop_id);
CREATE INDEX idx_merkle_claims_wallet_address ON public.merkle_claims(wallet_address);