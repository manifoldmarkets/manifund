-- Add ON DELETE CASCADE to foreign keys that are missing it
-- This enables clean deletion of users and their content

-- Fix txns.project foreign key
ALTER TABLE public.txns 
DROP CONSTRAINT IF EXISTS txns_project_fkey;

ALTER TABLE public.txns
ADD CONSTRAINT txns_project_fkey 
FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Fix grant_agreements.project_id foreign key
ALTER TABLE public.grant_agreements 
DROP CONSTRAINT IF EXISTS grant_agreements_project_id_fkey;

ALTER TABLE public.grant_agreements
ADD CONSTRAINT grant_agreements_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Fix grant_agreements.approved_by foreign key
ALTER TABLE public.grant_agreements 
DROP CONSTRAINT IF EXISTS grant_agreements_approved_by_fkey;

ALTER TABLE public.grant_agreements
ADD CONSTRAINT grant_agreements_approved_by_fkey 
FOREIGN KEY (approved_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix comment_rxns.comment_id foreign key
ALTER TABLE public.comment_rxns 
DROP CONSTRAINT IF EXISTS comment_rxns_comment_id_fkey;

ALTER TABLE public.comment_rxns
ADD CONSTRAINT comment_rxns_comment_id_fkey 
FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;

-- Fix comment_rxns.reactor_id foreign key
ALTER TABLE public.comment_rxns 
DROP CONSTRAINT IF EXISTS comment_rxns_reactor_id_fkey;

ALTER TABLE public.comment_rxns
ADD CONSTRAINT comment_rxns_reactor_id_fkey 
FOREIGN KEY (reactor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix comment_rxns.txn_id foreign key
ALTER TABLE public.comment_rxns 
DROP CONSTRAINT IF EXISTS comment_rxns_txn_id_fkey;

ALTER TABLE public.comment_rxns
ADD CONSTRAINT comment_rxns_txn_id_fkey 
FOREIGN KEY (txn_id) REFERENCES public.txns(id) ON DELETE CASCADE;

-- Fix project_votes.project_id foreign key
ALTER TABLE public.project_votes 
DROP CONSTRAINT IF EXISTS project_votes_project_id_fkey;

ALTER TABLE public.project_votes
ADD CONSTRAINT project_votes_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Fix project_causes.project_id foreign key
ALTER TABLE public.project_causes 
DROP CONSTRAINT IF EXISTS project_causes_project_id_fkey;

ALTER TABLE public.project_causes
ADD CONSTRAINT project_causes_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Fix project_follows.project_id foreign key
ALTER TABLE public.project_follows 
DROP CONSTRAINT IF EXISTS project_follows_project_id_fkey;

ALTER TABLE public.project_follows
ADD CONSTRAINT project_follows_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Fix comments.project foreign key
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_project_fkey;

ALTER TABLE public.comments
ADD CONSTRAINT comments_project_fkey 
FOREIGN KEY (project) REFERENCES public.projects(id) ON DELETE CASCADE;
