import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SECTION_BY_SLUG } from '@/lib/sections';
import { getNextSlotIndex } from '@/lib/db/queries';
import { AppShell } from '@/components/layout/AppShell';
import { TastingSession } from '@/components/learn/TastingSession';
import { AdHocLogPage } from '@/components/learn/AdHocLogPage';
import { JournalLogPage } from '@/components/learn/JournalLogPage';

interface PageProps {
  searchParams: Promise<{ section?: string }>;
}

export default async function LogPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { section: sectionSlug } = await searchParams;

  // ── Ad-hoc mode: no section chosen yet ─────────────────────────
  if (!sectionSlug) {
    return (
      <AppShell>
        <AdHocLogPage />
      </AppShell>
    );
  }

  // ── Journal-only mode (no section) ─────────────────────────────
  if (sectionSlug === 'adhoc') {
    return (
      <AppShell>
        <JournalLogPage />
      </AppShell>
    );
  }

  // ── Section-specific mode ───────────────────────────────────────
  const section = SECTION_BY_SLUG[sectionSlug];
  if (!section) redirect('/log');

  // Auto-assign the next available slot for this section
  const slotIndex = await getNextSlotIndex(user.id, section.id);
  const slotNumber = slotIndex + 1;

  return (
    <AppShell>
      <div className="px-4 pb-12">

        {/* ── Header ──────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-10 flex items-center gap-3 py-4 mb-2"
          style={{ background: 'var(--color-bg-base)' }}
        >
          <Link
            href={`/learn/${section.slug}?tab=bottles`}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] shrink-0"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
            }}
          >
            ←
          </Link>
          <div>
            <p
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {section.name} · Bottle {slotNumber}
            </p>
            <h1
              className="fraunces-display font-bold leading-tight"
              style={{ fontSize: 22, color: 'var(--color-text-primary)' }}
            >
              Open a Bottle 🍷
            </h1>
          </div>
        </div>

        <TastingSession
          sectionSlug={section.slug}
          sectionId={section.id}
          sectionName={section.name}
          sectionColor={section.color}
          sectionColorDark={section.colorDark}
          grapes={section.grapes}
          slotIndex={slotIndex}
          slotNumber={slotNumber}
        />

      </div>
    </AppShell>
  );
}
