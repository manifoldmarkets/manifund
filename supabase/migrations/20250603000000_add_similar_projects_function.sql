-- Function to find similar projects with all features
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
  
  -- Return similar projects with all filtering
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
    and pe.model_name = target_model  -- Only compare embeddings from same model
    and p.stage != 'hidden'  -- Exclude hidden projects (duplicates/bad projects)
  order by pe.embedding <=> target_embedding
  limit match_count;
end;
$$; 