---- Profiles ----
-- add public profiles table
create type profile_type as enum ('individual', 'org', 'amm', 'fund');

create table public.profiles (
  id uuid not null,
  username text not null unique,
  bio text not null,
  website text,
  accreditation_status boolean not null,
  full_name text not null,
  avatar_url text,
  type profile_type not null default 'individual',
  long_description jsonb,
  regranter_status boolean not null,
  stripe_connect_id text,
  primary key (id)
);

-- add RLS policies to profiles
alter table
  public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for
select
  using (true);

create policy "Users can insert their own profile." on profiles for
insert
  with check (auth.uid() = id);

create policy "Users can update own profile." on profiles for
update
  using (auth.uid() = id);

-- New user trigger
-- inserts a row into public.profiles
drop function if exists public.handle_new_user() cascade;

create function public.handle_new_user() returns trigger language plpgsql security definer
set
  search_path = public as $ $ begin
insert into
  public.profiles (id, username)
values
  (new.id, new.id);

return new;

end;

$ $;

-- trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after
insert
  on auth.users for each row execute procedure public.handle_new_user();

-- Expose user emails to admins
create view public.users as
select
  id,
  email
from
  auth.users;

revoke all on public.users
from
  anon,
  authenticated;

--
--
--
---- Projects ----
create type project_type as enum ('grant', 'cert');
create type project_stage as enum ('active', 'proposal', 'not funded', 'hidden', 'complete')
create table if not exists public.projects (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null,
  title text not null,
  blurb text,
  creator uuid not null references auth.users(id) on delete cascade,
  min_funding float8 not null,
  funding_goal float8  not null default 0,
  founder_shares int8 not null,
  amm_shares int8 not null,
  auction_close date,
  description jsonb,
  type project_type not null default 'cert',
  stage project_stage not null default 'proposal',
  approved boolean,
  signed_agreement boolean not null default false,
  primary key (id)
);

-- add RLS policies to projects
CREATE POLICY "Enable insert for authenticated users only" ON "public"."projects" AS PERMISSIVE FOR
INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for users based on creator" ON "public"."projects" FOR
UPDATE
  USING (auth.uid() = creator);

CREATE POLICY "Enable read access for all users" ON "public"."projects" AS PERMISSIVE FOR
SELECT
  TO public USING (true);

CREATE POLICY "Enable update for austin based on email" ON "public"."projects" AS PERMISSIVE FOR
UPDATE
  TO public USING (auth.jwt() ->> 'email' = 'akrolsmir@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'akrolsmir@gmail.com');

CREATE POLICY "Enable update for rachel based on email" ON "public"."projects" AS PERMISSIVE FOR
UPDATE
  TO public USING (
    auth.jwt() ->> 'email' = 'rachel.weinberg12@gmail.com'
  ) WITH CHECK (
    auth.jwt() ->> 'email' = 'rachel.weinberg12@gmail.com'
  );

-- add RLS policies to avatar bucket
CREATE POLICY "Give users access to own folder 1oj01fe_0" ON storage.objects FOR
SELECT
  TO public USING (
    bucket_id = 'avatars'
    AND auth.uid() :: text = (storage.foldername(name)) [1]
  );

CREATE POLICY "Allow users to add/change their avatar 1oj01fe_0" ON storage.objects FOR
INSERT
  TO public WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() :: text = (storage.foldername(name)) [1]
  );

CREATE POLICY "Give users access to own folder 1oj01fe_1" ON storage.objects FOR
INSERT
  TO public WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() :: text = (storage.foldername(name)) [1]
  );

--
--
--
---- Txns ----
create type txn_type as enum ("profile donation", "project donation", "user to user trade", "user to amm trade", "withdraw", "deposit", "cash to charity transfer", "inject amm liquidity", "mint cert");
create table if not exists public.txns (
  id uuid not null default gen_random_uuid(),
  from_id uuid not null references auth.users(id) on delete cascade,
  to_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  token text not null,
  created_at timestamp not null default now(),
  type txn_type no null,
  primary key (id)
);

alter table
  public.txns enable row level security;

CREATE POLICY "Enable read access for all users" ON "public"."txns" AS PERMISSIVE FOR
SELECT
  TO public USING (true);

-- Allow anyone to read txns
drop policy if exists "Allow anyone to read txns" on public.txns;

create policy "Allow anyone to read txns" on public.txns for
select
  using (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."txns" AS PERMISSIVE FOR
INSERT
  TO authenticated WITH CHECK (true);

--
--
--
---- Bids ----
-- Create an enum type for 'buy' vs 'sell' vs 'auction'
create type bid_type as enum ('buy', 'sell', 'donate', 'assurance buy', 'assurance sell');
create type bid_status as enum ('deleted', 'pending', 'accepted', 'declined');

create table if not exists public.bids (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project uuid not null references public.projects(id) on delete cascade,
  bidder uuid not null references auth.users(id) on delete cascade,
  status bid_status not null default 'pending',
  content jsonb,
  primary key (id)
);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."bids" AS PERMISSIVE FOR
INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for users based on user_id" ON "public"."bids" AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = bidder);

CREATE POLICY "Enable read access for all users" ON "public"."bids" AS PERMISSIVE FOR
SELECT
  TO public USING (true);


  -- Comments
create table if not exists public.comments (
  id int8 not null default (),
  created_at timestamptz not null default now(),
  project uuid not null references public.projects(id) on delete cascade,
  commenter uuid not null references profiles.users(id) on delete cascade,
  content jsonb,
  primary key (id)
);

  CREATE POLICY "Enable read access for all users" ON "public"."comments"
AS PERMISSIVE FOR SELECT
TO public
USING (true)

CREATE POLICY "Enable insert for authenticated users only" ON "public"."comments"
AS PERMISSIVE FOR INSERT
TO authenticated

WITH CHECK (true)


 -- Tags
create table if not exists public.tags (
  title text not null,
  auction_close_date date,
  description jsonb,
  slug text not null,
  subtitle text,
  data jsonb,
  primary key (title)
);

CREATE POLICY "Enable read access for all users" ON "public"."tags"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable update for rachel based on email" ON "public"."tags"
AS PERMISSIVE FOR UPDATE
TO public
USING (auth.jwt() ->> 'email' = 'rachel.weinberg12@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'rachel.weinberg12@gmail.com');

CREATE POLICY "Enable update for austin based on email" ON "public"."tags"
AS PERMISSIVE FOR UPDATE
TO public
USING (auth.jwt() ->> 'email' = 'akrolsmir@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'akrolsmir@gmail.com');

-- Round header image RLS
CREATE POLICY "Give edit access to rachel 1w84ji1_0" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'round-header-images' AND auth.jwt() ->> 'email'::text = 'rachel.weinberg12@gmail.com');
CREATE POLICY "Give edit access to rachel 1w84ji1_0" ON storage.objects FOR UPDATE TO public WITH CHECK (bucket_id = 'round-header-images' AND auth.jwt() ->> 'email'::text = 'rachel.weinberg12@gmail.com');
CREATE POLICY "Give edit access to rachel 1w84ji1_0" ON storage.objects FOR DELETE TO public WITH CHECK (bucket_id = 'round-header-images' AND auth.jwt() ->> 'email'::text = 'rachel.weinberg12@gmail.com');

CREATE POLICY "Give edit access to austin 1w84ji1_0" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'round-header-images' AND auth.jwt() ->> 'email'::text = 'akrolsmir@gmail.com');
CREATE POLICY "Give edit access to austin 1w84ji1_0" ON storage.objects FOR UPDATE TO public WITH CHECK (bucket_id = 'round-header-images' AND auth.jwt() ->> 'email'::text = 'akrolsmir@gmail.com');
CREATE POLICY "Give edit access to austin 1w84ji1_0" ON storage.objects FOR DELETE TO public WITH CHECK (bucket_id = 'round-header-images' AND auth.jwt() ->> 'email'::text = 'akrolsmir@gmail.com');

-- Stripe txns
create table if not exists public.stripe_txns (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null,
  session_id string not null,
  customer_id uuid not null references auth.users(id) on delete cascade,
  txn_id uuid not null references public.txns(id),
  amount float8 not null,
  primary key (id)
);

-- Stripe txns RLS
CREATE POLICY "Enable insert for authenticated users only" ON "public"."stripe_txns"
AS PERMISSIVE FOR INSERT
TO authenticated

WITH CHECK (true)

-- Project transfers
create table public.project_transfers (
  id uuid not null,
  recipient_email text not null,
  recipient_name text not null,
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  transferred boolean not null default false,
  primary key (id)
);

-- project transfers RLS
CREATE POLICY "Enable read access for all users" ON "public"."project_transfers"
AS PERMISSIVE FOR SELECT
TO public
USING (true)

CREATE POLICY "Enable insert for authenticated users only" ON "public"."project_transfers"
AS PERMISSIVE FOR INSERT
TO authenticated

WITH CHECK (true)


-- Project votes
CREATE TABLE public.project_votes (
  id int8 NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote int2 NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

-- Project votes RLS
CREATE POLICY "Enable read access for all users" ON "public"."project_votes"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."project_votes"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their votes" ON "public"."project_votes"
AS PERMISSIVE FOR UPDATE
TO public
USING (auth.uid() = voter_id)
WITH CHECK (auth.uid() = voter_id);


-- Project tags join table
CREATE TABLE public.project_causes (
  id int8 NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag_slug text NOT NULL REFERENCES public.tags(slug) ON DELETE CASCADE,
  PRIMARY KEY (id)
);

CREATE POLICY "Enable read access for all users" ON "public"."project_causes"
AS PERMISSIVE FOR SELECT
TO public
USING (true)

CREATE POLICY "Enable delete for users if they created the project" ON "public"."project_causes"
AS PERMISSIVE FOR DELETE
TO public
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND creator = auth.uid() ))

CREATE POLICY "Enable insert for authenticated users only" ON "public"."project_causes"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

-- Project evals
CREATE TABLE public.project_evals (
  evaluator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  score float8 NOT NULL DEFAULT 0,
  confidence float8 NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- This would be the ideal primary key, but it messes up Postgrest's foreign key relations
  -- PRIMARY KEY (evaluator_id, project_id),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  PRIMARY KEY (id)
);

-- Project evals RLS
CREATE POLICY "Enable read access for all users" ON "public"."project_evals"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."project_evals"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their votes" ON "public"."project_evals"
AS PERMISSIVE FOR UPDATE
TO public
USING (auth.uid() = evaluator_id)
WITH CHECK (auth.uid() = evaluator_id);

CREATE POLICY "Enable delete for users based on id" ON "public"."project_evals"
AS PERMISSIVE FOR DELETE
TO public
USING (auth.uid() = evaluator_id)

-- Profile trust scores
CREATE TABLE public.profile_trust (
  truster_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trusted_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  weight float8 NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (truster_id, trusted_id)
);

-- Profile trust RLS
CREATE POLICY "Enable read access for all users" ON "public"."profile_trust"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."profile_trust"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their trust scores" ON "public"."profile_trust"
AS PERMISSIVE FOR UPDATE
TO public
USING (auth.uid() = truster_id)
WITH CHECK (auth.uid() = truster_id);

CREATE POLICY "Enable delete for users based on id" ON "public"."profile_trust"
AS PERMISSIVE FOR DELETE
TO public
USING (auth.uid() = truster_id)

