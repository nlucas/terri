'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WineSection } from '@/types';
import { detectSectionFromGrape } from '@/lib/sections';

interface AdHocLogPageProps {
  sections: WineSection[];
}

export function AdHocLogPage({ sections }: AdHocLogPageProps) {
  const router = useRouter();
  const [grapeInput, setGrapeInput] = useState('');
  const [detectedId, setDetectedId] = useState<number | null>(null);

  function handleGrapeChange(val: string) {
    setGrapeInput(val);
    setDetectedId(detectSectionFromGrape(val));
  }

  function goToSection(slug: string) {
    router.push(`/log?section=${slug}`);
  }

  function goToJournalOnly() {
    router.push('/log?section=adhoc');
  }

  return (
    <div className="px-4 pt-6 pb-28">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] mb-4"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
          }}
        >
          ←
        </button>
        <p
          className="text-[11px] font-semibold tracking-widest uppercase mb-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Log a Bottle
        </p>
        <h1
          className="fraunces-display font-bold leading-tight"
          style={{ fontSize: 30, color: 'var(--color-text-primary)' }}
        >
          What are you drinking?
        </h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Pick a section or type a grape to find it automatically.
        </p>
      </div>

      {/* ── Smart grape detector ────────────────────────────────── */}
      <div className="mb-6">
        <input
          type="text"
          value={grapeInput}
          onChange={(e) => handleGrapeChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (detectedId) {
                const section = sections.find(s => s.id === detectedId);
                if (section) goToSection(section.slug);
              } else if (grapeInput.trim()) {
                goToJournalOnly();
              }
            }
          }}
          placeholder="Type a grape or wine style… e.g. Pinot Noir"
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1.5px solid var(--color-border-default)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-body)',
          }}
        />
        {detectedId && (
          <div
            className="mt-2 px-3 py-2 rounded-lg flex items-center gap-2"
            style={{
              background: 'var(--color-primary-muted)',
              border: '1px solid rgba(124,58,82,0.15)',
            }}
          >
            <span className="text-sm">✨</span>
            <p className="text-[13px]" style={{ color: 'var(--color-primary)' }}>
              Looks like a <strong>{sections.find(s => s.id === detectedId)?.shortName}</strong> — tap it below to log there.
            </p>
          </div>
        )}
      </div>

      {/* ── Section grid ─────────────────────────────────────────── */}
      <p
        className="text-[11px] font-semibold tracking-widest uppercase mb-3"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Choose a Section
      </p>

      <div className="flex flex-col gap-3 mb-6">
        {sections.map((section) => {
          const isDetected = detectedId === section.id;
          return (
            <button
              key={section.id}
              onClick={() => goToSection(section.slug)}
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all active:scale-[0.98]"
              style={{
                background: isDetected
                  ? `linear-gradient(135deg, ${section.color}, ${section.colorDark})`
                  : 'var(--color-bg-surface)',
                border: isDetected
                  ? 'none'
                  : '1.5px solid var(--color-border-subtle)',
                boxShadow: isDetected
                  ? `0 4px 20px ${section.color}40`
                  : 'none',
                transform: isDetected ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              {/* Color swatch */}
              <div
                className="w-10 h-10 rounded-xl shrink-0"
                style={{
                  background: isDetected
                    ? 'rgba(255,255,255,0.25)'
                    : `linear-gradient(135deg, ${section.color}, ${section.colorDark})`,
                }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="fraunces-card font-bold text-[15px] leading-tight"
                  style={{ color: isDetected ? 'white' : 'var(--color-text-primary)' }}
                >
                  {section.name}
                </p>
                <p
                  className="text-[12px] mt-0.5 truncate"
                  style={{ color: isDetected ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}
                >
                  {section.grapes.join(' · ')}
                </p>
              </div>
              <span
                className="text-[13px] font-semibold shrink-0"
                style={{ color: isDetected ? 'rgba(255,255,255,0.8)' : 'var(--color-primary)' }}
              >
                Log →
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Journal-only fallback ────────────────────────────────── */}
      <div
        className="rounded-2xl p-4 text-center"
        style={{
          background: 'var(--color-bg-subtle)',
          border: '1.5px dashed var(--color-border-default)',
        }}
      >
        <p className="text-[13px] mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Not sure which section it belongs to?
        </p>
        <button
          onClick={goToJournalOnly}
          className="text-[14px] font-semibold underline underline-offset-2"
          style={{ color: 'var(--color-primary)' }}
        >
          Just add it to my journal →
        </button>
      </div>

    </div>
  );
}
