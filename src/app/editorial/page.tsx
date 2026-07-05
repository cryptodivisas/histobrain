import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Editorial Standards",
  description:
    "How History Brain researches, reviews, updates, illustrates, and corrects its trivia questions and educational articles.",
  alternates: { canonical: "/editorial" },
};

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

export default function EditorialPage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 pixel-font">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <PageHeader />
        <div className="w-full h-1 bg-linear-to-r from-transparent via-[var(--hb-accent)] to-transparent opacity-60" />

        <article className="bg-[var(--hb-panel)] pixel-border p-6 sm:p-8 flex flex-col gap-6 text-[var(--hb-text)]">
          <div className="flex flex-col gap-3">
            <span className="text-[var(--hb-muted)] text-xs tracking-widest" style={hf}>TRANSPARENCY LOG</span>
            <h1 className="text-[var(--hb-accent)] text-2xl tracking-widest" style={hf}>&gt; EDITORIAL STANDARDS</h1>
            <p className="text-lg leading-relaxed">
              History Brain turns complex subjects into short clues, answer facts, and readable articles. Compression is useful only when it stays accurate, contextual, and open to correction.
            </p>
          </div>

          <Standard title="Source priority">
            Primary documents and official archives come first when available, followed by museums, universities, government institutions, and established reference publications.
          </Standard>
          <Standard title="Writing and review">
            Questions and articles are written and maintained by Henry Montilla. New material is checked for chronology, answer ambiguity, internal consistency, and whether each clue fairly supports its answer.
          </Standard>
          <Standard title="Images and licenses">
            Historical images are primarily drawn from Wikimedia Commons and other openly licensed or public-domain collections, subject to their respective licenses.
          </Standard>
          <Standard title="Dates and revisions">
            Topic pages display their latest page-update date. Changes may include factual corrections, expanded context, clearer wording, or improved sourcing.
          </Standard>
          <Standard title="Corrections">
            If something looks wrong or incomplete, send the topic title, disputed passage, and a reliable supporting source through the correction channel.
          </Standard>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t-2 border-[var(--hb-border)]">
            <Link href="/contact" className="pixel-btn text-center">&gt; REPORT A CORRECTION</Link>
            <Link href="/topics" className="pixel-btn text-center" style={{ background: "var(--hb-accent-2)" }}>&gt; BROWSE THE ARCHIVE</Link>
          </div>
        </article>
        <SiteFooter />
      </div>
    </div>
  );
}

function Standard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[var(--hb-accent-2)] text-sm tracking-widest" style={hf}>&gt; {title.toUpperCase()}</h2>
      <p className="text-base leading-relaxed">{children}</p>
    </section>
  );
}
