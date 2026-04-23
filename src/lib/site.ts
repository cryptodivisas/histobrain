// Central place for the site's canonical origin. Prefers NEXT_PUBLIC_SITE_URL
// when set (useful for preview deploys), falls back to the production domain.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://histobrain.com"
).replace(/\/+$/, "");
