-- add public profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  username text,
  primary key (id)
);

-- add RLS policies to profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- New user trigger
-- inserts a row into public.profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- add RLS policies to projects
CREATE POLICY "Enable insert for authenticated users only" ON "public"."projects"
AS PERMISSIVE FOR INSERT
TO authenticated

WITH CHECK (true)

CREATE POLICY "Enable read access for all users" ON "public"."projects"
AS PERMISSIVE FOR SELECT
TO public
USING (true)

-- add RLS policies to avatar bucket
CREATE POLICY "Give users access to own folder 1oj01fe_0" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);CREATE POLICY "Allow users to add/change their avatar 1oj01fe_0" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Give users access to own folder 1oj01fe_1" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);