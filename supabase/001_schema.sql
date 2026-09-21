-- Nationwide School for Academic Excellence — Portal schema
-- Run this once in Supabase SQL Editor (Project → SQL Editor → New query).
--
-- Design notes:
--   - Every authenticated user (however they signed in — email/password,
--     Google, or an admin-generated account) gets exactly one row in
--     `profiles`, created automatically by the trigger at the bottom.
--   - A brand-new sign-in (including via Google) starts with role
--     'pending' and sees nothing except a "waiting for approval" screen
--     until an admin assigns a real role. This is deliberate: Google
--     sign-in proves someone owns that email address, not that they're
--     actually a student, teacher, or parent at this school — an admin
--     still has to vouch for who they are.
--   - Student accounts an admin creates directly (with an
--     auto-generated username/password) start with their role already
--     set to 'student' and `must_change_password = true`.

create extension if not exists "pgcrypto";

-- One row per person, whatever role they hold.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'pending'
    check (role in ('pending', 'student', 'teacher', 'principal', 'admin', 'parent')),
  full_name text not null,
  email text,
  must_change_password boolean not null default false,
  created_at timestamptz not null default now()
);

-- Student-specific detail, one row per student, linked back to their profile.
create table students (
  user_id uuid primary key references profiles(id) on delete cascade,
  student_number text unique not null,
  grade text not null,
  date_of_birth date,
  parent_name text,
  parent_phone text,
  parent_email text,
  enrolled_at date not null default current_date
);

-- Staff-specific detail (teachers, principal, admin office staff).
create table staff (
  user_id uuid primary key references profiles(id) on delete cascade,
  staff_number text unique not null,
  position text not null,
  phase text
);

-- A parent can be linked to more than one child.
create table parent_links (
  parent_id uuid not null references profiles(id) on delete cascade,
  student_id uuid not null references students(user_id) on delete cascade,
  primary key (parent_id, student_id)
);

-- Subjects offered, scoped to a grade (matches the phases on the Academics page).
create table subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade text not null,
  created_at timestamptz not null default now()
);

-- Which teacher teaches which subject to which grade.
create table subject_teachers (
  subject_id uuid not null references subjects(id) on delete cascade,
  teacher_id uuid not null references staff(user_id) on delete cascade,
  primary key (subject_id, teacher_id)
);

-- Which students are enrolled in which subject.
create table enrollments (
  student_id uuid not null references students(user_id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  enrolled_at date not null default current_date,
  primary key (student_id, subject_id)
);

-- Term marks. One row per student, per subject, per term.
create table marks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(user_id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  term integer not null check (term between 1 and 4),
  year integer not null,
  score numeric(5,2) check (score >= 0 and score <= 100),
  comment text,
  recorded_by uuid references staff(user_id),
  recorded_at timestamptz not null default now(),
  unique (student_id, subject_id, term, year)
);

-- School-wide or role-targeted announcements (the portal's own News feed —
-- separate from the public site's News page, which is static content).
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all'
    check (audience in ('all', 'students', 'teachers', 'parents')),
  author_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Auto-create a profile row the moment someone signs up, whatever the
-- sign-in method. Google sign-in and email/password both fire this.
-- ---------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.email,
    coalesce(new.raw_user_meta_data->>'preset_role', 'pending')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Row Level Security — every table below is locked down by default;
-- these policies open exactly what each role should see.
-- ---------------------------------------------------------------------
alter table profiles enable row level security;
alter table students enable row level security;
alter table staff enable row level security;
alter table parent_links enable row level security;
alter table subjects enable row level security;
alter table subject_teachers enable row level security;
alter table enrollments enable row level security;
alter table marks enable row level security;
alter table announcements enable row level security;

-- Helper: is the current user an admin or principal?
create function public.is_school_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'principal')
  );
$$;

-- profiles: everyone can see their own row; admins/principal see everyone.
create policy profiles_self_select on profiles for select
  using (id = auth.uid() or public.is_school_admin());
create policy profiles_self_update on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_update on profiles for update
  using (public.is_school_admin());

-- students: a student sees their own row; parents see their linked
-- children; teachers/admin see everyone (a teacher needs the whole
-- class list, not just their own).
create policy students_select on students for select
  using (
    user_id = auth.uid()
    or exists (select 1 from parent_links pl where pl.student_id = students.user_id and pl.parent_id = auth.uid())
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('teacher', 'principal', 'admin'))
  );
create policy students_admin_write on students for insert with check (public.is_school_admin());
create policy students_admin_update on students for update using (public.is_school_admin());

-- staff: visible to any signed-in school member (a normal school-directory
-- level of visibility); only admins can create/edit staff records.
create policy staff_select on staff for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role <> 'pending'));
create policy staff_admin_write on staff for insert with check (public.is_school_admin());
create policy staff_admin_update on staff for update using (public.is_school_admin());

-- parent_links: a parent sees only their own links; admins manage them.
create policy parent_links_select on parent_links for select
  using (parent_id = auth.uid() or public.is_school_admin());
create policy parent_links_admin_write on parent_links for insert with check (public.is_school_admin());

-- subjects / subject_teachers: readable by any school member, written by admin.
create policy subjects_select on subjects for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role <> 'pending'));
create policy subjects_admin_write on subjects for insert with check (public.is_school_admin());
create policy subject_teachers_select on subject_teachers for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role <> 'pending'));
create policy subject_teachers_admin_write on subject_teachers for insert with check (public.is_school_admin());

-- enrollments: a student sees their own; teachers see rows for subjects
-- they teach; admins see everything.
create policy enrollments_select on enrollments for select
  using (
    student_id = auth.uid()
    or exists (select 1 from subject_teachers st where st.subject_id = enrollments.subject_id and st.teacher_id = auth.uid())
    or public.is_school_admin()
  );
create policy enrollments_admin_write on enrollments for insert with check (public.is_school_admin());

-- marks: a student sees their own marks; a parent sees their linked
-- child's marks; a teacher can enter/see marks for subjects they teach.
create policy marks_select on marks for select
  using (
    student_id = auth.uid()
    or exists (select 1 from parent_links pl where pl.student_id = marks.student_id and pl.parent_id = auth.uid())
    or exists (select 1 from subject_teachers st where st.subject_id = marks.subject_id and st.teacher_id = auth.uid())
    or public.is_school_admin()
  );
create policy marks_teacher_write on marks for insert
  with check (
    exists (select 1 from subject_teachers st where st.subject_id = marks.subject_id and st.teacher_id = auth.uid())
    or public.is_school_admin()
  );
create policy marks_teacher_update on marks for update
  using (
    exists (select 1 from subject_teachers st where st.subject_id = marks.subject_id and st.teacher_id = auth.uid())
    or public.is_school_admin()
  );

-- announcements: everyone signed in can read; only staff+ can write.
create policy announcements_select on announcements for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role <> 'pending'));
create policy announcements_write on announcements for insert
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('teacher', 'principal', 'admin')));
