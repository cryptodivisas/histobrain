// Resolve an authoritative thumbnail URL for each topic in questions.json by
// querying Wikipedia's REST summary API (which guarantees the returned image
// actually exists and is allowed to be embedded). Download each image into
// public/questions/ and rewrite questions.json so every `image` field points
// at a local asset.
//
// Usage:
//   node scripts/fetch-images.mjs
//
// Safe to re-run: downloads are cached by URL hash.

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { constants as FS } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const QUESTIONS_PATH = path.join(ROOT, "src", "data", "questions.json");
const OUT_DIR = path.join(ROOT, "public", "questions");

// Wikimedia requires contact info in the UA. See:
// https://meta.wikimedia.org/wiki/User-Agent_policy
const USER_AGENT =
  "HistoryBrain/1.0 (https://www.henrymontilla.com; https://github.com/henrymontilla) node-build-script";

// Manual overrides for names that don't map 1:1 to a Wikipedia article title.
// Keys are the exact `name` values from questions.json. Values are the
// Wikipedia page title (spaces allowed; we will URL-encode).
const TITLE_OVERRIDES = {
  "Declaration of Independence": "United States Declaration of Independence",
  "Christ the Redeemer": "Christ the Redeemer (statue)",
  "Motherland Calls": "The Motherland Calls",
  "Moai of Easter Island": "Moai",
  Pantheon: "Pantheon, Rome",
  "The Kiss": "The Kiss (Klimt)",
  "Apollo 11 Moon Landing": "Apollo 11",
  "Iron Curtain Checkpoint": "Checkpoint Charlie",
  "The Last Supper": "The Last Supper (Leonardo)",
  "Pieta (Michelangelo)": "Pietà (Michelangelo)",
  Nighthawks: "Nighthawks (painting)",
  "US Constitution": "Constitution of the United States",
  "Women's Suffrage (19th Amendment)":
    "Nineteenth Amendment to the United States Constitution",
  "Invention of the Printing Press": "Printing press",
  "Dead Sea Scrolls": "Qumran",
};

// Direct thumbnail URLs for topics where the Wikipedia summary API returns no
// pageimage (e.g. articles whose infobox uses an image not tagged as pageprop
// page_image_free). Values must point at a real Wikimedia Commons thumb URL.
const DIRECT_IMAGE_OVERRIDES = {
  "Empire State Building":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/ESBandDowntown2015.jpg/640px-ESBandDowntown2015.jpg",
};

function hashSlug(s) {
  return createHash("sha1").update(s).digest("hex").slice(0, 16);
}

function extFromContentType(ct) {
  if (!ct) return ".jpg";
  if (ct.includes("png")) return ".png";
  if (ct.includes("webp")) return ".webp";
  if (ct.includes("gif")) return ".gif";
  if (ct.includes("svg")) return ".svg";
  return ".jpg";
}

async function exists(p) {
  try {
    await access(p, FS.F_OK);
    return true;
  } catch {
    return false;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, init = {}, maxAttempts = 5) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, {
      ...init,
      headers: {
        "User-Agent": USER_AGENT,
        ...(init.headers ?? {}),
      },
    });
    if (res.ok) return res;
    lastErr = new Error(`HTTP ${res.status} for ${url}`);
    // 404 is terminal.
    if (res.status === 404) break;
    if (res.status !== 429 && res.status < 500) break;
    const ra = Number(res.headers.get("retry-after"));
    const wait = Number.isFinite(ra) && ra > 0 ? ra * 1000 : 600 * 2 ** attempt;
    await sleep(wait);
  }
  throw lastErr;
}

async function resolveImageUrl(name) {
  if (DIRECT_IMAGE_OVERRIDES[name]) return DIRECT_IMAGE_OVERRIDES[name];
  const title = TITLE_OVERRIDES[name] ?? name;
  const api = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    title.replace(/ /g, "_")
  )}`;
  const res = await fetchWithRetry(api, { headers: { Accept: "application/json" } });
  const data = await res.json();
  // Prefer thumbnail (already sized). Fall back to originalimage.
  const src = data?.thumbnail?.source ?? data?.originalimage?.source;
  if (!src) {
    throw new Error(`No image for title "${title}" (from name "${name}")`);
  }
  // Upscale the thumbnail to 640px for better quality in the card flip.
  // Wikipedia thumbnail URLs look like:
  //   .../thumb/<a>/<ab>/<File>/320px-<File>
  // We rewrite the final segment to "640px-<File>" if it's a thumb URL.
  const upscaled = src.replace(
    /\/(\d{2,4})px-([^/]+)$/,
    (_, _w, file) => `/640px-${file}`
  );
  return upscaled;
}

async function downloadImage(url) {
  const slug = hashSlug(url);
  for (const ext of [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]) {
    const p = path.join(OUT_DIR, slug + ext);
    if (await exists(p)) return `/questions/${slug}${ext}`;
  }
  const res = await fetchWithRetry(url, {
    headers: {
      Accept:
        "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5",
    },
  });
  const ext = extFromContentType(res.headers.get("content-type"));
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = slug + ext;
  await writeFile(path.join(OUT_DIR, filename), buf);
  return `/questions/${filename}`;
}

function collectNames(questions) {
  const set = new Set();
  for (const q of questions) {
    if (q.name) set.add(q.name);
    for (const wo of q.wrong_options ?? []) {
      if (wo.name) set.add(wo.name);
    }
  }
  return [...set];
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const raw = await readFile(QUESTIONS_PATH, "utf8");
  const questions = JSON.parse(raw);

  const names = collectNames(questions);
  console.log(`Resolving images for ${names.length} unique topic(s)…`);

  const nameToLocal = new Map();
  let ok = 0;
  let failed = 0;
  const errors = [];

  for (const name of names) {
    try {
      const remote = await resolveImageUrl(name);
      const local = await downloadImage(remote);
      nameToLocal.set(name, local);
      ok++;
      console.log(`  ✓ ${name} -> ${local}`);
    } catch (err) {
      failed++;
      errors.push({ name, error: err.message });
      console.error(`  ✗ ${name}: ${err.message}`);
    }
    await sleep(200); // polite pacing
  }

  // Rewrite questions.json. Only update entries where we resolved a local path;
  // leave unresolved entries untouched so you can see what still needs help.
  const updated = questions.map((q) => ({
    ...q,
    image: nameToLocal.get(q.name) ?? q.image,
    wrong_options: (q.wrong_options ?? []).map((wo) => ({
      ...wo,
      image: nameToLocal.get(wo.name) ?? wo.image,
    })),
  }));
  await writeFile(QUESTIONS_PATH, JSON.stringify(updated, null, 2) + "\n");

  console.log(`\nResolved=${ok}  failed=${failed}`);
  if (errors.length) {
    console.log("\nStill unresolved (add override in TITLE_OVERRIDES):");
    for (const e of errors) console.log(`  - ${e.name}: ${e.error}`);
  }
  console.log(`\nRewrote ${QUESTIONS_PATH}.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
