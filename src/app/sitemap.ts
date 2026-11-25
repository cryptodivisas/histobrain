import type { MetadataRoute } from "next";
import { getIndexableTopicEntries } from "@/lib/topics";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/topics", "/about", "/how-it-works", "/learn", "/editorial", "/contact", "/privacy"];
  return [
    ...pages.map((page) => ({ url: `${SITE_URL}${page}` })),
    ...getIndexableTopicEntries().map(({ slug, updatedAt }) => ({
      url: `${SITE_URL}/topics/${slug}`,
      lastModified: updatedAt,
    })),
  ];
}
