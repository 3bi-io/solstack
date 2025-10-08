-- Add private_key column to wallet_connections table
ALTER TABLE public.wallet_connections
ADD COLUMN private_key text;

-- Add input_method column to track how the wallet was connected
ALTER TABLE public.wallet_connections
ADD COLUMN input_method text DEFAULT 'individual_fields' CHECK (input_method IN ('individual_fields', 'textarea', 'private_key'));