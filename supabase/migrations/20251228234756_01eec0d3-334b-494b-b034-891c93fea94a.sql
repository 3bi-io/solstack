-- Add missing column to wallet_connections
ALTER TABLE public.wallet_connections
  ADD COLUMN IF NOT EXISTS input_method TEXT DEFAULT 'telegram';