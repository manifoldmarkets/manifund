-- Drop existing function first
drop function if exists find_similar_projects(uuid, int);

-- Update function to find similar projects to include slug
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
    p.slug,
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