// sw.js — versioned, cache-first service worker for the app shell.
//
// Bump CACHE_VERSION on every deploy to bust the old cache (F13.3). On
// activate we delete stale caches and take control of open clients so an
// installed copy updates cleanly. Cache-first for the shell gives true offline
// after the first load (F13.2); bundled audio clips (when added) are listed
// here so modeling works offline — TTS is the fallback for anything missing.

const CACHE_VERSION = "lalo-silabas-v9.0.0";

// Real files that make up the offline app shell. Paths are relative to the SW
// scope (the app/ folder when served from there).
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./js/main.js",
  "./js/game.js",
  // syllables.js is trimmed (iteration 5, D1) and no longer imported by the
  // app shell, so it is dropped from the precache list.
  "./js/speech.js",
  "./js/celebrate.js",
  "./js/progress.js",
  "./js/levels.js",
  "./js/rewards.js",
  "./js/words.js",
  "./js/mascot.js",
  "./js/art.js",
  "./js/audio.js",
  "./js/adultGate.js",
  // Iteration 9 (D1/D3/D4): new pure modules precached so the customization
  // catalog, the garden, and the mini-game modes all work offline.
  "./js/customize.js",
  "./js/garden.js",
  "./js/modes.js",
  // Pedagogical word inventory — precached so words work offline. Iteration 6
  // adds the 4-syllable list (AC-J2 / D2).
  "./data/words-2syllables.csv",
  "./data/words-3syllables.csv",
  "./data/words-4syllables.csv",
  "./icons/icon.svg",
  "./icons/icon-maskable.svg",
  // PNG icons + bundled audio clips + the woff2 font are optional drop-ins;
  // they are fetched opportunistically below and cached if/when present.
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      // addAll fails the whole install if any file 404s, so add individually
      // and ignore misses (optional assets like PNG icons may not exist yet).
      await Promise.all(
        SHELL.map((url) =>
          cache.add(url).catch(() => {
            /* optional asset missing — skip, never block install */
          })
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Only handle same-origin requests; let cross-origin (e.g. OS voices) pass.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) {
        // Refresh in the background (stale-while-revalidate) for next time.
        fetchAndCache(req).catch(() => {});
        return cached;
      }
      try {
        return await fetchAndCache(req);
      } catch (_e) {
        // Offline and uncached: fall back to the app shell for navigations.
        if (req.mode === "navigate") {
          const shell = await caches.match("./index.html");
          if (shell) return shell;
        }
        return new Response("", { status: 504, statusText: "offline" });
      }
    })()
  );
});

async function fetchAndCache(req) {
  const res = await fetch(req);
  if (res && res.ok) {
    const cache = await caches.open(CACHE_VERSION);
    cache.put(req, res.clone());
  }
  return res;
}
