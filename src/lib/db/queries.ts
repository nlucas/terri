import { eq, and } from 'drizzle-orm';
import { db } from './index';
import { loggedBottles, profiles, type NewLoggedBottle } from './schema';

// ─── Bottles ──────────────────────────────────────────────────────

/** Fetch all logged bottles for a user */
export async function getUserBottles(userId: string) {
  return db
    .select()
    .from(loggedBottles)
    .where(eq(loggedBottles.userId, userId))
    .orderBy(loggedBottles.loggedAt);
}

/** Fetch a single logged bottle by user + section + slot */
export async function getBottle(userId: string, sectionId: number, slotIndex: number) {
  const [bottle] = await db
    .select()
    .from(loggedBottles)
    .where(
      and(
        eq(loggedBottles.userId, userId),
        eq(loggedBottles.sectionId, sectionId),
        eq(loggedBottles.slotIndex, slotIndex)
      )
    )
    .limit(1);
  return bottle ?? null;
}

/** Fetch bottles for a specific section */
export async function getSectionBottles(userId: string, sectionId: number) {
  return db
    .select()
    .from(loggedBottles)
    .where(
      and(
        eq(loggedBottles.userId, userId),
        eq(loggedBottles.sectionId, sectionId)
      )
    );
}

/** Log a new bottle (or update existing slot) */
export async function upsertBottle(data: NewLoggedBottle) {
  return db
    .insert(loggedBottles)
    .values(data)
    .onConflictDoUpdate({
      target: [loggedBottles.userId, loggedBottles.sectionId, loggedBottles.slotIndex],
      set: {
        wineName:     data.wineName,
        producer:     data.producer,
        vintage:      data.vintage,
        region:       data.region,
        country:      data.country,
        grapeVariety: data.grapeVariety,
        sweetness:    data.sweetness,
        acidity:      data.acidity,
        tannin:       data.tannin,
        body:         data.body,
        rating:       data.rating,
        notes:        data.notes,
        loggedAt:     new Date(),
      },
    })
    .returning();
}

// ─── Progress ─────────────────────────────────────────────────────

/** Returns which sections are complete (all 3 slots filled) for a user */
export async function getCompletedSections(userId: string): Promise<number[]> {
  const bottles = await getUserBottles(userId);

  // Group by sectionId, count slots
  const counts: Record<number, number> = {};
  for (const b of bottles) {
    counts[b.sectionId] = (counts[b.sectionId] ?? 0) + 1;
  }

  // A section is complete when all 3 slots are filled
  return Object.entries(counts)
    .filter(([, count]) => count >= 3)
    .map(([sectionId]) => Number(sectionId));
}

/** Delete every logged bottle for a user — used by Reset Journey */
export async function deleteAllBottles(userId: string) {
  return db
    .delete(loggedBottles)
    .where(eq(loggedBottles.userId, userId));
}

// ─── Profiles ─────────────────────────────────────────────────────

/** Get or create a user profile (called after auth sign-in) */
export async function getProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  return profile ?? null;
}

export async function upsertProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
  return db
    .insert(profiles)
    .values({ id: userId, ...data })
    .onConflictDoUpdate({
      target: profiles.id,
      set: data,
    })
    .returning();
}
