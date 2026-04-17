-- Add ON DELETE CASCADE to remaining foreign keys referencing profiles(id)
-- so superban can delete a user profile cleanly.

ALTER TABLE public.project_follows
DROP CONSTRAINT IF EXISTS project_follows_follower_id_fkey;

ALTER TABLE public.project_follows
ADD CONSTRAINT project_follows_follower_id_fkey
FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.project_votes
DROP CONSTRAINT IF EXISTS project_votes_voter_id_fkey;

ALTER TABLE public.project_votes
ADD CONSTRAINT project_votes_voter_id_fkey
FOREIGN KEY (voter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
