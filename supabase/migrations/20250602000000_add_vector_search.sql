-- Enable the pgvector extension
create extension if not exists vector;

-- Create a separate table for project embeddings
create table if not exists project_embeddings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references projects(id) on delete cascade,
  embedding vector(1536) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for foreign key lookups
create index if not exists project_embeddings_project_id_idx 
on project_embeddings(project_id);

-- Create an index for fast similarity search
create index if not exists project_embeddings_embedding_idx 
on project_embeddings 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Function to find similar projects
create or replace function find_similar_projects(
  project_id uuid,
  match_count int default 5
)
returns table (
  id uuid,
  title text,
  blurb text,
  similarity float
)
language plpgsql
as $$
declare
  target_embedding vector(1536);
begin
  -- Get the embedding of the target project
  select embedding into target_embedding
  from project_embeddings
  where project_embeddings.project_id = find_similar_projects.project_id;
  
  -- Return similar projects
  return query
  select 
    p.id,
    p.title,
    p.blurb,
    1 - (pe.embedding <=> target_embedding) as similarity
  from project_embeddings pe
  join projects p on p.id = pe.project_id
  where pe.project_id != find_similar_projects.project_id
  order by pe.embedding <=> target_embedding
  limit match_count;
end;
$$;

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