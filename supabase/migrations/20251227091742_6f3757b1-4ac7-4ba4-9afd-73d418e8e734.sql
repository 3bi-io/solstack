-- Create bridge_transactions table for storing bridge history
CREATE TABLE public.bridge_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wallet_address text NOT NULL,
  from_token text NOT NULL,
  to_token text NOT NULL,
  from_chain text NOT NULL,
  to_chain text NOT NULL,
  amount numeric NOT NULL,
  output_amount numeric NOT NULL,
  fee_amount numeric NOT NULL,
  transaction_signature text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bridge_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own bridge transactions"
ON public.bridge_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bridge transactions"
ON public.bridge_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow public read access for transactions by wallet address (for non-authenticated viewing)
CREATE POLICY "Anyone can view transactions by wallet"
ON public.bridge_transactions
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_bridge_transactions_user_id ON public.bridge_transactions(user_id);
CREATE INDEX idx_bridge_transactions_wallet ON public.bridge_transactions(wallet_address);
CREATE INDEX idx_bridge_transactions_created_at ON public.bridge_transactions(created_at DESC);