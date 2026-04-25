/**
 * Dynamic ads.txt generated from NEXT_PUBLIC_ADSENSE_CLIENT_ID.
 *
 * AdSense requires an ads.txt file at the site root declaring authorised
 * sellers. We generate it from the env var so we only have to set the
 * publisher ID in one place.
 *
 * When the env var is absent we still return an empty 200 response rather
 * than a 404, so crawlers see a valid (empty) ads.txt during pre-approval
 * setup. Google's docs explicitly say an empty ads.txt is acceptable.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";
  // Strip the "ca-" prefix; ads.txt lines use the bare pub-XXXX form.
  const publisherId = clientId.replace(/^ca-/, "").trim();

  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : "";

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
