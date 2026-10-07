-- Row level security: exactly what each role can read and write.
-- Every table already has RLS switched on (first migration), so anything
-- not allowed here is denied.
--
--   pending   signed in, waiting for approval: sees nothing
--   student   their own profile, enrolments, marks
--   parent    the same, for each child linked to them
--   teacher   the students in subjects they teach, and marks for those
--   principal / admin   everything
--
-- Writes that happen through the service role (the create-student Edge
-- Function) bypass these policies by design.

-- profiles ------------------------------------------------------------
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

-- students ------------------------------------------------------------
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

-- staff (a directory every approved member can read) -------------------
create policy staff_select on public.staff for select to authenticated
  using (public.is_active_member());
create policy staff_insert on public.staff for insert to authenticated
  with check (public.is_school_admin());
create policy staff_update on public.staff for update to authenticated
  using (public.is_school_admin()) with check (public.is_school_admin());

-- parent_links --------------------------------------------------------
create policy parent_links_select on public.parent_links for select to authenticated
  using (parent_id = auth.uid() or public.is_school_admin());
create policy parent_links_insert on public.parent_links for insert to authenticated
  with check (public.is_school_admin());
create policy parent_links_delete on public.parent_links for delete to authenticated
  using (public.is_school_admin());

-- subjects and who teaches them ---------------------------------------
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

-- enrollments ---------------------------------------------------------
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

-- marks: a teacher can only record marks for a student who is actually
-- enrolled in a subject that teacher teaches.
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

-- announcements: you only see the ones addressed to your role ----------
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
