import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { PageHeader } from "@/components/PageHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  getAllTopics,
  nameForSlug,
  type Topic,
} from "@/lib/topics";
import {
  categoryOf,
  CATEGORIES,
  CATEGORY_COLORS,
  type Category,
} from "@/lib/categories";

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

export const metadata: Metadata = {
  title: "All Topics · History Brain",
  description:
    "Browse the full History Brain library — every landmark, work of art, historical figure, event and document covered in the game, organized by category.",
  alternates: { canonical: "/topics" },
};

const UNCATEGORIZED = "Other" as const;
type Bucket = Category | typeof UNCATEGORIZED;

export default async function TopicsIndexPage() {
  const topics = await getAllTopics();

  // Bucket by category.
  const buckets: Record<Bucket, Topic[]> = {
    Landmarks: [],
    Art: [],
    Figures: [],
    Events: [],
    Documents: [],
    [UNCATEGORIZED]: [],
  };
  for (const t of topics) {
    const name = nameForSlug(t.slug);
    const cat = name ? categoryOf(name) : null;
    buckets[cat ?? UNCATEGORIZED].push(t);
  }
  for (const key of Object.keys(buckets) as Bucket[]) {
    buckets[key].sort((a, b) => a.title.localeCompare(b.title));
  }

  const order: Bucket[] = [...CATEGORIES, UNCATEGORIZED];
  const totalTopics = topics.length;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 pixel-font">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <PageHeader />

        <div className="w-full h-1 bg-linear-to-r from-transparent via-[var(--hb-accent)] to-transparent opacity-60" />

        <div className="bg-[var(--hb-panel)] pixel-border p-6 sm:p-8 flex flex-col gap-3 text-[var(--hb-text)]">
          <h1
            className="text-[var(--hb-accent)] text-2xl tracking-widest"
            style={hf}
          >
            &gt; ALL TOPICS
          </h1>
          <p className="text-[var(--hb-muted)] text-sm tracking-wider" style={hf}>
            {totalTopics} articles · organized by category
          </p>
          <p className="text-base leading-relaxed">
            The full library of people, places, events and artifacts covered on
            History Brain. Pick any topic to read its deep-dive article, or{" "}
            <Link href="/" className="text-[var(--hb-accent)] underline">
              jump back into the game
            </Link>
            .
          </p>
        </div>

        {order.map((bucket) => {
          const list = buckets[bucket];
          if (list.length === 0) return null;
          const color =
            bucket === UNCATEGORIZED
              ? "var(--hb-muted)"
              : CATEGORY_COLORS[bucket];
          return (
            <section key={bucket} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <h2
                  className="text-sm tracking-widest"
                  style={{ ...hf, color }}
                >
                  &gt; {bucket.toUpperCase()}
                </h2>
                <span
                  className="text-xs tracking-widest text-[var(--hb-muted)]"
                  style={hf}
                >
                  ({list.length})
                </span>
                <div
                  className="flex-1 h-px opacity-40"
                  style={{ background: color }}
                />
              </div>
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {list.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/topics/${t.slug}`}
                      className="group block bg-[var(--hb-panel)] pixel-border overflow-hidden hover:border-[var(--hb-accent)] transition-colors h-full"
                    >
                      {t.image && (
                        <div className="relative w-full aspect-[4/3]">
                          <Image
                            src={t.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <p
                          className="text-xs tracking-widest text-[var(--hb-accent)] group-hover:text-[var(--hb-accent-2)] transition-colors"
                          style={hf}
                        >
                          {t.title.toUpperCase()}
                        </p>
                        {t.era && (
                          <p
                            className="mt-1 text-[10px] tracking-widest text-[var(--hb-muted)]"
                            style={hf}
                          >
                            {t.era}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <SiteFooter />
      </div>
    </div>
  );
}
