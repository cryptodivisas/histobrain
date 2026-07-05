import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Learning Hub",
  description:
    "Use History Brain for independent study, classroom warm-ups, visual history practice, and USCIS citizenship-test review.",
  alternates: { canonical: "/learn" },
};

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

export default function LearnPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: "Learn with History Brain",
    url: `${SITE_URL}/learn`,
    learningResourceType: ["Educational game", "Quiz", "Reference articles"],
    educationalUse: ["Independent study", "Classroom warm-up", "Test preparation"],
    isAccessibleForFree: true,
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 pixel-font">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <PageHeader />
        <div className="w-full h-1 bg-linear-to-r from-transparent via-[var(--hb-accent)] to-transparent opacity-60" />

        <main className="flex flex-col gap-7">
          <section className="bg-[var(--hb-panel)] pixel-border p-6 sm:p-8 flex flex-col gap-4 text-center">
            <span className="text-[var(--hb-muted)] text-xs tracking-widest" style={hf}>FREE · VISUAL · BROWSER-BASED</span>
            <h1 className="text-[var(--hb-accent)] text-2xl sm:text-4xl tracking-widest leading-relaxed" style={hf}>
              LEARN HISTORY BY PLAYING IT
            </h1>
            <p className="text-[var(--hb-text)] text-lg sm:text-2xl leading-snug max-w-3xl mx-auto">
              Short visual rounds for curious students, practical classroom activities for educators, and focused civics review for citizenship learners.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AudienceCard
              label="STUDENTS"
              title="Test recall, then explore"
              text="Play a five-question round, review every answer, and follow interesting topics into the article archive."
              href="/"
              cta="START A ROUND"
              color="var(--hb-accent)"
            />
            <AudienceCard
              label="EDUCATORS"
              title="A five-minute classroom spark"
              text="Use Daily mode as a warm-up, compare reasoning before revealing answers, then assign one topic for follow-up research."
              href="#classroom"
              cta="CLASSROOM IDEAS"
              color="var(--hb-accent-2)"
            />
            <AudienceCard
              label="CITIZENSHIP"
              title="Practice civics in context"
              text="Review accepted USCIS civics answers alongside concise notes about government, rights, history, and national symbols."
              href="/topics?category=Citizenship"
              cta="OPEN CIVICS TOPICS"
              color="var(--hb-cat-citizenship)"
            />
          </section>

          <section id="classroom" className="bg-[var(--hb-panel)] pixel-border p-6 sm:p-8 flex flex-col gap-5 scroll-mt-6">
            <h2 className="text-[var(--hb-accent-2)] text-lg tracking-widest" style={hf}>&gt; CLASSROOM PLAYBOOK</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Lesson number="01" title="Predict">Read the clue aloud and ask learners to defend a choice before revealing any image.</Lesson>
              <Lesson number="02" title="Play">Run the Daily challenge together so every group receives the same five questions.</Lesson>
              <Lesson number="03" title="Investigate">Open one answer article and identify the most important fact, source type, and unanswered question.</Lesson>
            </div>
          </section>

          <section className="bg-[var(--hb-panel)] pixel-border p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-[var(--hb-accent)] text-sm tracking-widest" style={hf}>&gt; PRIVACY-FRIENDLY</h2>
              <p className="text-lg leading-snug">No student account is required. Game progress remains in the current browser.</p>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-[var(--hb-accent)] text-sm tracking-widest" style={hf}>&gt; OPEN EXPLORATION</h2>
              <p className="text-lg leading-snug">The topic archive is readable without playing, signing in, or installing an application.</p>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}

function AudienceCard({
  label,
  title,
  text,
  href,
  cta,
  color,
}: {
  label: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  color: string;
}) {
  return (
    <article className="bg-[var(--hb-panel)] pixel-border p-5 flex flex-col gap-3">
      <span className="text-xs tracking-widest" style={{ ...hf, color }}>{label}</span>
      <h2 className="text-[var(--hb-text)] text-lg leading-relaxed" style={hf}>{title}</h2>
      <p className="text-lg leading-snug flex-1">{text}</p>
      <Link href={href} className="text-xs tracking-widest hover:underline" style={{ ...hf, color }}>&gt; {cta}</Link>
    </article>
  );
}

function Lesson({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--hb-bg)] p-4 flex flex-col gap-2">
      <span className="text-[var(--hb-accent)] text-xs tracking-widest" style={hf}>[{number}] {title.toUpperCase()}</span>
      <p className="text-base leading-relaxed">{children}</p>
    </div>
  );
}
