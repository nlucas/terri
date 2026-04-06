'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { SECTIONS } from '@/lib/sections';
import type { LoggedBottle } from '@/types';

// ─── Types ────────────────────────────────────────────────────────

interface JournalProps {
  bottles: LoggedBottle[];
  completedSections: number[];
  uniqueCountries: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StarRating({ rating }: { rating?: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{ fontSize: 13, opacity: i < rating ? 1 : 0.2 }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function MiniBar({
  label,
  value,
  color,
}: {
  label: string;
  value?: number | null;
  color: string;
}) {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[10px] font-medium w-14 shrink-0"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </span>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: 4, background: 'var(--color-border-subtle)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${(value / 5) * 100}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

// ─── Bottle Card ─────────────────────────────────────────────────

function BottleCard({ bottle }: { bottle: LoggedBottle }) {
  const [expanded, setExpanded] = useState(false);
  const section = SECTIONS.find((s) => s.id === bottle.sectionId);
  if (!section) return null;

  const hasSliders =
    bottle.sweetness != null ||
    bottle.acidity != null ||
    bottle.tannin != null ||
    bottle.body != null;

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: '0 2px 10px rgba(44,26,16,0.06)',
      }}
    >
      {/* Color strip */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${section.color}, ${section.colorDark})`,
        }}
      />

      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <p
              className="fraunces-card font-bold text-[17px] leading-snug"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {bottle.wineName}
            </p>
            {(bottle.producer || bottle.vintage || bottle.region) && (
              <p
                className="text-[12px] mt-0.5 truncate"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {[bottle.producer, bottle.vintage, bottle.region]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: `${section.color}22`,
                color: section.colorDark,
                border: `1px solid ${section.color}44`,
              }}
            >
              {section.shortName}
            </span>
            <StarRating rating={bottle.rating} />
          </div>
        </div>

        {/* Grape + Country */}
        <div className="flex items-center gap-2 mb-3">
          {bottle.grapeVariety && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--color-bg-subtle)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {bottle.grapeVariety}
            </span>
          )}
          {bottle.country && (
            <span
              className="text-[11px]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {bottle.country}
            </span>
          )}
          <span
            className="text-[11px] ml-auto"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {formatDate(bottle.loggedAt)}
          </span>
        </div>

        {/* Tasting bars */}
        {hasSliders && (
          <div className="flex flex-col gap-2">
            <MiniBar label="Sweetness" value={bottle.sweetness} color={section.color} />
            <MiniBar label="Acidity" value={bottle.acidity} color={section.color} />
            <MiniBar label="Tannin" value={bottle.tannin} color={section.color} />
            <MiniBar label="Body" value={bottle.body} color={section.color} />
          </div>
        )}

        {/* Expand indicator */}
        {bottle.notes && (
          <div
            className="flex items-center gap-1.5 mt-3 text-[12px]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span>{expanded ? '▴' : '▾'}</span>
            <span>{expanded ? 'Hide notes' : 'View notes'}</span>
          </div>
        )}
      </div>

      {/* Expanded notes */}
      <AnimatePresence>
        {expanded && bottle.notes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="px-4 pb-4"
              style={{
                borderTop: '1px solid var(--color-border-subtle)',
                paddingTop: 12,
                marginTop: 0,
              }}
            >
              <p
                className="text-[13px] leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}
              >
                &ldquo;{bottle.notes}&rdquo;
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Stats Bar ───────────────────────────────────────────────────

function StatsBar({
  bottles,
  completedSections,
  uniqueCountries,
}: {
  bottles: LoggedBottle[];
  completedSections: number[];
  uniqueCountries: string[];
}) {
  const ratedBottles = bottles.filter((b) => b.rating != null);
  const avgRating =
    ratedBottles.length > 0
      ? (
          ratedBottles.reduce((sum, b) => sum + (b.rating ?? 0), 0) /
          ratedBottles.length
        ).toFixed(1)
      : null;

  const stats = [
    { label: 'Bottles', value: `${bottles.length}/18`, emoji: '🍷' },
    { label: 'Sections', value: `${completedSections.length}/6`, emoji: '📚' },
    { label: 'Countries', value: `${uniqueCountries.length}`, emoji: '🌍' },
    {
      label: 'Avg Rating',
      value: avgRating ? `${avgRating}★` : '—',
      emoji: '⭐',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-5">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center py-3 rounded-xl"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <span style={{ fontSize: 18 }}>{s.emoji}</span>
          <span
            className="text-[14px] font-bold mt-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {s.value}
          </span>
          <span
            className="text-[10px] mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Filter Chips ────────────────────────────────────────────────

function FilterChips({
  active,
  onChange,
}: {
  active: number | null;
  onChange: (id: number | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-4 hide-scrollbar">
      <button
        onClick={() => onChange(null)}
        className="shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
        style={{
          background: active === null ? 'var(--color-primary)' : 'var(--color-bg-surface)',
          color: active === null ? '#fff' : 'var(--color-text-secondary)',
          border: active === null ? 'none' : '1px solid var(--color-border-subtle)',
        }}
      >
        All
      </button>
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(active === s.id ? null : s.id)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
          style={{
            background:
              active === s.id ? `${s.color}` : 'var(--color-bg-surface)',
            color: active === s.id ? '#fff' : 'var(--color-text-secondary)',
            border: active === s.id ? 'none' : '1px solid var(--color-border-subtle)',
          }}
        >
          {s.shortName}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function JournalView({ bottles, completedSections, uniqueCountries }: JournalProps) {
  const [activeSection, setActiveSection] = useState<number | null>(null);

  const filtered =
    activeSection === null
      ? [...bottles].sort(
          (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
        )
      : bottles
          .filter((b) => b.sectionId === activeSection)
          .sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0));

  return (
    <div className="px-4 pt-12 pb-4">
      {/* Header */}
      <div className="mb-6">
        <p
          className="text-[11px] font-semibold tracking-widest uppercase mb-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Your Tasting Notes
        </p>
        <h1
          className="fraunces-display font-bold leading-tight"
          style={{ fontSize: 34, color: 'var(--color-text-primary)' }}
        >
          Journal.
        </h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Every bottle, every note, every discovery.
        </p>
      </div>

      {/* Stats */}
      <StatsBar
        bottles={bottles}
        completedSections={completedSections}
        uniqueCountries={uniqueCountries}
      />

      {/* Filters */}
      <FilterChips active={activeSection} onChange={setActiveSection} />

      {/* Bottles */}
      {filtered.length === 0 ? (
        <EmptyState hasAnyBottles={bottles.length > 0} />
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((bottle, i) => (
              <motion.div
                key={bottle.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <BottleCard bottle={bottle} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasAnyBottles }: { hasAnyBottles: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1.5px dashed var(--color-border-default)',
      }}
    >
      <span style={{ fontSize: 48, marginBottom: 12 }}>🍷</span>
      <p
        className="fraunces-card font-bold text-[18px] mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {hasAnyBottles ? 'No bottles in this section yet' : 'Nothing here yet'}
      </p>
      <p
        className="text-[13px] leading-relaxed max-w-xs mb-5"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {hasAnyBottles
          ? 'Try a different filter — your bottles are in another section.'
          : 'Open a bottle in the Learn tab and your tasting notes will appear here.'}
      </p>
      {!hasAnyBottles && (
        <Link
          href="/learn"
          className="px-5 py-2.5 rounded-xl font-semibold text-[14px] text-white"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
          }}
        >
          Go to Curriculum →
        </Link>
      )}
    </div>
  );
}
