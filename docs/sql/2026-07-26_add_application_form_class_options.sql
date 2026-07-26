-- Add the class list used by the application form builder.
-- Safe to run repeatedly in Supabase SQL Editor.

ALTER TABLE public.application_form_templates
  ADD COLUMN IF NOT EXISTS class_options JSONB NOT NULL DEFAULT '[]'::jsonb;

NOTIFY pgrst, 'reload schema';
