-- On signup, default a new user's display name (full_name) and username from
-- their identity instead of leaving the raw UUID placeholder:
--   * full_name: the name from an OAuth provider (e.g. Google) if present,
--     otherwise the email's local part ("alice@gmail.com" -> "alice").
--   * username: always the email's local part, made URL-safe. Usernames are
--     unique, so retry with an incrementing numeric suffix on collisions.

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" = "public"
    AS $$
declare
  display_name text;
  base_username text;
  candidate text;
  suffix int := 0;
begin
  -- Display name: prefer an OAuth full name (Google etc.), else email local part.
  display_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    split_part(coalesce(new.email, ''), '@', 1)
  );

  -- Username base: the email local part, made URL-safe (mirrors the client rule
  -- in app/edit-profile/edit-profile-form.tsx: spaces -> dashes, strip the rest).
  base_username := regexp_replace(
    regexp_replace(split_part(coalesce(new.email, ''), '@', 1), '\s', '-', 'g'),
    '[^\w-]+', '', 'g'
  );

  -- Fall back to the user id if either ends up empty (e.g. a missing email).
  if display_name = '' then
    display_name := new.id::text;
  end if;
  if base_username = '' then
    base_username := new.id::text;
  end if;

  -- Insert, retrying with an incrementing suffix when the username is taken.
  -- The loop also resolves races between two simultaneous signups.
  loop
    candidate := case when suffix = 0 then base_username else base_username || suffix end;
    begin
      insert into public.profiles (id, username, full_name)
      values (new.id, candidate, display_name);
      return new;
    exception when unique_violation then
      suffix := suffix + 1;
      if suffix > 1000 then
        raise; -- give up rather than loop forever (e.g. a duplicate id)
      end if;
    end;
  end loop;
end;
$$;
