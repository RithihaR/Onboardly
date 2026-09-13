// app/onboarding/software/page.tsx
// Southern Cross Digital demo, using w4 (Alex Chen).
// Fixed: import path now matches the actual filename exactly
// (OnboardingExperience, not OnBoardingExperience) — the previous
// capitalization mismatch would have broken on deployment.

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
  videoModule: {
    title: "Engineering Culture Walkthrough",
    youtubeId: "i-QyW8D3ei0",
  },
};

export default function SoftwareOnboardingPage() {
  return <OnboardingExperience config={config} />;
}