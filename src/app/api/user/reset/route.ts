import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteAllBottles } from '@/lib/db/queries';

/**
 * DELETE /api/user/reset
 *
 * Permanently deletes all logged bottles for the authenticated user.
 * Does not log the user out or touch their auth record.
 */
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteAllBottles(user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[reset] Failed to delete bottles:', err);
    return NextResponse.json({ error: 'Failed to reset journey' }, { status: 500 });
  }
}
