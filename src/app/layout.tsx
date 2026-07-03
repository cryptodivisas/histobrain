import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAdsense from "@/components/GoogleAdsense";
import ConsentBanner from "@/components/ConsentBanner";

const pressStart = Press_Start_2P({
  variable: "--font-pixel-heading",
  subsets: ["latin"],
  weight: "400",
});

const vt323 = VT323({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "History Brain — Free History Trivia Game",
    template: "%s · History Brain",
  },
  description:
    "Play free history trivia in your browser—no account or download required. Explore 287 questions across world history, art, civics, music, movies, TV, and more.",
  keywords: [
    "history trivia",
    "history quiz",
    "free trivia game",
    "educational history game",
    "world history quiz",
  ],
  openGraph: {
    type: "website",
    siteName: "History Brain",
    url: "/",
    title: "History Brain — Free History Trivia Game",
    description:
      "Follow the clue, pick the right image, and learn the story behind every answer.",
  },
  twitter: {
    card: "summary_large_image",
    title: "History Brain — Free History Trivia Game",
    description:
      "Play free history trivia in your browser. No account. No download.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pressStart.variable} ${vt323.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ConsentBanner />
        <GoogleAnalytics />
        <GoogleAdsense />
      </body>
    </html>
  );
}
