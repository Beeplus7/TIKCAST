import { ProductionReadinessPage } from "@/components/landing/ProductionReadinessPage";

export const metadata = {
  title: "Production Readiness — TIKCAST LIVE",
  description:
    "Dual MVP / Full Project Tree OS production readiness score for TIKCAST LIVE.",
};

export default function ReadinessRoute() {
  return <ProductionReadinessPage />;
}
