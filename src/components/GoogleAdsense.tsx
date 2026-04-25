import Script from "next/script";

/**
 * AdSense loader.
 *
 * Reads NEXT_PUBLIC_ADSENSE_CLIENT_ID (format: ca-pub-XXXXXXXXXXXXXXXX).
 * Renders nothing when the env var is unset, so this is safe to ship before
 * AdSense approval.
 *
 * Consent Mode v2 is wired in GoogleAnalytics.tsx (ad_storage, ad_user_data,
 * ad_personalization all denied by default). adsbygoogle respects those
 * signals automatically; no extra glue is needed here.
 */
export default function GoogleAdsense() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  if (!clientId) return null;
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <Script
      id="adsense-loader"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
