-- Allow deleting a comment to cascade-delete its replies.
-- Needed so superban can remove a user's comments even when others replied.

ALTER TABLE public.comments
DROP CONSTRAINT IF EXISTS comments_replying_to_fkey;

ALTER TABLE public.comments
ADD CONSTRAINT comments_replying_to_fkey
FOREIGN KEY (replying_to) REFERENCES public.comments(id) ON DELETE CASCADE;
