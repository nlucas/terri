'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WineSection, BottleSlot } from '@/types';
import { SlotPillLarge } from './SlotPillLarge';

interface SectionTabsProps {
  section: WineSection;
  slots: [BottleSlot, BottleSlot, BottleSlot];
  isComplete: boolean;
  guideHtml: string;
  nextSectionSlug?: string;
  nextSectionShortName?: string;
  defaultTab?: 'learn' | 'bottles';
}

export function SectionTabs({
  section,
  slots,
  isComplete,
  guideHtml,
  nextSectionSlug,
  nextSectionShortName,
  defaultTab = 'learn',
}: SectionTabsProps) {
  const [tab, setTab] = useState<'learn' | 'bottles'>(defaultTab);
  const logged = slots.filter((s) => s.status === 'logged').length;

  return (
    <div>
      {/* ── Tab bar ─────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 flex"
        style={{
          background: 'var(--color-bg-base)',
          borderBottom: '1.5px solid var(--color-border-subtle)',
        }}
      >
        {(['learn', 'bottles'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-3.5 text-[14px] font-semibold transition-colors relative"
            style={{
              color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)',
              background: 'transparent',
              border: 'none',
            }}
          >
            {t === 'learn' ? '📖 Learn' : `🍷 My Bottles (${logged}/3)`}
            {tab === t && (
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                style={{ background: 'var(--color-primary)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Learn tab ───────────────────────────────────────── */}
      {tab === 'learn' && (
        <div className="px-5 pt-6 pb-28">
          <div
            className="guide-body"
            dangerouslySetInnerHTML={{ __html: guideHtml }}
          />

          {/* CTA at bottom of guide */}
          <div
            className="mt-8 rounded-xl p-5 text-center"
            style={{
              background: `linear-gradient(135deg, ${section.color}18, ${section.colorDark}28)`,
              border: `1.5px solid ${section.color}35`,
            }}
          >
            <p className="text-2xl mb-2">🍷</p>
            <p className="fraunces-card font-bold text-[17px] mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Ready to drink?
            </p>
            <p className="text-[13px] mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Open your first {section.shortName.toLowerCase()} and taste it with your AI sommelier.
            </p>
            <button
              onClick={() => setTab('bottles')}
              className="inline-block px-5 py-2.5 rounded-xl text-[14px] font-bold text-white"
              style={{ background: section.color }}
            >
              Open a Bottle →
            </button>
          </div>

          <style>{guideStyles(section.color)}</style>
        </div>
      )}

      {/* ── Bottles tab ─────────────────────────────────────── */}
      {tab === 'bottles' && (
        <div className="px-4 pt-5 pb-28 flex flex-col gap-4">

          {/* Header */}
          <div>
            <p className="fraunces-card font-bold text-[18px]" style={{ color: 'var(--color-text-primary)' }}>
              Your Bottles
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {logged === 0
                ? 'Open a bottle and taste it with your sommelier.'
                : logged === 3
                ? 'All 3 bottles tasted. Section complete!'
                : `${logged} tasted, ${3 - logged} to go.`}
            </p>
          </div>

          {/* Slots */}
          <div className="flex flex-col gap-3">
            {slots.map((slot, i) => (
              <SlotPillLarge
                key={i}
                slot={slot as BottleSlot}
                slotNumber={i + 1}
                sectionSlug={section.slug}
                sectionColor={section.color}
                sectionColorDark={section.colorDark}
              />
            ))}
          </div>

          {/* Hint to read guide first */}
          {logged === 0 && (
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <span className="text-xl">💡</span>
              <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                Read the <button onClick={() => setTab('learn')} className="underline font-semibold" style={{ color: 'var(--color-primary)' }}>Learn tab</button> first — your sommelier will connect what you taste to what you read.
              </p>
            </div>
          )}

          {/* Complete banner */}
          {isComplete && (
            <div
              className="rounded-xl p-5 text-center"
              style={{
                background: 'var(--color-primary-muted)',
                border: '1px solid rgba(124,58,82,0.15)',
              }}
            >
              <p className="text-3xl mb-2">🎉</p>
              <p className="fraunces-display font-bold text-[22px] mb-1" style={{ color: 'var(--color-primary)' }}>
                Section Complete!
              </p>
              <p className="text-[13px] mb-4" style={{ color: 'var(--color-primary-dark)' }}>
                All 3 bottles tasted. On to the next one.
              </p>
              {nextSectionSlug && (
                <Link
                  href={`/learn/${nextSectionSlug}`}
                  className="inline-block px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                  style={{ background: 'var(--color-primary)' }}
                >
                  Next: {nextSectionShortName} →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function guideStyles(sectionColor: string) {
  return `
    .guide-body h1 {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 800;
      color: var(--color-text-primary);
      line-height: 1.2;
      margin-bottom: 6px;
      margin-top: 28px;
    }
    .guide-body h1:first-child { margin-top: 0; }
    .guide-body h2 {
      font-family: var(--font-display);
      font-size: 19px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-top: 32px;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1.5px solid var(--color-border-subtle);
    }
    .guide-body h3 {
      font-size: 15px;
      font-weight: 700;
      color: var(--color-text-secondary);
      margin-top: 22px;
      margin-bottom: 8px;
    }
    .guide-body p {
      font-size: 15px;
      line-height: 1.78;
      color: var(--color-text-secondary);
      margin-bottom: 14px;
    }
    .guide-body strong {
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .guide-body em { font-style: italic; color: var(--color-text-muted); }
    .guide-body hr {
      border: none;
      border-top: 1.5px solid var(--color-border-subtle);
      margin: 24px 0;
    }
    .guide-body blockquote {
      border-left: 3px solid ${sectionColor};
      padding: 12px 16px;
      margin: 18px 0;
      border-radius: 0 10px 10px 0;
      background: var(--color-bg-subtle);
      font-size: 14px;
      line-height: 1.65;
      color: var(--color-text-secondary);
      font-style: italic;
    }
    .guide-body ul, .guide-body ol {
      margin: 10px 0 16px 0;
      padding-left: 20px;
    }
    .guide-body li {
      font-size: 14px;
      line-height: 1.7;
      color: var(--color-text-secondary);
      margin-bottom: 6px;
    }
    .guide-body code {
      font-size: 13px;
      background: var(--color-bg-subtle);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--color-primary);
    }
  `;
}
