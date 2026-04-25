"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_CHANGE_EVENT,
  clearConsent,
  readConsent,
  writeConsent,
  type ConsentRecord,
} from "@/lib/consent";

function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function ManageConsent() {
  const [rec, setRec] = useState<ConsentRecord | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRec(readConsent());
    setReady(true);
    const onChange = (e: Event) => {
      setRec((e as CustomEvent<ConsentRecord | null>).detail ?? null);
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  if (!ready) {
    return (
      <p className="text-[var(--hb-muted)] text-sm">Loading consent status…</p>
    );
  }

  const status = rec
    ? rec.mode === "granted"
      ? `Granted on ${formatDate(rec.ts)}`
      : `Rejected on ${formatDate(rec.ts)}`
    : "Not decided yet";

  return (
    <div className="flex flex-col gap-3 bg-[var(--hb-panel-alt)] border-2 border-[var(--hb-border)] p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-col">
          <span
            className="text-xs tracking-widest text-[var(--hb-muted)]"
            style={{ fontFamily: "var(--font-pixel-heading), monospace" }}
          >
            CURRENT STATUS
          </span>
          <span className="text-[var(--hb-text)] text-base">{status}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => writeConsent("granted")}
          className="border-2 border-[var(--hb-accent)] text-[var(--hb-accent)] hover:bg-[var(--hb-accent)] hover:text-[var(--hb-bg)] px-3 py-2 text-xs tracking-widest transition-colors"
          style={{ fontFamily: "var(--font-pixel-heading), monospace" }}
        >
          ACCEPT ALL
        </button>
        <button
          type="button"
          onClick={() => writeConsent("denied")}
          className="border-2 border-[var(--hb-border)] text-[var(--hb-muted)] hover:border-[var(--hb-wrong)] hover:text-[var(--hb-wrong)] px-3 py-2 text-xs tracking-widest transition-colors"
          style={{ fontFamily: "var(--font-pixel-heading), monospace" }}
        >
          REJECT ALL
        </button>
        <button
          type="button"
          onClick={clearConsent}
          className="border-2 border-[var(--hb-border)] text-[var(--hb-muted)] hover:border-[var(--hb-accent-2)] hover:text-[var(--hb-accent-2)] px-3 py-2 text-xs tracking-widest transition-colors"
          style={{ fontFamily: "var(--font-pixel-heading), monospace" }}
        >
          RE-ASK ME
        </button>
      </div>
    </div>
  );
}
