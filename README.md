# History Brain

A retro pixel-art trivia game that tests your historical knowledge across
art, landmarks, events, documents, and iconic figures.

- **Static-exportable Next.js 16 app** — every page prerendered at build time.
- **Offline-friendly** — progress, achievements, settings all stored in
  `localStorage`. No account, no tracking.
- **Per-topic articles** — 84 hand-written topic pages at `/topics/<slug>`
  backed by Markdown + YAML frontmatter.

## Tech Stack

- **Next.js 16** (App Router, `output: "export"`, Turbopack)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **remark + gray-matter** for topic content parsing
- Self-hosted pixel fonts (`Press_Start_2P`, `VT323`)

## Project Structure

```
content/topics/         # 84 Markdown topic articles (YAML frontmatter)
public/questions/       # Local question images (hashed filenames)
scripts/
  normalize-topics.mjs  # Idempotent Markdown cleaner
src/
  app/
    page.tsx            # The game itself (client component)
    topics/[slug]/      # Dynamic topic pages, prerendered
    sitemap.ts          # Auto-generates sitemap.xml
    robots.ts           # Auto-generates robots.txt
    privacy/            # Privacy policy
  components/           # Modals, overlays, share UI
  data/
    questions.json      # Question bank (name, image, clue, fact, options)
  lib/
    topics.ts           # Build-time markdown loader
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

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (static export) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run normalize:topics` | Clean up hand-written Markdown in `content/topics/` — fixes bullet spacing, adds `##` heading prefixes. Safe to re-run. |

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

## Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Origin used for canonical URLs, sitemap, OG tags | `https://histobrain.com` |

## Deploy

Because `output: "export"` is enabled, `npm run build` produces a fully
static site in `out/` that can be served from any static host (Vercel,
Netlify, Cloudflare Pages, S3, etc.).

## License

Code © Henry Montilla. Content under `content/topics/` © Henry Montilla.
All question images are sourced from Wikimedia Commons under their
respective licenses.
