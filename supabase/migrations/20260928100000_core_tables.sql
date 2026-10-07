-- Nationwide School for Academic Excellence -- core tables
--
-- Run the migrations in this folder in filename order. This one only
-- creates tables and locks them down (row level security on, no policies
-- yet, so nothing is readable until 20260928100200 opens up exactly what
-- each role should see).
--
-- Every signed-in person, however they signed in, has exactly one row in
-- `profiles`. The row is created automatically (see the next migration).

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'pending'
    check (role in ('pending', 'student', 'teacher', 'principal', 'admin', 'parent')),
  full_name text not null,
  email text,
  must_change_password boolean not null default false,
  created_at timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role);

create table public.students (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  student_number text not null unique,
  grade text not null check (grade ~ '^Grade (0|[1-9]|1[0-2])$'),
  date_of_birth date,
  parent_name text,
  parent_phone text,
  parent_email text,
  enrolled_at date not null default current_date
);
create index students_grade_idx on public.students (grade);

create table public.staff (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  staff_number text not null unique,
  position text not null,
  phase text
);

-- A parent can be linked to more than one child, and a child to more than
-- one parent/guardian.
create table public.parent_links (
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(user_id) on delete cascade,
  primary key (parent_id, student_id)
);
create index parent_links_student_idx on public.parent_links (student_id);

-- auto_enroll: when true, every student in that grade is enrolled in the
-- subject automatically (both for existing students when the subject is
-- added, and for new students when they are created). Turn it off for
-- subjects learners choose, e.g. Mathematical Literacy or an elective.
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade text not null check (grade ~ '^Grade (0|[1-9]|1[0-2])$'),
  auto_enroll boolean not null default true,
  created_at timestamptz not null default now(),
  unique (name, grade)
);

create table public.subject_teachers (
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid not null references public.staff(user_id) on delete cascade,
  primary key (subject_id, teacher_id)
);
create index subject_teachers_teacher_idx on public.subject_teachers (teacher_id);

create table public.enrollments (
  student_id uuid not null references public.students(user_id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  enrolled_at date not null default current_date,
  primary key (student_id, subject_id)
);
create index enrollments_subject_idx on public.enrollments (subject_id);

create table public.marks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(user_id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  term integer not null check (term between 1 and 4),
  year integer not null check (year between 2000 and 2100),
  score numeric(5,2) check (score >= 0 and score <= 100),
  comment text check (comment is null or char_length(comment) <= 1000),
  recorded_by uuid references public.profiles(id) on delete set null,
  recorded_at timestamptz not null default now(),
  unique (student_id, subject_id, term, year)
);
create index marks_student_idx on public.marks (student_id);
create index marks_subject_idx on public.marks (subject_id);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  body text not null check (char_length(body) between 1 and 5000),
  audience text not null default 'all'
    check (audience in ('all', 'students', 'teachers', 'parents')),
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index announcements_created_idx on public.announcements (created_at desc);

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.staff enable row level security;
alter table public.parent_links enable row level security;
alter table public.subjects enable row level security;
alter table public.subject_teachers enable row level security;
alter table public.enrollments enable row level security;
alter table public.marks enable row level security;
alter table public.announcements enable row level security;
