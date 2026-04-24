import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  accuracy,
  decodeShare,
  modeLabel,
  summaryLine,
  titleLine,
  type SharePayload,
} from "@/lib/share";
import { CATEGORY_COLORS } from "@/lib/categories";

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

type Params = Promise<{ code: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { code } = await params;
  const payload = decodeShare(code);
  if (!payload) {
    return {
      title: "Shared Score · History Brain",
      description: "A History Brain game result.",
      robots: { index: false, follow: false },
    };
  }
  const title = titleLine(payload);
  const description = summaryLine(payload);
  return {
    title,
    description,
    alternates: { canonical: `/s/${code}` },
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: false, follow: true },
  };
}

function statTile(label: string, value: string, accent: string) {
  return (
    <div className="bg-[var(--hb-bg)] p-3 flex flex-col gap-1">
      <div className="text-[10px] text-[var(--hb-muted)] tracking-widest uppercase">
        {label}
      </div>
      <div className="text-lg" style={{ ...hf, color: accent }}>
        {value}
      </div>
    </div>
  );
}

function scoreHeadline(p: SharePayload): { big: string; caption: string } {
  if (p.m === "endless") {
    return {
      big: `${p.er ?? p.r}`,
      caption: "rounds survived",
    };
  }
  return { big: `${p.r}/${p.t}`, caption: "questions" };
}

export default async function SharePage({ params }: { params: Params }) {
  const { code } = await params;
  const payload = decodeShare(code);
  if (!payload) notFound();

  const head = scoreHeadline(payload);
  const acc = payload.t > 0 ? `${accuracy(payload)}%` : "—";
  const comboText = `x${payload.b}`;
  const catColor = payload.c ? CATEGORY_COLORS[payload.c] : undefined;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 pixel-font">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <PageHeader />

        <div className="w-full h-1 bg-linear-to-r from-transparent via-[var(--hb-accent)] to-transparent opacity-60" />

        <article className="bg-[var(--hb-panel)] pixel-border p-6 sm:p-10 flex flex-col items-center gap-6 text-[var(--hb-text)] text-center">
          <h1
            className="text-[var(--hb-accent)] text-xl sm:text-2xl tracking-widest"
            style={hf}
          >
            &gt; SHARED SCORE
          </h1>

          <div className="flex flex-col items-center gap-2">
            <div
              className="text-6xl sm:text-7xl text-[var(--hb-accent-2)]"
              style={hf}
            >
              {head.big}
            </div>
            <div className="text-xs sm:text-sm text-[var(--hb-muted)] tracking-widest uppercase">
              {head.caption}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-center">
            <span
              className="px-3 py-1 text-[10px] tracking-widest border-2"
              style={{
                ...hf,
                borderColor: "var(--hb-accent)",
                color: "var(--hb-accent)",
              }}
            >
              {modeLabel(payload).toUpperCase()}
            </span>
            {payload.c && catColor ? (
              <span
                className="px-3 py-1 text-[10px] tracking-widest border-2"
                style={{
                  ...hf,
                  borderColor: catColor,
                  color: catColor,
                }}
              >
                {payload.c.toUpperCase()}
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-3 w-full max-w-md">
            {statTile("Score", payload.s.toLocaleString(), "var(--hb-accent)")}
            {statTile("Accuracy", acc, "var(--hb-accent-2)")}
            {statTile("Best Combo", comboText, "var(--hb-accent-3)")}
          </div>

          <p className="text-[var(--hb-text)] text-base sm:text-lg mt-2 max-w-lg">
            Think you can do better? Play History Brain and see where you land.
          </p>

          <Link
            href="/"
            className="pixel-btn"
            style={{ background: "var(--hb-accent-2)" }}
          >
            &gt; Play History Brain
          </Link>
        </article>

        <SiteFooter />
      </div>
    </div>
  );
}
