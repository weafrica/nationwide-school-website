# Nationwide School for Academic Excellence — Website

Public site + student/staff/parent portal for Nationwide School for
Academic Excellence, Jeppestown. Grade 0–12, Primary and High School.

## Stack
- React + Vite + Tailwind CSS v4 + React Router
- Supabase (auth + database) for the portal
- Deployed on Vercel

## Status

**Public site — done.** Home, About, Academics, Admissions, News,
Contact. Real content throughout (mission/vision, leadership, school
day, FAQ, an embedded map of the real address), matching the school's
actual branding, address, phone numbers and accreditation numbers from
the flyer supplied.

**Portal — built, not yet connected to a live database.** The full
system exists in code:
- Sign in with Google, or email/password
- Role-based accounts: student, teacher, principal, admin, parent —
  every new sign-in starts as `pending` until an admin approves it and
  assigns a role
- Admin tool to generate a student login (a random ID + password) in
  one click, with a forced password change on first login
- Student dashboard: their marks by subject/term, announcements
- Teacher dashboard: their classes, a roster per subject, a mark-entry
  form
- Admin dashboard: create student logins, approve pending accounts,
  post announcements
- Auto-refreshing data (polls every 15–30s, same pattern as the
  eFootball app's live banners) so changes show up without a manual
  page reload
- A Back button across the site, plus every page fully remounts fresh
  on navigation (including via Back) rather than carrying over stale
  state

**What's needed to make the portal live:** see `supabase/SETUP.md` —
run the schema SQL, deploy one Edge Function, set two environment
variables in Vercel. Nothing in the portal touches real people's data
until the school itself creates real student/staff accounts through it;
no data has been invented or scraped from anywhere for this.

## Local development
```
npm install
cp .env.example .env   # fill in your Supabase project's URL/anon key
npm run dev
```

## Build
```
npm run build
```

## Still to do
- Swap in real staff names/photos on the About page's leadership section
  (currently role titles only, no invented names)
- Course/subject catalog needs real data entered once the school is
  ready (currently no subjects exist until an admin adds them)
- Consider code-splitting the portal bundle (currently one ~540KB JS
  file — works fine, just larger than ideal)
