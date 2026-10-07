-- Automation so the portal works without hand-editing tables, plus two
-- helper functions an admin can run from the SQL editor.

-- 1. Approving someone as teacher/principal/admin creates their staff record.
create sequence public.staff_number_seq start 1001;

create function public.sync_staff_row() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role in ('teacher', 'principal', 'admin')
     and not exists (select 1 from public.staff where user_id = new.id) then
    insert into public.staff (user_id, staff_number, position)
    values (
      new.id,
      'ST' || nextval('public.staff_number_seq'),
      case new.role when 'teacher' then 'Teacher'
                    when 'principal' then 'Principal'
                    else 'Administrator' end
    );
  end if;
  return new;
end $$;

create trigger profiles_sync_staff
  after insert or update of role on public.profiles
  for each row execute function public.sync_staff_row();

-- 2. A new student is enrolled in every auto-enrol subject for their grade.
create function public.enrol_student_in_grade_subjects() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.enrollments (student_id, subject_id)
  select new.user_id, s.id from public.subjects s
  where s.grade = new.grade and s.auto_enroll
  on conflict do nothing;
  return new;
end $$;

create trigger students_auto_enrol
  after insert on public.students
  for each row execute function public.enrol_student_in_grade_subjects();

-- 3. A new auto-enrol subject enrols the students already in that grade.
create function public.enrol_grade_in_new_subject() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.auto_enroll then
    insert into public.enrollments (student_id, subject_id)
    select st.user_id, new.id from public.students st where st.grade = new.grade
    on conflict do nothing;
  end if;
  return new;
end $$;

create trigger subjects_auto_enrol
  after insert on public.subjects
  for each row execute function public.enrol_grade_in_new_subject();

-- 4. Admin helpers. From the SQL editor:
--      select admin_assign_teacher('teacher@example.com', 'Mathematics', 'Grade 4');
--      select admin_link_parent('parent@example.com', '20261234');
--    The teacher/parent must already have signed in and been approved with
--    the matching role.
create function public.admin_assign_teacher(p_teacher_email text, p_subject_name text, p_grade text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_teacher uuid;
  v_subject uuid;
begin
  if auth.uid() is not null and not public.is_school_admin() then
    raise exception 'Only an admin can assign teachers.';
  end if;

  select id into v_teacher from public.profiles
   where lower(email) = lower(p_teacher_email) and role = 'teacher';
  if v_teacher is null then
    raise exception 'No approved teacher with the email %.', p_teacher_email;
  end if;

  select id into v_subject from public.subjects
   where lower(name) = lower(p_subject_name) and grade = p_grade;
  if v_subject is null then
    raise exception 'There is no subject "%" for %.', p_subject_name, p_grade;
  end if;

  insert into public.subject_teachers (subject_id, teacher_id)
  values (v_subject, v_teacher) on conflict do nothing;
end $$;

create function public.admin_link_parent(p_parent_email text, p_student_number text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_parent uuid;
  v_student uuid;
begin
  if auth.uid() is not null and not public.is_school_admin() then
    raise exception 'Only an admin can link a parent to a student.';
  end if;

  select id into v_parent from public.profiles
   where lower(email) = lower(p_parent_email) and role = 'parent';
  if v_parent is null then
    raise exception 'No approved parent with the email %.', p_parent_email;
  end if;

  select user_id into v_student from public.students where student_number = p_student_number;
  if v_student is null then
    raise exception 'No student with the number %.', p_student_number;
  end if;

  insert into public.parent_links (parent_id, student_id)
  values (v_parent, v_student) on conflict do nothing;
end $$;

-- These check the caller themselves, but must not be callable by anonymous
-- visitors at all (where auth.uid() is null, which the check above treats
-- as a trusted session).
revoke all on function public.admin_assign_teacher(text, text, text) from public, anon, authenticated;
revoke all on function public.admin_link_parent(text, text) from public, anon, authenticated;
grant execute on function public.admin_assign_teacher(text, text, text) to authenticated;
grant execute on function public.admin_link_parent(text, text) to authenticated;
