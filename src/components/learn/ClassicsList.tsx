'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WineSection } from '@/types';
import {
  SectionClassics,
  ClassicPick,
  ClassicTier,
  groupPicksByTier,
  TIER_LABEL,
  TIER_PRICE_RANGE,
  TIER_DESCRIPTION,
} from '@/lib/classics';

interface ClassicsListProps {
  section: WineSection;
  classics: SectionClassics;
}

const TIER_SEQUENCE: ClassicTier[] = ['starter', 'benchmark', 'splurge'];

export function ClassicsList({ section, classics }: ClassicsListProps) {
  const grouped = groupPicksByTier(classics.picks);

  return (
    <div className="px-4 pt-5 pb-28 flex flex-col gap-8">
      {/* ── Header ─────────────────────────────────────── */}
      <div>
        <p
          className="fraunces-card font-bold text-[18px]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Classic Bottles to Try
        </p>
        <p
          className="text-[13px] mt-1 leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Foundational picks for {section.shortName.toLowerCase()} across three tiers.
          Each bottle is chosen to clearly express the grape — taste a few and you build
          your own internal calibration.
        </p>
      </div>

      {/* ── Tier sections ──────────────────────────────── */}
      {TIER_SEQUENCE.map((tier) => (
        <TierBlock
          key={tier}
          tier={tier}
          picks={grouped[tier]}
          section={section}
        />
      ))}

      {/* ── Caveat (e.g. "no $130 NZ Sauv exists") ──────── */}
      {classics.splurgeNote && (
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <span className="text-base shrink-0 leading-none mt-0.5">📝</span>
          <p
            className="text-[13px] italic leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {classics.splurgeNote}
          </p>
        </div>
      )}

      {/* ── Footer note ─────────────────────────────────── */}
      <p
        className="text-[11px] text-center"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Prices are approximate US retail. Vintages illustrative. Ask your shop for the
        most recent reasonable vintage if the primary isn&rsquo;t in stock.
      </p>
    </div>
  );
}

// ─── Tier block ─────────────────────────────────────────────────

function TierBlock({
  tier,
  picks,
  section,
}: {
  tier: ClassicTier;
  picks: ClassicPick[];
  section: WineSection;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Tier header */}
      <div
        className="flex items-baseline justify-between pb-2"
        style={{ borderBottom: '1.5px solid var(--color-border-subtle)' }}
      >
        <div className="flex items-baseline gap-2">
          <h3
            className="fraunces-card font-bold text-[16px]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {TIER_LABEL[tier]}
          </h3>
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: section.colorDark }}
          >
            {TIER_PRICE_RANGE[tier]}
          </span>
        </div>
      </div>

      <p
        className="text-[12px] italic -mt-1 mb-1"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {TIER_DESCRIPTION[tier]}
      </p>

      {/* Picks */}
      {picks.map((pick) => (
        <PickCard key={pick.id} pick={pick} section={section} />
      ))}
    </div>
  );
}

// ─── Individual pick card ───────────────────────────────────────

function PickCard({
  pick,
  section,
}: {
  pick: ClassicPick;
  section: WineSection;
}) {
  const [showAlts, setShowAlts] = useState(false);
  const prefill = encodeURIComponent(`${pick.producer} ${pick.bottle}`);
  const priceLabel = pick.priceRange ?? `~$${pick.approxPriceUSD}`;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: '0 1px 6px rgba(44,26,16,0.05)',
      }}
    >
      {/* Top row: tier chip + price */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
          style={{
            background: `${section.color}1c`,
            color: section.colorDark,
            letterSpacing: '0.08em',
          }}
        >
          {TIER_LABEL[pick.tier]}
        </span>
        <span
          className="text-[12px] font-semibold"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {priceLabel}
        </span>
      </div>

      {/* Producer + bottle + region */}
      <div>
        <p
          className="fraunces-card font-bold text-[16px] leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {pick.producer}
        </p>
        <p
          className="text-[14px] mt-0.5 leading-snug"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {pick.bottle}
        </p>
        <p
          className="text-[12px] mt-1.5 flex items-center gap-2 flex-wrap"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span>{pick.region}</span>
          {pick.flag && (
            <span
              className="px-1.5 py-0.5 rounded-md text-[10px] font-medium"
              style={{
                background: 'var(--color-bg-subtle)',
                color: 'var(--color-text-muted)',
              }}
            >
              {pick.flag}
            </span>
          )}
        </p>
      </div>

      {/* Rationale */}
      <p
        className="text-[13px] italic leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {pick.rationale}
      </p>

      {/* Alternates toggle */}
      <div>
        <button
          onClick={() => setShowAlts(!showAlts)}
          className="text-[12px] font-semibold flex items-center gap-1"
          style={{ color: 'var(--color-primary)' }}
        >
          <span style={{ display: 'inline-block', width: 10 }}>
            {showAlts ? '−' : '+'}
          </span>
          {showAlts ? 'Hide' : 'Show'} {pick.alternates.length} alternates
        </button>
        {showAlts && (
          <ul className="mt-2 flex flex-col gap-1.5 pl-3">
            {pick.alternates.map((alt, i) => (
              <li
                key={i}
                className="text-[12px] leading-snug flex items-baseline gap-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span style={{ color: section.color, opacity: 0.7 }}>›</span>
                <span>
                  {alt.label}
                  {alt.flag && (
                    <span
                      className="ml-1.5 text-[10px]"
                      style={{
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      ({alt.flag})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CTA */}
      <Link
        href={`/log?section=${section.slug}&prefill=${prefill}`}
        className="mt-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.98]"
        style={{
          background: `${section.color}14`,
          color: section.colorDark,
          border: `1px solid ${section.color}30`,
        }}
      >
        Log this bottle →
      </Link>
    </div>
  );
}
