import { ImageResponse } from "next/og";

export const alt = "History Brain — The Retro History Trivia Game";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function siteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://histobrain.com";
}

async function tryLoadFont(fileName: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(`${siteOrigin()}/fonts/${fileName}`);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

const COLORS = {
  bg: "#0f0f1a",
  panel: "#1a1a2e",
  border: "#2d2d44",
  text: "#e8e8f0",
  muted: "#8888a0",
  accent: "#00ffa3",
  accent2: "#ffcc00",
  accent3: "#ff6ec7",
  accent4: "#b28cff",
};

type Mode = {
  title: string;
  blurb: string;
  color: string;
};

const MODES: Mode[] = [
  {
    title: "CLASSIC",
    blurb: "5 random questions. Build combos for massive scores.",
    color: COLORS.accent2,
  },
  {
    title: "DAILY",
    blurb: "Everyone gets the same 5 today. Share your result.",
    color: COLORS.accent,
  },
  {
    title: "CATEGORY",
    blurb: "Pick your area — Landmarks, Art, Figures, Events, Documents.",
    color: COLORS.accent3,
  },
  {
    title: "ENDLESS",
    blurb: "Survive as long as you can. One wrong answer ends it.",
    color: COLORS.accent4,
  },
];

function ModeCard({ mode }: { mode: Mode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: COLORS.panel,
        border: `3px solid ${COLORS.border}`,
        padding: "22px 26px",
        width: 500,
        height: 130,
      }}
    >
      <div
        style={{
          display: "flex",
          color: mode.color,
          fontSize: 26,
          letterSpacing: 3,
          fontFamily: "Press Start 2P",
          marginBottom: 14,
        }}
      >
        &gt; {mode.title}
      </div>
      <div
        style={{
          display: "flex",
          color: COLORS.text,
          fontSize: 24,
          lineHeight: 1.25,
          fontFamily: "VT323",
        }}
      >
        {mode.blurb}
      </div>
    </div>
  );
}

export default async function Image() {
  const [pressStart, vt323] = await Promise.all([
    tryLoadFont("PressStart2P-Regular.ttf"),
    tryLoadFont("VT323-Regular.ttf"),
  ]);

  const fonts: {
    name: string;
    data: ArrayBuffer;
    style: "normal";
    weight: 400;
  }[] = [];
  if (pressStart) {
    fonts.push({
      name: "Press Start 2P",
      data: pressStart,
      style: "normal",
      weight: 400,
    });
  }
  if (vt323) {
    fonts.push({ name: "VT323", data: vt323, style: "normal", weight: 400 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: COLORS.bg,
          padding: "48px 56px",
          color: COLORS.text,
          fontFamily: "VT323",
        }}
      >
        {/* Top row */}
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
              color: COLORS.accent,
              fontSize: 38,
              letterSpacing: 4,
              fontFamily: "Press Start 2P",
            }}
          >
            HISTORY_BRAIN
          </div>
          <div
            style={{
              display: "flex",
              color: COLORS.muted,
              fontSize: 22,
              letterSpacing: 3,
              fontFamily: "Press Start 2P",
            }}
          >
            historybrain.com
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              color: COLORS.accent2,
              fontSize: 44,
              letterSpacing: 4,
              fontFamily: "Press Start 2P",
              textAlign: "center",
            }}
          >
            RETRO HISTORY TRIVIA
          </div>
          <div
            style={{
              display: "flex",
              color: COLORS.muted,
              fontSize: 28,
              marginTop: 10,
              fontFamily: "VT323",
            }}
          >
            Art · Landmarks · Events · Figures · Documents
          </div>
        </div>

        {/* Mode grid 2x2 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 16 }}>
            <ModeCard mode={MODES[0]} />
            <ModeCard mode={MODES[1]} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <ModeCard mode={MODES[2]} />
            <ModeCard mode={MODES[3]} />
          </div>
        </div>

        {/* Bottom caption */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              color: COLORS.accent,
              fontSize: 20,
              letterSpacing: 6,
              fontFamily: "Press Start 2P",
            }}
          >
            PLAY FREE · NO SIGN-UP · BROWSER ONLY
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    }
  );
}
