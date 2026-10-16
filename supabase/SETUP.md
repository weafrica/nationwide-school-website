# Setting up the school's Supabase project

Do this once, after creating a free Supabase project (see the main
README for that first step).

## 1. Run the database migrations

Supabase dashboard → SQL Editor → New query. Open each file in
`supabase/migrations/` **in filename order** (they're numbered, so sort
by name) and run them one at a time, in a fresh query each time:

1. `20260928100000_core_tables.sql` — every table (profiles, students,
   staff, subjects, enrollments, marks, announcements), with Row Level
   Security turned on but no policies yet (nothing is readable until
   step 3 below).
2. `20260928100100_auth_helpers_and_triggers.sql` — the automatic
   profile-creation trigger, and the guardrails that stop anyone but an
   existing admin from changing a role.
3. `20260928100200_row_level_security.sql` — the policies that actually
   open up what each role (student/teacher/parent/admin) can see.
4. `20260928100300_admissions_and_contact.sql` — the admissions
   application and contact-message tables your public pages submit to.
5. `20260928100400_automation_and_admin_helpers.sql` — auto-enrolling a
   new student into their grade's subjects, and two admin helper
   functions (`admin_assign_teacher`, `admin_link_parent`). The portal's
   **Teachers & parents** screen calls these for you.
6. `20260928100500_seed_subjects.sql` — the standard subject list for
   every grade, matching the Academics page.
7. `20261011000000_site_content_and_news.sql` — the editable website
   text and pictures (`site_content`), the public `site-images` picture
   bucket, and news posts (with the six posts the site launched with).
   This is what the **Website content** editor writes to.
8. `20261012000000_form_throttle.sql` — refuses new admission
   applications or contact messages when more than 30 arrive within ten
   minutes, so the forms can't be flooded.

Files 1-6 were tested against a real Postgres database (47 checks:
every role, every table, every write restriction). Files 7-8 and the
live school project were tested the same way, role by role (visitor,
learner, parent, teacher, principal, admin). Safe to run once on a
fresh project; don't run any of them a second time.

> **The school's live database** was first created from an earlier,
> looser single-file schema. It has since been brought fully in line with
> the migrations above by `supabase/catch-up/20261012_align_live_database_with_migrations.sql`.
> That file is a record of a one-off change that has **already been
> applied** — do **not** run it on a fresh project (a fresh project gets
> all of it from files 1-8).

## 2. Turn on Google sign-in (optional, can be added later)

Dashboard → Authentication → Providers → Google → toggle on. You'll
need a Google OAuth Client ID and Secret from
[console.cloud.google.com](https://console.cloud.google.com) — create
an "OAuth 2.0 Client ID" of type "Web application", and add the
callback URL Supabase shows on that same screen as an authorized
redirect URI. Paste the resulting Client ID/Secret into Supabase's
Google provider settings.

Until this is turned on, the "Continue with Google" button on the
portal login screen will show an error if clicked — email/password
login (including admin-generated student logins) works regardless.

## 3. Deploy the `create-student` Edge Function

This is what actually creates a student's login when an admin uses the
"Create student login" tool in the portal. It needs your project's
service role key, which must never appear in frontend code — that's why
it lives in an Edge Function instead.

Using the Supabase CLI (`npm install -g supabase`):

```
supabase login
supabase link --project-ref <your-project-ref>   # find this in your project URL
supabase functions deploy create-student
```

The function automatically has access to `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` — Supabase sets these for you, you don't
need to configure them manually.

If you'd rather not install the CLI: Dashboard → Edge Functions →
Deploy a new function → name it `create-student` → paste the contents
of `functions/create-student/index.ts`.

## 4. Create your own admin account

1. On the live site, go to `/portal` and sign in with Google (once step
   2 is done) — or ask me to help set up an email/password account
   directly in the Supabase dashboard (Authentication → Users → Add
   user) if you'd rather not use Google yet.
2. Your new account will show a "waiting for approval" screen — this is
   expected, every new sign-in starts with no role.
3. In the Supabase dashboard: Table Editor → `profiles` → find your row
   → change `role` from `pending` to `admin` → save. (This works because
   the Table Editor runs as the trusted project owner — once you're
   signed in as an ordinary portal user, only an *existing* admin can
   change anyone's role from inside the app itself, including their
   own. That's deliberate: it's what stops any visitor from granting
   themselves admin.)
4. Refresh the portal — you'll now see the admin dashboard, including
   the "Create student login" tool, without needing to do step 3 again
   for future staff (you can approve them from inside the portal itself
   from here on).

Once teachers and parents have signed in and been approved, use the
admin dashboard's **Teachers & parents** tab to say which teacher
teaches which subject and which parent belongs to which learner. (The
same thing can be done from the SQL Editor if you prefer:)

```sql
select admin_assign_teacher('teacher@example.com', 'Mathematics', 'Grade 4');
select admin_link_parent('parent@example.com', '20261234');
```

## 5. Set the site's environment variables

Vercel → your project → Settings → Environment Variables, add:

- `VITE_SUPABASE_URL` — from Project Settings → API
- `VITE_SUPABASE_ANON_KEY` — the "anon / public" key from the same page

Redeploy after adding these (Vercel → Deployments → \[latest\] → ⋯ →
Redeploy) so the live site picks them up.

## 6. Keep the free Supabase project awake

The free Supabase plan **pauses a project that has been idle for a
week**, which takes the news page, the forms and the portal offline
until someone restores it. `vercel.json` schedules a small daily
request (`/api/keepalive`, see `api/keepalive.js`) that keeps it awake.
It reads one public row, using the same two environment variables as
step 5.

To check it is running: Vercel → your project → Settings → Cron Jobs.
If the project ever does pause, Supabase dashboard → open the project →
**Restore project**. (Upgrading to a paid Supabase plan removes the
pausing altogether.)

## 7. Editing the website, news and the inbox

Sign in as an admin → **Website content** tab → **Open the content
editor**. Every page's wording, the contact details, the school logo
and optional photos can be changed there, and news posts can be added,
edited, hidden or deleted. Changes go live immediately, and the original
wording can always be restored.

Everything people send through the public forms appears under **Applications &
messages**, with a number on the tab showing how many are new.

To make a new piece of text editable, add one line to
`src/lib/contentFields.js` and read it in the page with
`get('your.key')` — the editor picks it up automatically.
