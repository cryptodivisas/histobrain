// Normalize hand-written topic .md files in content/topics/ to strict markdown:
//  - Adds "## " prefix to standalone section-title lines (heuristic + known list)
//  - Normalizes bullet lines "-foo" -> "- foo"
//  - Leaves YAML frontmatter untouched
//
// Safe to re-run; idempotent.
//
//   node scripts/normalize-topics.mjs

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(__dirname, "..", "content", "topics");

// Any line matching one of these (case-insensitive, trimmed) is definitely a
// section header and gets "## " prepended.
const KNOWN_HEADINGS = new Set(
  [
    "Overview",
    "Key Facts",
    "Key Features",
    "History",
    "Background",
    "Creation",
    "Early Life",
    "Major Works",
    "Major Achievements",
    "Achievements",
    "Architecture",
    "Style and Technique",
    "Style & Technique",
    "Description",
    "What Happened",
    "The Event",
    "Aftermath",
    "Significance",
    "Impact",
    "Impact / Legacy",
    "Legacy",
    "Cultural Impact",
    "Did You Know?",
    "Did You Know",
    "Fun Facts",
    "Timeline",
  ].map((s) => s.toLowerCase())
);

function splitFrontmatter(src) {
  if (!src.startsWith("---")) return { fm: "", body: src };
  const end = src.indexOf("\n---", 3);
  if (end === -1) return { fm: "", body: src };
  const fm = src.slice(0, end + 4); // include closing ---
  const body = src.slice(end + 4).replace(/^\r?\n/, "");
  return { fm, body };
}

function normalizeBody(body) {
  const lines = body.split(/\r?\n/);
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1) Bullet normalization: "-foo" -> "- foo"
    //    But leave "-" alone at line start only; don't touch mid-line hyphens.
    if (/^-\S/.test(trimmed)) {
      out.push("- " + trimmed.slice(1));
      continue;
    }

    // 2) Heading detection.
    //    Already a markdown heading? keep.
    if (/^#{1,6}\s/.test(trimmed)) {
      out.push(line);
      continue;
    }

    // Heuristic: non-bullet, non-empty line that is short, has no terminal
    // punctuation, and is followed (after optional blanks) by a non-heading
    // paragraph or bullet, is treated as a section heading.
    const looksLikeHeading =
      trimmed.length > 0 &&
      trimmed.length <= 60 &&
      !trimmed.startsWith("- ") &&
      !trimmed.startsWith("> ") &&
      !/[.:;!]$/.test(trimmed) &&
      // Don't treat a line as heading if it starts lowercase and isn't a known heading.
      (KNOWN_HEADINGS.has(trimmed.toLowerCase()) ||
        /^[A-Z]/.test(trimmed));

    if (looksLikeHeading) {
      // Look ahead: is next non-empty line content (bullet, paragraph, or end)?
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      const nextNonEmpty = j < lines.length ? lines[j].trim() : "";
      const nextIsContent =
        nextNonEmpty === "" ||
        nextNonEmpty.startsWith("- ") ||
        /^-\S/.test(nextNonEmpty) ||
        /^[A-Za-z0-9"“']/.test(nextNonEmpty);
      // Also require there was a blank line BEFORE (or we're at doc start)
      const prevNonEmpty =
        out.length > 0
          ? [...out].reverse().find((l) => l.trim() !== "") ?? ""
          : "";
      const prevIsBlankOrHeading =
        out.length === 0 ||
        out[out.length - 1].trim() === "" ||
        /^#{1,6}\s/.test(prevNonEmpty);

      if (
        nextIsContent &&
        prevIsBlankOrHeading &&
        (KNOWN_HEADINGS.has(trimmed.toLowerCase()) || trimmed.split(" ").length <= 6)
      ) {
        out.push("## " + trimmed);
        continue;
      }
    }

    out.push(line);
  }

  // Collapse >2 consecutive blank lines down to 2.
  const collapsed = [];
  let blankRun = 0;
  for (const l of out) {
    if (l.trim() === "") {
      blankRun++;
      if (blankRun <= 2) collapsed.push(l);
    } else {
      blankRun = 0;
      collapsed.push(l);
    }
  }

  // Ensure trailing newline.
  let result = collapsed.join("\n");
  if (!result.endsWith("\n")) result += "\n";
  return result;
}

async function main() {
  const files = (await readdir(DIR)).filter(
    (f) => f.endsWith(".md") && f !== "README.md"
  );
  let changed = 0;
  for (const f of files) {
    const full = path.join(DIR, f);
    const src = await readFile(full, "utf8");
    const { fm, body } = splitFrontmatter(src);
    const normalizedBody = normalizeBody(body);
    const out = fm ? `${fm}\n\n${normalizedBody}` : normalizedBody;
    if (out !== src) {
      await writeFile(full, out);
      changed++;
      console.log(`  normalized: ${f}`);
    }
  }
  console.log(`\nDone. ${changed}/${files.length} file(s) changed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
