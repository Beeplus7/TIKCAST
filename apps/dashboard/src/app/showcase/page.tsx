import type { Metadata } from "next";
import { ShowcaseLanding } from "@/components/landing/ShowcaseLanding";

export const metadata: Metadata = {
  title: "Creator Showcase — TIKCAST LIVE",
  description:
    "Meet the channels running on TIKCAST — morning shows, DJ radio, movie nights, and more. Apply to be featured.",
};

export default function ShowcasePage() {
  return <ShowcaseLanding />;
}
