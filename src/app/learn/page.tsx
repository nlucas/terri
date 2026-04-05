import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUserBottles, getCompletedSections } from '@/lib/db/queries';
import { AppShell } from '@/components/layout/AppShell';
import { SectionCard } from '@/components/learn/SectionCard';
import { IntroCard } from '@/components/learn/IntroCard';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';
import { SECTIONS, isSectionUnlocked, getSectionProgress } from '@/lib/sections';
import { BottleSlot } from '@/types';

export default async function LearnPage() {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Real data from DB
  const [bottles, completedSections] = await Promise.all([
    getUserBottles(user.id),
    getCompletedSections(user.id),
  ]);

  const foundationalComplete = completedSections.length === 6;

  return (
    <AppShell showLogButton={foundationalComplete}>
      {/* Silently redirect first-timers to onboarding */}
      <OnboardingGate />

      <div className="px-4 pt-12 pb-4">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p
                className="text-[11px] font-semibold tracking-widest uppercase mb-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Your Curriculum
              </p>
              <h1
                className="fraunces-display font-bold leading-tight"
                style={{ fontSize: 34, color: 'var(--color-text-primary)' }}
              >
                Learn Wine.
              </h1>
            </div>
            {/* Revisit intro — always accessible */}
            <Link
              href="/learn/intro"
              className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full shrink-0"
              style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-muted)',
              }}
            >
              📖 Intro
            </Link>
          </div>
          <p className="text-[14px] mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            Complete all 6 sections to unlock the advanced track.
          </p>
        </div>

        {/* ── Progress bar ───────────────────────────────────── */}
        <FoundationalProgress completedCount={completedSections.length} />

        {/* ── Section Cards ───────────────────────────────────── */}
        <div className="flex flex-col gap-4 mt-6">
          {/* Introduction module — always first */}
          <IntroCard />

          {SECTIONS.map((section) => {
            const progress = getSectionProgress(section.id, bottles);
            const unlocked = isSectionUnlocked(section.id, completedSections);

            return (
              <SectionCard
                key={section.id}
                section={section}
                slots={progress.slots as [BottleSlot, BottleSlot, BottleSlot]}
                isComplete={progress.isComplete}
                isLocked={!unlocked}
              />
            );
          })}
        </div>

        {/* ── Advanced track teaser ───────────────────────────── */}
        <div
          className="mt-6 rounded-xl p-5 text-center"
          style={{
            background: 'var(--color-bg-subtle)',
            border: '1.5px dashed var(--color-border-default)',
          }}
        >
          <p className="text-2xl mb-2">🎓</p>
          <p className="fraunces-card font-bold text-[17px]" style={{ color: 'var(--color-text-primary)' }}>
            Advanced Track
          </p>
          <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Complete all 6 foundational sections to unlock Old World vs. New World, natural wine, food pairing, and more.
          </p>
        </div>

      </div>
    </AppShell>
  );
}

function FoundationalProgress({ completedCount }: { completedCount: number }) {
  const total = 6;
  const pct = Math.round((completedCount / total) * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[12px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Foundational Track
        </span>
        <span className="text-[12px] font-semibold" style={{ color: 'var(--color-primary)' }}>
          {completedCount}/{total} complete
        </span>
      </div>
      <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: 'var(--color-border-subtle)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--color-primary-light), var(--color-primary))',
          }}
        />
      </div>
    </div>
  );
}
