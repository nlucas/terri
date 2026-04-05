import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// What wine type each section expects
const SECTION_WINE_TYPES: Record<number, {
  types: WineType[];
  label: string;
  sectionName: string;
}> = {
  1: { types: ['light_red'],   label: 'Light red wine (Pinot Noir, Gamay, Beaujolais)',     sectionName: 'Light & Elegant Reds' },
  2: { types: ['medium_red'],  label: 'Medium-bodied red (Merlot, Sangiovese, Malbec)',      sectionName: 'Medium-Bodied Reds' },
  3: { types: ['bold_red'],    label: 'Bold, full-bodied red (Cabernet, Syrah, Zinfandel)', sectionName: 'Bold & Full Reds' },
  4: { types: ['crisp_white'], label: 'Crisp, dry white (Sauvignon Blanc, Pinot Grigio)',   sectionName: 'Crisp & Dry Whites' },
  5: { types: ['rich_white'],  label: 'Rich, oaky white (Chardonnay, Viognier)',            sectionName: 'Rich & Oaky Whites' },
  6: { types: ['sparkling', 'rose'], label: 'Sparkling wine or Rosé',                       sectionName: 'Sparkling & Rosé' },
};

const WINE_TYPE_LABELS: Record<WineType, string> = {
  light_red:   'Light Red',
  medium_red:  'Medium Red',
  bold_red:    'Bold Red',
  crisp_white: 'Crisp White',
  rich_white:  'Rich White',
  sparkling:   'Sparkling',
  rose:        'Rosé',
  dessert:     'Dessert Wine',
  other:       'Other',
};

type WineType = 'light_red' | 'medium_red' | 'bold_red' | 'crisp_white' | 'rich_white' | 'sparkling' | 'rose' | 'dessert' | 'other';

export async function POST(req: NextRequest) {
  try {
    const { wineName, producer, vintage, sectionId } = await req.json();

    if (!wineName?.trim()) {
      return NextResponse.json({ error: 'Wine name required' }, { status: 400 });
    }

    const query = [
      wineName.trim(),
      producer?.trim() && `by ${producer.trim()}`,
      vintage && `(${vintage})`,
    ].filter(Boolean).join(' ');

    // Use Claude with tool_use to get structured wine data
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: `You are a comprehensive wine expert with deep knowledge of wines from around the world — including all major commercial producers, regions, appellations, grape varieties, and vintages. When given a wine name, identify it accurately and return structured data using the identify_wine tool. Be precise about wine type classification.

Wine type classification guide:
- light_red: Pinot Noir, Gamay, Beaujolais, Zweigelt, light Grenache
- medium_red: Merlot, Sangiovese, Malbec, Barbera, Dolcetto, Grenache, Tempranillo
- bold_red: Cabernet Sauvignon, Syrah/Shiraz, Zinfandel, Petite Sirah, Nebbiolo, Mourvèdre, Tannat
- crisp_white: Sauvignon Blanc, Pinot Grigio/Pinot Gris (unoaked), Albariño, Grüner Veltliner, Vermentino, Muscadet
- rich_white: Chardonnay (especially oaked), Viognier, white Burgundy, Marsanne, Roussanne, White Rioja
- sparkling: Champagne, Prosecco, Cava, Crémant, Sparkling Wine, Sekt, Pétillant Naturel
- rose: Any Rosé or Rosado wine
- dessert: Sauternes, Port, Sherry, Ice Wine, late harvest wines
- other: Orange wine, field blends, anything else`,
      tools: [
        {
          name: 'identify_wine',
          description: 'Return structured identification data for a wine',
          input_schema: {
            type: 'object' as const,
            properties: {
              found: {
                type: 'boolean',
                description: 'Whether this wine could be clearly identified',
              },
              confidence: {
                type: 'string',
                enum: ['high', 'medium', 'low'],
                description: 'Confidence in the identification',
              },
              canonicalName: {
                type: 'string',
                description: 'The full official name of the wine',
              },
              producer: {
                type: 'string',
                description: 'The winery or producer name',
              },
              vintage: {
                type: 'integer',
                description: 'Vintage year if this is a non-vintage wine or if known from query — omit if unknown',
              },
              region: {
                type: 'string',
                description: 'The specific wine region (e.g. "Willamette Valley", "Burgundy", "Napa Valley")',
              },
              country: {
                type: 'string',
                description: 'Country of origin',
              },
              grapeVariety: {
                type: 'string',
                description: 'Primary grape variety or blend description',
              },
              wineType: {
                type: 'string',
                enum: ['light_red', 'medium_red', 'bold_red', 'crisp_white', 'rich_white', 'sparkling', 'rose', 'dessert', 'other'],
                description: 'The wine style/type classification',
              },
              oneLiner: {
                type: 'string',
                description: 'One warm, specific sentence about this wine that would excite a beginner',
              },
            },
            required: ['found', 'confidence', 'wineType'],
          },
        },
      ],
      tool_choice: { type: 'tool', name: 'identify_wine' },
      messages: [
        {
          role: 'user',
          content: `Identify this wine: ${query}`,
        },
      ],
    });

    // Extract the tool result
    const toolUse = response.content.find((b) => b.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      return NextResponse.json({ found: false });
    }

    const wine = toolUse.input as {
      found: boolean;
      confidence: 'high' | 'medium' | 'low';
      canonicalName?: string;
      producer?: string;
      vintage?: number;
      region?: string;
      country?: string;
      grapeVariety?: string;
      wineType: WineType;
      oneLiner?: string;
    };

    // Check section match
    let matchesSection = true;
    let mismatchMessage: string | undefined;

    if (sectionId && wine.found && wine.wineType) {
      const sectionSpec = SECTION_WINE_TYPES[sectionId];
      if (sectionSpec && !sectionSpec.types.includes(wine.wineType)) {
        matchesSection = false;
        const wineLabel = WINE_TYPE_LABELS[wine.wineType] ?? wine.wineType;
        mismatchMessage = `This looks like a ${wineLabel}, but you're studying ${sectionSpec.sectionName}. This section calls for: ${sectionSpec.label}.`;
      }
    }

    return NextResponse.json({
      ...wine,
      matchesSection,
      mismatchMessage,
    });

  } catch (error) {
    console.error('identify-wine error:', error);
    return NextResponse.json({ found: false, error: 'Identification failed' });
  }
}
