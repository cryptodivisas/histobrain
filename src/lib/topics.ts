// Build-time loader for hand-written topic pages in content/topics/.
// Reads Markdown + YAML frontmatter, returns structured data, and renders the
// body to sanitized HTML. Used by the /topics/[slug] route.
//
// All APIs here are safe only in server components / build-time contexts
// (they touch the filesystem).

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

import questionsData from "@/data/questions.json";
import { slugify } from "@/lib/slug";
import type { Category } from "@/lib/categories";

export { slugify };

export interface TopicFrontmatter {
  title: string;
  era?: string;
  summary?: string;
}

export interface Topic extends TopicFrontmatter {
  slug: string;
  /** Rendered body HTML (sections, paragraphs, lists). */
  contentHtml: string;
  /** First paragraph after `## Overview`, plaintext, used for meta tags. */
  excerpt: string;
  /** Local /questions/<hash>.jpg image path if the topic exists in questions.json. */
  image: string | null;
  category?: Category;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "topics");

interface QuestionEntry {
  name: string;
  image?: string;
  clue?: string;
  fact?: string;
  category?: Category;
  wrong_options?: Array<{ name: string; image?: string }>;
}

/** Map of name -> image path, built once from questions.json. */
const NAME_TO_IMAGE: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const q of questionsData as QuestionEntry[]) {
    if (q.image) map[q.name] = q.image;
    for (const wo of q.wrong_options ?? []) {
      if (wo.image) map[wo.name] = wo.image;
    }
  }
  return map;
})();

/** Map of slug -> original name, so we can reverse-lookup images/categories. */
const SLUG_TO_NAME: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const q of questionsData as QuestionEntry[]) {
    if (!map[slugify(q.name)]) map[slugify(q.name)] = q.name;
    for (const wo of q.wrong_options ?? []) {
      if (!map[slugify(wo.name)]) map[slugify(wo.name)] = wo.name;
    }
  }
  return map;
})();

const CITIZENSHIP_BY_SLUG: Record<string, QuestionEntry[]> = (() => {
  const map: Record<string, QuestionEntry[]> = {};
  for (const q of questionsData as QuestionEntry[]) {
    if (q.category !== "Citizenship") continue;
    const slug = slugify(q.name);
    map[slug] ??= [];
    map[slug].push(q);
  }
  return map;
})();

/**
 * Return the original question name for a slug, if it exists in the quiz.
 * (Used to look up image / category / era.)
 */
export function nameForSlug(slug: string): string | null {
  return SLUG_TO_NAME[slug] ?? null;
}

function readTopicFile(slug: string): string | null {
  const full = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, "utf8");
}

async function renderMarkdown(body: string): Promise<string> {
  const processed = await remark().use(html).process(body);
  return processed.toString();
}

function generatedCitizenshipMarkdown(name: string, entries: QuestionEntry[]): string {
  const prompts = entries
    .map((entry) => {
      const clue = entry.clue?.replace(/^USCIS civics question \d+:\s*/, "");
      return clue ? `- ${clue}` : null;
    })
    .filter(Boolean)
    .join("\n");
  const facts = entries
    .map((entry) => (entry.fact ? `- ${entry.fact}` : null))
    .filter(Boolean)
    .join("\n");

  return `## Overview

${name} is an accepted answer in the USCIS 2025 civics test. These questions help applicants study American government, rights and responsibilities, history, symbols, and national holidays.

## Civics test prompt${entries.length > 1 ? "s" : ""}

${prompts}

## Accepted answer

${name}

## Study notes

${facts}
`;
}

function extractExcerpt(body: string): string {
  // Find the first non-heading, non-empty paragraph and return ~160 chars.
  const lines = body.split(/\r?\n/);
  const paraLines: string[] = [];
  let inPara = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("#")) {
      if (inPara) break;
      continue;
    }
    if (line === "") {
      if (inPara) break;
      continue;
    }
    if (line.startsWith("-") || line.startsWith(">")) {
      if (inPara) break;
      continue;
    }
    inPara = true;
    paraLines.push(line);
  }
  const text = paraLines.join(" ").replace(/\s+/g, " ").trim();
  if (text.length <= 160) return text;
  return text.slice(0, 157).replace(/\s+\S*$/, "") + "…";
}

/** Return the list of all slugs that have a content file on disk. */
export function getAllTopicSlugs(): string[] {
  const fileSlugs = fs.existsSync(CONTENT_DIR)
    ? fs
        .readdirSync(CONTENT_DIR)
        .filter((f) => f.endsWith(".md") && f !== "README.md")
        .map((f) => f.replace(/\.md$/, ""))
    : [];
  return Array.from(new Set([...fileSlugs, ...Object.keys(CITIZENSHIP_BY_SLUG)])).sort();
}

/** Load a single topic by slug. Returns null if the file is missing. */
export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const raw = readTopicFile(slug);
  if (!raw) {
    const citizenshipEntries = CITIZENSHIP_BY_SLUG[slug];
    if (!citizenshipEntries) return null;

    const name = SLUG_TO_NAME[slug] ?? citizenshipEntries[0].name;
    const body = generatedCitizenshipMarkdown(name, citizenshipEntries);
    const contentHtml = await renderMarkdown(body);
    const excerpt = extractExcerpt(body);

    return {
      slug,
      title: name,
      summary: `USCIS 2025 civics test answer: ${name}`,
      contentHtml,
      excerpt,
      image: NAME_TO_IMAGE[name] ?? null,
      category: "Citizenship",
    };
  }

  const { data, content } = matter(raw);
  const fm = data as TopicFrontmatter;
  const contentHtml = await renderMarkdown(content);
  const excerpt = fm.summary?.trim() || extractExcerpt(content);
  const name = SLUG_TO_NAME[slug] ?? fm.title;
  const image = NAME_TO_IMAGE[name] ?? null;

  return {
    slug,
    title: fm.title ?? name,
    era: fm.era,
    summary: fm.summary,
    contentHtml,
    excerpt,
    image,
  };
}

/**
 * Load every topic. Use sparingly — this reads and parses all ~84 files.
 * Intended for sitemap generation, related-topic lookups, etc.
 */
export async function getAllTopics(): Promise<Topic[]> {
  const slugs = getAllTopicSlugs();
  const topics = await Promise.all(slugs.map((s) => getTopicBySlug(s)));
  return topics.filter((t): t is Topic => t !== null);
}
