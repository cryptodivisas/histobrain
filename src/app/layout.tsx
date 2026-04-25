import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import GoogleAnalytics from "@/components/GoogleAnalytics";
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
    default: "History Brain — The Retro History Trivia Game",
    template: "%s · History Brain",
  },
  description:
    "Test your historical knowledge in History Brain, a pixel-art trivia game spanning art, landmarks, events, and iconic figures.",
  openGraph: {
    type: "website",
    siteName: "History Brain",
    url: "/",
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
      </body>
    </html>
  );
}
