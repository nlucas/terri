import { createClient } from '@/lib/supabase/server';
import { getUserBottles, getCompletedSections } from '@/lib/db/queries';
import { AppShell } from '@/components/layout/AppShell';
import { JournalView } from '@/components/journal/JournalView';
import type { LoggedBottle, SectionId } from '@/types';

export default async function JournalPage() {
  // Middleware ensures a session (anonymous or real). Defensive null
  // fallback in case anonymous sign-in is disabled in Supabase.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [rawBottles, completedSections] = user
    ? await Promise.all([
        getUserBottles(user.id),
        getCompletedSections(user.id),
      ])
    : [[], [] as number[]];

  // Serialize for client (dates → strings, normalise types)
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
      <JournalView
        bottles={bottles}
        completedSections={completedSections}
        uniqueCountries={uniqueCountries}
      />
    </AppShell>
  );
}
