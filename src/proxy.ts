import { NextResponse, type NextRequest } from "next/server";

const legacyTopics = new Map([
  ["beyoncé", "beyonce"],
  ["“father-of-our-country”", "father-of-our-country"],
  ["“father-of-the-constitution”", "father-of-the-constitution"],
]);

export function proxy(request: NextRequest) {
  const rawSlug = request.nextUrl.pathname.slice("/topics/".length);
  let slug: string;
  try {
    slug = decodeURIComponent(rawSlug).normalize("NFC");
  } catch {
    return NextResponse.next();
  }

  const canonical = legacyTopics.get(slug);
  if (!canonical) return NextResponse.next();

  const target = request.nextUrl.clone();
  target.pathname = `/topics/${canonical}`;
  return NextResponse.redirect(target, 308);
}

export const config = {
  matcher: "/topics/:slug",
};
