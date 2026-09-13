// app/onboarding/software/page.tsx
// Southern Cross Digital demo, using w4 (Alex Chen) — run
// db/add_software_worker.sql first so this worker actually exists.

import { OnboardingExperience, type CompanyConfig } from "@/components/onboarding/OnBoardingExperience";


const config: CompanyConfig = {
  companyId: "software",
  companyName: "Southern Cross Digital",
  workerId: "w4",
  workerDisplayName: "Alex Chen",
  theme: "slate",
  logoUrl: "/software-logo.png",
  avatarUrl: "/user (1).png",
  prevArrowUrl: "/left.png",
  nextArrowUrl: "/right.png",
  moduleImageUrl: "/software-image.png",
  backgroundImageUrl: "/software-office-bg.jfif",
};

export default function SoftwareOnboardingPage() {
  return <OnboardingExperience config={config} />;
}