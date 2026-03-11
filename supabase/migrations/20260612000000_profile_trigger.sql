-- Migration: Auto-create profile row when a new user signs up
-- This trigger runs after every INSERT on auth.users and creates
-- a matching row in public.profiles with a default 'guest' role.
-- Anonymous sign-ins will get is_anonymous true in their JWT but still
-- have a row in profiles for consistency.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    'guest',
    coalesce(new.raw_user_meta_data ->> 'display_name', 'Anonymous')
  );
  return new;
end;
$$;

-- Drop trigger if it already exists (idempotent)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
