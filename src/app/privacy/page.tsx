import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy · History Brain",
  description: "How History Brain handles your data, cookies, and advertising.",
  alternates: { canonical: "/privacy" },
};

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

export default function PrivacyPage() {
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
            &gt; PRIVACY POLICY
          </h1>

          <p className="text-sm text-[var(--hb-muted)] tracking-wider" style={hf}>
            Last updated: April 2026
          </p>

          <Section title="The Short Version">
            <p>
              History Brain is a free, browser-based trivia game. We do{" "}
              <strong>not</strong> require an account, we do{" "}
              <strong>not</strong> collect personal data for ourselves, and we
              do <strong>not</strong> sell anything. Your game progress stays on
              your own device.
            </p>
            <p>
              If and when advertising is enabled on this site, third-party ad
              partners (such as Google AdSense) may set cookies or use similar
              technologies in your browser to serve and measure ads — the
              details are below, and you can opt out at any time.
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
              History Brain itself does <strong>not</strong> set cookies for
              tracking or analytics. The only first-party client-side storage
              we use is{" "}
              <code className="text-[var(--hb-accent)]">localStorage</code>,
              which holds your game progress, settings and best score locally.
            </p>
            <p>
              Third-party services embedded on the site — specifically ad
              networks (see below) — may set their own cookies in your browser.
              We do not control those cookies directly.
            </p>
          </Section>

          <Section title="Advertising">
            <p>
              History Brain may display advertising served by{" "}
              <strong>Google AdSense</strong> and its partner networks. When
              ads are active:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                Google, as a third-party vendor, uses cookies to serve ads on
                this site. Google&apos;s use of advertising cookies enables it
                and its partners to serve ads to you based on your visits to
                this site and/or other sites on the Internet.
              </li>
              <li>
                You can opt out of personalized advertising by visiting{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--hb-accent)] underline"
                >
                  Google Ads Settings
                </a>
                .
              </li>
              <li>
                You can opt out of a third-party vendor&apos;s use of cookies
                for personalized advertising by visiting{" "}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--hb-accent)] underline"
                >
                  aboutads.info
                </a>
                .
              </li>
              <li>
                For users in the EEA, UK and Switzerland, a consent banner will
                appear the first time you visit, letting you accept or reject
                personalized advertising as required by GDPR / ePrivacy rules.
              </li>
              <li>
                Third-party ad servers or ad networks may also use technologies
                like cookies, JavaScript, or web beacons in the advertisements
                and links that appear on History Brain, which are sent directly
                to your browser. Their use is subject to their own privacy
                policies.
              </li>
            </ul>
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

          <Section title="Analytics">
            <p>
              At present, History Brain does not run Google Analytics or any
              other analytics platform. If analytics is added in the future,
              this section will be updated and the &quot;Last updated&quot;
              date at the top will change.
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
              Privacy questions, data requests, or concerns? Please see our{" "}
              <Link href="/contact" className="text-[var(--hb-accent)] underline">
                contact page
              </Link>
              .
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
      <div className="text-base leading-relaxed">{children}</div>
    </section>
  );
}
