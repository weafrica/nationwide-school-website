-- ONE-OFF CATCH-UP. Already applied to the live school database -- do NOT run
-- this on a fresh project (a fresh project gets all of this from the
-- numbered files in supabase/migrations/ instead).
--
-- Why it exists: the live database was first created from an earlier,
-- simpler single-file schema. It worked, but it was looser than the tested
-- migrations in this repo. This brings it fully in line:
--   * the helper functions the policies use
--   * stricter new-account and role-change protection
--   * who-entered-this-mark stamping
--   * the repo's row level security policies (announcements only visible to
--     the audience they are addressed to, marks only for enrolled learners,
--     admins able to delete announcements, subjects and enrolments, ...)
--   * the length / format checks and indexes on the tables

-- 1. Helper functions ---------------------------------------------------
create or replace function public.current_user_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_school_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() in ('admin', 'principal'), false)
$$;

create or replace function public.is_active_member() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role(), 'pending') <> 'pending'
$$;

create or replace function public.teaches_subject(p_subject uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.subject_teachers
    where subject_id = p_subject and teacher_id = auth.uid()
  )
$$;

create or replace function public.teaches_student(p_student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.enrollments e
    join public.subject_teachers st on st.subject_id = e.subject_id
    where e.student_id = p_student and st.teacher_id = auth.uid()
  )
$$;

create or replace function public.is_parent_of(p_student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.parent_links
    where student_id = p_student and parent_id = auth.uid()
  )
$$;

create or replace function public.is_enrolled(p_student uuid, p_subject uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.enrollments
    where student_id = p_student and subject_id = p_subject
  )
$$;

-- 2. New sign-ups: the role may only be student/teacher/parent/pending ---
create or replace function public.handle_new_user() returns trigger
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

-- 3. Role changes: only an admin changes roles, and only an admin can create
--    or change another admin or principal ---------------------------------
drop trigger if exists profiles_role_guard on public.profiles;
drop function if exists public.prevent_role_self_change();

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

-- 4. Marks: always stamp who recorded a mark and when --------------------
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

-- 5. Replace every policy on the nine portal tables with the repo's ------
do $$
declare p record;
begin
  for p in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles','students','staff','parent_links','subjects',
                        'subject_teachers','enrollments','marks','announcements')
  loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

drop function if exists public.can_view_profile(uuid);

create policy profiles_select on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.is_school_admin()
    or public.teaches_student(id)
    or public.is_parent_of(id)
  );
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on public.profiles for update to authenticated
  using (public.is_school_admin()) with check (public.is_school_admin());

create policy students_select on public.students for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_parent_of(user_id)
    or public.teaches_student(user_id)
    or public.is_school_admin()
  );
create policy students_insert on public.students for insert to authenticated
  with check (public.is_school_admin());
create policy students_update on public.students for update to authenticated
  using (public.is_school_admin()) with check (public.is_school_admin());

create policy staff_select on public.staff for select to authenticated
  using (public.is_active_member());
create policy staff_insert on public.staff for insert to authenticated
  with check (public.is_school_admin());
create policy staff_update on public.staff for update to authenticated
  using (public.is_school_admin()) with check (public.is_school_admin());

create policy parent_links_select on public.parent_links for select to authenticated
  using (parent_id = auth.uid() or public.is_school_admin());
create policy parent_links_insert on public.parent_links for insert to authenticated
  with check (public.is_school_admin());
create policy parent_links_delete on public.parent_links for delete to authenticated
  using (public.is_school_admin());

create policy subjects_select on public.subjects for select to authenticated
  using (public.is_active_member());
create policy subjects_insert on public.subjects for insert to authenticated
  with check (public.is_school_admin());
create policy subjects_update on public.subjects for update to authenticated
  using (public.is_school_admin()) with check (public.is_school_admin());
create policy subjects_delete on public.subjects for delete to authenticated
  using (public.is_school_admin());

create policy subject_teachers_select on public.subject_teachers for select to authenticated
  using (public.is_active_member());
create policy subject_teachers_insert on public.subject_teachers for insert to authenticated
  with check (public.is_school_admin());
create policy subject_teachers_delete on public.subject_teachers for delete to authenticated
  using (public.is_school_admin());

create policy enrollments_select on public.enrollments for select to authenticated
  using (
    student_id = auth.uid()
    or public.is_parent_of(student_id)
    or public.teaches_subject(subject_id)
    or public.is_school_admin()
  );
create policy enrollments_insert on public.enrollments for insert to authenticated
  with check (public.is_school_admin());
create policy enrollments_delete on public.enrollments for delete to authenticated
  using (public.is_school_admin());

create policy marks_select on public.marks for select to authenticated
  using (
    student_id = auth.uid()
    or public.is_parent_of(student_id)
    or public.teaches_subject(subject_id)
    or public.is_school_admin()
  );
create policy marks_insert on public.marks for insert to authenticated
  with check (
    (public.teaches_subject(subject_id) and public.is_enrolled(student_id, subject_id))
    or public.is_school_admin()
  );
create policy marks_update on public.marks for update to authenticated
  using (public.teaches_subject(subject_id) or public.is_school_admin())
  with check (
    (public.teaches_subject(subject_id) and public.is_enrolled(student_id, subject_id))
    or public.is_school_admin()
  );
create policy marks_delete on public.marks for delete to authenticated
  using (public.is_school_admin());

create policy announcements_select on public.announcements for select to authenticated
  using (
    public.is_school_admin()
    or author_id = auth.uid()
    or (
      public.is_active_member()
      and (
        audience = 'all'
        or (audience = 'students' and public.current_user_role() = 'student')
        or (audience = 'teachers' and public.current_user_role() = 'teacher')
        or (audience = 'parents' and public.current_user_role() = 'parent')
      )
    )
  );
create policy announcements_insert on public.announcements for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.current_user_role() in ('teacher', 'principal', 'admin')
  );
create policy announcements_update on public.announcements for update to authenticated
  using (author_id = auth.uid() or public.is_school_admin())
  with check (author_id = auth.uid() or public.is_school_admin());
create policy announcements_delete on public.announcements for delete to authenticated
  using (author_id = auth.uid() or public.is_school_admin());

-- 6. Format and length checks, and indexes, the live tables were missing --
alter table public.students
  add constraint students_grade_format check (grade ~ '^Grade (0|[1-9]|1[0-2])$');
alter table public.subjects
  add constraint subjects_grade_format check (grade ~ '^Grade (0|[1-9]|1[0-2])$');
alter table public.marks
  add constraint marks_year_range check (year between 2000 and 2100),
  add constraint marks_comment_length check (comment is null or char_length(comment) <= 1000);
alter table public.announcements
  add constraint announcements_title_length check (char_length(title) between 1 and 200),
  add constraint announcements_body_length check (char_length(body) between 1 and 5000);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists students_grade_idx on public.students (grade);
create index if not exists parent_links_student_idx on public.parent_links (student_id);
create index if not exists subject_teachers_teacher_idx on public.subject_teachers (teacher_id);
create index if not exists enrollments_subject_idx on public.enrollments (subject_id);
create index if not exists marks_student_idx on public.marks (student_id);
create index if not exists marks_subject_idx on public.marks (subject_id);
create index if not exists announcements_created_idx on public.announcements (created_at desc);
