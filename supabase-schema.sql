-- ============================================================================
-- ĐOÀN KHOA TÀI CHÍNH - NGÂN HÀNG
-- Complete Supabase schema for the current website
--
-- Safe to run repeatedly in the Supabase SQL Editor.
-- Admin writes use the server-side service-role client and bypass RLS.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remove columns left by the retired Google Drive / Google Sheets integration.
-- This runs before the current schema so legacy NOT NULL columns cannot block setup.
ALTER TABLE IF EXISTS public.application_form_templates
  DROP COLUMN IF EXISTS drive_folder_url,
  DROP COLUMN IF EXISTS drive_folder_id;

ALTER TABLE IF EXISTS public.application_form_submissions
  DROP COLUMN IF EXISTS sheet_write_ok,
  DROP COLUMN IF EXISTS sheet_error;

ALTER TABLE IF EXISTS public.admin_settings
  DROP COLUMN IF EXISTS google_sheet_id,
  DROP COLUMN IF EXISTS google_sheet_range,
  DROP COLUMN IF EXISTS google_sheet_range_contact,
  DROP COLUMN IF EXISTS google_sheet_range_comments;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 1. COMMUNITY: /blog and /forum
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  comment TEXT NOT NULL CHECK (length(btrim(comment)) > 0),
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  avatar TEXT,
  author_role TEXT NOT NULL DEFAULT 'user'
    CHECK (author_role IN ('user', 'admin')),
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS author_role TEXT NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comments_author_role_check'
  ) THEN
    ALTER TABLE public.comments
      ADD CONSTRAINT comments_author_role_check
      CHECK (author_role IN ('user', 'admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_comments_parent_id
  ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_published_created_at
  ON public.comments(is_published, created_at DESC);

DROP TRIGGER IF EXISTS trg_comments_updated_at ON public.comments;
CREATE TRIGGER trg_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Public can view published comments" ON public.comments;
DROP POLICY IF EXISTS "Anon can insert user comments only" ON public.comments;
CREATE POLICY "Public can view published comments"
  ON public.comments FOR SELECT
  USING (is_published = true);
CREATE POLICY "Anon can insert user comments only"
  ON public.comments FOR INSERT
  WITH CHECK (author_role = 'user' AND is_published = true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.alumni_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (length(btrim(full_name)) > 0),
  -- Backward compatible: a single URL or a JSON-encoded URL array.
  avatar_url TEXT,
  positions JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(positions) = 'array'),
  message TEXT NOT NULL CHECK (length(btrim(message)) > 0),
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.alumni_testimonials
  ALTER COLUMN is_published SET DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_alumni_testimonials_published_order
  ON public.alumni_testimonials(is_published, display_order, created_at DESC);

DROP TRIGGER IF EXISTS trg_alumni_testimonials_updated_at ON public.alumni_testimonials;
CREATE TRIGGER trg_alumni_testimonials_updated_at
BEFORE UPDATE ON public.alumni_testimonials
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.alumni_testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published alumni testimonials" ON public.alumni_testimonials;
CREATE POLICY "Public can read published alumni testimonials"
  ON public.alumni_testimonials FOR SELECT
  USING (is_published = true);

-- ============================================================================
-- 2. RECRUITMENT: /apply and application management in /admin
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.application_form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(btrim(name)) > 0),
  open_at TIMESTAMPTZ NOT NULL,
  close_at TIMESTAMPTZ NOT NULL,
  optional_personal_questions JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(optional_personal_questions) = 'array'),
  department_questions JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(department_questions) = 'object'),
  illustrations JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(illustrations) = 'array'),
  class_options JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(class_options) = 'array'),
  is_selected BOOLEAN NOT NULL DEFAULT false,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CHECK (close_at > open_at)
);

-- CREATE TABLE IF NOT EXISTS does not add new columns to an existing table.
-- Keep older Supabase projects compatible with the current form builder.
ALTER TABLE public.application_form_templates
  ADD COLUMN IF NOT EXISTS class_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_selected BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_application_form_templates_window
  ON public.application_form_templates(open_at, close_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_application_form_templates_one_selected
  ON public.application_form_templates(is_selected)
  WHERE is_selected = true;

DROP TRIGGER IF EXISTS trg_application_form_templates_updated_at
  ON public.application_form_templates;
CREATE TRIGGER trg_application_form_templates_updated_at
BEFORE UPDATE ON public.application_form_templates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.application_form_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read templates" ON public.application_form_templates;
CREATE POLICY "Allow public read templates"
  ON public.application_form_templates FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS public.application_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL
    REFERENCES public.application_form_templates(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  class_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  facebook_url TEXT NOT NULL,
  hometown TEXT NOT NULL,
  gender TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  department TEXT NOT NULL,
  optional_personal_answers JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(optional_personal_answers) = 'array'),
  dept_optional_answers JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(dept_optional_answers) = 'array'),
  status TEXT NOT NULL DEFAULT 'not_selected'
    CHECK (status IN ('not_selected', 'accepted', 'undecided', 'rejected')),
  standing_committee_comment TEXT NOT NULL DEFAULT '',
  board_comment TEXT NOT NULL DEFAULT '',
  team_leader_comment TEXT NOT NULL DEFAULT ''
);

ALTER TABLE public.application_form_submissions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'not_selected',
  ADD COLUMN IF NOT EXISTS standing_committee_comment TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS board_comment TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_leader_comment TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone_number TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hometown TEXT NOT NULL DEFAULT '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'application_form_submissions_status_check'
  ) THEN
    ALTER TABLE public.application_form_submissions
      ADD CONSTRAINT application_form_submissions_status_check
      CHECK (status IN ('not_selected', 'accepted', 'undecided', 'rejected'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_application_submissions_template
  ON public.application_form_submissions(template_id);
CREATE INDEX IF NOT EXISTS idx_application_submissions_submitted
  ON public.application_form_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_application_submissions_status
  ON public.application_form_submissions(status, department);

ALTER TABLE public.application_form_submissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.application_form_template_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL
    REFERENCES public.application_form_templates(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated')),
  snapshot JSONB NOT NULL CHECK (jsonb_typeof(snapshot) = 'object'),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_template_history_template
  ON public.application_form_template_history(template_id, changed_at DESC);

ALTER TABLE public.application_form_template_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. MANAGED PUBLIC CONTENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  image_alt TEXT NOT NULL DEFAULT '',
  achieved_on DATE,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_achievements_published_order
  ON public.achievements(is_published, display_order, created_at DESC);
DROP TRIGGER IF EXISTS trg_achievements_updated_at ON public.achievements;
CREATE TRIGGER trg_achievements_updated_at
BEFORE UPDATE ON public.achievements
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published achievements" ON public.achievements;
CREATE POLICY "Public can read published achievements"
  ON public.achievements FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL DEFAULT 'program'
    CHECK (activity_type IN ('category', 'program')),
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  icon_url TEXT NOT NULL DEFAULT '',
  target_href TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(images) = 'array'),
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS activity_type TEXT NOT NULL DEFAULT 'program',
  ADD COLUMN IF NOT EXISTS subtitle TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS icon_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS target_href TEXT NOT NULL DEFAULT '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'activities_activity_type_check'
  ) THEN
    ALTER TABLE public.activities
      ADD CONSTRAINT activities_activity_type_check
      CHECK (activity_type IN ('category', 'program'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_activities_published_order
  ON public.activities(is_published, display_order, created_at DESC);
DROP TRIGGER IF EXISTS trg_activities_updated_at ON public.activities;
CREATE TRIGGER trg_activities_updated_at
BEFORE UPDATE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published activities" ON public.activities;
CREATE POLICY "Public can read published activities"
  ON public.activities FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_partners_published_order
  ON public.partners(is_published, display_order, created_at DESC);
DROP TRIGGER IF EXISTS trg_partners_updated_at ON public.partners;
CREATE TRIGGER trg_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published partners" ON public.partners;
CREATE POLICY "Public can read published partners"
  ON public.partners FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.structure_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(images) = 'array'),
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_structure_departments_published_order
  ON public.structure_departments(is_published, display_order, created_at DESC);
DROP TRIGGER IF EXISTS trg_structure_departments_updated_at ON public.structure_departments;
CREATE TRIGGER trg_structure_departments_updated_at
BEFORE UPDATE ON public.structure_departments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.structure_departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published structure departments" ON public.structure_departments;
CREATE POLICY "Public can read published structure departments"
  ON public.structure_departments FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.youth_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  icon_url TEXT NOT NULL DEFAULT '',
  target_href TEXT NOT NULL DEFAULT '',
  launch_status TEXT NOT NULL DEFAULT 'active'
    CHECK (launch_status IN ('active', 'coming_soon', 'ended')),
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.youth_items
  ADD COLUMN IF NOT EXISTS launch_status TEXT NOT NULL DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'youth_items_launch_status_check'
  ) THEN
    ALTER TABLE public.youth_items
      ADD CONSTRAINT youth_items_launch_status_check
      CHECK (launch_status IN ('active', 'coming_soon', 'ended'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_youth_items_published_order
  ON public.youth_items(is_published, display_order, created_at DESC);
DROP TRIGGER IF EXISTS trg_youth_items_updated_at ON public.youth_items;
CREATE TRIGGER trg_youth_items_updated_at
BEFORE UPDATE ON public.youth_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.youth_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published youth items" ON public.youth_items;
CREATE POLICY "Public can read published youth items"
  ON public.youth_items FOR SELECT USING (is_published = true);

-- ============================================================================
-- 4. SCHOOL MAP: /youth/school-map
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.school_map_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.school_map_nodes(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL DEFAULT 'overview'
    CHECK (node_type IN ('overview', 'building', 'floor', 'room')),
  name TEXT NOT NULL,
  code TEXT NOT NULL DEFAULT '',
  function_text TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  image_alt TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_school_map_nodes_parent_order
  ON public.school_map_nodes(parent_id, display_order);
CREATE INDEX IF NOT EXISTS idx_school_map_nodes_published
  ON public.school_map_nodes(is_published, node_type, display_order);
DROP TRIGGER IF EXISTS trg_school_map_nodes_updated_at ON public.school_map_nodes;
CREATE TRIGGER trg_school_map_nodes_updated_at
BEFORE UPDATE ON public.school_map_nodes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.school_map_nodes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published school map nodes" ON public.school_map_nodes;
CREATE POLICY "Public can read published school map nodes"
  ON public.school_map_nodes FOR SELECT USING (is_published = true);

CREATE TABLE IF NOT EXISTS public.school_map_hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_node_id UUID NOT NULL
    REFERENCES public.school_map_nodes(id) ON DELETE CASCADE,
  target_node_id UUID
    REFERENCES public.school_map_nodes(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'navigate'
    CHECK (action_type IN ('navigate', 'info')),
  x_percent NUMERIC(5,2) NOT NULL DEFAULT 50
    CHECK (x_percent BETWEEN 0 AND 100),
  y_percent NUMERIC(5,2) NOT NULL DEFAULT 50
    CHECK (y_percent BETWEEN 0 AND 100),
  description TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_school_map_hotspots_scene_order
  ON public.school_map_hotspots(scene_node_id, display_order);
DROP TRIGGER IF EXISTS trg_school_map_hotspots_updated_at ON public.school_map_hotspots;
CREATE TRIGGER trg_school_map_hotspots_updated_at
BEFORE UPDATE ON public.school_map_hotspots
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.school_map_hotspots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published school map hotspots" ON public.school_map_hotspots;
CREATE POLICY "Public can read published school map hotspots"
  ON public.school_map_hotspots FOR SELECT USING (is_published = true);

-- ============================================================================
-- 5. A80 SHARING: /youth/a80
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  student_id TEXT,
  class_name TEXT,
  faculty TEXT,
  email TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at
  ON public.submissions(created_at DESC);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read submissions" ON public.submissions;
DROP POLICY IF EXISTS "Public can insert submissions" ON public.submissions;
DROP POLICY IF EXISTS "Public can delete submissions" ON public.submissions;
CREATE POLICY "Public can read submissions"
  ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Public can insert submissions"
  ON public.submissions FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 6. SETTINGS, ADMIN METRICS, AND PROFILE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.home_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  home_banner_image TEXT NOT NULL DEFAULT '',
  home_image_one TEXT NOT NULL DEFAULT '',
  home_image_two TEXT NOT NULL DEFAULT '',
  home_image_three TEXT NOT NULL DEFAULT '',
  home_youtube_url TEXT NOT NULL DEFAULT '',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.home_settings
  ADD COLUMN IF NOT EXISTS home_banner_image TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS home_youtube_url TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS public.admin_visits (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  visits BIGINT NOT NULL DEFAULT 0 CHECK (visits >= 0),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Role-based admin access. The two protected super-admin identities are also
-- enforced in server-side code and cannot be demoted or removed from the UI.
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

DROP TRIGGER IF EXISTS trg_admin_user_profiles_updated_at ON public.admin_user_profiles;
CREATE TRIGGER trg_admin_user_profiles_updated_at
BEFORE UPDATE ON public.admin_user_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.home_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user_profiles ENABLE ROW LEVEL SECURITY;

INSERT INTO public.home_settings (
  id, home_banner_image, home_image_one, home_image_two,
  home_image_three, home_youtube_url
)
VALUES (1, '', '', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.admin_visits (id, visits)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.admin_accounts (email, role, is_protected, created_by)
VALUES
  ('dktaichinhnganhang@st.uel.edu.vn', 'super_admin', true, 'source-code'),
  ('tranlequangan2308@gmail.com', 'super_admin', true, 'source-code')
ON CONFLICT (email) DO UPDATE
SET role = 'super_admin', is_protected = true;

-- Preserve an existing legacy shared profile when upgrading an older project.
DO $$
BEGIN
  IF to_regclass('public.admin_profiles') IS NOT NULL THEN
    INSERT INTO public.admin_user_profiles (
      email, full_name, position, unit, class_name, transportation,
      address, school_email, personal_email, phone, student_id
    )
    SELECT
      'dktaichinhnganhang@st.uel.edu.vn',
      full_name, position, unit, class_name, transportation,
      address, school_email, personal_email, phone, student_id
    FROM public.admin_profiles
    WHERE id = 1
    ON CONFLICT (email) DO NOTHING;

    DELETE FROM public.admin_profiles
    WHERE id = 1
      AND full_name = 'Quản trị viên ĐKTCNH';
  END IF;
END $$;

INSERT INTO public.admin_user_profiles (
  email, full_name, position, unit, school_email, personal_email
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

UPDATE public.admin_user_profiles
SET full_name = ''
WHERE email = 'dktaichinhnganhang@st.uel.edu.vn'
  AND full_name = 'Quản trị viên ĐKTCNH';

-- ============================================================================
-- 7. STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('blog-testimonials', 'blog-testimonials', true, 5242880,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]),
  ('achievements', 'achievements', true, 8388608,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]),
  ('activities', 'activities', true, 10485760,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4']::text[]),
  ('partners', 'partners', true, 8388608,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']::text[]),
  ('structure', 'structure', true, 8388608,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]),
  ('home-images', 'home-images', true, 8388608,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]),
  ('youth-icons', 'youth-icons', true, 5242880,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']::text[]),
  ('school-map-images', 'school-map-images', true, 10485760,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]),
  ('application-form-images', 'application-form-images', true, 8388608,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]),
  ('application-form-photos', 'application-form-photos', true, 8388608,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]),
  ('submission-images', 'submission-images', true, 8388608,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- A80 uploads use the public Supabase client. All other uploads use service role.
DROP POLICY IF EXISTS "Public can view submission images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload submission images" ON storage.objects;
DROP POLICY IF EXISTS "Public can update submission images" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete submission images" ON storage.objects;
CREATE POLICY "Public can view submission images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'submission-images');
CREATE POLICY "Public can upload submission images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'submission-images');

-- End of schema.
