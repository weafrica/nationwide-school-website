-- Public forms: admission applications and contact messages.
--
-- Anyone visiting the website (not signed in) may SUBMIT one of these,
-- and nobody but a school admin/principal may read or change them. The
-- column-level grants below mean an anonymous visitor can only fill in
-- the form fields -- they cannot set status, notes or anything else even
-- if they craft the request by hand.

create table public.admission_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  learner_name text not null check (char_length(learner_name) between 2 and 120),
  learner_dob date not null,
  grade_applying text not null check (char_length(grade_applying) between 1 and 40),
  parent_name text not null check (char_length(parent_name) between 2 and 120),
  parent_phone text not null check (char_length(parent_phone) between 7 and 30),
  parent_email text check (parent_email is null or char_length(parent_email) <= 200),
  previous_school text check (previous_school is null or char_length(previous_school) <= 200),
  notes text check (notes is null or char_length(notes) <= 2000),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'accepted', 'waitlisted', 'declined', 'enrolled')),
  admin_notes text check (admin_notes is null or char_length(admin_notes) <= 4000),
  handled_by uuid references public.profiles(id) on delete set null,
  handled_at timestamptz
);
create index admission_applications_status_idx
  on public.admission_applications (status, created_at desc);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  contact text not null check (char_length(contact) between 3 and 200),
  message text not null check (char_length(message) between 5 and 3000),
  status text not null default 'new' check (status in ('new', 'read', 'replied')),
  handled_by uuid references public.profiles(id) on delete set null,
  handled_at timestamptz
);
create index contact_messages_status_idx on public.contact_messages (status, created_at desc);

alter table public.admission_applications enable row level security;
alter table public.contact_messages enable row level security;

revoke all on public.admission_applications from anon, authenticated;
revoke all on public.contact_messages from anon, authenticated;

grant insert (learner_name, learner_dob, grade_applying, parent_name, parent_phone,
              parent_email, previous_school, notes)
  on public.admission_applications to anon, authenticated;
grant select on public.admission_applications to authenticated;
grant update (status, admin_notes, handled_by, handled_at)
  on public.admission_applications to authenticated;

grant insert (name, contact, message) on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;
grant update (status, handled_by, handled_at) on public.contact_messages to authenticated;

create policy applications_insert on public.admission_applications
  for insert to anon, authenticated
  with check (status = 'new' and admin_notes is null and handled_by is null and handled_at is null);
create policy applications_select on public.admission_applications
  for select to authenticated using (public.is_school_admin());
create policy applications_update on public.admission_applications
  for update to authenticated
  using (public.is_school_admin()) with check (public.is_school_admin());

create policy messages_insert on public.contact_messages
  for insert to anon, authenticated
  with check (status = 'new' and handled_by is null and handled_at is null);
create policy messages_select on public.contact_messages
  for select to authenticated using (public.is_school_admin());
create policy messages_update on public.contact_messages
  for update to authenticated
  using (public.is_school_admin()) with check (public.is_school_admin());
