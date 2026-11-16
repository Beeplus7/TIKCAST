import type { Metadata } from "next";
import { WhyBanLanding } from "@/components/landing/WhyBanLanding";

export const metadata: Metadata = {
  title: "Why TikTok Bans Creators — TIKCAST LIVE",
  description:
    "The 8 reasons TikTok bans creators — and how TIKCAST LIVE’s Safety Net, Rights Check, Kill Switch and risk checker help you broadcast past them.",
};

export default function WhyBansPage() {
  return <WhyBanLanding />;
}
