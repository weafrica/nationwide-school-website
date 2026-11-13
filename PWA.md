# The school app (installable website)

The website can be installed like an app on phones, tablets and computers.
It opens full screen with its own icon, with no browser address bar, and it
is still the same website: nothing to publish separately, nothing to keep in
step. This follows the same approach as the eFootball Matchday app.

## How people install it

- **Android (Chrome, Edge, Samsung Internet):** use the **Install the app**
  link in the website footer, or the browser menu → *Install app*.
- **iPhone / iPad (Safari):** Share button → **Add to Home Screen**. (The
  footer link shows these steps; iPhones cannot show an install pop-up.)
- **Windows / Mac (Chrome, Edge):** the install icon at the right end of the
  address bar, or the **Install the app** link in the footer.

Long-pressing the icon on Android also offers shortcuts to **Portal login**,
**Apply for 2026** and **School news**.

## What is in the project

| File | What it does |
| --- | --- |
| `public/manifest.webmanifest` | The app's name, colours, icons and shortcuts |
| `public/sw.js` | The service worker (see below) |
| `public/icons/*`, `public/apple-touch-icon.png` | The home-screen icons |
| `scripts/generate-pwa-icons.mjs` | Makes those icons from `public/logo.png` |
| `scripts/apply-pwa-patches.mjs` | One-time helper that made the small edits to `main.jsx`, `Footer.jsx` and `contentFields.js` (safe to run again) |
| `index.html` | Install tags, the launch splash, and the early install-prompt catcher |
| `src/main.jsx` | Registers the service worker and fades the splash away |
| `src/components/InstallApp.jsx` | The footer "Install the app" link |
| `api/keepalive.js`, `vercel.json` | The daily request that stops the free Supabase project pausing, and the hosting headers the app needs |

## The icons

The icons are built from the school logo. If the logo changes, put the new
file at `public/logo.png` and run:

```
npm install --no-save sharp
node scripts/generate-pwa-icons.mjs
```

then commit the files it writes in `public/`. (Changing the logo in the
website's content editor changes the logo shown on the site, but not an
already-installed app's icon; that is saved on the person's device.)

## The service worker (and why it is simple)

`public/sw.js` is **network-first**: every request goes to the internet, and a
saved copy is used only when there is no connection. That means a new deploy
is always what people see, never a stale copy. When offline, pages already
visited still open (showing the last content they saw); the portal, forms and
news need a connection. Only this site's own files are saved. Logins, marks
and messages (all of which come from Supabase) are never stored. Error pages,
redirects and the daily keep-alive request are never saved either.

If you ever need to force everyone onto fresh saved copies, change
`CACHE_NAME` in `public/sw.js` (for example to `nationwide-shell-v2`); old
copies are deleted automatically.

## The launch splash

When the site is opened **as the installed app** a purple screen with the
crest shows while it loads, then fades. In an ordinary browser tab it is never
shown. It stays up as long as the app is genuinely loading (slow data
included). If the page finishes loading and the app still is not there, it
steps aside after three seconds; and if not even JavaScript can run, a CSS
timer hides it after fifteen. It can never trap someone on a purple screen.

## Checking it

In Chrome on the live site: press F12 → **Application** tab → *Manifest*
(should show the name and three icons with no warnings) and *Service Workers*
(should say "activated and is running"). The **Lighthouse** tab → *Progressive
Web App* gives a pass/fail report.

## Known limits

- **Signing in with Google inside the installed iPhone app** can send people
  to Safari and back, and sometimes does not return to the app. Email and
  password sign-in (including the student logins the school issues) works
  normally inside the app.
- The home-screen name is shortened to **Nationwide** so phones do not cut it
  off. Change `short_name` in `public/manifest.webmanifest` (and
  `apple-mobile-web-app-title` in `index.html` for iPhones) to alter it.
