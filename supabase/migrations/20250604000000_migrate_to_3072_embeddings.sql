-- Drop the old embedding column and index
drop index if exists project_embeddings_embedding_idx;
alter table project_embeddings drop column if exists embedding;

-- Add new embedding column with 3072 dimensions
alter table project_embeddings add column embedding vector(3072);

-- Update default model to text-embedding-3-large and dimension
alter table project_embeddings 
alter column model_name set default 'text-embedding-3-large',
alter column model_dimension set default 3072;

-- Note: Skipping index creation initially due to pgvector dimension limits
-- For 3072 dimensions, we'll create index after confirming it works or use alternative approach
-- create index project_embeddings_embedding_idx
-- on project_embeddings
-- using hnsw (embedding vector_cosine_ops)
-- with (m = 16, ef_construction = 64);

-- Update the function to use 3072 dimensions
drop function if exists find_similar_projects(uuid, int);

create or replace function find_similar_projects(
  project_id uuid,
  match_count int default 5
)
returns table (
  id uuid,
  slug text,
  title text,
  blurb text,
  similarity float
)
language plpgsql
as $$
declare
  target_embedding vector(3072);
  target_model text;
begin
  -- Get the embedding and model of the target project
  select embedding, model_name into target_embedding, target_model
  from project_embeddings
  where project_embeddings.project_id = find_similar_projects.project_id;

  -- Return similar projects (only compare within same model)
  -- Note: Without index, this will be slower but still functional
  return query
  select
    p.id,
    p.slug,
    p.title,
    p.blurb,
    1 - (pe.embedding <=> target_embedding) as similarity
  from project_embeddings pe
  join projects p on p.id = pe.project_id
  where pe.project_id != find_similar_projects.project_id
    and pe.model_name = target_model
  order by pe.embedding <=> target_embedding
  limit match_count;
end;
$$; 