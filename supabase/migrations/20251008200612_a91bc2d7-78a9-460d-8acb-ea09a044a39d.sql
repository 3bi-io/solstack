-- Create referral codes table
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  uses_count INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  reward_type TEXT NOT NULL DEFAULT 'percentage',
  reward_value NUMERIC NOT NULL DEFAULT 10,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral tracking table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_claimed BOOLEAN DEFAULT false,
  reward_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referred_id)
);

-- Create API keys table for enterprise access
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL,
  permissions JSONB DEFAULT '["read"]'::jsonb,
  rate_limit INTEGER DEFAULT 1000,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create API usage logs
CREATE TABLE public.api_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create multisig wallets table
CREATE TABLE public.multisig_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL UNIQUE,
  signers TEXT[] NOT NULL,
  threshold INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create multisig transactions table
CREATE TABLE public.multisig_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  multisig_wallet_id UUID NOT NULL REFERENCES public.multisig_wallets(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_data JSONB NOT NULL,
  signatures JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create merkle airdrop table
CREATE TABLE public.merkle_airdrops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_address TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  total_recipients INTEGER NOT NULL,
  merkle_root TEXT NOT NULL,
  merkle_tree JSONB NOT NULL,
  claimed_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create merkle claims table
CREATE TABLE public.merkle_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merkle_airdrop_id UUID NOT NULL REFERENCES public.merkle_airdrops(id) ON DELETE CASCADE,
  recipient_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  proof JSONB NOT NULL,
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  transaction_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(merkle_airdrop_id, recipient_address)
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multisig_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multisig_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merkle_airdrops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merkle_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral codes"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral codes"
  ON public.referral_codes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all referral codes"
  ON public.referral_codes FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for referrals
CREATE POLICY "Users can view their referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all referrals"
  ON public.referrals FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for api_keys
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

-- RLS Policies for api_usage_logs
CREATE POLICY "Users can view their own API usage"
  ON public.api_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert API usage logs"
  ON public.api_usage_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all API usage"
  ON public.api_usage_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for multisig_wallets
CREATE POLICY "Users can view multisig wallets they're part of"
  ON public.multisig_wallets FOR SELECT
  USING (auth.uid() = creator_id OR auth.uid()::text = ANY(signers));

CREATE POLICY "Users can create multisig wallets"
  ON public.multisig_wallets FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their multisig wallets"
  ON public.multisig_wallets FOR UPDATE
  USING (auth.uid() = creator_id);

-- RLS Policies for multisig_transactions
CREATE POLICY "Signers can view multisig transactions"
  ON public.multisig_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.multisig_wallets
    WHERE id = multisig_transactions.multisig_wallet_id
    AND (auth.uid() = creator_id OR auth.uid()::text = ANY(signers))
  ));

CREATE POLICY "Users can create multisig transactions"
  ON public.multisig_transactions FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Signers can update multisig transactions"
  ON public.multisig_transactions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.multisig_wallets
    WHERE id = multisig_transactions.multisig_wallet_id
    AND auth.uid()::text = ANY(signers)
  ));

-- RLS Policies for merkle_airdrops
CREATE POLICY "Users can view their own merkle airdrops"
  ON public.merkle_airdrops FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own merkle airdrops"
  ON public.merkle_airdrops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own merkle airdrops"
  ON public.merkle_airdrops FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for merkle_claims
CREATE POLICY "Anyone can view merkle claims"
  ON public.merkle_claims FOR SELECT
  USING (true);

CREATE POLICY "System can insert merkle claims"
  ON public.merkle_claims FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update merkle claims"
  ON public.merkle_claims FOR UPDATE
  USING (true);

-- Create indexes
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_usage_logs_api_key_id ON public.api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_logs_created_at ON public.api_usage_logs(created_at);
CREATE INDEX idx_multisig_wallets_creator_id ON public.multisig_wallets(creator_id);
CREATE INDEX idx_multisig_transactions_wallet_id ON public.multisig_transactions(multisig_wallet_id);
CREATE INDEX idx_merkle_airdrops_user_id ON public.merkle_airdrops(user_id);
CREATE INDEX idx_merkle_claims_airdrop_id ON public.merkle_claims(merkle_airdrop_id);

-- Update triggers
CREATE TRIGGER update_referral_codes_updated_at
  BEFORE UPDATE ON public.referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_multisig_wallets_updated_at
  BEFORE UPDATE ON public.multisig_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_multisig_transactions_updated_at
  BEFORE UPDATE ON public.multisig_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_merkle_airdrops_updated_at
  BEFORE UPDATE ON public.merkle_airdrops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();