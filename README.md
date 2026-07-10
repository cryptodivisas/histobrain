# History Brain

A retro pixel-art trivia game covering landmarks, art, historical figures,
events, documents, U.S. civics, music, movies, and television.

- **Four game modes** — Classic, deterministic Daily challenges, Category,
  and Endless.
- **Local player data** — progress, achievements, settings, daily streaks,
  and high scores are stored in `localStorage`; no account or application
  database is required.
- **Topic library** — 308 topic pages at `/topics/<slug>`: 197 hand-written
  Markdown articles plus 111 data-generated civics answer pages.
- **Consent-aware services** — production includes Google Analytics 4 with
  Consent Mode v2 and optional Google AdSense. Storage is denied by default
  until the visitor grants consent.
- **Hybrid rendering** — most routes are statically generated, while shared
  score pages and their Open Graph images are rendered on demand.

## Tech Stack

- **Next.js 16.2** (App Router, hybrid static/dynamic rendering, Turbopack)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **remark + gray-matter** for topic content parsing
- `next/font` for the interface fonts and local font files for Open Graph images

## Project Structure

```
content/topics/         # 197 Markdown topic articles (YAML frontmatter)
public/questions/       # Local question images (hashed filenames)
scripts/
  fetch-images.mjs      # Fetch and localize Wikipedia/Wikimedia images
  normalize-topics.mjs  # Idempotent Markdown cleaner
src/
  app/
    page.tsx            # The game itself (client component)
    s/[code]/           # Dynamic shared-score page and OG image
    topics/[slug]/      # Dynamic topic pages, prerendered
    sitemap.ts          # Auto-generates sitemap.xml
    robots.ts           # Auto-generates robots.txt
    privacy/            # Privacy policy
  components/           # Modals, overlays, share UI
  data/
    questions.json      # 1,024 source-backed questions across nine categories
  lib/
    topics.ts           # Markdown loader and generated-topic builder
    profile.ts          # Local player profile and statistics
    daily.ts            # Seeded daily challenge logic
    share.ts            # Shared-score encoding and display helpers
    slug.ts             # Shared slugify rule (client + server safe)
    eras.ts             # Era / Wikipedia metadata
    categories.ts       # Question categories
    site.ts             # SITE_URL constant
    ...
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If Turbopack has a local filesystem or CSS resolution problem, use Next.js's
Webpack fallback:

```bash
npm run dev -- --webpack
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Optimized hybrid production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run expand:questions` | Rebuild the balanced 1,024-question bank from the original questions and topic articles. |
| `npm run validate:questions` | Verify distribution, required fields, unique clues, sources, wrong options, and local images. |
| `npm run normalize:topics` | Clean up hand-written Markdown in `content/topics/` — fixes bullet spacing, adds `##` heading prefixes. Safe to re-run. |

Run `node scripts/fetch-images.mjs` when question images need to be resolved
and downloaded. It rewrites `src/data/questions.json`, so review the resulting
data and assets before committing.

## Adding a Topic Article

1. Drop a `.md` file into `content/topics/`. The filename must be the slug
   (lowercase, hyphens, no punctuation), e.g. `leonardo-da-vinci.md`.
2. Use this structure:

```markdown
---
title: Leonardo da Vinci
era: 1452–1519
summary: Italian Renaissance polymath — painter, engineer, anatomist.
---

## Overview

Leonardo was a leading figure of the Italian Renaissance...

## Early Life

...

## Did You Know?
- He wrote his notebooks in mirror script.
- He dissected human corpses to study anatomy.
```

3. Run `npm run normalize:topics` to sanitize formatting.
4. The new page will appear at `/topics/<slug>` on the next build.

Topics with names matching a question in `src/data/questions.json` will
automatically pull in their question image as the hero.

Questions in the Citizenship, Music, Movies, and TV Series categories receive
concise generated topic pages when no hand-written Markdown file exists. A
hand-written file always takes precedence.

## Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Origin used for canonical URLs, sitemap, OG tags | `https://histobrain.com` |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense publisher ID; enables the production loader and populates `ads.txt` | Unset |
| `VERCEL_URL` | Vercel-provided fallback origin for generated OG images | Unset |

## Deploy

Run `npm run build` before deployment. The application requires a
Next.js-compatible runtime for `/s/[code]` and its generated Open Graph image,
so it is not a fully static `out/` export.

Vercel works without additional routing configuration. Other platforms must
support App Router static output and server-rendered routes. A plain static
host cannot provide the dynamic score-sharing routes without redesigning or
removing that feature.

## Privacy

Gameplay data remains in the visitor's browser. Production analytics and
optional advertising use Google Consent Mode v2 with storage denied by
default. Visitors can accept, reject, or reset consent from the privacy page.

## License

Code © Henry Montilla. Content under `content/topics/` © Henry Montilla.
All question images are sourced from Wikimedia Commons under their
respective licenses.
