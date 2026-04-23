// Shared slug rule used by both client (in-game LEARN MORE link) and server
// (content loader, sitemap). Must match scripts/normalize-topics.mjs.
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['''`’()]/g, "")
    .replace(/[,.]/g, "")
    .replace(/[\s_]+/g, "-");
}
