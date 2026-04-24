// Share payload for the end-of-game "Share your score" card.
//
// The payload is encoded into a short base64url string used as the [code]
// segment of /s/[code]. Kept compact so shared links stay readable.

import type { Category } from "@/lib/categories";

export type ShareMode = "classic" | "daily" | "category" | "endless";

export interface SharePayload {
  /** Total score (points). */
  s: number;
  /** Correct answers (for classic/daily/category) or survived rounds (endless). */
  r: number;
  /** Total questions. 0 means "not applicable" (e.g. endless). */
  t: number;
  /** Game mode. */
  m: ShareMode;
  /** Category key — only present for mode "category". */
  c?: Category;
  /** Best combo (x-multiplier peak). */
  b: number;
  /** Endless rounds reached — only for mode "endless". */
  er?: number;
  /** Daily number — only for mode "daily". */
  dn?: number;
}

// ---------- Encoding ----------

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(binary, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): Uint8Array | null {
  try {
    const b64 = code
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(code.length / 4) * 4, "=");
    const binary =
      typeof atob === "function"
        ? atob(b64)
        : Buffer.from(b64, "base64").toString("binary");
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

export function encodeShare(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return toBase64Url(bytes);
}

export function decodeShare(code: string): SharePayload | null {
  const bytes = fromBase64Url(code);
  if (!bytes) return null;
  try {
    const json = new TextDecoder().decode(bytes);
    const obj = JSON.parse(json) as Partial<SharePayload>;
    if (
      typeof obj.s !== "number" ||
      typeof obj.r !== "number" ||
      typeof obj.t !== "number" ||
      typeof obj.b !== "number" ||
      !obj.m ||
      !["classic", "daily", "category", "endless"].includes(obj.m)
    ) {
      return null;
    }
    return obj as SharePayload;
  } catch {
    return null;
  }
}

// ---------- Display helpers ----------

export function modeLabel(p: SharePayload): string {
  switch (p.m) {
    case "classic":
      return "Classic";
    case "daily":
      return p.dn ? `Daily #${p.dn}` : "Daily";
    case "category":
      return p.c ? `${p.c} Mode` : "Category Mode";
    case "endless":
      return "Endless Mode";
  }
}

export function accuracy(p: SharePayload): number {
  if (p.t <= 0) return 0;
  return Math.round((p.r / p.t) * 100);
}

/**
 * Short one-line summary used for social share text and the og:description
 * field (which shows up as the preview caption on some platforms).
 */
export function summaryLine(p: SharePayload): string {
  if (p.m === "endless") {
    return `I survived ${p.er ?? p.r} rounds in Endless Mode on History Brain — can you beat me?`;
  }
  return `I scored ${p.s.toLocaleString()} points (${p.r}/${p.t}) on ${modeLabel(
    p
  )} — can you beat me?`;
}

/**
 * Pithy title used for og:title. Keeps under ~55 chars for Twitter.
 */
export function titleLine(p: SharePayload): string {
  if (p.m === "endless") {
    return `${p.er ?? p.r} rounds · History Brain`;
  }
  return `${p.r}/${p.t} on ${modeLabel(p)} · History Brain`;
}
