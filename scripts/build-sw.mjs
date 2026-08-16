/**
 * Generates out/sw.js after `next build`.
 *
 * Walks the static export, builds a precache list of the app shell, derives a
 * build id from the content of those files, and substitutes both into
 * sw/sw-template.js. Bundler-independent by design — it reads the emitted output
 * rather than hooking webpack or Turbopack.
 *
 * Run via `npm run build` (next build && node scripts/build-sw.mjs).
 */
import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const OUT = "out";
const TEMPLATE = "sw/sw-template.js";
const DEST = join(OUT, "sw.js");

// Precache the shell, not the whole export. Route HTML is cached on navigation
// instead, so adding a page never bloats the install step.
const PRECACHE_EXT = new Set([".js", ".css", ".woff2"]);
const PRECACHE_EXTRA = [
  "/",
  "/offline/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/favicon.ico",
];
const MAX_PRECACHE_BYTES = 2 * 1024 * 1024;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    }),
  );
  return files.flat();
}

function toUrl(file) {
  return `/${relative(OUT, file).split(sep).join("/")}`;
}

const all = await walk(OUT);

// Next emits its routing manifests under a per-build random directory
// (/_next/static/<deploymentId>/_buildManifest.js). Those paths change on every
// build even when nothing else does, which would rotate the cache name — and
// therefore force every user to re-download the whole app — on any redeploy.
// They are tiny and navigations are network-first, so they are simply not
// precached, which makes the build id stable for unchanged source.
const BUILD_MANIFEST = /\/_next\/static\/[^/]+\/_[A-Za-z]*[Mm]anifest\.js$/;

const assets = [];
for (const file of all) {
  const url = toUrl(file);
  if (!url.startsWith("/_next/static/")) continue;
  if (BUILD_MANIFEST.test(url)) continue;
  const ext = url.slice(url.lastIndexOf("."));
  if (!PRECACHE_EXT.has(ext)) continue;
  const { size } = await stat(file);
  if (size > MAX_PRECACHE_BYTES) {
    // Loud, not silent: a skipped asset means the app is less complete offline.
    console.warn(`  [sw] skipping ${url} (${Math.round(size / 1024)} KB > limit)`);
    continue;
  }
  assets.push(url);
}

const manifest = [...new Set([...PRECACHE_EXTRA, ...assets])].sort();

/*
 * Build id = the app's code identity, which determines the cache name; a change
 * drops every previous cache on activate.
 *
 * It is computed from the content-hashed /_next/static/ filenames plus the bytes
 * of the hand-authored static assets — deliberately NOT from the HTML. Next
 * stamps a random per-build deployment id into every HTML file, so hashing the
 * HTML made the id change on every build even when nothing had, which would force
 * all 13 users to re-download the whole app on any redeploy. Next already encodes
 * chunk content in the chunk filenames, and navigations are network-first, so
 * precached HTML is only ever an offline fallback.
 */
const hash = createHash("sha256");
for (const url of assets.sort()) hash.update(url);
for (const url of PRECACHE_EXTRA) {
  if (url.endsWith("/")) continue; // HTML routes, excluded per above
  try {
    hash.update(await readFile(join(OUT, url)));
  } catch {
    hash.update(url);
  }
}
const buildId = hash.digest("hex").slice(0, 12);

const template = await readFile(TEMPLATE, "utf8");
// replaceAll, not replace: a token appearing more than once (a doc comment, say)
// would otherwise leave the real placeholder untouched and ship a broken worker.
const sw = template
  .replaceAll("__PRECACHE_MANIFEST__", JSON.stringify(manifest, null, 2))
  .replaceAll("__BUILD_ID__", buildId);

if (sw.includes("__PRECACHE_MANIFEST__") || sw.includes("__BUILD_ID__")) {
  throw new Error("Service worker placeholders were not substituted");
}

await writeFile(DEST, sw, "utf8");
console.log(`  [sw] ${DEST} — ${manifest.length} precached entries, build ${buildId}`);
