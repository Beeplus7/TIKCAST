import type { Metadata } from "next";
import { AboutLanding } from "@/components/landing/AboutLanding";

export const metadata: Metadata = {
  title: "About + Docs — TIKCAST LIVE",
  description:
    "Why we built TIKCAST LIVE, our values, setup docs, safety policy, FAQ, and creator waitlist. Built by a creator, for creators.",
};

export default function AboutPage() {
  return <AboutLanding />;
}
