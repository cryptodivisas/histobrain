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
    default: "History Brain — Free Interactive Quiz Game",
    template: "%s · History Brain",
  },
  description:
    "Challenge your knowledge with free interactive quizzes about history, landmarks, movies, music, TV series, citizenship, and more.",
  keywords: [
    "history trivia",
    "interactive quiz game",
    "general knowledge quiz",
    "history quiz",
    "free trivia game",
    "educational history game",
    "world history quiz",
  ],
  other: {
    "google-adsense-account": "ca-pub-1168292405668194",
  },
  openGraph: {
    type: "website",
    siteName: "History Brain",
    url: "/",
    title: "History Brain — Free Interactive Quiz Game",
    description:
      "Challenge your knowledge across history, landmarks, movies, music, TV series, citizenship, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "History Brain — Free Interactive Quiz Game",
    description:
      "Play free interactive quizzes in your browser. No account. No download.",
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
        <ConsentBanner />
        {children}
        <GoogleAnalytics />
        <GoogleAdsense />
      </body>
    </html>
  );
}
