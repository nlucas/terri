'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Silently redirects first-time users to /onboarding.
 * Renders nothing — purely a navigation side-effect.
 */
export function OnboardingGate() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('vinora_onboarded')) {
      router.replace('/onboarding');
    }
  }, [router]);

  return null;
}
