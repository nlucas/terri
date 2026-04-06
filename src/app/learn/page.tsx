import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getUserBottles, getCompletedSections } from '@/lib/db/queries';
import { AppShell } from '@/components/layout/AppShell';
import { SectionCard } from '@/components/learn/SectionCard';
import { IntroCard } from '@/components/learn/IntroCard';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';
import { SECTIONS, isSectionUnlocked, getSectionProgress } from '@/lib/sections';

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
    <AppShell>
      {/* Silently redirect first-timers to onboarding */}
      <OnboardingGate />

      <div className="px-4 pt-12 pb-4">

        {/* ── Header ─────────────────────────────────────────── */}
        <LearnHeader user={user} completedCount={completedSections.length} />

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
                bottles={progress.bottles}
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

function LearnHeader({ user, completedCount }: { user: User; completedCount: number }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
                'Good evening';

  const firstName = user.user_metadata?.full_name?.split(' ')[0]
    || user.email?.split('@')[0]
    || 'there';

  const encouragement =
    completedCount === 0 ? 'Your palate is waiting.' :
    completedCount < 3   ? 'You\'re finding your feet.' :
    completedCount < 6   ? 'Your palate is developing.' :
                           'The foundational track is yours.';

  return (
    <div className="mb-6">
      {/* Dark hero band */}
      <div
        className="rounded-2xl px-5 pt-5 pb-5 mb-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #2C1A10 0%, #1C0A06 100%)',
        }}
      >
        {/* Decorative large T */}
        <span
          className="absolute -right-3 -top-5 fraunces-display font-black select-none pointer-events-none"
          style={{ fontSize: 120, lineHeight: 1, color: 'rgba(255,255,255,0.04)', letterSpacing: -4 }}
        >
          T
        </span>

        <p
          className="text-[10px] font-semibold tracking-widest uppercase mb-1"
          style={{ color: 'rgba(196,144,64,0.7)' }}
        >
          {greeting}
        </p>
        <h1
          className="fraunces-display font-bold leading-tight"
          style={{ fontSize: 30, color: 'white' }}
        >
          {firstName}.
        </h1>
        <p
          className="text-[13px] mt-1 fraunces-italic"
          style={{ color: 'rgba(255,255,255,0.42)', fontStyle: 'italic' }}
        >
          {encouragement}
        </p>

        {/* Intro pill */}
        <Link
          href="/learn/intro"
          className="absolute top-4 right-4 flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.10)',
            color: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(8px)',
          }}
        >
          📖 Intro
        </Link>
      </div>
    </div>
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
