import { eq, and, isNull } from 'drizzle-orm';
import { db } from './index';
import { loggedBottles, profiles, type NewLoggedBottle } from './schema';

// ─── Bottles ──────────────────────────────────────────────────────

/** Fetch all logged bottles for a user, oldest first */
export async function getUserBottles(userId: string) {
  return db
    .select()
    .from(loggedBottles)
    .where(eq(loggedBottles.userId, userId))
    .orderBy(loggedBottles.loggedAt);
}

/** Fetch a single bottle by its UUID */
export async function getBottleById(bottleId: string, userId: string) {
  const [bottle] = await db
    .select()
    .from(loggedBottles)
    .where(
      and(
        eq(loggedBottles.id, bottleId),
        eq(loggedBottles.userId, userId)
      )
    )
    .limit(1);
  return bottle ?? null;
}

/** Fetch a single logged bottle by user + section + slot (legacy compat) */
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

/** Fetch all bottles for a specific section, ordered by slot */
export async function getSectionBottles(userId: string, sectionId: number) {
  return db
    .select()
    .from(loggedBottles)
    .where(
      and(
        eq(loggedBottles.userId, userId),
        eq(loggedBottles.sectionId, sectionId)
      )
    )
    .orderBy(loggedBottles.loggedAt);
}

/** Fetch ad-hoc bottles (no section assigned) */
export async function getAdhocBottles(userId: string) {
  return db
    .select()
    .from(loggedBottles)
    .where(
      and(
        eq(loggedBottles.userId, userId),
        isNull(loggedBottles.sectionId)
      )
    )
    .orderBy(loggedBottles.loggedAt);
}

/** Get the next slot index for a section (= current count of bottles in that section) */
export async function getNextSlotIndex(userId: string, sectionId: number): Promise<number> {
  const existing = await getSectionBottles(userId, sectionId);
  return existing.length;
}

/** Insert a new bottle. slotIndex should be pre-computed via getNextSlotIndex. */
export async function insertBottle(data: NewLoggedBottle) {
  return db
    .insert(loggedBottles)
    .values(data)
    .returning();
}

// ─── Progress ─────────────────────────────────────────────────────

/** Returns which sections are complete (3+ bottles) for a user */
export async function getCompletedSections(userId: string): Promise<number[]> {
  const bottles = await getUserBottles(userId);

  const counts: Record<number, number> = {};
  for (const b of bottles) {
    if (b.sectionId != null) {
      counts[b.sectionId] = (counts[b.sectionId] ?? 0) + 1;
    }
  }

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
