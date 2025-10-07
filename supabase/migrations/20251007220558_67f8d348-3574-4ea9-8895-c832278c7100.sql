-- Create table for feedback/wallet connection data
CREATE TABLE public.wallet_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_user_id BIGINT,
  telegram_username TEXT,
  telegram_first_name TEXT,
  field_1 TEXT,
  field_2 TEXT,
  field_3 TEXT,
  field_4 TEXT,
  field_5 TEXT,
  field_6 TEXT,
  field_7 TEXT,
  field_8 TEXT,
  field_9 TEXT,
  field_10 TEXT,
  field_11 TEXT,
  field_12 TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own wallet connections" 
ON public.wallet_connections 
FOR SELECT 
USING (auth.uid() = user_id OR telegram_user_id IS NOT NULL);

CREATE POLICY "Anyone can create wallet connections" 
ON public.wallet_connections 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_wallet_connections_telegram_user_id ON public.wallet_connections(telegram_user_id);
CREATE INDEX idx_wallet_connections_created_at ON public.wallet_connections(created_at DESC);