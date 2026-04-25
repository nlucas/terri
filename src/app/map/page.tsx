import { createClient } from '@/lib/supabase/server';
import { getUserBottles } from '@/lib/db/queries';
import { AppShell } from '@/components/layout/AppShell';
import { MapView } from '@/components/map/MapView';
import type { LoggedBottle, SectionId } from '@/types';

export default async function MapPage() {
  // Middleware ensures a session (anonymous or real). Empty bottles
  // list is the right state if anonymous sign-in failed.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const rawBottles = user ? await getUserBottles(user.id) : [];

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

  return (
    <AppShell>
      <MapView bottles={bottles} uniqueCountries={uniqueCountries} />
    </AppShell>
  );
}
