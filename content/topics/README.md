# Topic content

One Markdown file per unique topic from `src/data/questions.json` (both `name`
and `wrong_options[].name`).

## File naming

`<slug>.md` where slug is:
- lowercase
- spaces → hyphens
- apostrophes, commas, parentheses stripped
- diacritics kept as-is

Examples:
- `William Shakespeare` → `william-shakespeare.md`
- `USS Arizona (BB-39)` → `uss-arizona.md`
- `Hadrian's Wall` → `hadrians-wall.md`

## File format

```markdown
---
title: William Shakespeare
era: 1564–1616
summary: English playwright and poet, widely regarded as the greatest writer in the English language.
---

## Overview
…

## [Section 2]
…

## Legacy
…

## Did You Know?
- …
- …
- …
```

## Guidelines

- ~300–600 words total
- `summary`: one sentence, max ~160 chars (used as meta description)
- `era`: date, range, or century ("1889", "c. 2560 BC", "19th century", "1914–1918", "Ongoing")
- 3–5 body sections
- Always end with `## Did You Know?` bullet list (3–5 items)
