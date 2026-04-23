import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · History Brain",
  description: "How History Brain handles your data.",
};

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 pixel-font">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="glitch-text text-[var(--hb-accent)] text-lg sm:text-2xl tracking-widest cursor-pointer"
            style={hf}
          >
            HISTORY_BRAIN
          </Link>
          <Link
            href="/"
            className="border-2 border-[var(--hb-border)] hover:border-[var(--hb-accent)] text-[var(--hb-accent)] px-3 py-2 transition-colors cursor-pointer text-xs"
            style={hf}
          >
            &lt; BACK
          </Link>
        </header>

        <div className="w-full h-1 bg-linear-to-r from-transparent via-[var(--hb-accent)] to-transparent opacity-60" />

        <article className="bg-[var(--hb-panel)] pixel-border p-6 sm:p-8 flex flex-col gap-5 text-[var(--hb-text)]">
          <h1
            className="text-[var(--hb-accent)] text-2xl tracking-widest"
            style={hf}
          >
            &gt; PRIVACY POLICY
          </h1>

          <p className="text-sm text-[var(--hb-muted)] tracking-wider" style={hf}>
            Last updated: April 2026
          </p>

          <Section title="The Short Version">
            <p>
              History Brain is a free, offline-friendly trivia game. We do{" "}
              <strong>not</strong> collect personal data, we do{" "}
              <strong>not</strong> use tracking cookies, and we do{" "}
              <strong>not</strong> share information with third parties.
              Everything about your progress stays on your own device.
            </p>
          </Section>

          <Section title="What We Store">
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                Your game progress, achievements, score and settings are saved
                in your browser&apos;s <strong>localStorage</strong>. This data
                never leaves your device.
              </li>
              <li>
                No account, email, or login is required.
              </li>
              <li>
                You can wipe all stored data at any time via{" "}
                <strong>CFG → Reset Progress</strong> in the app, or by
                clearing your browser&apos;s site data.
              </li>
            </ul>
          </Section>

          <Section title="Cookies">
            <p>
              History Brain does <strong>not</strong> use cookies for tracking,
              advertising, or analytics. The only client-side storage used is{" "}
              <code className="text-[var(--hb-accent)]">localStorage</code> for
              saving your own game state (see above).
            </p>
          </Section>

          <Section title="Third-Party Content">
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                <strong>Wikimedia Commons</strong> — question images are
                fetched from Wikimedia&apos;s public CDN. Your browser contacts
                Wikimedia directly to load these images. See{" "}
                <a
                  href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--hb-accent)] underline"
                >
                  Wikimedia&apos;s privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Fonts</strong> are self-hosted on our own origin, so no
                data is sent to Google Fonts at runtime.
              </li>
              <li>
                Wikipedia &quot;Learn More&quot; links open Wikipedia articles
                in a new tab. Once you click, Wikipedia&apos;s privacy policy
                applies.
              </li>
            </ul>
          </Section>

          <Section title="Analytics & Advertising">
            <p>
              None. No Google Analytics, no ad networks, no trackers.
            </p>
          </Section>

          <Section title="Children">
            <p>
              History Brain is suitable for all ages. We do not knowingly
              collect any personal data from anyone, including children.
            </p>
          </Section>

          <Section title="Your Rights">
            <p>
              Because we don&apos;t collect personal data, there is nothing to
              request, export, or delete on our servers. You retain full
              control over your local game data via your browser.
            </p>
          </Section>

          <Section title="Changes">
            <p>
              If this policy ever changes (for example, if analytics are added
              in the future), the &quot;Last updated&quot; date above will
              change and a notice will appear on the main page.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions? Reach out via{" "}
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
        </article>

        <footer className="mt-4 text-[var(--hb-muted)] text-xs tracking-widest flex flex-col items-center gap-2 text-center">
          <div>
            © History Brain all right reserved - Created by{" "}
            <a
              href="https://www.henrymontilla.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--hb-accent)] hover:underline"
            >
              Henry Montilla
            </a>
          </div>
        </footer>
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
      <div className="text-base leading-relaxed">{children}</div>
    </section>
  );
}
