-- =====================================================
-- PHASE 1: FIX ROLE SECURITY ARCHITECTURE
-- =====================================================

-- 1.1 Drop RLS policies that reference profiles.role (must fix these first)
DROP POLICY IF EXISTS "Admins can view all referral clicks" ON public.referral_clicks;
DROP POLICY IF EXISTS "Admins can view all referrals" ON public.referrals;

-- 1.2 Remove the dangerous role column from profiles table
-- First update handle_new_user function to not insert role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Also insert default 'user' role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;

-- 1.3 Drop the role column and user_role type (after function update)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
DROP TYPE IF EXISTS public.user_role;

-- 1.4 Recreate admin policies using has_role() function
CREATE POLICY "Admins can view all referral clicks"
ON public.referral_clicks
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all referrals"
ON public.referrals
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- PHASE 2: CLEAN UP DUPLICATE RLS POLICIES
-- =====================================================

-- 2.1 Remove duplicate SELECT policies on referral_clicks
DROP POLICY IF EXISTS "Anyone can view referral clicks" ON public.referral_clicks;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.referral_clicks;
-- Keep: "Users can view clicks for their referrals" - specific user access
-- Already recreated: "Admins can view all referral clicks"

-- 2.2 Remove duplicate INSERT policies on referral_clicks
DROP POLICY IF EXISTS "Anyone can create referral clicks" ON public.referral_clicks;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.referral_clicks;
-- Keep: "System can insert referral clicks"

-- 2.3 Remove duplicate SELECT policies on referrals
DROP POLICY IF EXISTS "Anyone can view referrals" ON public.referrals;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.referrals;
-- Keep: "Users can view their own referrals"
-- Already recreated: "Admins can view all referrals"

-- 2.4 Remove duplicate INSERT policies on referrals
DROP POLICY IF EXISTS "Anyone can create referrals" ON public.referrals;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.referrals;
-- Keep: "Users can create referrals" (requires user to be referrer)

-- 2.5 Fix dangerous UPDATE policy on referrals (currently allows anyone)
DROP POLICY IF EXISTS "Referrers can update their own referrals" ON public.referrals;

-- Create proper UPDATE policy that only allows users to update their own referrals
CREATE POLICY "Users can update their own referrals"
ON public.referrals
FOR UPDATE
USING (
  user_id = auth.uid() 
  OR referrer_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- =====================================================
-- PHASE 4: RESTORE MISSING TRIGGER
-- =====================================================

-- 4.1 Create trigger on auth.users to call handle_new_user()
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();