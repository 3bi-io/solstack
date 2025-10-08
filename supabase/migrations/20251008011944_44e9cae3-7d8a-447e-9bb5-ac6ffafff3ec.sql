-- Create tokens table to track launched tokens
CREATE TABLE public.tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  mint_address TEXT UNIQUE,
  decimals INTEGER NOT NULL DEFAULT 9,
  supply BIGINT NOT NULL,
  description TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create airdrops table to track airdrop campaigns
CREATE TABLE public.airdrops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_address TEXT NOT NULL,
  amount_per_address NUMERIC NOT NULL,
  total_recipients INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create airdrop_recipients table to track individual airdrop recipients
CREATE TABLE public.airdrop_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  airdrop_id UUID NOT NULL REFERENCES public.airdrops(id) ON DELETE CASCADE,
  recipient_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_signature TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table to track all transactions
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  token TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  signature TEXT UNIQUE,
  recipient TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  details TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airdrops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airdrop_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tokens
CREATE POLICY "Users can view their own tokens"
  ON public.tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tokens"
  ON public.tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
  ON public.tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tokens"
  ON public.tokens FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for airdrops
CREATE POLICY "Users can view their own airdrops"
  ON public.airdrops FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own airdrops"
  ON public.airdrops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own airdrops"
  ON public.airdrops FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for airdrop_recipients
CREATE POLICY "Users can view their own airdrop recipients"
  ON public.airdrop_recipients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.airdrops
      WHERE airdrops.id = airdrop_recipients.airdrop_id
      AND airdrops.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own airdrop recipients"
  ON public.airdrop_recipients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.airdrops
      WHERE airdrops.id = airdrop_recipients.airdrop_id
      AND airdrops.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own airdrop recipients"
  ON public.airdrop_recipients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.airdrops
      WHERE airdrops.id = airdrop_recipients.airdrop_id
      AND airdrops.user_id = auth.uid()
    )
  );

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for activity_logs
CREATE POLICY "Users can view their own logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all logs"
  ON public.activity_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_tokens_user_id ON public.tokens(user_id);
CREATE INDEX idx_tokens_mint_address ON public.tokens(mint_address);
CREATE INDEX idx_airdrops_user_id ON public.airdrops(user_id);
CREATE INDEX idx_airdrop_recipients_airdrop_id ON public.airdrop_recipients(airdrop_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_signature ON public.transactions(signature);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Create triggers for updated_at
CREATE TRIGGER update_tokens_updated_at
  BEFORE UPDATE ON public.tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_airdrops_updated_at
  BEFORE UPDATE ON public.airdrops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_airdrop_recipients_updated_at
  BEFORE UPDATE ON public.airdrop_recipients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();