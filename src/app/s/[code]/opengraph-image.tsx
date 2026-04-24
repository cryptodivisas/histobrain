import { ImageResponse } from "next/og";
import {
  accuracy,
  decodeShare,
  modeLabel,
  type SharePayload,
} from "@/lib/share";

export const runtime = "edge";
export const alt = "History Brain — shared game result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Hardcoded synthwave-theme palette so the card looks consistent regardless
// of the viewer's theme preference. These mirror :root in globals.css.
const COLORS = {
  bg: "#0f0f1a",
  panel: "#1a1a2e",
  panelAlt: "#232340",
  border: "#2d2d44",
  text: "#e8e8f0",
  muted: "#8888a0",
  accent: "#00ffa3",
  accent2: "#ffcc00",
  accent3: "#ff6ec7",
  accent4: "#b28cff",
  wrong: "#ff3860",
  catLandmarks: "#00ffa3",
  catArt: "#ff6ec7",
  catFigures: "#ffcc00",
  catEvents: "#6ea8ff",
  catDocuments: "#b28cff",
} as const;

const CATEGORY_COLOR: Record<string, string> = {
  Landmarks: COLORS.catLandmarks,
  Art: COLORS.catArt,
  Figures: COLORS.catFigures,
  Events: COLORS.catEvents,
  Documents: COLORS.catDocuments,
};

// Fetch a Google Font as an ArrayBuffer for ImageResponse to embed.
// The css2 endpoint returns CSS pointing at the actual TTF.
async function loadGoogleFont(family: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family
    )}`;
    const cssRes = await fetch(cssUrl, {
      headers: {
        // Google serves TTF only when the UA doesn't advertise woff2 support.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36",
      },
    });
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const match = css.match(
      /src:\s*url\(([^)]+)\)\s*format\(['"]?truetype['"]?\)/
    );
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

function statBlock(label: string, value: string, color: string) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        background: COLORS.bg,
        border: `2px solid ${COLORS.border}`,
        padding: "22px 28px",
        minWidth: 220,
        gap: 8,
      }}
    >
      <span
        style={{
          color: COLORS.muted,
          fontSize: 20,
          letterSpacing: 4,
          textTransform: "uppercase",
          fontFamily: "Press Start 2P, VT323, monospace",
        }}
      >
        {label}
      </span>
      <span
        style={{
          color,
          fontSize: 56,
          fontFamily: "VT323, monospace",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function scoreHeadline(p: SharePayload) {
  if (p.m === "endless") {
    return { big: String(p.er ?? p.r), caption: "ROUNDS SURVIVED" };
  }
  return { big: `${p.r}/${p.t}`, caption: "CORRECT" };
}

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const payload = decodeShare(code);

  const [vt323, pressStart] = await Promise.all([
    loadGoogleFont("VT323"),
    loadGoogleFont("Press+Start+2P"),
  ]);

  // Fallback image if code is invalid — still shows the brand, not broken.
  const safe: SharePayload = payload ?? {
    s: 0,
    r: 0,
    t: 0,
    m: "classic",
    b: 0,
  };

  const head = scoreHeadline(safe);
  const acc = safe.t > 0 ? `${accuracy(safe)}%` : "—";
  const catColor = safe.c ? CATEGORY_COLOR[safe.c] ?? COLORS.accent : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: COLORS.bg,
          // Subtle synthwave gradient on top to add depth.
          backgroundImage: `radial-gradient(circle at 20% 0%, rgba(255,110,199,0.18) 0%, transparent 45%), radial-gradient(circle at 85% 100%, rgba(0,255,163,0.18) 0%, transparent 45%)`,
          padding: 56,
          fontFamily: "VT323, monospace",
          color: COLORS.text,
          position: "relative",
        }}
      >
        {/* Top row: brand + URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: COLORS.accent,
              fontFamily: "Press Start 2P, monospace",
              fontSize: 26,
              letterSpacing: 3,
            }}
          >
            <span style={{ color: COLORS.accent2 }}>&gt;</span>
            HISTORY BRAIN
          </div>
          <div
            style={{
              color: COLORS.muted,
              fontSize: 28,
              letterSpacing: 4,
              display: "flex",
            }}
          >
            historybrain.com
          </div>
        </div>

        {/* Middle: big score + mode badge */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              color: COLORS.muted,
              fontSize: 28,
              letterSpacing: 6,
              textTransform: "uppercase",
              fontFamily: "Press Start 2P, monospace",
              display: "flex",
            }}
          >
            {head.caption}
          </div>
          <div
            style={{
              color: COLORS.accent2,
              fontSize: 240,
              lineHeight: 1,
              fontFamily: "VT323, monospace",
              display: "flex",
              textShadow: "0 0 40px rgba(255,204,0,0.35)",
            }}
          >
            {head.big}
          </div>

          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 4,
            }}
          >
            <span
              style={{
                padding: "10px 20px",
                border: `3px solid ${COLORS.accent}`,
                color: COLORS.accent,
                fontSize: 22,
                letterSpacing: 3,
                fontFamily: "Press Start 2P, monospace",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {modeLabel(safe)}
            </span>
            {safe.c && catColor ? (
              <span
                style={{
                  padding: "10px 20px",
                  border: `3px solid ${catColor}`,
                  color: catColor,
                  fontSize: 22,
                  letterSpacing: 3,
                  fontFamily: "Press Start 2P, monospace",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                {safe.c}
              </span>
            ) : null}
          </div>
        </div>

        {/* Bottom row: stat tiles + CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", gap: 16 }}>
            {statBlock(
              "Score",
              safe.s.toLocaleString(),
              COLORS.accent
            )}
            {statBlock("Accuracy", acc, COLORS.accent2)}
            {statBlock("Best Combo", `x${safe.b}`, COLORS.accent3)}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
              color: COLORS.text,
              fontSize: 36,
              fontFamily: "VT323, monospace",
              textAlign: "right",
              lineHeight: 1.1,
              maxWidth: 360,
            }}
          >
            <span style={{ color: COLORS.accent3 }}>Can you</span>
            <span style={{ color: COLORS.accent2, fontSize: 48 }}>
              beat me?
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(vt323
          ? [
              {
                name: "VT323",
                data: vt323,
                style: "normal" as const,
                weight: 400 as const,
              },
            ]
          : []),
        ...(pressStart
          ? [
              {
                name: "Press Start 2P",
                data: pressStart,
                style: "normal" as const,
                weight: 400 as const,
              },
            ]
          : []),
      ],
    }
  );
}
