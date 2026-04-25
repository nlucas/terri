import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SECTION_BY_SLUG } from '@/lib/sections';
import { getBottleById } from '@/lib/db/queries';
import { AppShell } from '@/components/layout/AppShell';
import { BottleSommelierCard } from '@/components/learn/BottleSommelierCard';

interface PageProps {
  params: Promise<{ slug: string; slot: string }>;
}

// Dynamic — no static params needed since bottles are user-specific
export const dynamic = 'force-dynamic';

const SLIDER_LABELS: Record<string, [string, string]> = {
  sweetness: ['Bone dry', 'Sweet'],
  acidity:   ['Low', 'High'],
  tannin:    ['Silky', 'Grippy'],
  body:      ['Light', 'Full'],
};

function SliderDisplay({ label, value, color }: { label: string; value: number; color: string }) {
  const [left, right] = SLIDER_LABELS[label] ?? ['Low', 'High'];
  const pct = ((value - 1) / 4) * 100;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between mb-1.5">
        <span className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </span>
        <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          {left} → {right}
        </span>
      </div>
      <div className="relative" style={{ height: 6 }}>
        <div className="absolute inset-0 rounded-full" style={{ background: 'var(--color-border-subtle)' }} />
        <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 shadow-sm"
          style={{ left: `calc(${pct}% - 8px)`, borderColor: color }}
        />
      </div>
    </div>
  );
}

export default async function BottleDetailPage({ params }: PageProps) {
  // `slot` now holds the bottle UUID (not a slot index number)
  const { slug, slot: bottleId } = await params;
  const section = SECTION_BY_SLUG[slug];
  if (!section) notFound();

  // Middleware ensures a session. Bottle ownership is enforced inside
  // getBottleById (it filters by user.id).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/learn/${slug}`);

  // Fetch this specific bottle by UUID
  const bottle = await getBottleById(bottleId, user.id);
  if (!bottle) redirect(`/learn/${slug}`);

  const slotNumber = (bottle.slotIndex ?? 0) + 1;
  const isRed = section.id <= 3;

  return (
    <AppShell>

      {/* ── Hero ────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden flex flex-col justify-end"
        style={{
          height: 180,
          background: `linear-gradient(145deg, ${section.color} 0%, ${section.colorDark} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(44,26,16,0.60) 100%)' }}
        />
        <span
          className="absolute -top-6 -right-4 select-none pointer-events-none fraunces-display font-black opacity-10"
          style={{ fontSize: 140, lineHeight: 1, color: 'white' }}
        >
          {slotNumber}
        </span>

        {/* Back */}
        <Link
          href={`/learn/${slug}?tab=bottles`}
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-white text-[13px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
        >
          ← Back
        </Link>

        <div className="relative z-10 px-5 pb-5">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-white/60 mb-1">
            {section.name} · Bottle {slotNumber}
          </p>
          <h1
            className="fraunces-display font-bold text-white leading-tight"
            style={{ fontSize: 24, textShadow: '0 1px 8px rgba(0,0,0,0.25)' }}
          >
            {bottle.wineName}
          </h1>
          {bottle.producer && (
            <p className="text-white/70 text-[13px] mt-0.5">{bottle.producer}</p>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-24 flex flex-col gap-5">

        {/* ── Wine details card ─────────────────────────────── */}
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {bottle.vintage && (
              <Detail label="Vintage" value={String(bottle.vintage)} />
            )}
            {bottle.grapeVariety && (
              <Detail label="Grape" value={bottle.grapeVariety} />
            )}
            {bottle.region && (
              <Detail label="Region" value={bottle.region} />
            )}
            {bottle.country && (
              <Detail label="Country" value={bottle.country} />
            )}
          </div>

          {/* Star rating */}
          {bottle.rating && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Your rating
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className="text-[22px]"
                    style={{ color: s <= (bottle.rating ?? 0) ? 'var(--color-honey)' : 'var(--color-border-default)' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {bottle.notes && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Your notes
              </p>
              <p className="text-[14px] leading-relaxed italic" style={{ color: 'var(--color-text-secondary)' }}>
                &ldquo;{bottle.notes}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* ── Tasting profile ───────────────────────────────── */}
        {(bottle.sweetness || bottle.acidity || bottle.tannin || bottle.body) && (
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}
          >
            <p className="fraunces-card font-bold text-[16px] mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Tasting Profile
            </p>
            {bottle.sweetness && <SliderDisplay label="sweetness" value={bottle.sweetness} color={section.color} />}
            {bottle.acidity   && <SliderDisplay label="acidity"   value={bottle.acidity}   color={section.color} />}
            {isRed && bottle.tannin && <SliderDisplay label="tannin" value={bottle.tannin} color={section.color} />}
            {bottle.body      && <SliderDisplay label="body"      value={bottle.body}      color={section.color} />}
          </div>
        )}

        {/* ── AI Sommelier ─────────────────────────────────── */}
        <div>
          <p className="fraunces-card font-bold text-[18px] mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Learn About This Wine
          </p>
          <BottleSommelierCard
            bottleContext={{
              wineName:     bottle.wineName,
              producer:     bottle.producer,
              vintage:      bottle.vintage,
              region:       bottle.region,
              country:      bottle.country,
              grapeVariety: bottle.grapeVariety,
              sweetness:    bottle.sweetness,
              acidity:      bottle.acidity,
              tannin:       bottle.tannin,
              body:         bottle.body,
              rating:       bottle.rating,
              notes:        bottle.notes,
              sectionName:  section.name,
              grapes:       section.grapes,
              sectionColor: section.color,
            }}
          />
        </div>

      </div>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </p>
      <p className="text-[14px] font-medium mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </p>
    </div>
  );
}
