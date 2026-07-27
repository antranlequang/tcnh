-- Candidate contact details and three-role interview comments.
-- Safe to run repeatedly in the Supabase SQL Editor.

ALTER TABLE public.application_form_submissions
  ADD COLUMN IF NOT EXISTS phone_number TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hometown TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS standing_committee_comment TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS board_comment TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS team_leader_comment TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.application_form_submissions.phone_number
  IS 'Candidate phone number provided on the application form.';
COMMENT ON COLUMN public.application_form_submissions.facebook_url
  IS 'Candidate Facebook profile URL.';
COMMENT ON COLUMN public.application_form_submissions.hometown
  IS 'Candidate hometown.';
COMMENT ON COLUMN public.application_form_submissions.standing_committee_comment
  IS 'Interview comment from the Standing Committee.';
COMMENT ON COLUMN public.application_form_submissions.board_comment
  IS 'Interview comment from the Professional Committee.';
COMMENT ON COLUMN public.application_form_submissions.team_leader_comment
  IS 'Interview comment from the team leader.';
