import type { Metadata } from "next";
import QuizHome from "@/components/QuizHome";
import { getAllTopicSlugs } from "@/lib/topics";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <QuizHome topicSlugs={getAllTopicSlugs()} />;
}
