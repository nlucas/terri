// ─── Core domain types for Terri ────────────────────────────────

export type SectionId = 1 | 2 | 3 | 4 | 5 | 6;

export interface WineSection {
  id: SectionId;
  slug: string;
  name: string;
  shortName: string;
  grapes: string[];
  color: string;
  colorDark: string;
  description: string;
  contentFile: string;
}

export interface BottleSlot {
  index: number;       // 0, 1, 2, 3… unlimited
  wineName: string;
  bottleId: string;    // DB uuid for navigation
}

export interface SectionProgress {
  sectionId: SectionId;
  bottles: BottleSlot[];  // all logged bottles, no cap
  isComplete: boolean;    // true when bottles.length >= 3
}

export interface LoggedBottle {
  id: string;
  userId: string;
  sectionId: number | null;
  slotIndex: number | null;
  wineName: string;
  producer?: string | null;
  vintage?: number | null;
  region?: string | null;
  country?: string | null;
  grapeVariety?: string | null;
  sweetness?: number | null;
  acidity?: number | null;
  tannin?: number | null;
  body?: number | null;
  rating?: number | null;
  notes?: string | null;
  loggedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  foundationalComplete: boolean;
  completedSections: SectionId[];
  totalBottlesLogged: number;
  createdAt: string;
}
