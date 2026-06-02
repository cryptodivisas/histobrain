import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { SiteFooter } from "@/components/SiteFooter";

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 pixel-font">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <PageHeader />

        <div className="w-full h-1 bg-linear-to-r from-transparent via-[var(--hb-accent)] to-transparent opacity-60" />

        <main className="relative overflow-hidden bg-[var(--hb-panel)] pixel-border p-6 sm:p-10 text-[var(--hb-text)] scanlines">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(var(--hb-glow2),0.55),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(var(--hb-glow1),0.45),transparent_32%)]" />
          <div className="relative flex flex-col items-center gap-7 text-center">
            <div className="flex flex-col gap-2">
              <p
                className="text-[var(--hb-wrong)] text-xs sm:text-sm tracking-widest"
                style={hf}
              >
                &gt; ARCHIVE_GLITCH_DETECTED
              </p>
              <h1
                className="glitch-text text-[var(--hb-accent)] text-5xl sm:text-7xl tracking-widest"
                style={hf}
              >
                404
              </h1>
            </div>

            <div className="w-full max-w-2xl bg-[var(--hb-bg)] pixel-border p-5 sm:p-7 flex flex-col gap-4">
              <h2
                className="text-[var(--hb-accent-2)] text-lg sm:text-2xl tracking-widest"
                style={hf}
              >
                &gt; PAGE NOT FOUND
              </h2>
              <p className="text-base sm:text-xl leading-relaxed text-[var(--hb-text)]">
                This artifact is missing from the timeline. The page may have
                moved, been renamed, or never existed in the History Brain
                archive.
              </p>
              <p
                className="text-[var(--hb-muted)] text-xs sm:text-sm tracking-widest leading-relaxed"
                style={hf}
              >
                TRY A NEW ROUTE, RETURN TO THE GAME, OR BROWSE THE TOPIC
                LIBRARY.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
              <Link href="/" className="pixel-btn flex-1 text-center">
                &gt; Play History Brain
              </Link>
              <Link
                href="/topics"
                className="flex-1 border-2 border-[var(--hb-border)] hover:border-[var(--hb-accent)] text-[var(--hb-accent)] px-4 py-3 transition-colors text-center uppercase tracking-widest"
                style={hf}
              >
                &gt; Browse Topics
              </Link>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
