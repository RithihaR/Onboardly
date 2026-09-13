// app/onboarding/warehouse/page.tsx
// Southern Cross Distribution demo, using a real worker from your
// existing workers table (w1 — Amrit Singh) instead of a fictitious
// "W-1001" that doesn't exist in your database.

import { OnboardingExperience, type CompanyConfig } from "@/components/onboarding/OnBoardingExperience";

const config: CompanyConfig = {
  companyId: "warehouse",
  companyName: "Southern Cross Distribution",
  workerId: "w1",
  workerDisplayName: "Amrit Singh",
  theme: "orange",
  logoUrl: "/warehouse-logo.png",
  avatarUrl: "/user (1).png",
  prevArrowUrl: "/left.png",
  nextArrowUrl: "/right.png",
  moduleImageUrl: "/warehouse-image.avif",
  backgroundImageUrl: "/warehouse.jfif",
};

export default function WarehouseOnboardingPage() {
  return <OnboardingExperience config={config} />;
}