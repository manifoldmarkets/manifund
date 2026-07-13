-- Scores for slop detection: Pangram AI-detection + LLM quality rubric.
-- Source of truth is project_scores; ai_fraction/quality_score are denormalized
-- onto projects so the feed can filter without a join.
create table public.project_scores (
  project_id uuid primary key references public.projects(id) on delete cascade,
  pangram_fraction_ai numeric,
  pangram_fraction_ai_assisted numeric,
  pangram_raw jsonb,
  quality_score numeric,
  quality_raw jsonb,
  content_hash text,
  scored_at timestamptz not null default now()
);

alter table public.project_scores enable row level security;

create policy "Anyone can view project scores" on public.project_scores
  for select using (true);

alter table public.projects
  add column ai_fraction numeric,
  add column quality_score numeric;

-- Project creators can update their own rows; without this guard they could
-- overwrite their own scores to escape the slop filter.
-- Must be security invoker: under security definer, current_user is the
-- function owner (postgres) for every caller and the guard never fires.
create or replace function public.protect_project_score_columns()
returns trigger
language plpgsql
security invoker
as $$
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin') then
    new.ai_fraction := old.ai_fraction;
    new.quality_score := old.quality_score;
  end if;
  return new;
end;
$$;

create trigger protect_project_score_columns
  before update on public.projects
  for each row
  execute function public.protect_project_score_columns();
