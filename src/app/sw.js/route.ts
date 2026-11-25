import { BASE_PATH } from "@/lib/config";

// The service worker, generated at build time so it knows the base path and gets a fresh
// version (and cache) on every deploy. Served as /sw.js from the static export.
export const dynamic = "force-static";

const VERSION = new Date().toISOString();

const source = (base: string, version: string) => `// Extra Extra service worker · build ${version}
const BASE = ${JSON.stringify(base)};
const CACHE = "extra-extra-" + ${JSON.stringify(version)};
const SHELL = [BASE + "/", BASE + "/read/", BASE + "/clippings/", BASE + "/manifest.webmanifest", BASE + "/brand/icon-192.png"];

// Find the hashed scripts, styles and fonts a page needs, so the shell works offline from the first visit.
async function assetsOf(urls) {
  const found = new Set();
  const grab = (text) => {
    for (const m of text.matchAll(/["'(]((?:\\/[\\w.-]+)*\\/_next\\/static\\/[^"')\\s]+)/g)) found.add(m[1]);
  };
  for (const url of urls) {
    try { grab(await (await fetch(url)).text()); } catch {}
  }
  for (const css of [...found].filter((u) => u.endsWith(".css"))) {
    try { grab(await (await fetch(css)).text()); } catch {}
  }
  return [...found];
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    const assets = await assetsOf(SHELL.filter((u) => u.endsWith("/")));
    await Promise.all(assets.map((a) => cache.add(a).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith("extra-extra-") && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: request.mode === "navigate" })) ||
      (fallbackUrl && (await cache.match(fallbackUrl))) ||
      Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(BASE + "/")) return;

  if (url.pathname.includes("/_next/static/") || url.pathname.includes("/brand/")) {
    event.respondWith(cacheFirst(request)); // hashed / immutable
  } else if (request.mode === "navigate") {
    const shell = SHELL.find((s) => s === url.pathname) || BASE + "/";
    event.respondWith(networkFirst(request, shell));
  } else {
    event.respondWith(networkFirst(request)); // headlines (data/*.json), route payloads, etc.
  }
});
`;

export function GET() {
  return new Response(source(BASE_PATH, VERSION), {
    headers: { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
