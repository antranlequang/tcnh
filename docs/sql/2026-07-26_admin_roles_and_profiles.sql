-- Admin and super-admin access for /admin.
-- Safe to run repeatedly in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.admin_accounts (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'admin'
    CHECK (role IN ('admin', 'super_admin')),
  is_protected BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CHECK (email = lower(btrim(email)))
);

CREATE INDEX IF NOT EXISTS idx_admin_accounts_role
  ON public.admin_accounts(role, created_at);

CREATE TABLE IF NOT EXISTS public.admin_user_profiles (
  email TEXT PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  position TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL DEFAULT '',
  class_name TEXT NOT NULL DEFAULT '',
  transportation TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  school_email TEXT NOT NULL DEFAULT '',
  personal_email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  student_id TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CHECK (email = lower(btrim(email)))
);

CREATE OR REPLACE FUNCTION public.set_admin_user_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_user_profiles_updated_at
  ON public.admin_user_profiles;
CREATE TRIGGER trg_admin_user_profiles_updated_at
BEFORE UPDATE ON public.admin_user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_admin_user_profiles_updated_at();

ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user_profiles ENABLE ROW LEVEL SECURITY;

-- These identities are also hard-coded on the server. The UI/API cannot
-- demote or delete them.
INSERT INTO public.admin_accounts (email, role, is_protected, created_by)
VALUES
  ('dktaichinhnganhang@st.uel.edu.vn', 'super_admin', true, 'source-code'),
  ('tranlequangan2308@gmail.com', 'super_admin', true, 'source-code')
ON CONFLICT (email) DO UPDATE
SET
  role = 'super_admin',
  is_protected = true;

INSERT INTO public.admin_user_profiles (
  email,
  full_name,
  position,
  unit,
  school_email,
  personal_email
)
VALUES
  (
    'dktaichinhnganhang@st.uel.edu.vn',
    '',
    '',
    '',
    'dktaichinhnganhang@st.uel.edu.vn',
    ''
  ),
  (
    'tranlequangan2308@gmail.com',
    'Trần Lê Quang An',
    'Super admin',
    '',
    '',
    'tranlequangan2308@gmail.com'
  )
ON CONFLICT (email) DO NOTHING;

-- Remove the placeholder name created by the previous schema version.
UPDATE public.admin_user_profiles
SET full_name = ''
WHERE email = 'dktaichinhnganhang@st.uel.edu.vn'
  AND full_name = 'Quản trị viên ĐKTCNH';

DO $$
BEGIN
  IF to_regclass('public.admin_profiles') IS NOT NULL THEN
    DELETE FROM public.admin_profiles
    WHERE id = 1
      AND full_name = 'Quản trị viên ĐKTCNH';
  END IF;
END $$;

-- Example: grant a regular admin account manually.
-- Normally, use the Super admin interface instead.
--
-- INSERT INTO public.admin_accounts (email, role, is_protected, created_by)
-- VALUES ('new-admin@example.com', 'admin', false, 'manual-sql')
-- ON CONFLICT (email) DO NOTHING;
