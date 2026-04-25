import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type WineType =
  | 'light_red'
  | 'medium_red'
  | 'bold_red'
  | 'crisp_white'
  | 'rich_white'
  | 'sparkling'
  | 'rose'
  | 'dessert'
  | 'other';

const ALLOWED_MEDIA_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

// Cap on the decoded image size we'll forward to Claude.
// The client resizes to ~1024px, so a real wine label should land well under this.
const MAX_DECODED_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();

    if (typeof imageBase64 !== 'string' || !imageBase64.trim()) {
      return NextResponse.json(
        { found: false, error: 'imageBase64 required' },
        { status: 400 },
      );
    }

    const mt = typeof mediaType === 'string' ? mediaType : 'image/jpeg';
    if (!ALLOWED_MEDIA_TYPES.has(mt)) {
      return NextResponse.json(
        { found: false, error: `Unsupported media type: ${mt}` },
        { status: 400 },
      );
    }

    // Strip a data: URL prefix if the client included one.
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    // Rough decoded-size guard (base64 expands ~4/3).
    const approxBytes = Math.floor((cleanBase64.length * 3) / 4);
    if (approxBytes > MAX_DECODED_BYTES) {
      return NextResponse.json(
        { found: false, error: 'Image too large — please retake at lower resolution' },
        { status: 413 },
      );
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: `You are a comprehensive wine expert with deep knowledge of wines from around the world — including all major commercial producers, regions, appellations, grape varieties, and vintages. You will be shown a photograph of a wine bottle, label, or capsule. Read the label carefully and identify the wine, then return structured data using the identify_wine tool. Be precise about wine type classification.

Important guidance for label reading:
- The producer/winery name is usually the most prominent text on the label.
- The vintage is a four-digit year, often near the top or bottom of the label. Set vintage only if clearly legible.
- The grape variety may not appear on the label (especially for European wines named after region) — infer it from the appellation if you are confident.
- If the label is unclear, partially obscured, glare-blocked, or you cannot reliably make out the producer or wine name, set found=false and confidence='low' rather than guessing.
- If the photo does not appear to contain a wine label at all, set found=false.

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
          description: 'Return structured identification data for a wine identified from a label photo',
          input_schema: {
            type: 'object' as const,
            properties: {
              found: {
                type: 'boolean',
                description: 'Whether this wine could be clearly identified from the image',
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
                description: 'Vintage year if legible on the label — omit if unknown',
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
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mt as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
                data: cleanBase64,
              },
            },
            {
              type: 'text',
              text: 'Identify the wine shown on this label. If you cannot clearly read enough of the label to be sure, set found=false.',
            },
          ],
        },
      ],
    });

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

    return NextResponse.json(wine);

  } catch (error) {
    console.error('identify-wine-from-image error:', error);
    return NextResponse.json(
      { found: false, error: 'Identification failed' },
      { status: 500 },
    );
  }
}
