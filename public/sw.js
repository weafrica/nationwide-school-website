// Service worker for the installable school app.
//
// Deliberately simple and NETWORK-FIRST: every request goes to the network
// and only falls back to a saved copy when the network is unavailable. That
// matters because the site is redeployed often - caching the JavaScript
// aggressively would strand people on an old version. (This is the same
// approach as the eFootball Matchday app.)
//
// What it gives you:
//   * the "Install app" option in Chrome, Edge and Android (they require one)
//   * pages you have already visited still open with no signal, using the
//     last content they saw (the portal still needs a connection)
//
// What it never does:
//   * touch anything that is not on this site - Supabase (all logins, marks
//     and messages) goes straight to the network, so nothing private is stored
//   * save error pages or partial downloads
const CACHE_NAME = "nationwide-shell-v1";
const SHELL_URLS = ["/", "/manifest.webmanifest", "/logo.png", "/favicon.png"];
const MAX_ENTRIES = 80; // enough for the pages and files a visitor really uses

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // add() one by one so a single missing file cannot block the install
      Promise.allSettled(SHELL_URLS.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Hashed JavaScript and CSS files change on every deploy, so the saved copies
// would otherwise pile up forever. Keep the newest MAX_ENTRIES, never the shell.
async function trimCache(cache) {
  const keys = await cache.keys();
  const removable = keys.filter((request) => !SHELL_URLS.includes(new URL(request.url).pathname));
  const excess = keys.length - MAX_ENTRIES;
  if (excess > 0) await Promise.all(removable.slice(0, excess).map((request) => cache.delete(request)));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Same-site GET requests only; never the keep-alive/API calls or this file.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname === "/sw.js") return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Save only complete, successful, same-site answers (not 404s, 500s,
        // partial downloads, or redirects).
        if (response.status === 200 && response.type === "basic" && !response.redirected) {
          const copy = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, copy).then(() => trimCache(cache)))
            .catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        // Offline (or the server is unreachable).
        const saved = await caches.match(request);
        if (saved) return saved;
        // A page the visitor never opened before: give them the app itself
        // (the router then shows the right page) rather than a browser error.
        if (request.mode === "navigate") {
          const shell = await caches.match("/");
          if (shell) return shell;
        }
        return Response.error();
      })
  );
});
