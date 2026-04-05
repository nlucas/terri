import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SECTION_BY_SLUG } from '@/lib/sections';
import { AppShell } from '@/components/layout/AppShell';
import { TastingSession } from '@/components/learn/TastingSession';

interface PageProps {
  searchParams: Promise<{ section?: string; slot?: string }>;
}

export default async function LogPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { section: sectionSlug, slot } = await searchParams;
  const section = sectionSlug ? SECTION_BY_SLUG[sectionSlug] : null;

  // Must have a valid section to open a bottle
  if (!section) redirect('/learn');

  const slotIndex = slot !== undefined ? parseInt(slot) : 0;
  const slotNumber = slotIndex + 1;

  return (
    <AppShell>
      <div className="px-4 pb-12">

        {/* ── Header ───────────────────────────────────────── */}
        <div
          className="sticky top-0 z-10 flex items-center gap-3 py-4 mb-2"
          style={{ background: 'var(--color-bg-base)' }}
        >
          <a
            href={`/learn/${section.slug}?tab=bottles`}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] shrink-0 transition-colors"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
            }}
          >
            ←
          </a>
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
              {section.name} · Bottle {slotNumber} of 3
            </p>
            <h1
              className="fraunces-display font-bold leading-tight"
              style={{ fontSize: 22, color: 'var(--color-text-primary)' }}
            >
              Open a Bottle 🍷
            </h1>
          </div>
        </div>

        {/* ── Tasting session ───────────────────────────────── */}
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
