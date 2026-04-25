"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CONSENT_CHANGE_EVENT,
  readConsent,
  writeConsent,
  type ConsentRecord,
} from "@/lib/consent";

export default function ConsentBanner() {
  // null = still checking, "hidden" = already decided / not to show,
  // "visible" = show the banner.
  const [state, setState] = useState<null | "hidden" | "visible">(null);

  useEffect(() => {
    const rec = readConsent();
    setState(rec ? "hidden" : "visible");

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentRecord | null>).detail;
      // If consent was cleared (from the privacy page), re-show the banner.
      setState(detail ? "hidden" : "visible");
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  if (state !== "visible") return null;

  const accept = () => {
    writeConsent("granted");
    setState("hidden");
  };
  const reject = () => {
    writeConsent("denied");
    setState("hidden");
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[70] flex justify-center p-3 sm:p-5 pointer-events-none"
    >
      <div
        className="pointer-events-auto w-full max-w-3xl bg-[var(--hb-panel)] pixel-border p-4 sm:p-5 flex flex-col gap-3 sm:gap-4"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}
      >
        <div
          className="text-[var(--hb-accent)] text-sm sm:text-base tracking-widest pixel-font"
          style={{ fontFamily: "var(--font-pixel-heading), monospace" }}
        >
          &gt; COOKIES &amp; PRIVACY
        </div>
        <p className="text-[var(--hb-text)] text-base sm:text-lg leading-relaxed">
          We use cookies for aggregate analytics and, in the future, to show
          ads. With your permission we&apos;ll enable Google Analytics and
          advertising cookies. Without it we still load the game, and only
          anonymous signals are sent.{" "}
          <Link
            href="/privacy"
            className="text-[var(--hb-accent)] underline hover:text-[var(--hb-accent-2)]"
          >
            Learn more
          </Link>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <button
            type="button"
            onClick={reject}
            className="border-2 border-[var(--hb-border)] hover:border-[var(--hb-muted)] text-[var(--hb-muted)] hover:text-[var(--hb-text)] px-4 py-2 tracking-widest text-sm pixel-font transition-colors"
            style={{ fontFamily: "var(--font-pixel-heading), monospace" }}
          >
            REJECT ALL
          </button>
          <button
            type="button"
            onClick={accept}
            className="pixel-btn"
          >
            ACCEPT ALL
          </button>
        </div>
      </div>
    </div>
  );
}
