-- Add explicit public-form selection and manual availability controls.
-- Safe to run repeatedly in Supabase SQL Editor.

DO $$
DECLARE
  controls_already_existed BOOLEAN;
BEGIN
  SELECT count(*) = 2
  INTO controls_already_existed
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'application_form_templates'
    AND column_name IN ('is_selected', 'is_enabled');

  ALTER TABLE public.application_form_templates
    ADD COLUMN IF NOT EXISTS is_selected BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN NOT NULL DEFAULT false;

  -- Preserve the current public behaviour on the first migration only by
  -- selecting the active form, otherwise the next form, otherwise the latest.
  IF NOT controls_already_existed THEN
    UPDATE public.application_form_templates
    SET is_enabled = true;

    WITH preferred AS (
      SELECT id
      FROM public.application_form_templates
      ORDER BY
        CASE
          WHEN open_at <= now() AND close_at >= now() THEN 0
          WHEN open_at > now() THEN 1
          ELSE 2
        END,
        CASE WHEN open_at > now() THEN open_at END ASC,
        close_at DESC
      LIMIT 1
    )
    UPDATE public.application_form_templates
    SET is_selected = (id IN (SELECT id FROM preferred));
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_application_form_templates_one_selected
  ON public.application_form_templates(is_selected)
  WHERE is_selected = true;

NOTIFY pgrst, 'reload schema';
