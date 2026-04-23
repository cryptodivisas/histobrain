import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "How It Works · History Brain",
  description:
    "How to play History Brain: three blurred images, one clue, one life lost for each wrong guess. A quick guide to scoring, streaks, and keyboard shortcuts.",
  alternates: { canonical: "/how-it-works" },
};

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

export default function HowItWorksPage() {
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
            &gt; HOW IT WORKS
          </h1>

          <Section title="The Basics">
            <ol className="list-decimal pl-6 flex flex-col gap-2">
              <li>
                A clue appears at the top of the screen — usually one sentence
                about a person, place, event, work of art, or document.
              </li>
              <li>
                Three blurred pixel-art images sit below it. Exactly one of
                them matches the clue.
              </li>
              <li>
                Pick an image by clicking it or pressing <strong>1</strong>,{" "}
                <strong>2</strong>, or <strong>3</strong> on your keyboard.
              </li>
              <li>
                If you&apos;re right, the image un-blurs and an explanation
                panel opens. If you&apos;re wrong, you lose a life and the
                correct answer is revealed anyway.
              </li>
              <li>
                Press <strong>Enter</strong> to load the next question.
              </li>
            </ol>
          </Section>

          <Section title="Scoring & Streaks">
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                <strong>+10 points</strong> for each correct answer.
              </li>
              <li>
                <strong>Streak bonus:</strong> every three correct answers in a
                row adds a small multiplier to your next score.
              </li>
              <li>
                <strong>Lives:</strong> you start with three. Lose them all and
                the run ends — your score is saved to your local best.
              </li>
              <li>
                <strong>Hints:</strong> stuck? The clue&apos;s era badge and
                category label narrow things down fast.
              </li>
            </ul>
          </Section>

          <Section title="Keyboard Shortcuts">
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                <strong>1 / 2 / 3</strong> — pick an image
              </li>
              <li>
                <strong>Enter</strong> — next question / dismiss the answer
                panel
              </li>
              <li>
                <strong>M</strong> — mute / unmute sound effects
              </li>
              <li>
                <strong>CFG</strong> (top-right) — settings, theme, reset
                progress
              </li>
            </ul>
          </Section>

          <Section title="Learn More">
            <p>
              Every answer card has a <strong>LEARN MORE</strong> button that
              opens a full topic article right here on the site — covering the
              background, timeline, legacy, and a few surprising facts about
              that subject. Or browse the full{" "}
              <Link href="/topics" className="text-[var(--hb-accent)] underline">
                topics library
              </Link>{" "}
              directly.
            </p>
          </Section>

          <Section title="Your Data">
            <p>
              Scores, settings and streaks are saved only in your browser&apos;s
              localStorage. Nothing is sent to a server. Wipe it anytime via{" "}
              <strong>CFG → Reset Progress</strong>. Details in our{" "}
              <Link href="/privacy" className="text-[var(--hb-accent)] underline">
                Privacy Policy
              </Link>
              .
            </p>
          </Section>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-[var(--hb-border)]">
            <Link href="/" className="pixel-btn flex-1 text-center">
              &gt; Play a Round [ENTER]
            </Link>
          </div>
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
