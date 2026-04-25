import { OnboardingSlides } from '@/components/onboarding/OnboardingSlides';

export default function OnboardingPage() {
  // Onboarding doesn't require any user data — it's purely about teaching
  // the new user what the app does. Middleware will have already created
  // an anonymous session in the background by the time they finish the
  // slides and start logging bottles.
  return <OnboardingSlides />;
}
