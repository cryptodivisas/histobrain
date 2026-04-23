import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "About · History Brain",
  description:
    "History Brain is a free pixel-art trivia game that teaches world history one image at a time. Learn about the people, places, events and documents that shaped our world.",
  alternates: { canonical: "/about" },
};

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 pixel-font">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <PageHeader />

        <div className="w-full h-1 bg-linear-to-r from-transparent via-[var(--hb-accent)] to-transparent opacity-60" />

        <article className="bg-[var(--hb-panel)] pixel-border p-6 sm:p-8 flex flex-col gap-5 text-[var(--hb-text)]">
          <h1
            className="text-[var(--hb-accent)] text-2xl tracking-widest"
            style={hf}
          >
            &gt; ABOUT HISTORY BRAIN
          </h1>

          <Section title="What It Is">
            <p>
              History Brain is a free, browser-based trivia game that turns
              world history into a fast, visual puzzle. Every round shows you
              three blurred images — a landmark, a work of art, a historical
              figure, an event or a document — and asks you to guess which one
              matches the clue. Guess right, the image sharpens and a short
              explanation unlocks. Guess wrong, you lose a life but learn the
              answer anyway.
            </p>
            <p>
              There are no accounts, no ads during your first session, no
              sign-ups, and nothing to install. Open the page, play a round,
              close the tab. Your progress is saved locally on your device.
            </p>
          </Section>

          <Section title="Why It Exists">
            <p>
              Most history content online is either a Wikipedia wall-of-text or
              a 10-minute YouTube video. Neither respects your time when you
              just want to remember <em>which</em> century Machu Picchu was
              built in, or <em>who</em> actually painted{" "}
              <em>The Persistence of Memory</em>. History Brain is designed for
              curious minds who want to learn something real in 30 seconds and
              then go deeper only if they want to.
            </p>
            <p>
              Every correct answer links to a full, hand-written topic article
              on this site covering the subject&apos;s background, major
              moments, legacy, and a few surprising facts.
            </p>
          </Section>

          <Section title="Who Makes It">
            <p>
              History Brain is built and maintained by{" "}
              <a
                href="https://www.henrymontilla.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--hb-accent)] underline"
              >
                Henry Montilla
              </a>
              , an independent developer and designer. The game is a solo
              project — code, pixel art, content research and writing are all
              done in-house. No AI-generated filler articles: every topic page
              on the site is hand-reviewed for accuracy.
            </p>
          </Section>

          <Section title="Sources">
            <p>
              Images are sourced from{" "}
              <a
                href="https://commons.wikimedia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--hb-accent)] underline"
              >
                Wikimedia Commons
              </a>
              , used under their respective free licenses (public domain or
              Creative Commons). Historical dates, names and events are
              cross-referenced against Wikipedia, Encyclopedia Britannica, and
              primary sources where available. Spot an error? Please{" "}
              <a href="/contact" className="text-[var(--hb-accent)] underline">
                get in touch
              </a>{" "}
              — corrections ship the same week.
            </p>
          </Section>

          <Section title="What's Next">
            <p>
              The content library grows weekly. Planned additions include
              science history, music, invention timelines, and a hardcore
              difficulty mode with shorter clue windows. Suggestions are always
              welcome.
            </p>
          </Section>
        </article>

        <SiteFooter />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2
        className="text-[var(--hb-accent-2)] text-sm tracking-widest"
        style={hf}
      >
        &gt; {title.toUpperCase()}
      </h2>
      <div className="text-base leading-relaxed flex flex-col gap-3">
        {children}
      </div>
    </section>
  );
}
