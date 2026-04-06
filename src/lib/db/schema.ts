import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ─── Profiles ────────────────────────────────────────────────────
export const profiles = pgTable('profiles', {
  id:        uuid('id').primaryKey(),
  name:      text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
               .defaultNow()
               .notNull(),
});

// ─── Logged Bottles ───────────────────────────────────────────────
// Unlimited bottles per section. sectionId is nullable for ad-hoc
// bottles that aren't assigned to a section. slotIndex is the
// auto-assigned order within a section (0, 1, 2, 3, ...).
// A section is "complete" once it has >= 3 bottles.

export const loggedBottles = pgTable('logged_bottles', {
  id:           uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId:       uuid('user_id')
                  .notNull()
                  .references(() => profiles.id, { onDelete: 'cascade' }),
  sectionId:    integer('section_id'),   // 1–6, nullable for ad-hoc
  slotIndex:    integer('slot_index'),   // auto-assigned, nullable for ad-hoc

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
  tannin:       integer('tannin'),
  body:         integer('body'),

  // ── Rating & notes ──
  rating:       integer('rating'),
  notes:        text('notes'),

  loggedAt: timestamp('logged_at', { withTimezone: true })
              .defaultNow()
              .notNull(),
});

// ─── Types inferred from schema ───────────────────────────────────
export type Profile         = typeof profiles.$inferSelect;
export type NewProfile      = typeof profiles.$inferInsert;
export type LoggedBottle    = typeof loggedBottles.$inferSelect;
export type NewLoggedBottle = typeof loggedBottles.$inferInsert;
