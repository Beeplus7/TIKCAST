import type { Metadata } from "next";
import { PricingLanding } from "@/components/landing/PricingLanding";

export const metadata: Metadata = {
  title: "Pricing — TIKCAST LIVE",
  description:
    "Start free. Upgrade when your channel grows. Starter, Creator, Studio Pro and Network plans with Safety Net on paid tiers.",
};

export default function PricingPage() {
  return <PricingLanding />;
}
