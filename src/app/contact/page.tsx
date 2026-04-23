import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Contact · History Brain",
  description:
    "Get in touch with History Brain. Report a factual error, suggest a topic, or reach out about the project.",
  alternates: { canonical: "/contact" },
};

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

// Primary contact email. Update this if the alias changes.
const CONTACT_EMAIL = "hello@histobrain.com";

export default function ContactPage() {
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
            &gt; CONTACT
          </h1>

          <Section title="Get In Touch">
            <p>
              The quickest way to reach History Brain is by email. We read every
              message and usually reply within a few days.
            </p>
            <p className="text-lg">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[var(--hb-accent)] underline break-all"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </Section>

          <Section title="What To Write About">
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                <strong>Factual errors</strong> — a wrong date, a misattributed
                quote, a misidentified image. We fix these as fast as we can.
              </li>
              <li>
                <strong>Topic suggestions</strong> — people, places, events or
                artworks you&apos;d like to see added to the game.
              </li>
              <li>
                <strong>Accessibility feedback</strong> — color contrast,
                keyboard navigation, screen-reader issues.
              </li>
              <li>
                <strong>Partnerships & collaborations</strong> — educators,
                writers, illustrators.
              </li>
              <li>
                <strong>Press & interviews</strong> — happy to talk about the
                project.
              </li>
            </ul>
          </Section>

          <Section title="About The Developer">
            <p>
              History Brain is built solo by Henry Montilla. You can also find
              more of his work at{" "}
              <a
                href="https://www.henrymontilla.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--hb-accent)] underline"
              >
                henrymontilla.com
              </a>
              .
            </p>
          </Section>

          <Section title="Response Time">
            <p>
              History Brain is a one-person project, so please allow a few days
              for a reply. Corrections and bug reports are prioritized over
              general questions.
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
