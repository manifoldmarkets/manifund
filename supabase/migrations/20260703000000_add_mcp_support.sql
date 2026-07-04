-- Support for the Manifund MCP server (app/api/mcp):
-- 1. A read-only role + SQL executor for the admin query_sql tool
-- 2. Free-text semantic project search over project_embeddings

-- 1a. Restricted role: SELECT-only on public tables, used by execute_readonly_sql
do $$
begin
  if not exists (select from pg_roles where rolname = 'mcp_readonly') then
    create role mcp_readonly nologin;
  end if;
end $$;

grant mcp_readonly to postgres;
grant mcp_readonly to service_role;
grant usage on schema public to mcp_readonly;
grant select on all tables in schema public to mcp_readonly;
alter default privileges in schema public grant select on tables to mcp_readonly;

-- 1b. Executes arbitrary SELECT queries as mcp_readonly (writes fail on
-- permission checks), with a statement timeout and row cap. Only callable
-- with the service role key.
-- SECURITY INVOKER (the default) on purpose: Postgres forbids SET ROLE inside
-- security-definer functions, and service_role can SET ROLE mcp_readonly via
-- the membership granted above. SET LOCAL reverts when the transaction ends.
create or replace function execute_readonly_sql(query text, max_rows int default 500)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  result jsonb;
begin
  set local role mcp_readonly;
  set local statement_timeout = '15s';
  execute format(
    'select coalesce(jsonb_agg(t), ''[]''::jsonb) from (select * from (%s) sub limit %s) t',
    query,
    least(greatest(max_rows, 1), 1000)
  ) into result;
  return result;
end;
$$;

revoke execute on function execute_readonly_sql(text, int) from public;
revoke execute on function execute_readonly_sql(text, int) from anon;
revoke execute on function execute_readonly_sql(text, int) from authenticated;
grant execute on function execute_readonly_sql(text, int) to service_role;

-- 2. Free-text semantic search: nearest projects to a query embedding.
-- Mirrors find_similar_projects but takes an embedding instead of a project id.
create or replace function search_projects_by_embedding(
  query_embedding vector(3072),
  match_count int default 10,
  include_hidden boolean default false
)
returns table (
  id uuid,
  slug text,
  title text,
  blurb text,
  stage project_stage,
  similarity float
)
language sql
stable
as $$
  select
    p.id,
    p.slug,
    p.title,
    p.blurb,
    p.stage,
    1 - (pe.embedding <=> query_embedding) as similarity
  from project_embeddings pe
  join projects p on p.id = pe.project_id
  where include_hidden or p.stage not in ('hidden', 'draft')
  order by pe.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 50);
$$;
