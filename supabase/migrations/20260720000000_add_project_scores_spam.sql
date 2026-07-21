-- Spam-filter verdict, recorded when the pre-Pangram spam gate flags a project.
-- Kept alongside the other scores so admins can see why a project was hidden.
alter table public.project_scores
  add column is_spam boolean,
  add column spam_reason text;
