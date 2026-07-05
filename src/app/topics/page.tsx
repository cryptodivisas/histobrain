import Link from "next/link";
import type { Metadata } from "next";

import { PageHeader } from "@/components/PageHeader";
import { SiteFooter } from "@/components/SiteFooter";
import TopicExplorer, { type TopicExplorerItem } from "@/components/TopicExplorer";
import {
  getAllTopics,
  nameForSlug,
} from "@/lib/topics";
import {
  categoryOf,
} from "@/lib/categories";

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };

export const metadata: Metadata = {
  title: "All Topics",
  description:
    "Browse the full History Brain library — landmarks, art, figures, events, documents, civics, music, movies, and TV series covered in the game, organized by category.",
  alternates: { canonical: "/topics" },
};

const UNCATEGORIZED = "Other" as const;

export default async function TopicsIndexPage() {
  const topics = await getAllTopics();

  const totalTopics = topics.length;
  const explorerTopics: TopicExplorerItem[] = topics
    .map((topic) => {
      const name = nameForSlug(topic.slug);
      return {
        slug: topic.slug,
        title: topic.title,
        era: topic.era,
        image: topic.image,
        category: topic.category ?? (name ? categoryOf(name) : null) ?? UNCATEGORIZED,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

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
            The full library of people, places, events, artifacts, music,
            movies, and TV series covered on History Brain. Pick any topic to
            read its deep-dive article, or{" "}
            <Link href="/" className="text-[var(--hb-accent)] underline">
              jump back into the game
            </Link>
            .
          </p>
        </div>

        <TopicExplorer topics={explorerTopics} />

        <SiteFooter />
      </div>
    </div>
  );
}
