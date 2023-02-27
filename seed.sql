---- Profiles ----
-- add public profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  username text not null unique,
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
create table if not exists public.projects (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null,
  title text not null,
  blurb text,
  creator uuid not null references auth.users(id) on delete cascade,
  min_funding numeric not null,
  founder_portion int8 not null,
  description jsonb,
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
create table if not exists public.txns (
  id uuid not null default gen_random_uuid(),
  from_id uuid not null references auth.users(id) on delete cascade,
  to_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  token text not null,
  created_at timestamp not null default now(),
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
create type bid_type as enum ('buy', 'sell', 'ipo');

create table if not exists public.bids (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project uuid not null references public.projects(id) on delete cascade,
  bidder uuid not null references auth.users(id) on delete cascade,
  content jsonb,
  primary key (id)
);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."bids" AS PERMISSIVE FOR
INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Enable delete for users based on user_id" ON "public"."bids" AS PERMISSIVE FOR DELETE TO public USING (auth.uid() = bidder);

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

CREATE POLICY "Enable delete for users based on user_id" ON "public"."comments"
AS PERMISSIVE FOR DELETE
TO public
USING (auth.uid() = commenter)
