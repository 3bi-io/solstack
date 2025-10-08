-- Add admin role for x@test.com
-- First, get the user_id for x@test.com and insert admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'x@test.com'
ON CONFLICT (user_id, role) DO NOTHING;