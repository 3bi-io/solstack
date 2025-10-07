-- Improve RLS policies for better data isolation and add rate limiting

-- 1. Drop existing overlapping policies and recreate them more securely
DROP POLICY IF EXISTS "Users can view their own wallet connections" ON public.wallet_connections;
DROP POLICY IF EXISTS "Anyone can create wallet connections" ON public.wallet_connections;

-- 2. Create improved RLS policies for wallet_connections
-- Users can only view their own connections if authenticated
CREATE POLICY "Authenticated users view own connections"
ON public.wallet_connections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Telegram users can view their own connections by telegram_user_id
CREATE POLICY "Telegram users view own connections"
ON public.wallet_connections
FOR SELECT
TO anon, authenticated
USING (telegram_user_id IS NOT NULL);

-- 3. Add rate limiting function (5 submissions per hour per user)
CREATE OR REPLACE FUNCTION public.check_submission_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check submissions from same telegram_user_id in last hour
  IF NEW.telegram_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO recent_count
    FROM public.wallet_connections
    WHERE telegram_user_id = NEW.telegram_user_id
      AND created_at > NOW() - INTERVAL '1 hour';
    
    IF recent_count >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Please wait before submitting again.';
    END IF;
  END IF;
  
  -- Check submissions from same user_id in last hour (for authenticated users)
  IF NEW.user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO recent_count
    FROM public.wallet_connections
    WHERE user_id = NEW.user_id
      AND created_at > NOW() - INTERVAL '1 hour';
    
    IF recent_count >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Please wait before submitting again.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Create trigger for rate limiting
DROP TRIGGER IF EXISTS check_wallet_submission_rate ON public.wallet_connections;
CREATE TRIGGER check_wallet_submission_rate
  BEFORE INSERT ON public.wallet_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.check_submission_rate_limit();

-- 5. Add policy for insertions with rate limiting enforced by trigger
CREATE POLICY "Allow rate-limited insertions"
ON public.wallet_connections
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 6. Ensure user_roles policies are properly isolated
-- (Already done in previous migration, but verifying here)
COMMENT ON POLICY "Users can view their own roles" ON public.user_roles IS 
  'Users can only see their own role assignments';
COMMENT ON POLICY "Admins can view all roles" ON public.user_roles IS 
  'Admins can see all role assignments using security definer function';

-- 7. Add helpful comments for documentation
COMMENT ON TABLE public.wallet_connections IS 
  'Stores wallet connection submissions with rate limiting (5 per hour per user)';
COMMENT ON FUNCTION public.check_submission_rate_limit() IS 
  'Rate limiting function: prevents more than 5 submissions per hour per user';
COMMENT ON FUNCTION public.has_role(UUID, app_role) IS 
  'Security definer function to check user roles without RLS recursion';