import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages that use generateStaticParams / have no dynamic data will still be
  // pre-rendered at build time and served from the CDN. Dynamic routes like
  // /s/[code] run on demand (needed for per-user share cards).
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/topics/beyonc\u00e9",
        destination: "/topics/beyonce",
        permanent: true,
      },
      {
        source: "/topics/\u201cfather-of-our-country\u201d",
        destination: "/topics/father-of-our-country",
        permanent: true,
      },
      {
        source: "/topics/\u201cfather-of-the-constitution\u201d",
        destination: "/topics/father-of-the-constitution",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
