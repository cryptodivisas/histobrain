// Shared slug rule used by both client (in-game LEARN MORE link) and server
// (content loader, sitemap). Keep scripts/expand-question-bank.mjs aligned.
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/["'`\u00b4\u2018\u2019\u201c\u201d()*]/g, "")
    .replace(/[:,.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
