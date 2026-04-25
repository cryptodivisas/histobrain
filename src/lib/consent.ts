/**
 * Consent Mode v2 helpers for History Brain.
 *
 * We maintain a tiny first-party record of the user's choice in localStorage
 * and translate that into Google Consent Mode v2 signals via gtag().
 *
 * Default is *denied* for everything that matters (ad_*, analytics_storage).
 * GA/AdSense will still fire cookie-less pings in that mode, which is what
 * Consent Mode v2 is designed for.
 */

export type ConsentChoice = "granted" | "denied";

export interface ConsentRecord {
  mode: ConsentChoice;
  ts: number;
}

export const CONSENT_STORAGE_KEY = "hb_consent_v1";

/** GDPR recommends re-asking at least every 13 months. */
export const CONSENT_TTL_MS = 1000 * 60 * 60 * 24 * 30 * 13;

export const CONSENT_CHANGE_EVENT = "hb:consent-change";

export function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (parsed?.mode !== "granted" && parsed?.mode !== "denied") return null;
    if (typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > CONSENT_TTL_MS) return null;
    return { mode: parsed.mode, ts: parsed.ts };
  } catch {
    return null;
  }
}

export function writeConsent(mode: ConsentChoice) {
  if (typeof window === "undefined") return;
  const rec: ConsentRecord = { mode, ts: Date.now() };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(rec));
  } catch {
    /* storage may be blocked — ignore */
  }
  applyConsent(mode);
  window.dispatchEvent(
    new CustomEvent<ConsentRecord>(CONSENT_CHANGE_EVENT, { detail: rec })
  );
}

export function clearConsent() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  applyConsent("denied");
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: null }));
}

/** Push a consent update into gtag's dataLayer, if gtag is present. */
export function applyConsent(mode: ConsentChoice) {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };
  if (!w.gtag) {
    // gtag may not be loaded yet (dev mode, ad blocker, …). Bail.
    return;
  }
  w.gtag("consent", "update", {
    ad_storage: mode,
    ad_user_data: mode,
    ad_personalization: mode,
    analytics_storage: mode,
  });
}
