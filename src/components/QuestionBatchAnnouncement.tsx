"use client";

import { useEffect, useRef, useState } from "react";
import { CONSENT_CHANGE_EVENT, readConsent } from "@/lib/consent";

const STORAGE_KEY = "hb_announcement_90_questions_v1";
const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

interface Props {
  enabled: boolean;
  onPlay: () => void;
  onCategories: () => void;
}

export default function QuestionBatchAnnouncement({ enabled, onPlay, onCategories }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const showIfNew = () => {
      if (!readConsent()) return;
      try {
        if (window.localStorage.getItem(STORAGE_KEY)) return;
      } catch {
        // The announcement can still be shown when browser storage is unavailable.
      }
      setVisible(true);
    };

    const timer = window.setTimeout(showIfNew, 350);
    window.addEventListener(CONSENT_CHANGE_EVENT, showIfNew);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CONSENT_CHANGE_EVENT, showIfNew);
    };
  }, [enabled]);

  useEffect(() => {
    if (visible && enabled && !dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, [visible, enabled]);

  if (!visible || !enabled) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      // Dismissal still works for this visit when storage is unavailable.
    }
    if (dialogRef.current?.open) dialogRef.current.close();
    setVisible(false);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="batch-announcement-title"
      aria-describedby="batch-announcement-description"
      onClose={dismiss}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
      className="m-auto w-[min(92vw,36rem)] max-h-[90dvh] overflow-y-auto border-2 border-[var(--hb-accent)] bg-[var(--hb-panel)] p-0 text-[var(--hb-text)] backdrop:bg-black/75"
      style={{ boxShadow: "0 0 40px rgba(var(--hb-glow2), 0.28)" }}
    >
      <div className="border-b-2 border-[var(--hb-border)] bg-[var(--hb-panel-alt)] px-5 py-4 flex items-center justify-between gap-4">
        <span className="text-[10px] sm:text-xs tracking-widest text-[var(--hb-accent-2)]" style={hf}>
          ✦ NEW CONTENT DROP
        </span>
        <button
          type="button"
          autoFocus
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="shrink-0 border-2 border-[var(--hb-border)] px-2 py-1 text-xs text-[var(--hb-muted)] hover:border-[var(--hb-accent)] hover:text-[var(--hb-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hb-accent)] cursor-pointer"
          style={hf}
        >
          X
        </button>
      </div>

      <div className="p-5 sm:p-8 text-center">
        <div className="mb-2 text-5xl sm:text-7xl leading-none text-[var(--hb-accent)]" style={hf}>
          +90
        </div>
        <h2
          id="batch-announcement-title"
          className="text-sm sm:text-lg leading-relaxed tracking-widest text-[var(--hb-text)]"
          style={hf}
        >
          NEW QUESTIONS
        </h2>
        <p id="batch-announcement-description" className="mt-4 text-base sm:text-xl leading-snug text-[var(--hb-muted)]">
          We added 90 fresh questions to History Brain—10 in every category. Ready to see what you know?
        </p>

        <div className="my-6 grid grid-cols-2 gap-2 text-left sm:gap-3">
          <div className="border-2 border-[var(--hb-border)] bg-[var(--hb-panel-alt)] p-3">
            <span className="block text-lg text-[var(--hb-accent-2)]" style={hf}>09</span>
            <span className="text-sm text-[var(--hb-muted)]">categories</span>
          </div>
          <div className="border-2 border-[var(--hb-border)] bg-[var(--hb-panel-alt)] p-3">
            <span className="block text-lg text-[var(--hb-accent-3)]" style={hf}>10</span>
            <span className="text-sm text-[var(--hb-muted)]">new questions each</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => { dismiss(); onPlay(); }}
            className="pixel-btn flex-1 text-xs! sm:text-sm!"
          >
            &gt; PLAY A ROUND
          </button>
          <button
            type="button"
            onClick={() => { dismiss(); onCategories(); }}
            className="flex-1 border-2 border-[var(--hb-accent)] px-3 py-3 text-[10px] sm:text-xs text-[var(--hb-accent)] hover:bg-[var(--hb-panel-alt)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hb-accent)] cursor-pointer"
            style={hf}
          >
            CHOOSE CATEGORY
          </button>
        </div>
      </div>
    </dialog>
  );
}
