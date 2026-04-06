import { WineSection } from '@/types';

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

// All 6 foundational sections are always open.
// Advanced track (future) remains locked.
export function isSectionUnlocked(
  _sectionId: number,
  _completedSections: number[]
): boolean {
  return true;
}

// Returns all logged bottles for a section — no slot cap.
// isComplete triggers at 3 bottles.
export function getSectionProgress(
  sectionId: number,
  allBottles: { id: string; sectionId: number | null; slotIndex: number | null; wineName: string }[]
) {
  const sectionBottles = allBottles
    .filter((b) => b.sectionId === sectionId)
    .sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0));

  const bottles = sectionBottles.map((b, i) => ({
    index: i,
    wineName: b.wineName,
    bottleId: b.id,
  }));

  return {
    sectionId,
    bottles,
    isComplete: bottles.length >= 3,
  };
}

// ─── Smart section detection from grape variety ───────────────────
// Used by ad-hoc logging to suggest a section match.

const SECTION_GRAPES: { id: number; keywords: string[] }[] = [
  { id: 1, keywords: ['pinot noir', 'gamay', 'beaujolais', 'burgundy', 'bourgogne'] },
  { id: 2, keywords: ['merlot', 'sangiovese', 'malbec', 'chianti', 'montepulciano', 'rioja', 'tempranillo', 'barbera', 'dolcetto'] },
  { id: 3, keywords: ['cabernet sauvignon', 'cab sauv', 'syrah', 'shiraz', 'zinfandel', 'petite sirah', 'mourvèdre', 'mourvedre', 'grenache', 'bordeaux'] },
  { id: 4, keywords: ['sauvignon blanc', 'pinot grigio', 'pinot gris', 'albariño', 'albarino', 'muscadet', 'grüner veltliner', 'gruner', 'vermentino', 'sancerre', 'pouilly fumé', 'vinho verde'] },
  { id: 5, keywords: ['chardonnay', 'viognier', 'white burgundy', 'white rioja', 'roussanne', 'marsanne', 'white rhône'] },
  { id: 6, keywords: ['champagne', 'prosecco', 'cava', 'rosé', 'rose', 'sparkling', 'crémant', 'cremant', 'sekt', 'pétillant', 'pet nat', 'moscato', 'lambrusco'] },
];

export function detectSectionFromGrape(input: string): number | null {
  if (!input.trim()) return null;
  const lower = input.toLowerCase();
  for (const { id, keywords } of SECTION_GRAPES) {
    if (keywords.some((kw) => lower.includes(kw))) return id;
  }
  return null;
}
