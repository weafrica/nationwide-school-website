-- Editable website content (text + pictures), the news posts manager and the
-- picture storage bucket. Managed from /portal/admin/content.
-- Needs public.is_school_admin() from the earlier migrations.

-- ── Editable text and pictures ──────────────────────────────────────────────
create table public.site_content (
  key text primary key,
  type text not null check (type in ('text', 'image')),
  value text not null default '',
  page text not null,
  section text not null,
  label text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

alter table public.site_content enable row level security;

-- Anyone may read (it powers the public pages); only admins may write.
create policy site_content_public_select on public.site_content
  for select using (true);
create policy site_content_admin_insert on public.site_content
  for insert with check (public.is_school_admin());
create policy site_content_admin_update on public.site_content
  for update using (public.is_school_admin());

grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;

create function public.set_site_content_updated_by()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

create trigger site_content_set_updated
  before update on public.site_content
  for each row execute function public.set_site_content_updated_by();

-- ── Picture storage ─────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy site_images_public_read on storage.objects
  for select using (bucket_id = 'site-images');
create policy site_images_admin_write on storage.objects
  for insert with check (bucket_id = 'site-images' and public.is_school_admin());
create policy site_images_admin_update on storage.objects
  for update using (bucket_id = 'site-images' and public.is_school_admin());

-- ── News posts ──────────────────────────────────────────────────────────────
create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  post_date text not null default '' check (char_length(post_date) <= 60),
  tag text not null default '' check (char_length(tag) <= 40),
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '' check (char_length(body) <= 4000),
  image_url text,
  published boolean not null default true
);
create index news_posts_created_idx on public.news_posts (created_at desc);

alter table public.news_posts enable row level security;

-- Visitors see published posts; admins also see (and manage) hidden ones.
create policy news_posts_public_select on public.news_posts
  for select using (published or public.is_school_admin());
create policy news_posts_admin_insert on public.news_posts
  for insert to authenticated with check (public.is_school_admin());
create policy news_posts_admin_update on public.news_posts
  for update to authenticated using (public.is_school_admin()) with check (public.is_school_admin());
create policy news_posts_admin_delete on public.news_posts
  for delete to authenticated using (public.is_school_admin());

grant select on public.news_posts to anon, authenticated;
grant insert, update, delete on public.news_posts to authenticated;

-- The six posts the site launched with, newest first.
insert into public.news_posts (post_date, tag, title, body, created_at) values
 ('2026 admissions', 'Admissions', '2026 registration is officially open',
  'Reception is taking applications for every grade, 0 through 12. Bring the learner’s ID or birth certificate, a recent report card and proof of address to register in person, or apply online.',
  now() - interval '1 minute'),
 ('Matric results', 'Academics', 'Five years, five 100% matric pass rates',
  'Our Grade 12 class has now delivered a 100% pass rate for five consecutive years — a record built on thirteen years of consistent teaching, not a single strong cohort.',
  now() - interval '2 minutes'),
 ('Accreditation', 'School news', 'Umalusi accreditation renewed',
  'Nationwide School for Academic Excellence holds Umalusi Accreditation No. 18 SCH0100567PA and GDE EMIS No. 700400454, confirming our full Grade 0–12 curriculum meets national standards.',
  now() - interval '3 minutes'),
 ('Sport', 'Student life', 'Inter-house athletics day set for this term',
  'Every learner from Grade 0 to Grade 12 competes for their house on the day — parents are welcome to come and support from the sidelines.',
  now() - interval '4 minutes'),
 ('Open day', 'Admissions', 'Book a school tour before you register',
  'Prefer to see the classrooms first? Reception can arrange a short walk-through during school hours, 7am–3pm, Monday to Friday — no appointment necessary.',
  now() - interval '5 minutes'),
 ('Arts', 'Student life', 'Choir and drama auditions open to Grade 4 and up',
  'No experience necessary — rehearsals run after school once a week, building toward the end-of-year showcase parents are invited to attend.',
  now() - interval '6 minutes');
