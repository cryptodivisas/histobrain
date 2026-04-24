import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages that use generateStaticParams / have no dynamic data will still be
  // pre-rendered at build time and served from the CDN. Dynamic routes like
  // /s/[code] run on demand (needed for per-user share cards).
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
