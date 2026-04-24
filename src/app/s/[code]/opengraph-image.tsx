import { ImageResponse } from "next/og";
import {
  accuracy,
  decodeShare,
  modeLabel,
  type SharePayload,
} from "@/lib/share";

export const alt = "History Brain — shared game result";
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
  catLandmarks: "#00ffa3",
  catArt: "#ff6ec7",
  catFigures: "#ffcc00",
  catEvents: "#6ea8ff",
  catDocuments: "#b28cff",
};

const CATEGORY_COLOR: Record<string, string> = {
  Landmarks: COLORS.catLandmarks,
  Art: COLORS.catArt,
  Figures: COLORS.catFigures,
  Events: COLORS.catEvents,
  Documents: COLORS.catDocuments,
};

function scoreHeadline(p: SharePayload) {
  if (p.m === "endless") {
    return { big: String(p.er ?? p.r), caption: "ROUNDS SURVIVED" };
  }
  return { big: `${p.r}/${p.t}`, caption: "CORRECT" };
}

function Tile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: COLORS.bg,
        border: `2px solid ${COLORS.border}`,
        padding: "20px 28px",
        minWidth: 200,
      }}
    >
      <div
        style={{
          display: "flex",
          color: COLORS.muted,
          fontSize: 16,
          letterSpacing: 3,
          marginBottom: 12,
          fontFamily: "Press Start 2P",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          color,
          fontSize: 52,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const payload = decodeShare(code);

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
          padding: 56,
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
              fontSize: 36,
              letterSpacing: 4,
              fontFamily: "Press Start 2P",
            }}
          >
            HISTORY BRAIN
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

        {/* Middle */}
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
              color: COLORS.muted,
              fontSize: 24,
              letterSpacing: 6,
              marginBottom: 12,
              fontFamily: "Press Start 2P",
            }}
          >
            {head.caption}
          </div>
          <div
            style={{
              display: "flex",
              color: COLORS.accent2,
              fontSize: 220,
              lineHeight: 1,
            }}
          >
            {head.big}
          </div>
          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "12px 20px",
                border: `3px solid ${COLORS.accent}`,
                color: COLORS.accent,
                fontSize: 20,
                letterSpacing: 3,
                fontFamily: "Press Start 2P",
              }}
            >
              {modeLabel(safe).toUpperCase()}
            </div>
            {safe.c && catColor ? (
              <div
                style={{
                  display: "flex",
                  padding: "12px 20px",
                  border: `3px solid ${catColor}`,
                  color: catColor,
                  fontSize: 20,
                  letterSpacing: 3,
                  fontFamily: "Press Start 2P",
                }}
              >
                {safe.c.toUpperCase()}
              </div>
            ) : null}
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", gap: 16 }}>
            <Tile
              label="SCORE"
              value={safe.s.toLocaleString()}
              color={COLORS.accent}
            />
            <Tile label="ACCURACY" value={acc} color={COLORS.accent2} />
            <Tile
              label="BEST COMBO"
              value={`x${safe.b}`}
              color={COLORS.accent3}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              color: COLORS.accent3,
              fontSize: 26,
              lineHeight: 1.4,
              fontFamily: "Press Start 2P",
            }}
          >
            <div style={{ display: "flex" }}>Can you</div>
            <div
              style={{
                display: "flex",
                color: COLORS.accent2,
                fontSize: 34,
              }}
            >
              beat me?
            </div>
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
