import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SiteFooter } from "@/components/SiteFooter";
import ManageConsent from "@/components/ManageConsent";

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
            Last updated: April 25, 2026
          </p>

          <Section title="Your Choices">
            <p>
              History Brain treats analytics and advertising cookies as
              opt-in. On your first visit a banner asks whether to{" "}
              <strong>Accept All</strong> or <strong>Reject All</strong>; we
              implement this with Google&apos;s{" "}
              <strong>Consent Mode v2</strong>, so when you reject, Google
              Analytics and (in the future) Google AdSense only receive
              anonymous, cookieless signals.
            </p>
            <p>
              You can change your choice at any time from this page:
            </p>
            <ManageConsent />
          </Section>

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
              History Brain itself does <strong>not</strong> set first-party
              cookies for tracking. Our own client-side storage is limited to{" "}
              <code className="text-[var(--hb-accent)]">localStorage</code>,
              which holds your game progress, settings and best score locally.
            </p>
            <p>
              Third-party services embedded on the site set their own cookies
              in your browser:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                <strong>Google Analytics 4</strong> sets the{" "}
                <code className="text-[var(--hb-accent)]">_ga</code> and{" "}
                <code className="text-[var(--hb-accent)]">_ga_*</code>{" "}
                cookies to measure aggregated site usage (see the Analytics
                section below).
              </li>
              <li>
                Ad networks (see the Advertising section below) may set their
                own cookies. We do not control those cookies directly.
              </li>
            </ul>
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
              History Brain uses{" "}
              <strong>Google Analytics 4 (GA4)</strong> to understand how the
              site is used in aggregate — for example, which game modes are
              popular, which topics attract the most visits, and roughly where
              in the world our visitors come from. GA4 is wired with{" "}
              <strong>Google Consent Mode v2</strong> and starts in a
              denied-by-default state; it only switches to full tracking if
              you click <strong>Accept All</strong>.
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                GA4 collects usage data such as pages viewed, session length,
                approximate geographic location (derived from IP and then
                discarded), device/browser information, and referrer.
              </li>
              <li>
                We do <strong>not</strong> ask GA4 to collect any personal
                identifiers, and IP addresses are anonymised by Google before
                storage.
              </li>
              <li>
                You can opt out of Google Analytics across all sites by
                installing the{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--hb-accent)] underline"
                >
                  Google Analytics Opt-out Browser Add-on
                </a>
                .
              </li>
              <li>
                You can also block analytics cookies via your browser settings
                or any privacy extension of your choice.
              </li>
            </ul>
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
