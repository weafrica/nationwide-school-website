-- Editable site content (text + images), managed from /portal/admin/content.
create table public.site_content (
  key text primary key,
  type text not null check (type in (''text'', ''image'')),
  value text not null default '''',
  page text not null,
  section text not null,
  label text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

alter table public.site_content enable row level security;

create policy site_content_public_select on public.site_content
  for select using (true);
create policy site_content_admin_insert on public.site_content
  for insert with check (public.is_school_admin());
create policy site_content_admin_update on public.site_content
  for update using (public.is_school_admin());

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

-- Storage bucket for uploaded images, public read / admin write.
insert into storage.buckets (id, name, public)
values (''site-images'', ''site-images'', true)
on conflict (id) do nothing;

create policy site_images_public_read on storage.objects
  for select using (bucket_id = ''site-images'');
create policy site_images_admin_write on storage.objects
  for insert with check (bucket_id = ''site-images'' and public.is_school_admin());
create policy site_images_admin_update on storage.objects
  for update using (bucket_id = ''site-images'' and public.is_school_admin());
