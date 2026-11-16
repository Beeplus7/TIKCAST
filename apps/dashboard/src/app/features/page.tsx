import type { Metadata } from "next";
import { StudioFeatures } from "@/components/landing/StudioFeatures";

export const metadata: Metadata = {
  title: "Studio Features — TIKCAST LIVE",
  description:
    "Playout, multi-screen, automation, wallpapers, interaction layer and content factory — one calm control room.",
};

export default function FeaturesPage() {
  return <StudioFeatures />;
}
