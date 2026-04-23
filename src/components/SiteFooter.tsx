import Link from "next/link";

/**
 * Shared site footer with navigation to all static info pages.
 * Used on every page so crawlers and readers can reach About / Privacy / etc.
 */
export function SiteFooter() {
  return (
    <footer className="mt-4 text-[var(--hb-muted)] text-xs tracking-widest flex flex-col items-center gap-3 text-center">
      <nav className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        <Link href="/about" className="hover:text-[var(--hb-accent)] transition-colors">
          About
        </Link>
        <span>·</span>
        <Link href="/how-it-works" className="hover:text-[var(--hb-accent)] transition-colors">
          How It Works
        </Link>
        <span>·</span>
        <Link href="/topics" className="hover:text-[var(--hb-accent)] transition-colors">
          Topics
        </Link>
        <span>·</span>
        <Link href="/contact" className="hover:text-[var(--hb-accent)] transition-colors">
          Contact
        </Link>
        <span>·</span>
        <Link href="/privacy" className="hover:text-[var(--hb-accent)] transition-colors">
          Privacy
        </Link>
      </nav>
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
  );
}
