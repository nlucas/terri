import { pgTable, uuid, text, integer, timestamp, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ─── Profiles ────────────────────────────────────────────────────
// Extends Supabase auth.users — created automatically on sign-up
// via a Postgres trigger (see migration notes below).

export const profiles = pgTable('profiles', {
  id:        uuid('id').primaryKey(), // mirrors auth.users.id
  name:      text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
               .defaultNow()
               .notNull(),
});

// ─── Logged Bottles ───────────────────────────────────────────────
// One row per bottle logged. Each user gets exactly 3 slots per
// section (slot_index 0, 1, 2). The unique constraint enforces this.

export const loggedBottles = pgTable('logged_bottles', {
  id:           uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId:       uuid('user_id')
                  .notNull()
                  .references(() => profiles.id, { onDelete: 'cascade' }),
  sectionId:    integer('section_id').notNull(),   // 1–6
  slotIndex:    integer('slot_index').notNull(),    // 0–2

  // ── Wine identity ──
  wineName:     text('wine_name').notNull(),
  producer:     text('producer'),
  vintage:      integer('vintage'),
  region:       text('region'),
  country:      text('country'),
  grapeVariety: text('grape_variety'),

  // ── Tasting attributes (1–5 sliders) ──
  sweetness:    integer('sweetness'),
  acidity:      integer('acidity'),
  tannin:       integer('tannin'),    // reds only, nullable for whites
  body:         integer('body'),

  // ── Rating & notes ──
  rating:       integer('rating'),    // 1–5 stars
  notes:        text('notes'),

  loggedAt: timestamp('logged_at', { withTimezone: true })
              .defaultNow()
              .notNull(),
}, (table) => [
  // One bottle per slot per user — enforced at DB level
  unique('unique_user_section_slot').on(table.userId, table.sectionId, table.slotIndex),
]);

// ─── Types inferred from schema ───────────────────────────────────
export type Profile       = typeof profiles.$inferSelect;
export type NewProfile    = typeof profiles.$inferInsert;
export type LoggedBottle  = typeof loggedBottles.$inferSelect;
export type NewLoggedBottle = typeof loggedBottles.$inferInsert;
