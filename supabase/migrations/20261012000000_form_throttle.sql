-- Flood protection for the public forms: refuse new submissions when more
-- than 30 arrived in the last 10 minutes. A school never gets close to that
-- in normal use, so this only bites when something is spamming the forms.
-- (The website itself also has a hidden "trap" field and a too-fast check.)
create function public.throttle_public_submissions() returns trigger
language plpgsql security definer set search_path = public as $$
declare recent integer;
begin
  execute format(
    'select count(*) from public.%I where created_at > now() - interval ''10 minutes''',
    tg_table_name) into recent;
  if recent >= 30 then
    raise exception 'Too many submissions right now. Please try again in a few minutes.';
  end if;
  return new;
end $$;

create trigger admission_applications_throttle
  before insert on public.admission_applications
  for each row execute function public.throttle_public_submissions();
create trigger contact_messages_throttle
  before insert on public.contact_messages
  for each row execute function public.throttle_public_submissions();
