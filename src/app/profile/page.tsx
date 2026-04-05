import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserBottles, getCompletedSections, getProfile } from '@/lib/db/queries';
import { AppShell } from '@/components/layout/AppShell';
import { ProfileView } from '@/components/profile/ProfileView';
import type { LoggedBottle, SectionId } from '@/types';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [rawBottles, completedSections, profile] = await Promise.all([
    getUserBottles(user.id),
    getCompletedSections(user.id),
    getProfile(user.id),
  ]);

  const bottles: LoggedBottle[] = rawBottles.map((b) => ({
    id: b.id,
    userId: b.userId,
    sectionId: b.sectionId as SectionId,
    slotIndex: b.slotIndex as 0 | 1 | 2,
    wineName: b.wineName,
    producer: b.producer ?? undefined,
    vintage: b.vintage ?? undefined,
    region: b.region ?? undefined,
    country: b.country ?? undefined,
    grapeVariety: b.grapeVariety ?? undefined,
    sweetness: b.sweetness ?? undefined,
    acidity: b.acidity ?? undefined,
    tannin: b.tannin ?? undefined,
    body: b.body ?? undefined,
    rating: b.rating ?? undefined,
    notes: b.notes ?? undefined,
    loggedAt: b.loggedAt instanceof Date
      ? b.loggedAt.toISOString()
      : String(b.loggedAt),
  }));

  const uniqueCountries = [...new Set(
    bottles.map((b) => b.country).filter(Boolean) as string[]
  )];

  const profileData = {
    name: profile?.name ?? user.user_metadata?.full_name ?? null,
    email: user.email ?? '',
    avatarUrl: profile?.avatarUrl ?? null,
    createdAt: user.created_at ?? new Date().toISOString(),
    bottles,
    completedSections,
    uniqueCountries,
  };

  return (
    <AppShell>
      <ProfileView data={profileData} />
    </AppShell>
  );
}
