# Nationwide School for Academic Excellence — Website

Public site + (future) student/staff portal for Nationwide School for
Academic Excellence, Jeppestown. Grade 0–12, Primary and High School.

## Stack
- React + Vite
- Tailwind CSS v4
- React Router
- Supabase (auth + database) — not wired up yet, coming in Phase 2

## Status
**Phase 1 (this commit):** public marketing site — Home, About, Academics,
Admissions (form UI only, not saving anywhere yet), News, Contact, and a
Portal login screen with no real auth behind it yet.

**Phase 2 (not started):** Supabase project for the database, real auth
for student/staff/admin portal roles, admissions applications actually
saving to a database, course enrollment.

## Local development
```
npm install
npm run dev
```

## Build
```
npm run build
```

## To do before this looks finished
- Swap `src/components/Seal.jsx` for the real school crest/logo file
- Wire the Admissions form and Contact form to a real backend
- Build the Supabase schema + portal auth (Phase 2)
