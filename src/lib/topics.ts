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
}

const CONTENT_DIR = path.join(process.cwd(), "content", "topics");

interface QuestionEntry {
  name: string;
  image: string;
  wrong_options?: Array<{ name: string; image: string }>;
}

/** Map of name -> image path, built once from questions.json. */
const NAME_TO_IMAGE: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const q of questionsData as QuestionEntry[]) {
    map[q.name] = q.image;
    for (const wo of q.wrong_options ?? []) {
      map[wo.name] = wo.image;
    }
  }
  return map;
})();

/** Map of slug -> original name, so we can reverse-lookup images/categories. */
const SLUG_TO_NAME: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const name of Object.keys(NAME_TO_IMAGE)) {
    map[slugify(name)] = name;
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
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

/** Load a single topic by slug. Returns null if the file is missing. */
export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const raw = readTopicFile(slug);
  if (!raw) return null;

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
