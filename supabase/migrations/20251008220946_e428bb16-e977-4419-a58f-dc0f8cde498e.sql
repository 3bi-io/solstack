-- Temporarily disable RLS to insert the first admin
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Insert the admin role for c@3bi.io
INSERT INTO public.user_roles (user_id, role) 
VALUES ('781809a6-85ca-4391-bf90-840625381f16', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Re-enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Verify the admin was added
SELECT u.email, ur.role 
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'c@3bi.io';