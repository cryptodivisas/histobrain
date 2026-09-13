import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const questions = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src", "data", "questions.json"), "utf8")
);
const source = fs.readFileSync(
  path.join(ROOT, "src", "lib", "categories.ts"),
  "utf8"
);
const categoryMap = new Map(
  [...source.matchAll(/^\s*"([^"]+)":\s*"([^"]+)",?$/gm)].map((match) => [
    match[1],
    match[2],
  ])
);
const categories = [
  "Landmarks",
  "Art",
  "Figures",
  "Events",
  "Documents",
  "Citizenship",
  "Music",
  "Movies",
  "TV Series",
];
const errors = [];
const warnings = [];
const clueKeys = new Map();
const counts = Object.fromEntries(categories.map((category) => [category, 0]));

questions.forEach((question, index) => {
  const label = `Question ${index + 1} (${question.name ?? "unnamed"})`;
  const category = question.category ?? categoryMap.get(question.name);
  if (!categories.includes(category)) errors.push(`${label}: unknown category`);
  else counts[category] += 1;

  for (const field of ["name", "image", "clue", "fact"]) {
    if (typeof question[field] !== "string" || !question[field].trim()) {
      errors.push(`${label}: missing ${field}`);
    }
  }
  if ((question.clue?.length ?? 0) < 35) warnings.push(`${label}: short clue`);
  if ((question.fact?.length ?? 0) < 40) warnings.push(`${label}: short fact`);
  if (!Array.isArray(question.wrong_options) || question.wrong_options.length !== 2) {
    errors.push(`${label}: expected exactly two wrong options`);
  } else {
    const names = question.wrong_options.map((option) => option.name);
    if (names.includes(question.name)) errors.push(`${label}: answer repeated as wrong option`);
    if (new Set(names).size !== names.length) errors.push(`${label}: duplicate wrong options`);
    for (const option of question.wrong_options) {
      if (!option.name || !option.image) errors.push(`${label}: incomplete wrong option`);
      validateImage(option.image, `${label} wrong option`);
    }
  }
  validateImage(question.image, label);

  const clueKey = normalize(question.clue ?? "");
  if (clueKeys.has(clueKey)) {
    errors.push(`${label}: duplicate clue also used by ${clueKeys.get(clueKey)}`);
  } else {
    clueKeys.set(clueKey, label);
  }

  if (question.bankVersion && !question.source) {
    errors.push(`${label}: generated question has no source`);
  }
  if (question.bankVersion) {
    if (leaksAnswer(question.clue, question.name)) {
      errors.push(`${label}: clue appears to reveal the answer`);
    }
    if (normalize(question.clue) === normalize(question.fact)) {
      errors.push(`${label}: reveal fact repeats the clue`);
    }
    if (/\b(?:The|A|An) This\b|\bis is\b/i.test(question.clue)) {
      errors.push(`${label}: awkward generated phrasing`);
    }
    const sourceSlug = question.source?.replace(/^\/topics\//, "");
    const generatedCivicsPage =
      question.bankVersion === "topic-bank-v4" &&
      category === "Citizenship" &&
      sourceSlug === slugify(question.name);
    if (
      !sourceSlug ||
      (!generatedCivicsPage &&
        !fs.existsSync(path.join(ROOT, "content", "topics", `${sourceSlug}.md`)))
    ) {
      errors.push(`${label}: missing source article ${question.source}`);
    }
  }
});

if (questions.length < 1000) {
  errors.push(`Bank contains ${questions.length} questions; minimum is 1000`);
}
for (const category of categories) {
  if (counts[category] < 100) {
    errors.push(`${category} has only ${counts[category]} questions`);
  }
}

console.log(`Questions: ${questions.length}`);
console.log(`Unique answers: ${new Set(questions.map((q) => q.name)).size}`);
console.table(counts);
console.log(`Warnings: ${warnings.length}`);
if (warnings.length) console.log(warnings.slice(0, 20).join("\n"));

if (errors.length) {
  console.error(`\nValidation failed with ${errors.length} error(s):`);
  console.error(errors.slice(0, 100).join("\n"));
  process.exit(1);
}
console.log("\nQuestion bank validation passed.");

function validateImage(image, label) {
  if (typeof image !== "string" || !image.startsWith("/questions/")) {
    errors.push(`${label}: invalid image path`);
    return;
  }
  if (!fs.existsSync(path.join(ROOT, "public", image))) {
    errors.push(`${label}: missing image file ${image}`);
  }
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/["'`\u00b4\u2018\u2019\u201c\u201d()*]/g, "")
    .replace(/[:,.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function leaksAnswer(clue, answer) {
  const ignored = new Set([
    "the", "and", "for", "with", "from", "into", "this", "that", "of", "in",
    "on", "at", "to", "ii", "iii", "battle", "war", "united", "states",
    "american", "attack", "painting", "series", "film",
  ]);
  const tokens = answer
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !ignored.has(token));
  const lowerClue = clue.toLowerCase();
  return tokens.some((token) =>
    new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(
      lowerClue
    )
  );
}
