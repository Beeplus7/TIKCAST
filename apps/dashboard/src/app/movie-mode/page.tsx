import type { Metadata } from "next";
import { MovieModeLanding } from "@/components/landing/MovieModeLanding";

export const metadata: Metadata = {
  title: "Movie Mode — TIKCAST LIVE",
  description:
    "Host watch parties, premieres and movie nights on TikTok LIVE. Cinema sets, split-screen host, rights check and weekly schedules.",
};

export default function MovieModePage() {
  return <MovieModeLanding />;
}
