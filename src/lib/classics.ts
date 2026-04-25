// ─── Classics: foundational bottles per section ───────────────────
//
// Curated list of canonical wines for each learning module. Three tiers
// per section: Starter (~$15-25), Benchmark (~$30-60), Splurge ($75+).
// Each pick has a primary recommendation + 2-3 trusted producer alternates.
//
// Source of truth (with rationale + commentary): /content/classics_recommendations.md
// Pricing is mid-2025 US retail reference. Vintages are illustrative only.
//
// Schema is intentionally extensible: `retailerLinks` is reserved for a
// future "Tap to buy" integration; `notes` carries icon/allocation flags.

import { SectionId } from '@/types';

export type ClassicTier = 'starter' | 'benchmark' | 'splurge';

export interface AlternateProducer {
  /** "Producer — Bottle" or "Producer Bottle" formatted for display. */
  label: string;
  /** Optional flag e.g. "icon, $200+" or "allocation". Renders as a chip. */
  flag?: string;
}

export interface ClassicPick {
  /** Stable identifier: `${sectionId}-${tier}-${tierIndex}` (1-3 within tier). */
  id: string;
  tier: ClassicTier;
  /** Headline producer + bottle. Producer first, bottle second. */
  producer: string;
  bottle: string;
  region: string;
  /** Approximate US retail price. Used for the price chip. */
  approxPriceUSD: number;
  /** Optional price range string when a single number is misleading (e.g. Turley). */
  priceRange?: string;
  /** One-line teaching note tying the pick to what the module covers. */
  rationale: string;
  /** 2-3 substitutes at the same tier in case the primary isn't in stock. */
  alternates: AlternateProducer[];
  /** Optional flag for the primary itself ("icon, $300+", "allocation"). */
  flag?: string;
  /** Reserved for future retailer integration. */
  retailerLinks?: { name: string; url: string }[];
}

export interface SectionClassics {
  sectionId: SectionId;
  picks: ClassicPick[];
  /** Optional caveat shown at the bottom of the tab. */
  splurgeNote?: string;
}

// ─────────────────────────────────────────────────────────────────────

export const CLASSICS: Record<SectionId, SectionClassics> = {
  // ── Section 1: Light & Elegant Reds ─────────────────────────────
  1: {
    sectionId: 1,
    picks: [
      {
        id: '1-starter-1',
        tier: 'starter',
        producer: 'Louis Jadot',
        bottle: 'Bourgogne Pinot Noir',
        region: 'Burgundy, France',
        approxPriceUSD: 22,
        rationale:
          'The textbook "first Burgundy." Reliable négociant entry point that shows the restrained, earthy, high-acid French style.',
        alternates: [
          { label: 'Joseph Drouhin Bourgogne Pinot Noir' },
          { label: 'Faiveley Bourgogne Pinot Noir' },
          { label: 'Bouchard Père & Fils Bourgogne Pinot Noir' },
        ],
      },
      {
        id: '1-starter-2',
        tier: 'starter',
        producer: 'Georges Duboeuf',
        bottle: 'Morgon',
        region: 'Beaujolais Cru, France',
        approxPriceUSD: 17,
        rationale:
          'Proves Beaujolais ≠ Beaujolais Nouveau. Morgon is the most structured Cru — granite, cherry, juicy core.',
        alternates: [
          { label: 'Henry Fessy Brouilly' },
          { label: 'Pierre-Marie Chermette Beaujolais Vieilles Vignes' },
          { label: 'Domaine Dupeuble Beaujolais' },
        ],
      },
      {
        id: '1-starter-3',
        tier: 'starter',
        producer: 'La Crema',
        bottle: 'Sonoma Coast Pinot Noir',
        region: 'Sonoma Coast, CA',
        approxPriceUSD: 22,
        rationale:
          'The contrast pour. Riper and more red-fruit forward than Burgundy. Tasted back-to-back with the Jadot, this teaches Old World vs. New World in one sip.',
        alternates: [
          { label: 'A to Z Wineworks Oregon Pinot Noir' },
          { label: 'Meiomi Pinot Noir' },
          { label: 'Acrobat Pinot Noir' },
        ],
      },
      {
        id: '1-benchmark-1',
        tier: 'benchmark',
        producer: 'Domaine Drouhin Oregon',
        bottle: '"Dundee Hills" Pinot Noir',
        region: 'Willamette Valley, OR',
        approxPriceUSD: 45,
        rationale:
          "Joseph Drouhin's Oregon project. The wine that proved Willamette could rival Burgundy. Old-World restraint, New-World fruit.",
        alternates: [
          { label: 'Cristom "Mt Jefferson Cuvée" Pinot Noir' },
          { label: 'Stoller "Estate" Pinot Noir' },
          { label: 'King Estate "Quail Run" Pinot Noir' },
        ],
      },
      {
        id: '1-benchmark-2',
        tier: 'benchmark',
        producer: 'Jean Foillard',
        bottle: 'Morgon "Côte du Py"',
        region: 'Beaujolais Cru, France',
        approxPriceUSD: 45,
        rationale:
          'The gold standard for serious Gamay. Foillard is one of the "Gang of Four" who rebuilt Beaujolais\'s reputation — granitic, complex, age-worthy.',
        alternates: [
          { label: 'Marcel Lapierre Morgon' },
          { label: 'Jean-Paul Brun "L\'Ancien"' },
          { label: 'Yvon Métras Fleurie', flag: 'allocation' },
        ],
      },
      {
        id: '1-benchmark-3',
        tier: 'benchmark',
        producer: 'Domaine Faiveley',
        bottle: 'Gevrey-Chambertin Village',
        region: 'Burgundy, France',
        approxPriceUSD: 60,
        rationale:
          'First step into "real" Burgundy — village-level wine from a stylistic touchstone domaine. Gevrey is the most structured commune; this is what Burgundy means when it gets serious.',
        alternates: [
          { label: 'Joseph Drouhin Gevrey-Chambertin' },
          { label: 'Maison Louis Jadot Gevrey-Chambertin' },
          { label: 'Bouchard Père & Fils Gevrey-Chambertin' },
        ],
      },
      {
        id: '1-splurge-1',
        tier: 'splurge',
        producer: 'Joseph Drouhin',
        bottle: 'Beaune 1er Cru "Clos des Mouches" Rouge',
        region: 'Burgundy, France',
        approxPriceUSD: 110,
        rationale:
          'Proper Premier Cru red Burgundy from a major house. Findable in any decent shop; this is what Pinot does at its highest reasonable level.',
        alternates: [
          { label: 'Louis Jadot Beaune 1er Cru "Clos des Ursules"' },
          { label: 'Bouchard "Beaune Grèves Vigne de l\'Enfant Jésus"' },
          { label: 'Faiveley "Mercurey Clos des Myglands" 1er Cru' },
        ],
      },
      {
        id: '1-splurge-2',
        tier: 'splurge',
        producer: 'Williams Selyem',
        bottle: 'Sonoma Coast Pinot Noir',
        region: 'Sonoma Coast, CA',
        approxPriceUSD: 95,
        rationale:
          'Cult California Pinot. Allocation-only at the source, but bottles surface at top shops. The benchmark for "Sonoma Pinot can be world class."',
        alternates: [
          { label: 'Kosta Browne Sonoma Coast Pinot Noir' },
          { label: 'Aubert Pinot Noir', flag: 'allocation' },
          { label: 'Marcassin Pinot Noir', flag: 'icon, allocation' },
        ],
      },
      {
        id: '1-splurge-3',
        tier: 'splurge',
        producer: 'Domaine Dujac',
        bottle: 'Morey-Saint-Denis Village',
        region: 'Burgundy, France',
        approxPriceUSD: 120,
        rationale:
          'True Burgundy from a top domaine. If you only ever drink one bottle from this list, drink this one. Whole-cluster fermented, perfumed, profound.',
        alternates: [
          { label: 'Domaine de Montille Volnay 1er Cru' },
          { label: 'Hubert Lignier Morey-Saint-Denis' },
          { label: 'Bruno Clair Marsannay "Les Longeroies"' },
        ],
      },
    ],
    splurgeNote:
      'Gamay tops out around $60–80 even at the highest end. The splurge tier is intentionally Pinot-heavy because that\'s where the price ceiling actually lives.',
  },

  // ── Section 2: Medium-Bodied Reds ───────────────────────────────
  2: {
    sectionId: 2,
    picks: [
      {
        id: '2-starter-1',
        tier: 'starter',
        producer: 'Catena',
        bottle: 'Classic Malbec',
        region: 'Mendoza, Argentina',
        approxPriceUSD: 20,
        rationale:
          'The textbook Argentine Malbec. From the family that put Mendoza on the international map. Plum, violet, mountain-cool freshness.',
        alternates: [
          { label: 'Trapiche "Oak Cask" Malbec' },
          { label: 'Bodega Norton "Reserva" Malbec' },
          { label: 'Alamos Malbec' },
        ],
      },
      {
        id: '2-starter-2',
        tier: 'starter',
        producer: 'Castello di Volpaia',
        bottle: 'Chianti Classico',
        region: 'Tuscany, Italy',
        approxPriceUSD: 22,
        rationale:
          'Proper Chianti Classico (Black Rooster seal). Traditional style — bright Sangiovese acidity, tart cherry, refuses to be a fruit bomb.',
        alternates: [
          { label: 'Banfi Chianti Classico' },
          { label: 'Tenuta di Arceno Chianti Classico' },
          { label: 'Ruffino "Riserva Ducale" Chianti Classico' },
        ],
      },
      {
        id: '2-starter-3',
        tier: 'starter',
        producer: 'Duckhorn',
        bottle: '"Decoy" Merlot',
        region: 'Sonoma County, CA',
        approxPriceUSD: 25,
        rationale:
          'Reliable, widely distributed California Merlot from a serious estate. The "Sideways was wrong" wine.',
        alternates: [
          { label: 'Sterling Vineyards Napa Merlot' },
          { label: 'Markham Vineyards Merlot' },
          { label: 'Beringer "Founders\' Estate" Merlot' },
        ],
      },
      {
        id: '2-benchmark-1',
        tier: 'benchmark',
        producer: 'Fèlsina',
        bottle: 'Chianti Classico Riserva',
        region: 'Tuscany, Italy',
        approxPriceUSD: 35,
        rationale:
          'Deeper, more structured Sangiovese. Fèlsina is one of the most consistent producers in the region — the benchmark for "serious Chianti."',
        alternates: [
          { label: 'Castello di Ama Chianti Classico' },
          { label: 'Isole e Olena Chianti Classico' },
          { label: 'Castello di Volpaia "Coltassala"', flag: 'IGT' },
        ],
      },
      {
        id: '2-benchmark-2',
        tier: 'benchmark',
        producer: 'Achaval-Ferrer',
        bottle: '"Quimera"',
        region: 'Mendoza, Argentina',
        approxPriceUSD: 45,
        rationale:
          'High-altitude Mendoza blend (Malbec-led, with Cab Franc and Merlot). Shows what Argentine wine can do beyond varietal Malbec.',
        alternates: [
          { label: 'Catena Zapata "Argentino" Malbec' },
          { label: 'Pulenta Estate "La Flor" Malbec' },
          { label: 'Bodega Salentein "Reserve" Malbec' },
        ],
      },
      {
        id: '2-benchmark-3',
        tier: 'benchmark',
        producer: 'Duckhorn',
        bottle: 'Napa Valley Merlot',
        region: 'Napa Valley, CA',
        approxPriceUSD: 60,
        rationale:
          'Flagship Napa Merlot from the producer most associated with the grape in California. The reference for ripe, plush, polished American Merlot.',
        alternates: [
          { label: 'Pahlmeyer Merlot' },
          { label: 'Shafer Merlot' },
          { label: 'Whitehall Lane Merlot' },
        ],
      },
      {
        id: '2-splurge-1',
        tier: 'splurge',
        producer: 'Il Poggione',
        bottle: 'Brunello di Montalcino',
        region: 'Tuscany, Italy',
        approxPriceUSD: 80,
        rationale:
          'Classic, findable Brunello — 100% Sangiovese aged for years. The "where Sangiovese gets serious" reference.',
        alternates: [
          { label: 'Banfi Brunello di Montalcino' },
          { label: 'Argiano Brunello di Montalcino' },
          { label: 'Biondi-Santi Brunello', flag: 'icon, $250+' },
        ],
      },
      {
        id: '2-splurge-2',
        tier: 'splurge',
        producer: 'Catena Zapata',
        bottle: '"Nicolás Catena Zapata"',
        region: 'Mendoza, Argentina',
        approxPriceUSD: 130,
        rationale:
          'Argentina\'s flagship Bordeaux blend. The "what if Mendoza made a First Growth" wine.',
        alternates: [
          { label: 'Achaval-Ferrer "Finca Altamira"' },
          { label: 'Bodega Aleanna "Gran Enemigo"' },
          { label: 'Viña Cobos "Bramare"' },
        ],
      },
      {
        id: '2-splurge-3',
        tier: 'splurge',
        producer: 'Château Larcis-Ducasse',
        bottle: 'Saint-Émilion Grand Cru Classé',
        region: 'Bordeaux, France',
        approxPriceUSD: 80,
        rationale:
          'Proper Right Bank Bordeaux — Merlot-dominant from one of Saint-Émilion\'s most consistent classed-growth estates. Pomerol icons (Pétrus, La Conseillante) sit at $250+; this is the entry to that world.',
        alternates: [
          { label: 'Château Pavie-Macquin Saint-Émilion', flag: '~$110' },
          { label: 'Château Canon Saint-Émilion', flag: '~$130' },
          { label: 'Château La Croix de Gay Pomerol', flag: '~$60' },
        ],
      },
    ],
  },

  // ── Section 3: Bold & Full Reds ─────────────────────────────────
  3: {
    sectionId: 3,
    picks: [
      {
        id: '3-starter-1',
        tier: 'starter',
        producer: 'Louis M. Martini',
        bottle: 'Sonoma County Cabernet Sauvignon',
        region: 'Sonoma County, CA',
        approxPriceUSD: 20,
        rationale:
          'Reliable, ubiquitous Sonoma Cab. The everyday-Cab reference point — shows the grape\'s structure without the Napa price tag.',
        alternates: [
          { label: 'Joel Gott "815" Cabernet' },
          { label: 'Hess "Allomi" Cabernet' },
          { label: 'J. Lohr "Seven Oaks" Cabernet' },
        ],
      },
      {
        id: '3-starter-2',
        tier: 'starter',
        producer: 'Penfolds',
        bottle: '"Bin 28 Kalimna" Shiraz',
        region: 'South Australia',
        approxPriceUSD: 25,
        rationale:
          'Classic warm-climate Shiraz from Australia\'s most important producer. Plush, peppery, blueberry-rich — the New World Syrah profile.',
        alternates: [
          { label: 'Wolf Blass "Yellow Label" Shiraz' },
          { label: 'd\'Arenberg "The Footbolt" Shiraz' },
          { label: 'Yalumba "The Y Series" Shiraz' },
        ],
      },
      {
        id: '3-starter-3',
        tier: 'starter',
        producer: 'Bogle',
        bottle: 'Old Vine Zinfandel',
        region: 'Lodi, CA',
        approxPriceUSD: 12,
        rationale:
          'The workhorse. Demonstrates the textbook California Zin profile — jammy red fruit, brambles, soft tannin — at a price that makes nightly drinking sensible.',
        alternates: [
          { label: 'Cline "Ancient Vines" Zinfandel' },
          { label: 'Ravenswood Old Vine Zinfandel' },
          { label: 'Seghesio Sonoma Zinfandel' },
        ],
      },
      {
        id: '3-benchmark-1',
        tier: 'benchmark',
        producer: "Frog's Leap",
        bottle: 'Napa Valley Cabernet Sauvignon',
        region: 'Rutherford, Napa',
        approxPriceUSD: 50,
        rationale:
          'Restrained, organically-grown Napa Cab. The counterpoint to fruit-bomb Napa — shows how the region\'s wines can be balanced and Bordeaux-like.',
        alternates: [
          { label: 'Stag\'s Leap Wine Cellars "Artemis"' },
          { label: 'Honig Napa Cabernet' },
          { label: 'Mt. Veeder Winery Napa Cabernet' },
        ],
      },
      {
        id: '3-benchmark-2',
        tier: 'benchmark',
        producer: 'E. Guigal',
        bottle: 'Crozes-Hermitage Rouge',
        region: 'Northern Rhône, France',
        approxPriceUSD: 40,
        rationale:
          'Northern Rhône Syrah at its most accessible. Smoke, black pepper, cured meat — the Old World counterpoint to Aussie Shiraz.',
        alternates: [
          { label: 'Domaine Combier Crozes-Hermitage' },
          { label: 'Yann Chave Crozes-Hermitage' },
          { label: 'Delas "Les Launes" Crozes-Hermitage' },
        ],
      },
      {
        id: '3-benchmark-3',
        tier: 'benchmark',
        producer: 'Ridge',
        bottle: '"Geyserville"',
        region: 'Sonoma County, CA',
        approxPriceUSD: 50,
        rationale:
          'The flagship Ridge field blend (mostly Zinfandel). The apex of California Zin done with restraint and oak discipline. A genuine American original.',
        alternates: [
          { label: 'Ridge "Lytton Springs"' },
          { label: 'Bedrock "Old Vine" Zinfandel' },
          { label: 'Carlisle Sonoma Zinfandel' },
        ],
      },
      {
        id: '3-splurge-1',
        tier: 'splurge',
        producer: 'Silver Oak',
        bottle: 'Alexander Valley Cabernet Sauvignon',
        region: 'Sonoma County, CA',
        approxPriceUSD: 90,
        rationale:
          'The iconic American steakhouse Cab. Polarizing among insiders, but a reference point you have to taste at least once to understand the American palate.',
        alternates: [
          { label: 'Caymus Napa Cabernet' },
          { label: 'Beringer "Knights Valley" Reserve' },
          { label: 'Stag\'s Leap Wine Cellars "Cask 23"', flag: 'icon, $300+' },
        ],
      },
      {
        id: '3-splurge-2',
        tier: 'splurge',
        producer: 'E. Guigal',
        bottle: 'Côte-Rôtie "Brune et Blonde"',
        region: 'Northern Rhône, France',
        approxPriceUSD: 95,
        rationale:
          'Classic Côte-Rôtie from the master producer. Co-fermented with a touch of Viognier, perfumed and savory. The apex of Northern Rhône Syrah outside Guigal\'s "La La" wines ($400+).',
        alternates: [
          { label: 'M. Chapoutier "La Mordorée"', flag: '~$200' },
          { label: 'Domaine Jamet Côte-Rôtie' },
          { label: 'Delas "Seigneur de Maugiron"' },
        ],
      },
      {
        id: '3-splurge-3',
        tier: 'splurge',
        producer: 'Turley',
        bottle: '"Old Vines" Zinfandel',
        region: 'Multiple CA appellations',
        approxPriceUSD: 60,
        priceRange: '$45–80',
        rationale:
          'The single-vineyard Zin reference. Turley is the apex of old-vine Zinfandel — head-trained vines older than the producer. Pricing varies by vineyard.',
        alternates: [
          { label: 'Bedrock "Esola Vineyard" Zinfandel' },
          { label: 'Carlisle "Papera Ranch" Zinfandel' },
          { label: 'Williams Selyem Zinfandel' },
        ],
      },
    ],
  },

  // ── Section 4: Crisp & Dry Whites ───────────────────────────────
  4: {
    sectionId: 4,
    picks: [
      {
        id: '4-starter-1',
        tier: 'starter',
        producer: 'Kim Crawford',
        bottle: 'Marlborough Sauvignon Blanc',
        region: 'Marlborough, NZ',
        approxPriceUSD: 15,
        rationale:
          'The Marlborough Sauv that defined the New World style for most Americans. Grapefruit, passionfruit, cut grass — the textbook "loud" Sauv.',
        alternates: [
          { label: 'Whitehaven Marlborough Sauv Blanc' },
          { label: 'Oyster Bay Sauv Blanc' },
          { label: 'Nobilo Sauv Blanc' },
        ],
      },
      {
        id: '4-starter-2',
        tier: 'starter',
        producer: 'Santa Margherita',
        bottle: 'Pinot Grigio',
        region: 'Veneto, Italy',
        approxPriceUSD: 22,
        rationale:
          'The PG that built the category in the US. Yes, it\'s basic, but it\'s the reference point everyone has tasted — and it\'s cleanly made.',
        alternates: [
          { label: 'Cavit Pinot Grigio' },
          { label: 'Ruffino "Lumina" Pinot Grigio' },
          { label: 'Maso Canali Pinot Grigio' },
        ],
      },
      {
        id: '4-starter-3',
        tier: 'starter',
        producer: 'Burgáns',
        bottle: 'Albariño',
        region: 'Rías Baixas, Spain',
        approxPriceUSD: 15,
        rationale:
          'Entry Rías Baixas Albariño, widely distributed. Saline, peachy, citrusy — coastal Spanish wine in a glass.',
        alternates: [
          { label: 'Martín Códax Albariño' },
          { label: 'Paco & Lola Albariño' },
          { label: 'Licia Albariño' },
        ],
      },
      {
        id: '4-benchmark-1',
        tier: 'benchmark',
        producer: 'Pascal Jolivet',
        bottle: 'Sancerre',
        region: 'Loire Valley, France',
        approxPriceUSD: 32,
        rationale:
          'Proper Sancerre — the European Sauv Blanc benchmark. Mineral, flinty, restrained. The Old World counterpoint to Marlborough.',
        alternates: [
          { label: 'Henri Bourgeois Sancerre' },
          { label: 'Domaine Vacheron Sancerre' },
          { label: 'Greywacke "Wild Sauvignon"', flag: 'NZ benchmark' },
        ],
      },
      {
        id: '4-benchmark-2',
        tier: 'benchmark',
        producer: 'Jermann',
        bottle: 'Pinot Grigio',
        region: 'Friuli, Italy',
        approxPriceUSD: 28,
        rationale:
          'Top Friulian PG. Proves that Italian Pinot Grigio can be a serious wine — textured, pear-skinned, faintly nutty.',
        alternates: [
          { label: 'Livio Felluga Pinot Grigio' },
          { label: 'Alois Lageder Pinot Grigio' },
          { label: 'Trimbach Pinot Gris', flag: 'Alsace' },
        ],
      },
      {
        id: '4-benchmark-3',
        tier: 'benchmark',
        producer: 'Pazo de Señoráns',
        bottle: 'Albariño',
        region: 'Rías Baixas, Spain',
        approxPriceUSD: 30,
        rationale:
          'The benchmark Albariño. More depth, salinity, and structure than the Starter tier. The wine that proves Albariño can age.',
        alternates: [
          { label: 'Do Ferreiro Albariño' },
          { label: 'Pedralonga Albariño' },
          { label: 'La Caña Albariño' },
        ],
      },
      {
        id: '4-splurge-1',
        tier: 'splurge',
        producer: 'Didier Dagueneau',
        bottle: '"Silex" Pouilly-Fumé',
        region: 'Loire Valley, France',
        approxPriceUSD: 130,
        rationale:
          'The apex of Loire Sauvignon Blanc. Dagueneau treated Sauv Blanc with the seriousness most reserve for Burgundy. Flint, smoke, profound.',
        alternates: [
          { label: 'Edmond Vatan "Clos La Néore"', flag: 'allocation' },
          { label: 'Henri Bourgeois "La Bourgeoise"' },
          { label: 'Domaine Vacheron Sancerre "Les Romains"' },
        ],
      },
      {
        id: '4-splurge-2',
        tier: 'splurge',
        producer: 'Domaine Zind-Humbrecht',
        bottle: '"Clos Windsbuhl" Pinot Gris',
        region: 'Alsace, France',
        approxPriceUSD: 95,
        rationale:
          'Apex Alsace Pinot Gris. Off-dry, rich, almost decadent — a different planet from Italian PG. Teaches that the grape has a serious side.',
        alternates: [
          { label: 'Marcel Deiss "Engelgarten" Pinot Gris' },
          { label: 'Domaine Weinbach Pinot Gris' },
          { label: 'Hugel "Jubilée" Pinot Gris' },
        ],
      },
      {
        id: '4-splurge-3',
        tier: 'splurge',
        producer: 'Do Ferreiro',
        bottle: '"Cepas Vellas" Albariño',
        region: 'Rías Baixas, Spain',
        approxPriceUSD: 80,
        rationale:
          'Old-vine, single-parcel Albariño. The wine that puts Albariño in the same conversation as top white Burgundy.',
        alternates: [
          { label: 'Pazo de Señoráns "Selección de Añada"' },
          { label: 'Forjas del Salnés "Leirana Genoveva"' },
          { label: 'Lagar de Cervera Albariño' },
        ],
      },
    ],
    splurgeNote:
      'There genuinely isn\'t a $130 Marlborough Sauv Blanc — the category tops out around $50. The splurge tier here is Old-World heavy by necessity.',
  },

  // ── Section 5: Rich & Oaky Whites ───────────────────────────────
  5: {
    sectionId: 5,
    picks: [
      {
        id: '5-starter-1',
        tier: 'starter',
        producer: 'Sonoma-Cutrer',
        bottle: '"Russian River Ranches" Chardonnay',
        region: 'Russian River, CA',
        approxPriceUSD: 25,
        rationale:
          'The classic creamy Sonoma Chardonnay. Restaurant-by-the-glass standard. Shows the textbook American Chard profile — apple, vanilla, malolactic richness.',
        alternates: [
          { label: 'Rombauer Chardonnay' },
          { label: 'La Crema Sonoma Coast Chardonnay' },
          { label: 'J. Lohr "Riverstone" Chardonnay' },
        ],
      },
      {
        id: '5-starter-2',
        tier: 'starter',
        producer: 'Louis Jadot',
        bottle: 'Mâcon-Villages',
        region: 'Burgundy, France',
        approxPriceUSD: 18,
        rationale:
          'Entry-level white Burgundy. Restrained Old World Chard — citrus, stone, almost no oak. The Old World reference at a workhorse price.',
        alternates: [
          { label: 'Joseph Drouhin Mâcon-Villages' },
          { label: 'Domaine Cordier Mâcon-Lugny' },
          { label: 'Cave de Lugny Mâcon' },
        ],
      },
      {
        id: '5-starter-3',
        tier: 'starter',
        producer: 'Yalumba',
        bottle: '"Y Series" Viognier',
        region: 'South Australia',
        approxPriceUSD: 15,
        rationale:
          'Entry-level Aussie Viognier. Apricot, honeysuckle, ginger — the textbook varietal profile at a forgiving price point.',
        alternates: [
          { label: 'McManis Family Viognier' },
          { label: 'Cline Viognier' },
          { label: 'Smoking Loon Viognier' },
        ],
      },
      {
        id: '5-benchmark-1',
        tier: 'benchmark',
        producer: 'Kistler',
        bottle: '"Les Noisetiers" Chardonnay',
        region: 'Sonoma Coast, CA',
        approxPriceUSD: 60,
        rationale:
          'The benchmark Sonoma Chard. The standard for "California oak handled with discipline" — full-bodied, Burgundian-influenced, age-worthy.',
        alternates: [
          { label: 'Far Niente Napa Chardonnay' },
          { label: 'Stony Hill Chardonnay' },
          { label: 'Hyde de Villaine "HdV" Chardonnay' },
        ],
      },
      {
        id: '5-benchmark-2',
        tier: 'benchmark',
        producer: 'Bouchard Père & Fils',
        bottle: 'Meursault',
        region: 'Burgundy, France',
        approxPriceUSD: 65,
        rationale:
          'Village-level Meursault — the most accessible great white Burgundy commune. Hazelnut, butter, citrus. The pivot wine between Mâcon and the splurge tier.',
        alternates: [
          { label: 'Joseph Drouhin Meursault' },
          { label: 'Olivier Leflaive Meursault' },
          { label: 'Louis Jadot Meursault "Genevrières" 1er Cru' },
        ],
      },
      {
        id: '5-benchmark-3',
        tier: 'benchmark',
        producer: 'Yves Cuilleron',
        bottle: 'Condrieu "La Petite Côte"',
        region: 'Northern Rhône, France',
        approxPriceUSD: 60,
        rationale:
          'Proper Condrieu — the apex appellation for Viognier. Shows what the grape becomes in its homeland: floral, peachy, oily-textured.',
        alternates: [
          { label: 'E. Guigal Condrieu' },
          { label: 'Domaine du Monteillet Condrieu' },
          { label: 'Pierre Gaillard Condrieu' },
        ],
      },
      {
        id: '5-splurge-1',
        tier: 'splurge',
        producer: 'Joseph Drouhin',
        bottle: 'Beaune 1er Cru "Clos des Mouches" Blanc',
        region: 'Burgundy, France',
        approxPriceUSD: 130,
        rationale:
          'Top white Burgundy, findable. A 1er Cru white from a major house — the Premier Cru reference without the Leflaive/Coche-Dury scarcity tax.',
        alternates: [
          { label: 'Louis Jadot Puligny-Montrachet' },
          { label: 'Olivier Leflaive Puligny-Montrachet' },
          { label: 'Domaine Leflaive Puligny-Montrachet', flag: 'icon, $200+' },
        ],
      },
      {
        id: '5-splurge-2',
        tier: 'splurge',
        producer: 'Peter Michael',
        bottle: '"Mon Plaisir" Chardonnay',
        region: 'Sonoma County, CA',
        approxPriceUSD: 110,
        rationale:
          'Apex California Chardonnay. Cult-status producer; the "what if Napa made Montrachet" wine — built to age, not for the tasting room.',
        alternates: [
          { label: 'Aubert "CIX Estate" Chardonnay' },
          { label: 'Kongsgaard Chardonnay', flag: 'icon' },
          { label: 'Marcassin Chardonnay', flag: 'icon, allocation' },
        ],
      },
      {
        id: '5-splurge-3',
        tier: 'splurge',
        producer: 'E. Guigal',
        bottle: 'Condrieu "La Doriane"',
        region: 'Northern Rhône, France',
        approxPriceUSD: 120,
        rationale:
          'Single-vineyard Condrieu from Guigal. The apex of Viognier — extravagant aromatics, full body, complete.',
        alternates: [
          { label: 'Georges Vernay "Coteau de Vernon"' },
          { label: 'Domaine André Perret "Coteau de Chéry"' },
          { label: 'Yves Cuilleron "Vertige"' },
        ],
      },
    ],
  },

  // ── Section 6: Sparkling & Rosé ─────────────────────────────────
  6: {
    sectionId: 6,
    picks: [
      {
        id: '6-starter-1',
        tier: 'starter',
        producer: 'La Marca',
        bottle: 'Prosecco',
        region: 'Veneto, Italy',
        approxPriceUSD: 15,
        rationale:
          'The most popular US Prosecco. Light, fruity, low-pressure bubbles — gives the textbook Prosecco profile (Charmat method, Glera grape).',
        alternates: [
          { label: 'Mionetto Prosecco' },
          { label: 'Zardetto Prosecco' },
          { label: 'Bisol "Crede" Prosecco Superiore', flag: 'step-up' },
        ],
      },
      {
        id: '6-starter-2',
        tier: 'starter',
        producer: 'Segura Viudas',
        bottle: 'Brut Reserva Cava',
        region: 'Penedès, Spain',
        approxPriceUSD: 13,
        rationale:
          'Entry-level Cava — traditional method (same as Champagne) at an everyday price. The "yes, real bubbles can cost $13" wine.',
        alternates: [
          { label: 'Freixenet Cordon Negro Cava' },
          { label: 'Codorníu "Anna" Cava' },
          { label: 'Pere Ventura Cava' },
        ],
      },
      {
        id: '6-starter-3',
        tier: 'starter',
        producer: 'Whispering Angel',
        bottle: 'Côtes de Provence Rosé',
        region: 'Provence, France',
        approxPriceUSD: 22,
        rationale:
          'The rosé that built the modern American category. Pale, dry, restrained — the Provence template that everyone now imitates.',
        alternates: [
          { label: 'Studio by Miraval Rosé' },
          { label: 'AIX Rosé' },
          { label: 'Wölffer Estate "Summer in a Bottle"' },
        ],
      },
      {
        id: '6-benchmark-1',
        tier: 'benchmark',
        producer: 'Veuve Clicquot',
        bottle: 'Yellow Label Brut',
        region: 'Champagne, France',
        approxPriceUSD: 60,
        rationale:
          'The most recognized Champagne house. The classic non-vintage benchmark — apple, brioche, toasted almond. The reference everyone in the world has tasted.',
        alternates: [
          { label: 'Moët & Chandon Brut Impérial' },
          { label: 'Taittinger Brut Réserve' },
          { label: 'Pommery Brut Royal' },
        ],
      },
      {
        id: '6-benchmark-2',
        tier: 'benchmark',
        producer: 'Billecart-Salmon',
        bottle: 'Brut Réserve',
        region: 'Champagne, France',
        approxPriceUSD: 60,
        rationale:
          'The sommelier-favorite grower-house Champagne. Refined, finer-bubbled, more elegant than the big names — proves that Champagne has a quiet side.',
        alternates: [
          { label: 'Ruinart Blanc de Blancs' },
          { label: 'Pol Roger Brut Réserve' },
          { label: 'Charles Heidsieck Brut Réserve' },
        ],
      },
      {
        id: '6-benchmark-3',
        tier: 'benchmark',
        producer: 'Domaine Tempier',
        bottle: 'Bandol Rosé',
        region: 'Provence, France',
        approxPriceUSD: 55,
        rationale:
          'The apex Provence rosé. Mourvèdre-dominant, structured, age-worthy — what serious people drink when they "drink rosé." A different category from Whispering Angel.',
        alternates: [
          { label: 'Château Pradeaux Bandol Rosé' },
          { label: 'Domaines Ott "Clos Mireille"' },
          { label: 'Château Simone Palette Rosé' },
        ],
      },
      {
        id: '6-splurge-1',
        tier: 'splurge',
        producer: 'Bollinger',
        bottle: '"La Grande Année"',
        region: 'Champagne, France',
        approxPriceUSD: 170,
        rationale:
          'Top-tier traditional Champagne — Pinot-dominant, vinous, oxidative. The "James Bond Champagne" with serious technique behind the marketing.',
        alternates: [
          { label: 'Pol Roger "Sir Winston Churchill"' },
          { label: 'Louis Roederer Vintage Brut' },
          { label: 'Krug "Grande Cuvée"', flag: 'icon, $200+' },
        ],
      },
      {
        id: '6-splurge-2',
        tier: 'splurge',
        producer: 'Dom Pérignon',
        bottle: 'Vintage',
        region: 'Champagne, France',
        approxPriceUSD: 220,
        rationale:
          'The icon. Polarizing among insiders, but a foundational reference point — you cannot have a Champagne education without tasting it once.',
        alternates: [
          { label: 'Louis Roederer "Cristal"', flag: 'icon, $250+' },
          { label: 'Taittinger "Comtes de Champagne" Blanc de Blancs' },
          { label: 'Salon "Le Mesnil"', flag: 'icon, allocation' },
        ],
      },
      {
        id: '6-splurge-3',
        tier: 'splurge',
        producer: "Château d'Esclans",
        bottle: '"Garrus" Rosé',
        region: 'Provence, France',
        approxPriceUSD: 100,
        rationale:
          'The apex Provence rosé — old-vine Grenache, oak-aged, made by the team behind Whispering Angel. The "rosé as a serious wine" splurge.',
        alternates: [
          { label: 'Domaine Ott "Clos Mireille Cœur de Grain"' },
          { label: 'Domaine Tempier "Cuvée La Migoua"' },
          { label: 'Léoube "Le Secret de Léoube"' },
        ],
      },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────

export function getClassicsForSection(sectionId: SectionId): SectionClassics {
  return CLASSICS[sectionId];
}

const TIER_ORDER: Record<ClassicTier, number> = {
  starter: 0,
  benchmark: 1,
  splurge: 2,
};

export function groupPicksByTier(picks: ClassicPick[]): Record<ClassicTier, ClassicPick[]> {
  const grouped: Record<ClassicTier, ClassicPick[]> = {
    starter: [],
    benchmark: [],
    splurge: [],
  };
  for (const p of picks) grouped[p.tier].push(p);
  // Stable order within tier
  for (const tier of Object.keys(grouped) as ClassicTier[]) {
    grouped[tier].sort((a, b) => a.id.localeCompare(b.id));
  }
  return grouped;
}

export const TIER_LABEL: Record<ClassicTier, string> = {
  starter: 'Starter',
  benchmark: 'Benchmark',
  splurge: 'Splurge',
};

export const TIER_PRICE_RANGE: Record<ClassicTier, string> = {
  starter: '$15–25',
  benchmark: '$30–60',
  splurge: '$75+',
};

export const TIER_DESCRIPTION: Record<ClassicTier, string> = {
  starter: 'Everyday bottles you can pour on a Tuesday. Findable, forgiving, true to the style.',
  benchmark: 'The wine to taste once you\'re serious. A clear step up — the grape with confidence.',
  splurge: 'The reference point. What the grape can do at its peak — for the special occasion.',
};

export const TIER_SORT = TIER_ORDER;
