import { createClient } from '@/lib/supabase/server';
import { insertBottle, upsertProfile, getNextSlotIndex } from '@/lib/db/queries';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure profile row exists (required for FK constraint on logged_bottles)
    await upsertProfile(user.id, {
      name: user.user_metadata?.full_name ?? user.email ?? '',
    });

    const body = await req.json();

    // Auto-assign slotIndex server-side if a section is given but no slot provided
    let resolvedSlotIndex: number | null = body.slotIndex ?? null;
    if (body.sectionId != null && resolvedSlotIndex == null) {
      resolvedSlotIndex = await getNextSlotIndex(user.id, body.sectionId);
    }

    // Always use the authenticated user's ID — never trust the client
    const result = await insertBottle({
      userId:       user.id,
      sectionId:    body.sectionId ?? null,
      slotIndex:    resolvedSlotIndex,
      wineName:     body.wineName,
      producer:     body.producer ?? null,
      vintage:      body.vintage ?? null,
      region:       body.region ?? null,
      country:      body.country ?? null,
      grapeVariety: body.grapeVariety ?? null,
      sweetness:    body.sweetness ?? null,
      acidity:      body.acidity ?? null,
      tannin:       body.tannin ?? null,
      body:         body.body ?? null,
      rating:       body.rating ?? null,
      notes:        body.notes ?? null,
    });

    return NextResponse.json({ bottle: result[0] });
  } catch (error) {
    console.error('Error saving bottle:', error);
    return NextResponse.json({ error: 'Failed to save bottle' }, { status: 500 });
  }
}
