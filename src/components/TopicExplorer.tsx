"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_COLORS, type Category } from "@/lib/categories";

export interface TopicExplorerItem {
  slug: string;
  title: string;
  era?: string;
  image: string | null;
  category: Category | "Other";
}

const hf = { fontFamily: "var(--font-pixel-heading), monospace" };
const FILTERS = ["All", ...CATEGORIES, "Other"] as const;

export default function TopicExplorer({ topics }: { topics: TopicExplorerItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof FILTERS)[number]>("All");

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return topics.filter((topic) => {
      const categoryMatch = category === "All" || topic.category === category;
      const queryMatch =
        normalized === "" ||
        topic.title.toLocaleLowerCase().includes(normalized) ||
        topic.era?.toLocaleLowerCase().includes(normalized);
      return categoryMatch && queryMatch;
    });
  }, [category, query, topics]);

  return (
    <section aria-labelledby="topic-explorer" className="flex flex-col gap-5">
      <div className="bg-[var(--hb-panel)] pixel-border p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 id="topic-explorer" className="text-[var(--hb-accent)] text-sm tracking-widest" style={hf}>
              &gt; FIND A TOPIC
            </h2>
            <p className="mt-2 text-[var(--hb-muted)] text-sm">
              Search by name or era, then narrow the archive by category.
            </p>
          </div>
          <span className="text-[var(--hb-accent-2)] text-xs tracking-widest" style={hf}>
            {visible.length} RESULT{visible.length === 1 ? "" : "S"}
          </span>
        </div>

        <label className="flex flex-col gap-2">
          <span className="sr-only">Search topics</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="SEARCH PEOPLE, PLACES, EVENTS..."
            className="w-full bg-[var(--hb-bg)] border-2 border-[var(--hb-border)] focus:border-[var(--hb-accent)] outline-none px-4 py-3 text-[var(--hb-text)] placeholder:text-[var(--hb-muted)] text-base tracking-wider"
          />
        </label>

        <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Filter topics by category">
          {FILTERS.map((filter) => {
            const active = category === filter;
            const color =
              filter === "All"
                ? "var(--hb-accent)"
                : filter === "Other"
                  ? "var(--hb-muted)"
                  : CATEGORY_COLORS[filter];
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setCategory(filter)}
                aria-pressed={active}
                className="shrink-0 border-2 px-3 py-2 text-[10px] tracking-widest transition-colors"
                style={{
                  ...hf,
                  borderColor: active ? color : "var(--hb-border)",
                  color: active ? "var(--hb-bg)" : color,
                  background: active ? color : "var(--hb-bg)",
                }}
              >
                {filter.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {visible.length > 0 ? (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visible.map((topic) => {
            const color =
              topic.category === "Other"
                ? "var(--hb-muted)"
                : CATEGORY_COLORS[topic.category];
            return (
              <li key={topic.slug}>
                <Link
                  href={`/topics/${topic.slug}`}
                  className="group block bg-[var(--hb-panel)] pixel-border overflow-hidden h-full hover:-translate-y-1 transition-transform"
                >
                  {topic.image && (
                    <div className="relative w-full aspect-[4/3]">
                      <Image
                        src={topic.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                  )}
                  <div className="p-3 flex flex-col gap-1">
                    <span className="text-[9px] tracking-widest uppercase" style={{ color }}>
                      {topic.category}
                    </span>
                    <p className="text-xs tracking-widest text-[var(--hb-text)] group-hover:text-[var(--hb-accent)] transition-colors" style={hf}>
                      {topic.title.toUpperCase()}
                    </p>
                    {topic.era && (
                      <p className="text-[10px] tracking-widest text-[var(--hb-muted)]" style={hf}>
                        {topic.era}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="bg-[var(--hb-panel)] pixel-border p-8 text-center">
          <p className="text-[var(--hb-accent-2)] text-sm tracking-widest" style={hf}>
            &gt; NO MATCHES FOUND
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="mt-4 text-[var(--hb-accent)] text-xs tracking-widest hover:underline"
            style={hf}
          >
            RESET SEARCH
          </button>
        </div>
      )}
    </section>
  );
}
