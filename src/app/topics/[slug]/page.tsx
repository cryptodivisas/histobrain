import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/SiteFooter";
import {
  canonicalTopicSlug,
  getAllTopicSlugs,
  getAllTopics,
  getTopicBySlug,
  nameForSlug,
  type Topic,
} from "@/lib/topics";
import { eraOf } from "@/lib/eras";
import { categoryOf, CATEGORY_COLORS } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";

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
  const canonicalSlug = canonicalTopicSlug(slug);
  const topic = await getTopicBySlug(canonicalSlug);
  if (!topic) return { title: "Topic not found" };

  const description = topic.excerpt;
  const title = topic.title;
  const socialTitle = `${topic.title} · History Brain`;

  return {
    title,
    description,
    openGraph: {
      title: socialTitle,
      description,
      type: topic.indexable ? "article" : "website",
      images: topic.image ? [{ url: topic.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: topic.image ? [topic.image] : undefined,
    },
    alternates: {
      canonical: `/topics/${canonicalSlug}`,
    },
    robots: topic.indexable ? undefined : { index: false, follow: true },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const canonicalSlug = canonicalTopicSlug(slug);
  if (canonicalSlug !== slug) notFound();

  const topic = await getTopicBySlug(canonicalSlug);
  if (!topic) notFound();

  const name = nameForSlug(canonicalSlug);
  const eraInfo = name ? eraOf(name) : null;
  const category = topic.category ?? (name ? categoryOf(name) : null);
  const related = await getRelatedTopics(canonicalSlug, category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: topic.title,
    description: topic.excerpt,
    image: topic.image ? [new URL(topic.image, SITE_URL).href] : undefined,
    dateModified: topic.updatedAt,
    author: {
      "@type": "Person",
      name: "Henry Montilla",
      url: "https://www.henrymontilla.com",
    },
    publisher: {
      "@type": "Organization",
      name: "History Brain",
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 pixel-font">
      {topic.indexable && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
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
            href="/topics"
            className="border-2 border-[var(--hb-border)] hover:border-[var(--hb-accent)] text-[var(--hb-accent)] px-3 py-2 transition-colors cursor-pointer text-xs"
            style={hf}
          >
            &lt; TOPICS
          </Link>
        </header>

        <div className="w-full h-1 bg-linear-to-r from-transparent via-[var(--hb-accent)] to-transparent opacity-60" />

        <article className="bg-[var(--hb-panel)] pixel-border p-6 sm:p-8 flex flex-col gap-6 text-[var(--hb-text)]">
          {topic.image && (
            <div className="relative w-full aspect-[4/3] overflow-hidden pixel-border bg-[var(--hb-bg)]">
              <Image
                src={topic.image}
                alt={topic.title}
                fill
                className="object-contain"
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
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--hb-muted)]">
              {topic.generated ? <span>Quick study notes from the quiz bank</span> : <span>
                Written and maintained by{" "}
                <a
                  href="https://www.henrymontilla.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--hb-accent)] hover:underline"
                >
                  Henry Montilla
                </a>
              </span>}
              {topic.updatedAt && <span>
                Page updated{" "}
                <time dateTime={topic.updatedAt}>
                  {new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC",
                  }).format(new Date(topic.updatedAt))}
                </time>
              </span>}
            </div>
          </div>

          <div
            className="topic-body text-base leading-relaxed flex flex-col gap-4"
            dangerouslySetInnerHTML={{ __html: topic.contentHtml }}
          />

          <aside className="bg-[var(--hb-bg)] border-2 border-[var(--hb-border)] p-4 flex flex-col gap-2">
            <h2 className="text-[var(--hb-accent-2)] text-xs tracking-widest" style={hf}>
              &gt; EDITORIAL STANDARDS
            </h2>
            <p className="text-base leading-relaxed">
              Spot a factual error or have a source to suggest?{" "}
              <Link href="/contact" className="text-[var(--hb-accent)] underline">
                Send a correction
              </Link>
              .
            </p>
            <Link href="/editorial" className="text-[var(--hb-accent)] text-xs tracking-widest hover:underline" style={hf}>
              REVIEW OUR RESEARCH STANDARD →
            </Link>
          </aside>

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

        <SiteFooter />
      </div>
    </div>
  );
}

/**
 * Prefer published articles within the same category.
 */
async function getRelatedTopics(
  currentSlug: string,
  category: ReturnType<typeof categoryOf>
): Promise<Topic[]> {
  const all = await getAllTopics();
  const articles = all.filter((topic) => topic.slug !== currentSlug && topic.indexable);
  const sameCategory = articles.filter((topic) => topic.category === category);
  const otherCategories = articles.filter((topic) => topic.category !== category);
  return [...sameCategory, ...otherCategories].slice(0, 6);
}
