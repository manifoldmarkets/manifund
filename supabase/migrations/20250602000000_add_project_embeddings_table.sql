-- Enable the pgvector extension
create extension if not exists vector;

-- Create a separate table for project embeddings with all final columns
create table if not exists project_embeddings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references projects(id) on delete cascade,
  embedding vector(3072) not null,
  model_name text not null default 'text-embedding-3-large',
  model_dimension int not null default 3072,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for foreign key lookups
create index if not exists project_embeddings_project_id_idx 
on project_embeddings(project_id);

-- Add an index on model_name for filtering
create index if not exists project_embeddings_model_name_idx 
on project_embeddings(model_name);

-- Note: Skipping vector similarity index initially due to pgvector dimension limits
-- For 3072 dimensions, we'll create index after confirming it works or use alternative approach

-- Add RLS policies
alter table project_embeddings enable row level security;

-- Allow anyone to read embeddings (they're just vectors, not sensitive)
create policy "Anyone can view project embeddings" 
on project_embeddings for select 
using (true);

-- Only service role can insert/update/delete embeddings
create policy "Service role can manage embeddings" 
on project_embeddings for all 
using (auth.role() = 'service_role'); 