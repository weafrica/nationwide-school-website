# Setting up the school's Supabase project

Do this once, after creating a free Supabase project (see the main
README for that first step).

## 1. Run the database schema

Supabase dashboard → SQL Editor → New query → paste the entire contents
of `001_schema.sql` → Run.

This creates every table (profiles, students, staff, subjects,
enrollments, marks, announcements), the auto-profile-creation trigger,
and all Row Level Security policies. Safe to run once on a fresh
project; do not run it a second time (it will error on tables that
already exist).

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
   → change `role` from `pending` to `admin` → save.
4. Refresh the portal — you'll now see the admin dashboard, including
   the "Create student login" tool, without needing to do step 3 again
   for future staff (you can approve them from inside the portal itself
   from here on).

## 5. Set the site's environment variables

Vercel → your project → Settings → Environment Variables, add:

- `VITE_SUPABASE_URL` — from Project Settings → API
- `VITE_SUPABASE_ANON_KEY` — the "anon / public" key from the same page

Redeploy after adding these (Vercel → Deployments → \[latest\] → ⋯ →
Redeploy) so the live site picks them up.
