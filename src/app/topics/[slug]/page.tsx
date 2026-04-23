import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getAllTopicSlugs,
  getAllTopics,
  getTopicBySlug,
  nameForSlug,
  slugify,
  type Topic,
} from "@/lib/topics";
import { eraOf } from "@/lib/eras";
import { categoryOf, CATEGORY_COLORS } from "@/lib/categories";

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

export async function generateStaticParams() {
  return getAllTopicSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) return { title: "Topic not found · History Brain" };

  const description = topic.excerpt;
  const title = `${topic.title} · History Brain`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: topic.image ? [{ url: topic.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: topic.image ? [topic.image] : undefined,
    },
    alternates: {
      canonical: `/topics/${slug}`,
    },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) notFound();

  const name = nameForSlug(slug);
  const eraInfo = name ? eraOf(name) : null;
  const category = name ? categoryOf(name) : null;
  const related = await getRelatedTopics(slug, category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: topic.title,
    description: topic.excerpt,
    image: topic.image ? [topic.image] : undefined,
    author: {
      "@type": "Organization",
      name: "History Brain",
    },
    publisher: {
      "@type": "Organization",
      name: "History Brain",
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 pixel-font">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

        <article className="bg-[var(--hb-panel)] pixel-border p-6 sm:p-8 flex flex-col gap-6 text-[var(--hb-text)]">
          {topic.image && (
            <div className="relative w-full aspect-[16/10] overflow-hidden pixel-border">
              <Image
                src={topic.image}
                alt={topic.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h1
              className="text-[var(--hb-accent)] text-2xl sm:text-3xl tracking-widest"
              style={hf}
            >
              &gt; {topic.title.toUpperCase()}
            </h1>

            <div className="flex flex-wrap gap-2 text-xs" style={hf}>
              {topic.era && (
                <span className="border-2 border-[var(--hb-border)] text-[var(--hb-muted)] px-2 py-1 tracking-widest">
                  {topic.era}
                </span>
              )}
              {category && (
                <span
                  className="border-2 px-2 py-1 tracking-widest"
                  style={{
                    color: CATEGORY_COLORS[category],
                    borderColor: CATEGORY_COLORS[category],
                  }}
                >
                  {category.toUpperCase()}
                </span>
              )}
              {!topic.era && eraInfo?.year && (
                <span className="border-2 border-[var(--hb-border)] text-[var(--hb-muted)] px-2 py-1 tracking-widest">
                  {eraInfo.year}
                </span>
              )}
            </div>

            {topic.summary && (
              <p className="text-[var(--hb-muted)] text-lg leading-relaxed italic">
                {topic.summary}
              </p>
            )}
          </div>

          <div
            className="topic-body text-base leading-relaxed flex flex-col gap-4"
            dangerouslySetInnerHTML={{ __html: topic.contentHtml }}
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-[var(--hb-border)]">
            <Link href="/" className="pixel-btn flex-1 text-center">
              &gt; Play a Round [ENTER]
            </Link>
          </div>
        </article>

        {related.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2
              className="text-[var(--hb-accent-2)] text-sm tracking-widest"
              style={hf}
            >
              &gt; RELATED TOPICS
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {related.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/topics/${t.slug}`}
                    className="group block bg-[var(--hb-panel)] pixel-border overflow-hidden hover:border-[var(--hb-accent)] transition-colors"
                  >
                    {t.image && (
                      <div className="relative w-full aspect-[4/3]">
                        <Image
                          src={t.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 33vw"
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
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

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

/**
 * Pick a few related topics. Prefers same category; falls back to random
 * other topics so every page has something to click.
 */
async function getRelatedTopics(
  currentSlug: string,
  category: ReturnType<typeof categoryOf>
): Promise<Topic[]> {
  const all = await getAllTopics();
  const others = all.filter((t) => t.slug !== currentSlug);

  if (category) {
    const sameCat = others.filter((t) => {
      const name = nameForSlug(t.slug);
      return name ? categoryOf(name) === category : false;
    });
    if (sameCat.length >= 3) return sameCat.slice(0, 6);
    // Mix same-category + a few random to reach 6.
    const filler = others
      .filter((t) => !sameCat.some((s) => s.slug === t.slug))
      .sort(() => Math.random() - 0.5)
      .slice(0, 6 - sameCat.length);
    return [...sameCat, ...filler];
  }

  return others.sort(() => Math.random() - 0.5).slice(0, 6);
}

// Referenced so the import survives tree-shaking even if related lookups are
// short-circuited.
void slugify;
