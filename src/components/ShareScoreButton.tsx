"use client";

import { useCallback, useState } from "react";
import { encodeShare, summaryLine, type SharePayload } from "@/lib/share";

interface Props {
  payload: SharePayload;
  /** Optional click sound hook so the button matches other pixel buttons. */
  onClick?: () => void;
}

/**
 * "Share your score" button. Uses the Web Share API on supporting browsers
 * (native share sheet on mobile) and falls back to copying the link to the
 * clipboard on desktop.
 */
export function ShareScoreButton({ payload, onClick }: Props) {
  const [state, setState] = useState<"idle" | "shared" | "copied" | "error">(
    "idle"
  );

  const handleShare = useCallback(async () => {
    onClick?.();
    const code = encodeShare(payload);
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/s/${code}`;
    const text = summaryLine(payload);

    const shareData: ShareData = {
      title: "History Brain",
      text,
      url,
    };

    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        (typeof navigator.canShare !== "function" ||
          navigator.canShare(shareData))
      ) {
        await navigator.share(shareData);
        setState("shared");
      } else if (
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setState("copied");
      } else {
        setState("error");
      }
    } catch (err: unknown) {
      // Users cancelling the native share sheet throw AbortError — treat as noop.
      if (err instanceof Error && err.name === "AbortError") {
        setState("idle");
        return;
      }
      setState("error");
    } finally {
      setTimeout(() => setState("idle"), 2000);
    }
  }, [payload, onClick]);

  const label =
    state === "shared"
      ? "> Shared!"
      : state === "copied"
      ? "> Link Copied!"
      : state === "error"
      ? "> Try Again"
      : "> Share Score";

  return (
    <button
      onClick={handleShare}
      className="pixel-btn"
      style={{ background: "var(--hb-accent-3)" }}
      aria-label="Share your History Brain score"
    >
      {label}
    </button>
  );
}
