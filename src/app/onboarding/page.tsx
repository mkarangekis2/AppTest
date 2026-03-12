import { requireUser } from "@/lib/auth";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export default async function OnboardingPage() {
  await requireUser();
  return <OnboardingWizard />;
}
