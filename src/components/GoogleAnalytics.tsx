import Script from "next/script";
import { CONSENT_STORAGE_KEY, CONSENT_TTL_MS } from "@/lib/consent";

export const GA_MEASUREMENT_ID = "G-WJLBZ09E3D";

/**
 * Google Analytics 4 loader wired for Consent Mode v2.
 *
 * All ad_* and analytics_storage signals start as "denied". GA will still
 * send cookieless signals while analytics storage is denied.
 *
 * When the user accepts via our ConsentBanner, we push
 *   gtag('consent', 'update', { ...all granted })
 * and GA/AdSense switch to full cookie mode from that point onward.
 */
export default function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script id="ga-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted',
            wait_for_update: 500
          });
          try {
            var raw = window.localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)});
            if (raw) {
              var rec = JSON.parse(raw);
              if (rec && rec.mode === 'granted' && Number.isFinite(rec.ts) &&
                  Date.now() - rec.ts <= ${CONSENT_TTL_MS}) {
                gtag('consent', 'update', {
                  ad_storage: 'granted',
                  ad_user_data: 'granted',
                  ad_personalization: 'granted',
                  analytics_storage: 'granted'
                });
              }
            }
          } catch (e) { /* ignore */ }
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
