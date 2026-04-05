// ─── Core domain types for Vinora ────────────────────────────────

export type SectionId = 1 | 2 | 3 | 4 | 5 | 6;

export interface WineSection {
  id: SectionId;
  slug: string;
  name: string;
  shortName: string;
  grapes: string[];
  color: string;          // CSS hex — card header gradient start
  colorDark: string;      // CSS hex — card header gradient end
  description: string;    // one-sentence hook shown on card
  contentFile: string;    // path to markdown content
}

export type SlotStatus = 'empty' | 'logged';

export interface BottleSlot {
  index: 0 | 1 | 2;
  status: SlotStatus;
  wineName?: string;
  wineId?: string;
}

export interface SectionProgress {
  sectionId: SectionId;
  slots: [BottleSlot, BottleSlot, BottleSlot];
  isComplete: boolean;
}

export interface LoggedBottle {
  id: string;
  userId: string;
  sectionId: SectionId;
  slotIndex: 0 | 1 | 2;
  wineName: string;
  producer?: string;
  vintage?: number;
  region?: string;
  country?: string;
  grapeVariety?: string;
  sweetness?: number;   // 1-5 slider
  acidity?: number;     // 1-5 slider
  tannin?: number;      // 1-5 slider (reds only)
  body?: number;        // 1-5 slider
  rating?: number;      // 1-5 stars
  notes?: string;
  loggedAt: string;     // ISO date string
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
