// app/onboarding/page.tsx
// This USED TO BE the whole onboarding experience for one hardcoded
// company. Now that there are two (warehouse, software), visiting the
// bare /onboarding route doesn't make sense on its own — redirect to the
// demo chooser instead, where the visitor picks which one to view.

import { redirect } from "next/navigation";

export default function OnboardingIndexPage() {
  redirect("/demo");
}