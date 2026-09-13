import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const QUESTIONS_PATH = path.join(ROOT, "src", "data", "questions.json");
const CATEGORIES_PATH = path.join(ROOT, "src", "lib", "categories.ts");
const TOPICS_DIR = path.join(ROOT, "content", "topics");
const BANK_VERSION = "topic-bank-v4";
const CATEGORIES = [
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
const DEFAULT_ADD_PER_CATEGORY = 10;

// Reviewed replacements for source passages that are too broad as quiz clues.
const FOURTH_BATCH_CLUES = {
  "Christ the Redeemer": "Which landmark is a statue of Jesus overlooking Rio de Janeiro from Mount Corcovado?",
  "Great Pyramid of Giza": "Which landmark was built as a royal tomb for Pharaoh Khufu on Egypt's west bank of the Nile?",
  "Moai of Easter Island": "Which landmark consists of monumental stone figures carved by the Rapa Nui people in the remote Pacific?",
  "American Gothic": "Which work of art shows a stern pair standing before a farmhouse, with one figure holding a pitchfork?",
  "David (Michelangelo)": "Which work of art depicts a young biblical hero standing alert before his battle with Goliath?",
  "Discus Thrower (Discobolus)": "Which work of art depicts an idealized athlete twisting just before releasing a discus?",
  "Girl with a Pearl Earring": "Which work of art shows a young woman turning toward the viewer in a blue-and-yellow headscarf?",
  "Las Meninas": "Which work of art places the Spanish Infanta and her attendants in a royal room with the painter visible at his easel?",
  "Pieta (Michelangelo)": "Which work of art depicts the Virgin Mary cradling the body of Jesus after the Crucifixion?",
  "The Birth of Venus": "Which work of art shows the goddess Venus arriving at shore on a giant scallop shell?",
  "Abraham Lincoln": "Which historical figure led the United States during the Civil War and issued the Emancipation Proclamation?",
  "Cleopatra": "Which historical figure was the last active ruler of Ptolemaic Egypt and formed alliances with Julius Caesar and Mark Antony?",
  "Marco Polo": "Which historical figure was a Venetian merchant whose account of travels across Asia reached European readers in the late 1200s?",
  "Mahatma Gandhi": "Which historical figure led India's 1930 Salt March as a campaign of nonviolent resistance to British rule?",
  "Martin Luther King Jr.": "Which historical figure delivered the 1963 'I Have a Dream' speech during the March on Washington?",
  "Apollo 11 Moon Landing": "Which historical event was the 1969 mission in which Neil Armstrong and Buzz Aldrin first walked on the lunar surface?",
  "Black Death": "Which historical event was a plague pandemic that devastated Europe and parts of Asia in the mid-14th century?",
  "Boston Tea Party": "Which historical event involved colonists dumping East India Company cargo into a Massachusetts harbor in 1773?",
  "Chernobyl Disaster": "Which historical event began with a 1986 reactor explosion at a Soviet nuclear power plant in present-day Ukraine?",
  "D-Day (Normandy Landings)": "Which historical event was the Allied amphibious invasion of northern France on June 6, 1944?",
  "Code of Hammurabi": "Which document is an ancient Babylonian collection of laws inscribed on a stone stele?",
  "Epic of Gilgamesh": "Which document is an ancient Mesopotamian poem about a king of Uruk and his companion Enkidu?",
  "Elvis Presley": "Which musician or group became known as the 'King of Rock and Roll' after recording early hits at Sun Studio in Memphis?",
  "Johann Sebastian Bach": "Which musician or group composed the Brandenburg Concertos and The Well-Tempered Clavier?",
  "Ludwig van Beethoven": "Which musician or group composed a Ninth Symphony that ends with a setting of 'Ode to Joy'?",
  "Michael Jackson": "Which musician or group released Thriller and popularized the moonwalk dance move?",
  "Breaking Bad": "Which television series follows chemistry teacher Walter White as he starts making methamphetamine?",
  "Doctor Who": "Which television series began on the BBC in 1963 and follows a Time Lord traveling in a blue police box?",
  "The Crown": "Which television series dramatizes Elizabeth II's reign across decades of British political and family life?",
  "The Sopranos": "Which television series follows a New Jersey mob boss who begins therapy with psychiatrist Dr. Melfi?",
};

const FOURTH_BATCH_FACTS = {
  "Colosseum": "Construction of the Colosseum began under Emperor Vespasian around 72 CE and was completed under his son Titus around 80 CE.",
  "Great Wall of China": "Early Chinese states built defensive walls centuries before the best-known stone and brick sections were constructed under the Ming dynasty (1368–1644).",
  "Eiffel Tower": "The Eiffel Tower was built for the 1889 Paris World's Fair and was originally intended to be temporary.",
  "Machu Picchu": "Machu Picchu became internationally known after Hiram Bingham visited in 1911 with the help of local Peruvian guides.",
  "David (Michelangelo)": "Michelangelo carved David from marble between 1501 and 1504; the statue stands in Florence's Galleria dell'Accademia.",
  "Girl with a Pearl Earring": "Johannes Vermeer painted Girl with a Pearl Earring around 1665; it is displayed at the Mauritshuis in The Hague.",
  "Pieta (Michelangelo)": "Michelangelo's Pieta is housed in St. Peter's Basilica in Vatican City and is the only work the artist signed.",
  "The Birth of Venus": "Botticelli's The Birth of Venus was painted around 1485 and is displayed at the Uffizi Gallery in Florence.",
  "Discus Thrower (Discobolus)": "The original bronze sculpture by Myron dates to about 450 BCE; its pose survives through Roman marble copies.",
  "Nighthawks": "Edward Hopper painted Nighthawks in 1942, and the work is held by the Art Institute of Chicago.",
  "Galileo Galilei": "Galileo's observations of Jupiter's moons and Venus's phases helped challenge the Earth-centered model of the cosmos.",
  "Christopher Columbus": "Sponsored by the Spanish crown, Columbus reached the Bahamas in October 1492 while seeking a westward route to Asia.",
  "American Civil War": "The American Civil War ended in 1865 after the Confederacy's defeat and led to the abolition of slavery.",
  "Battle of Hastings": "King Harold II died at the Battle of Hastings in 1066, after which William of Normandy became king of England.",
  "Battle of Waterloo": "The Battle of Waterloo on June 18, 1815, ended Napoleon's final bid for power against an allied army led by Wellington and Blucher.",
  "Black Death": "The Black Death spread across Europe in the mid-14th century and caused enormous population losses.",
  "Boston Tea Party": "The Sons of Liberty organized the Boston Tea Party in December 1773 to protest British tea policy.",
  "Chernobyl Disaster": "The 1986 explosion at Chernobyl's Reactor No. 4 spread radioactive material and led to the evacuation of nearby Pripyat.",
  "D-Day (Normandy Landings)": "The June 6, 1944, Normandy landings involved Allied sea and airborne forces and began the liberation of German-occupied France.",
  "Apollo 11 Moon Landing": "The Apollo 11 crew included Neil Armstrong, Buzz Aldrin, and Michael Collins; Armstrong and Aldrin walked on the lunar surface.",
  "Atlantic Charter": "The 1941 Atlantic Charter set out war aims shared by Roosevelt and Churchill and influenced the founding principles of the United Nations.",
  "Bayeux Tapestry": "The Bayeux Tapestry depicts events around the Norman conquest of England in 1066.",
  "The Communist Manifesto": "Karl Marx and Friedrich Engels published The Communist Manifesto in 1848, outlining class struggle and communism.",
  "Code of Hammurabi": "The Code of Hammurabi was inscribed on a stone stele in ancient Babylon; the surviving monument is displayed at the Louvre in Paris.",
  "Dead Sea Scrolls": "The Dead Sea Scrolls include some of the oldest surviving manuscripts of books later included in the Hebrew Bible.",
  "Epic of Gilgamesh": "The Epic of Gilgamesh survives on Mesopotamian clay tablets and contains a flood story that predates the biblical account of Noah.",
  "Gettysburg Address": "Lincoln delivered the roughly 270-word Gettysburg Address at the dedication of a military cemetery in November 1863.",
  "Gutenberg Bible": "Johannes Gutenberg printed the Gutenberg Bible in Mainz around 1455 using movable metal type.",
  "Ludwig van Beethoven": "Beethoven composed nine symphonies, including the Ninth, whose final movement sets Schiller's 'Ode to Joy.'",
};

const NOUNS = {
  Landmarks: "This landmark",
  Art: "This work of art",
  Figures: "This historical figure",
  Events: "This historical event",
  Documents: "This document",
  Citizenship: "This civics answer",
  Music: "This musician or group",
  Movies: "This film",
  "TV Series": "This television series",
};

const QUESTION_LABELS = {
  Landmarks: "landmark",
  Art: "work of art",
  Figures: "historical figure",
  Events: "historical event",
  Documents: "document",
  Citizenship: "civics answer",
  Music: "musician or group",
  Movies: "film",
  "TV Series": "television series",
};

const ANSWER_STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "into", "this", "that", "of", "in",
  "on", "at", "to", "a", "an", "ii", "iii", "jr", "saint", "battle", "war",
  "united", "states", "american", "attack", "painting", "series", "film",
]);

const dryRun = process.argv.includes("--dry-run");
const original = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
const categoryMap = parseCategoryMap();
const baseQuestions = original.filter((question) => question.bankVersion !== BANK_VERSION);
const TARGETS = buildTargets(baseQuestions);
const imageByName = buildImageMap(baseQuestions);
const topicBySlug = loadTopics();
const records = buildAnswerRecords(baseQuestions);
const additions = [];
const usedClues = new Set(baseQuestions.map((question) => normalize(question.clue)));

for (const [category, target] of Object.entries(TARGETS)) {
  const existing = baseQuestions.filter((question) => resolveCategory(question) === category);
  const needed = Math.max(0, target - existing.length);
  if (needed === 0) continue;

  const categoryRecords = records
    .filter((record) => record.category === category && record.topic && record.image)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (categoryRecords.length === 0) {
    throw new Error(`No source-backed answer records available for ${category}`);
  }

  const candidateSets = categoryRecords.map((record) => ({
    record,
    candidates: buildCandidates(record),
    cursor: record.category === "Citizenship" ? 0 : 1,
  }));

  let created = 0;
  let pass = 0;
  while (created < needed) {
    let progress = false;
    for (const set of candidateSets) {
      if (created >= needed) break;
      const candidate = set.candidates[set.cursor];
      if (!candidate) continue;

      const question = buildQuestion(
        set.record,
        candidate,
        set.cursor,
        categoryRecords
      );
      set.cursor += 1;
      if (!question) continue;
      const clueKey = normalize(question.clue);
      if (usedClues.has(clueKey)) continue;
      usedClues.add(clueKey);
      additions.push(question);
      created += 1;
      progress = true;
    }

    pass += 1;
    if (!progress || pass > 20) {
      const available = candidateSets.reduce(
        (sum, set) => sum + set.candidates.length,
        0
      );
      throw new Error(
        `${category} needs ${needed} additions but only ${created} passed ` +
          `quality checks from ${available} candidates.`
      );
    }
  }
}

const expanded = [...baseQuestions, ...additions];
const counts = countByCategory(expanded);

console.log(`Base questions: ${baseQuestions.length}`);
console.log(`Generated questions: ${additions.length}`);
console.log(`Expanded total: ${expanded.length}`);
console.table(counts);

if (dryRun) {
  if (process.argv.includes("--audit")) {
    for (const question of additions) {
      console.log(`${question.category}\t${question.name}\t${question.clue}\t${question.fact}`);
    }
    process.exit(0);
  }
  console.log("\nSample generated questions:");
  console.log(
    JSON.stringify(
      additions.filter((_, index) => index % Math.max(1, Math.floor(additions.length / 18)) === 0).slice(0, 18),
      null,
      2
    )
  );
} else {
  fs.writeFileSync(QUESTIONS_PATH, `${JSON.stringify(expanded, null, 2)}\n`);
  console.log(`Wrote ${QUESTIONS_PATH}`);
}

function parseCategoryMap() {
  const source = fs.readFileSync(CATEGORIES_PATH, "utf8");
  const map = new Map();
  for (const match of source.matchAll(/^\s*"([^"]+)":\s*"([^"]+)",?$/gm)) {
    map.set(match[1], match[2]);
  }
  return map;
}

function buildTargets(questions) {
  const addPerCategoryArg = process.argv.find((arg) =>
    arg.startsWith("--add-per-category=")
  );
  const addPerCategory = addPerCategoryArg
    ? Number(addPerCategoryArg.split("=")[1])
    : DEFAULT_ADD_PER_CATEGORY;
  if (!Number.isInteger(addPerCategory) || addPerCategory < 1) {
    throw new Error("--add-per-category must be a positive integer");
  }

  const counts = countByCategory(questions);
  return Object.fromEntries(
    CATEGORIES.map((category) => [
      category,
      (counts[category] ?? 0) + addPerCategory,
    ])
  );
}

function buildImageMap(questions) {
  const map = new Map();
  for (const question of questions) {
    if (question.image) map.set(question.name, question.image);
    for (const option of question.wrong_options ?? []) {
      if (option.image && !map.has(option.name)) map.set(option.name, option.image);
    }
  }
  return map;
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

function loadTopics() {
  const map = new Map();
  for (const file of fs.readdirSync(TOPICS_DIR)) {
    if (!file.endsWith(".md") || file === "README.md") continue;
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(TOPICS_DIR, file), "utf8");
    const parsed = matter(raw);
    map.set(slug, {
      slug,
      title: parsed.data.title ?? slug,
      era: parsed.data.era ?? "",
      summary: parsed.data.summary ?? "",
      body: parsed.content,
    });
  }
  return map;
}

function resolveCategory(question) {
  return question.category ?? categoryMap.get(question.name) ?? null;
}

function buildAnswerRecords(questions) {
  const byName = new Map();
  for (const question of questions) {
    const category = resolveCategory(question);
    if (!category || byName.has(question.name)) continue;
    const topic =
      topicBySlug.get(slugify(question.name)) ??
      findFallbackTopic(question, category);
    byName.set(question.name, {
      name: question.name,
      category,
      image: question.image ?? imageByName.get(question.name),
      originalFact: question.fact,
      originalClue: question.clue,
      originalWrongOptions: question.wrong_options,
      topic,
    });
  }
  return [...byName.values()];
}

function buildCandidates(record) {
  if (record.category === "Citizenship") return buildCitizenshipCandidates(record);

  const { topic } = record;
  const sourcePieces = [
    topic.summary,
    ...extractMarkdownPieces(topic.body),
  ].filter(Boolean);

  const seen = new Set();
  const candidates = [];
  for (const source of sourcePieces) {
    const clue = clueFromSource(source, record);
    if (!clue) continue;
    const key = normalize(clue);
    if (seen.has(key) || key === normalize(record.originalClue)) continue;
    seen.add(key);
    candidates.push({ clue, source });
  }
  return candidates;
}

function findFallbackTopic(question, category) {
  if (category !== "Citizenship") return null;

  const text = `${question.name} ${question.clue} ${question.fact}`.toLowerCase();
  const preferredSlug =
    /declaration|colonies|britain|independence/.test(text)
      ? "declaration-of-independence"
      : /bill of rights|freedom|speech|religion|press|assembly|petition|amendment|rights/.test(text)
        ? "united-states-bill-of-rights"
        : "us-constitution";
  return topicBySlug.get(preferredSlug) ?? null;
}

function buildCitizenshipCandidates(record) {
  const prompt = record.originalClue
    .replace(/^USCIS civics question\s+\d+:\s*/i, "")
    .replace(/[“”]/g, "\"")
    .trim();
  if (!prompt || prompt.length < 20) return [];

  return [
    {
      clue: `In a U.S. citizenship civics review, which answer fits this prompt: ${prompt}`,
      source: record.originalClue,
    },
  ];
}

function extractMarkdownPieces(markdown) {
  const pieces = [];
  const blocks = markdown.split(/\n\s*\n/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("- ")) {
      for (const line of trimmed.split(/\r?\n/)) {
        const item = line.replace(/^\s*-\s*/, "").trim();
        if (item) pieces.push(item);
      }
      continue;
    }
    const paragraph = trimmed.replace(/\s*\n\s*/g, " ");
    pieces.push(...splitSentences(paragraph));
  }
  return pieces;
}

function splitSentences(text) {
  const protectedText = text
    .replace(/\bU\.S\./g, "U§S§")
    .replace(/\bU\.K\./g, "U§K§")
    .replace(/\bD\.C\./g, "D§C§")
    .replace(/\bMr\./g, "Mr§")
    .replace(/\bMrs\./g, "Mrs§")
    .replace(/\bDr\./g, "Dr§")
    .replace(/\bSt\./g, "St§")
    .replace(/\b([A-Z])\./g, "$1§");
  return protectedText
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"*])/)
    .map((value) =>
      value
        .replace(/U§S§/g, "U.S.")
        .replace(/U§K§/g, "U.K.")
        .replace(/D§C§/g, "D.C.")
        .replace(/Mr§/g, "Mr.")
        .replace(/Mrs§/g, "Mrs.")
        .replace(/Dr§/g, "Dr.")
        .replace(/St§/g, "St.")
        .replace(/\b([A-Z])§/g, "$1.")
        .trim()
    )
    .filter(Boolean);
}

function cleanMarkdown(value) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function aliasesFor(answer) {
  const aliases = [answer];
  const beforeParen = answer.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (beforeParen !== answer && beforeParen.length >= 4) aliases.push(beforeParen);
  return aliases.sort((a, b) => b.length - a.length);
}

function clueFromSource(source, record) {
  let text = cleanMarkdown(source);
  if (text.length < 28 || text.length > 240) return null;

  const noun = NOUNS[record.category];
  const nounLower = noun.toLowerCase();
  for (const alias of aliasesFor(record.name)) {
    text = text.replace(new RegExp(escapeRegExp(alias), "gi"), noun);
  }

  text = text
    .replace(/^(He|She|It)\s+/i, `${noun} `)
    .replace(/^His\s+/i, `${noun}'s `)
    .replace(/^Her\s+/i, `${noun}'s `)
    .replace(/^Their\s+/i, `${noun}'s `)
    .replace(/^Its\s+/i, `${noun}'s `);

  text = text
    .replace(
      new RegExp(`\\b(?:the|a|an)\\s+${escapeRegExp(noun)}\\b`, "gi"),
      nounLower
    )
    .replace(new RegExp(`^(The|A|An)\\s+${escapeRegExp(noun)}\\b`, "i"), noun)
    .replace(new RegExp(`^${escapeRegExp(noun)}\\s+is\\s+is\\b`, "i"), `${noun} is`);

  text = text
    .replace(new RegExp(`^The character ${escapeRegExp(noun)}\\b`, "i"), `The title character of ${noun}`)
    .replace(new RegExp(`^The novel ${escapeRegExp(noun)}\\b`, "i"), `The novel behind ${noun}`)
    .replace(new RegExp(`["“]${escapeRegExp(noun)}["”]`, "gi"), noun)
    .replace(
      new RegExp(
        `\\b([A-Z][A-Za-z.-]+(?:\\s+[A-Z][A-Za-z.-]+){0,2})[’']s\\s+${escapeRegExp(noun)}\\b`,
        "g"
      ),
      `${noun} by $1`
    )
    .replace(
      new RegExp(`,\\s+${escapeRegExp(noun)}\\b`, "g"),
      "; it"
    )
    .replace(
      new RegExp(`\\b(use|call|called|named|as|about|of)\\s+${escapeRegExp(noun)}\\b`, "g"),
      (_, verb) => `${verb} ${noun.toLowerCase()}`
    );

  const clueTransformations = [
    [/^Born\s+/i, `${noun} was born `],
    [/^Formed\s+/i, `${noun} was formed `],
    [/^Directed by\s+/i, `${noun} was directed by `],
    [/^Written by\s+/i, `${noun} was written by `],
    [/^Created\s+/i, `${noun} was created `],
    [/^Painted\s+/i, `${noun} was painted `],
    [/^Built\s+/i, `${noun} was built `],
    [/^Released\s+/i, `${noun} was released `],
    [/^Published\s+/i, `${noun} was published `],
    [/^Won\s+/i, `${noun} won `],
    [/^Known\s+/i, `${noun} is known `],
    [/^Located\s+/i, `${noun} is located `],
    [/^Adapted\s+/i, `${noun} was adapted `],
    [/^Starring\s+/i, `${noun} stars `],
  ];
  let transformed = false;
  for (const [pattern, replacement] of clueTransformations) {
    if (!pattern.test(text)) continue;
    text = text.replace(pattern, replacement);
    transformed = true;
    break;
  }
  if (!transformed && !/^(This|The|A|An|Its)\b/i.test(text)) {
    text = `${noun} can be identified by this detail: ${text}`;
  }

  text = text.replace(/\s+/g, " ").trim();
  text = `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
  if (!/[.!?]$/.test(text)) text += ".";
  if (text.length < 45 || text.length > 260) return null;
  if (BANK_VERSION === "topic-bank-v4") {
    if (new RegExp(`\\b${escapeRegExp(noun)}\\b`, "i").test(text.slice(1))) return null;
    if (/\bone of the most (?:famous|recognizable|important|influential|studied|celebrated|remarkable)\b/i.test(text)) return null;
    if (/\baround c\b|\b\d{3,4}\s+This\b/i.test(text)) return null;
  }
  if (/\bNo\.$/i.test(text)) return null;
  if (/\(This [^)]+\)/.test(text)) return null;
  if (/\b(?:da|de|van|von)\s+This\b/i.test(text)) return null;
  if (leaksAnswer(text, record.name)) return null;
  return text;
}

function leaksAnswer(clue, answer) {
  const lower = clue.toLowerCase();
  const tokens = answer
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !ANSWER_STOP_WORDS.has(token));
  return tokens.some((token) => new RegExp(`\\b${escapeRegExp(token)}\\b`, "i").test(lower));
}

function buildQuestion(record, candidate, variantIndex, categoryRecords) {
  const alternatives = categoryRecords
    .filter((other) => other.name !== record.name && other.image)
    .sort((a, b) => {
      const eraDelta = Math.abs(firstYear(a.topic?.era) - firstYear(record.topic?.era)) -
        Math.abs(firstYear(b.topic?.era) - firstYear(record.topic?.era));
      return eraDelta || a.name.localeCompare(b.name);
    });

  if (alternatives.length < 2) return null;
  const first = alternatives[variantIndex % alternatives.length];
  let second = alternatives[(variantIndex + 3) % alternatives.length];
  if (second.name === first.name) second = alternatives[(variantIndex + 1) % alternatives.length];
  if (!first || !second || first.name === second.name) return null;

  const sourceKey = normalize(cleanMarkdown(candidate.source));
  const factCandidates = extractMarkdownPieces(record.topic.body)
    .map(cleanMarkdown)
    .filter(
      (fact) =>
        fact.length >= 45 &&
        fact.length <= 320 &&
        normalize(fact) !== sourceKey &&
        !/around\s+c\.?$/i.test(fact) &&
        !/\bNo\.$/i.test(fact) &&
        !/\(This [^)]+\)/.test(fact) &&
        !/^(He|She|It|They|His|Her|Their|Its|This|These|Those|That)\b/i.test(fact)
    );
  const rawFact =
    BANK_VERSION === "topic-bank-v4" || record.category === "Citizenship"
      ? record.originalFact
      : factCandidates[variantIndex % Math.max(1, factCandidates.length)] ??
        record.originalFact;
  const fact = FOURTH_BATCH_FACTS[record.name] ?? completeFact(rawFact, record.name, variantIndex);
  const generatedClue = formatBatchClue(
    varyClueScaffold(candidate.clue, variantIndex),
    record.category,
    variantIndex
  );
  const clue = BANK_VERSION === "topic-bank-v4" && !additions.some((entry) => entry.name === record.name && entry.category === record.category)
    ? FOURTH_BATCH_CLUES[record.name] ?? generatedClue
    : generatedClue;
  if (leaksAnswer(clue, record.name)) return null;
  if (BANK_VERSION === "topic-bank-v4" && /\bthis (?:landmark|work of art|historical figure|historical event|document|musician or group|film|television series)\b/i.test(clue)) return null;

  const wrongOptions =
    BANK_VERSION === "topic-bank-v4" && record.category === "Citizenship" &&
    record.originalWrongOptions?.length === 2
      ? record.originalWrongOptions
      : [
          { name: first.name, image: first.image },
          { name: second.name, image: second.image },
        ];

  return {
    name: record.name,
    image: record.image,
    clue,
    wrong_options: wrongOptions,
    fact,
    category: record.category,
    source: `/topics/${record.category === "Citizenship" && BANK_VERSION === "topic-bank-v4" ? slugify(record.name) : record.topic.slug}`,
    bankVersion: BANK_VERSION,
  };
}

function firstYear(era = "") {
  const match = String(era).match(/\b(\d{3,4})\b/);
  return match ? Number(match[1]) : 9999;
}

function completeFact(value, answer, variantIndex) {
  let fact = cleanMarkdown(value);
  if (new RegExp(`\\b${escapeRegExp(answer)}\\b`, "i").test(fact)) {
    return ensureSentence(fact);
  }
  if (/^(He|She|It|They)\b/i.test(fact)) {
    return ensureSentence(fact.replace(/^(He|She|It|They)\b/i, answer));
  }
  if (/^(His|Her|Their|Its)\b/i.test(fact)) {
    return ensureSentence(fact.replace(/^(His|Her|Their|Its)\b/i, `${answer}'s`));
  }
  if (/^Accepted USCIS\b/i.test(fact)) {
    return ensureSentence(fact);
  }
  if (/^(The|A|An|By|After|Before|During|In|On|At|Although|When|While|For|As|More|Many|Most|Some|These|This)\b/i.test(fact)) {
    return ensureSentence(fact);
  }

  const answerTokens = answer
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !ANSWER_STOP_WORDS.has(token));
  const firstToken = fact.toLowerCase().match(/^[a-z0-9]+/)?.[0];
  if (firstToken && answerTokens.includes(firstToken)) {
    return ensureSentence(fact);
  }

  const transformations = [
    [/^Born\s+/i, `${answer} was born `],
    [/^Built\s+/i, `${answer} was built `],
    [/^Completed\s+/i, `${answer} was completed `],
    [/^Located\s+/i, `${answer} is located `],
    [/^Created\s+/i, `${answer} was created `],
    [/^Originally\s+/i, `${answer} was originally `],
    [/^Abandoned\s+/i, `${answer} was abandoned `],
    [/^Set\s+/i, `${answer} is set `],
    [/^Grew up\s+/i, `${answer} grew up `],
    [/^Achieved\s+/i, `${answer} achieved `],
    [/^Formed\s+/i, `${answer} formed `],
    [/^Aired\s+/i, `${answer} aired `],
    [/^Directed by\s+/i, `${answer} was directed by `],
    [/^Written by\s+/i, `${answer} was written by `],
    [/^Created by\s+/i, `${answer} was created by `],
    [/^Released in\s+/i, `${answer} was released in `],
    [/^Published in\s+/i, `${answer} was published in `],
    [/^First\s+/i, `${answer} was the first `],
    [/^Stars\s+/i, `${answer} stars `],
    [/^Uses\s+/i, `${answer} uses `],
    [/^Won\s+/i, `${answer} won `],
    [/^Major albums include\s+/i, `${answer}'s major albums include `],
    [/^Closely associated with\s+/i, `${answer} was closely associated with `],
  ];
  for (const [pattern, replacement] of transformations) {
    if (pattern.test(fact)) {
      return ensureSentence(fact.replace(pattern, replacement));
    }
  }
  const fallbacks = [
    `One notable detail about ${answer}: ${fact}`,
    `${answer} has this additional historical detail: ${fact}`,
    `An important source detail about ${answer}: ${fact}`,
  ];
  return ensureSentence(fallbacks[variantIndex % fallbacks.length]);
}

function ensureSentence(value) {
  const sentence = value.replace(/\s+/g, " ").trim().replace(/\.{2,}$/, ".");
  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
}

function varyClueScaffold(clue, variantIndex) {
  const phrases = [
    "matches this description:",
    "is known for the following:",
    "can be recognized from this clue:",
    "is connected to this defining detail:",
    "fits this description:",
  ];
  return clue.replace(
    "can be identified by this detail:",
    phrases[variantIndex % phrases.length]
  );
}

function formatBatchClue(clue, category, variantIndex) {
  if (!BANK_VERSION.startsWith("topic-bank-v")) return clue;

  const noun = NOUNS[category];
  const label = QUESTION_LABELS[category];
  let detail = cleanBatchDetail(clue);

  if (category === "Citizenship") {
    if (BANK_VERSION === "topic-bank-v4") {
      const prompt = clue
        .replace("In a U.S. citizenship civics review, which answer fits this prompt:", "")
        .replace(/[.!?]$/, "")
        .trim();
      return `For the U.S. civics test, which answer responds to this question: ${prompt}?`;
    }
    if (BANK_VERSION === "topic-bank-v3") {
      return clue
        .replace(
          "In a U.S. citizenship civics review, which answer fits this prompt:",
          "For U.S. citizenship practice, choose the answer to this civics prompt:"
        )
        .replace(/[.!?]$/, "?");
    }
    return clue;
  }

  if (detail.startsWith(`${noun} `)) {
    detail = detail.slice(noun.length + 1).trim();
    detail = cleanBatchDetail(detail);
    if (BANK_VERSION === "topic-bank-v4") {
      return buildFourthBatchClue(label, detail, variantIndex);
    }
    return buildQuestionStyleClue(label, detail, variantIndex);
  }

  if (BANK_VERSION === "topic-bank-v4") {
    return `Which ${label} fits this detail: ${lowercaseFirst(detail)}?`;
  }
  return `Which ${label} is connected to this source detail: ${lowercaseFirst(detail)}?`;
}

function buildFourthBatchClue(label, detail, variantIndex) {
  const verbLike = /^(is|was|were|has|had|stars|uses|won|features|became|grew|includes|served|marked|argued|combined|aired|depicts|shows|follows|explores|focuses|began|ended|helped|introduced|released|formed|built|created|published|directed|written|located|known)\b/i.test(detail);
  const templates = verbLike
    ? [
        "Name the {label} that {detail}.",
        "Which {label} {detail}?",
        "Select the {label} that {detail}.",
      ]
    : [
        "Which {label} fits this description: {detail}?",
        "Name the {label} connected to this detail: {detail}.",
        "Select the {label} described here: {detail}.",
      ];
  return templates[variantIndex % templates.length]
    .replace("{label}", label)
    .replace("{detail}", detail);
}

function buildQuestionStyleClue(label, detail, variantIndex) {
  const verbLike = /^(is|was|were|has|had|stars|uses|won|features|became|grew|includes|served|marked|argued|combined|aired|depicts|shows|follows|explores|focuses|began|ended|helped|introduced|inspired|released|formed|built|created|published|directed|written|located|known)\b/i.test(detail);
  const templates = verbLike
    ? [
        "Which {label} {detail}?",
        "What {label} {detail}?",
        "Identify the {label} that {detail}.",
      ]
    : [
        "Which {label} is described by this clue: {detail}?",
        "Choose the {label} connected to this detail: {detail}.",
        "This clue points to what {label}: {detail}?",
      ];
  return templates[variantIndex % templates.length]
    .replace("{label}", label)
    .replace("{detail}", detail);
}

function lowercaseFirst(value) {
  return value ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;
}

function cleanBatchDetail(value) {
  return value
    .replace(/[.!?]$/, "")
    .replace(/^matches this description:\s*/i, "")
    .replace(/^is known for the following:\s*/i, "")
    .replace(/^can be recognized from this clue:\s*/i, "")
    .replace(/^is connected to this defining detail:\s*/i, "")
    .replace(/^fits this description:\s*/i, "")
    .trim();
}

function countByCategory(questions) {
  const counts = {};
  for (const category of CATEGORIES) counts[category] = 0;
  for (const question of questions) {
    const category = resolveCategory(question);
    if (category) counts[category] = (counts[category] ?? 0) + 1;
  }
  return counts;
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
