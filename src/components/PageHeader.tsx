import Link from "next/link";

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

/**
 * Shared page header used on all non-game pages (about, contact, privacy, etc).
 * Shows the HISTORY_BRAIN wordmark (links home) and a BACK button.
 */
export function PageHeader() {
  return (
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
  );
}
