-- Helper functions and triggers.
--
-- The helpers are SECURITY DEFINER on purpose: the row level security
-- policies in the next migration call them instead of querying other
-- tables directly. Querying profiles from inside a profiles policy (or
-- enrollments from inside an enrollments policy, and so on) makes
-- Postgres report "infinite recursion detected in policy"; a definer
-- function reads the table without re-triggering the policies.

create function public.current_user_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create function public.is_school_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() in ('admin', 'principal'), false)
$$;

create function public.is_active_member() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role(), 'pending') <> 'pending'
$$;

create function public.teaches_subject(p_subject uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.subject_teachers
    where subject_id = p_subject and teacher_id = auth.uid()
  )
$$;

create function public.teaches_student(p_student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.enrollments e
    join public.subject_teachers st on st.subject_id = e.subject_id
    where e.student_id = p_student and st.teacher_id = auth.uid()
  )
$$;

create function public.is_parent_of(p_student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.parent_links
    where student_id = p_student and parent_id = auth.uid()
  )
$$;

create function public.is_enrolled(p_student uuid, p_subject uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.enrollments
    where student_id = p_student and subject_id = p_subject
  )
$$;

-- ---------------------------------------------------------------------
-- New sign-ups: create the profile row automatically.
--
-- SECURITY: the role may only come from app_metadata, which can be set
-- only server-side (the create-student Edge Function, or the Supabase
-- dashboard). It must never come from user_metadata: that is whatever the
-- browser sends at sign-up, so anyone could otherwise register with
-- {"preset_role": "admin"} and become an administrator.
--
-- Anything else -- including every Google sign-in -- starts as 'pending'
-- and sees nothing until an admin approves it. Admin and principal are
-- never preset; they are only ever assigned by an existing admin.
-- ---------------------------------------------------------------------
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_role text := coalesce(new.raw_app_meta_data ->> 'preset_role', 'pending');
begin
  if v_role not in ('pending', 'student', 'teacher', 'parent') then
    v_role := 'pending';
  end if;

  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      new.email,
      'Unnamed user'
    ),
    new.email,
    v_role
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Role changes. Row level security lets people update their own profile
-- row (to change their name, say), which would also let them change their
-- own `role`. This trigger closes that: only an admin or principal can
-- change a role, and only an admin can create or remove another
-- admin/principal.
--
-- When auth.uid() is null the change is not coming from a signed-in
-- person but from the SQL editor, a migration or the service role (the
-- Edge Function), which are trusted.
-- ---------------------------------------------------------------------
create function public.protect_profile_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    if not public.is_school_admin() then
      raise exception 'Only an admin can change a role.';
    end if;
    if (new.role in ('admin', 'principal') or old.role in ('admin', 'principal'))
       and public.current_user_role() <> 'admin' then
      raise exception 'Only an admin can create or change an admin or principal.';
    end if;
  end if;
  return new;
end $$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Marks: always stamp who recorded a mark and when, rather than trusting
-- whatever the browser sends.
create function public.stamp_mark() returns trigger
language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null then
    new.recorded_by := auth.uid();
  end if;
  new.recorded_at := now();
  return new;
end $$;

create trigger marks_stamp
  before insert or update on public.marks
  for each row execute function public.stamp_mark();
