import type { Metadata } from "next";
import { DjRadioLanding } from "@/components/landing/DjRadioLanding";

export const metadata: Metadata = {
  title: "DJ Radio Mode — TIKCAST LIVE",
  description:
    "Audio-only TikTok LIVE radio. Animated MP4 wallpapers, Auto-DJ scheduler, live requests, gift shoutouts — no camera needed.",
};

export default function DjRadioPage() {
  return <DjRadioLanding />;
}
