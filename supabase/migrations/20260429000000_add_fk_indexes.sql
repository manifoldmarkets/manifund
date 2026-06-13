-- Add indexes on foreign-key columns used in hot read paths.
-- Without these, every .eq('project', id) / .in('project', ids) on bids/txns/
-- comments/votes/transfers does a sequential scan. A single project page is
-- ~6 such scans; the homepage feed runs hundreds.
--
-- Skipped: project_follows.project_id, project_causes.project_id,
-- comment_rxns.comment_id — already covered as the leading column of a
-- composite PK.
--
-- Non-CONCURRENTLY: the Supabase SQL editor wraps queries in a transaction,
-- and CREATE INDEX CONCURRENTLY can't run inside one. At ~1000-project scale
-- each CREATE INDEX takes milliseconds and the brief write lock is invisible.
-- If you want truly online builds later, run via psql with CONCURRENTLY.

CREATE INDEX IF NOT EXISTS bids_project_idx              ON public.bids(project);
CREATE INDEX IF NOT EXISTS bids_bidder_idx               ON public.bids(bidder);
CREATE INDEX IF NOT EXISTS bids_pending_status_idx       ON public.bids(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS txns_project_idx              ON public.txns(project) WHERE project IS NOT NULL;
CREATE INDEX IF NOT EXISTS txns_from_id_idx              ON public.txns(from_id);
CREATE INDEX IF NOT EXISTS txns_to_id_idx                ON public.txns(to_id);
CREATE INDEX IF NOT EXISTS comments_project_idx          ON public.comments(project);
CREATE INDEX IF NOT EXISTS comments_commenter_idx        ON public.comments(commenter);
CREATE INDEX IF NOT EXISTS project_votes_project_idx     ON public.project_votes(project_id);
CREATE INDEX IF NOT EXISTS project_follows_follower_idx  ON public.project_follows(follower_id);
CREATE INDEX IF NOT EXISTS project_transfers_project_idx ON public.project_transfers(project_id);
CREATE INDEX IF NOT EXISTS project_causes_cause_slug_idx ON public.project_causes(cause_slug);
CREATE INDEX IF NOT EXISTS projects_creator_idx          ON public.projects(creator);
CREATE INDEX IF NOT EXISTS projects_stage_idx            ON public.projects(stage) WHERE stage NOT IN ('hidden', 'draft');
