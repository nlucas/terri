import { WineSection } from '@/types';

// ─── The 6 Foundational Sections ─────────────────────────────────
// Order matters: this is the progression order.
// Color pairs are used for full-bleed card header gradients.

export const SECTIONS: WineSection[] = [
  {
    id: 1,
    slug: 'light-elegant-reds',
    name: 'Light & Elegant Reds',
    shortName: 'Light Reds',
    grapes: ['Pinot Noir', 'Gamay', 'Beaujolais'],
    color: '#D49080',
    colorDark: '#A05848',
    description: 'Silky, subtle, and wildly misunderstood — start here.',
    contentFile: '01_light_elegant_reds',
  },
  {
    id: 2,
    slug: 'medium-bodied-reds',
    name: 'Medium-Bodied Reds',
    shortName: 'Medium Reds',
    grapes: ['Merlot', 'Sangiovese', 'Malbec'],
    color: '#9B5070',
    colorDark: '#7C3A52',
    description: 'The everyday wines. Easy to drink, hard to put down.',
    contentFile: '02_medium_bodied_reds',
  },
  {
    id: 3,
    slug: 'bold-full-reds',
    name: 'Bold & Full Reds',
    shortName: 'Bold Reds',
    grapes: ['Cabernet Sauvignon', 'Syrah', 'Zinfandel'],
    color: '#4A3020',
    colorDark: '#2C1A10',
    description: 'Big, structured wines built for long evenings.',
    contentFile: '03_bold_full_reds',
  },
  {
    id: 4,
    slug: 'crisp-dry-whites',
    name: 'Crisp & Dry Whites',
    shortName: 'Crisp Whites',
    grapes: ['Sauvignon Blanc', 'Pinot Grigio', 'Albariño'],
    color: '#5C8C6C',
    colorDark: '#3D5948',
    description: 'Fresh, bright, and perfect for the convert.',
    contentFile: '04_crisp_dry_whites',
  },
  {
    id: 5,
    slug: 'rich-oaky-whites',
    name: 'Rich & Oaky Whites',
    shortName: 'Rich Whites',
    grapes: ['Chardonnay', 'Viognier'],
    color: '#D4A850',
    colorDark: '#C49040',
    description: 'Butter, oak, and the Napa effect. You\'ll have opinions.',
    contentFile: '05_rich_oaky_whites',
  },
  {
    id: 6,
    slug: 'sparkling-rose',
    name: 'Sparkling & Rosé',
    shortName: 'Sparkling',
    grapes: ['Champagne', 'Prosecco', 'Cava', 'Provence Rosé'],
    color: '#D4A8B8',
    colorDark: '#C490A8',
    description: 'Bubbles, blush, and the art of celebration.',
    contentFile: '06_sparkling_rose',
  },
];

export const SECTION_BY_ID = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s])
) as Record<number, WineSection>;

export const SECTION_BY_SLUG = Object.fromEntries(
  SECTIONS.map((s) => [s.slug, s])
) as Record<string, WineSection>;

// A section is "unlocked" if all previous sections are complete
export function isSectionUnlocked(
  sectionId: number,
  completedSections: number[]
): boolean {
  if (sectionId === 1) return true;
  // All sections with lower IDs must be complete
  for (let i = 1; i < sectionId; i++) {
    if (!completedSections.includes(i)) return false;
  }
  return true;
}

export function getSectionProgress(
  sectionId: number,
  loggedBottles: { sectionId: number; slotIndex: number; wineName: string }[]
) {
  const sectionBottles = loggedBottles.filter((b) => b.sectionId === sectionId);
  const slots = [0, 1, 2].map((i) => {
    const bottle = sectionBottles.find((b) => b.slotIndex === i);
    return {
      index: i as 0 | 1 | 2,
      status: bottle ? ('logged' as const) : ('empty' as const),
      wineName: bottle?.wineName,
    };
  });
  return {
    sectionId,
    slots: slots as [typeof slots[0], typeof slots[0], typeof slots[0]],
    isComplete: slots.every((s) => s.status === 'logged'),
  };
}
