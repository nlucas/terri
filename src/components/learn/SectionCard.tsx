'use client';

import Link from 'next/link';
import { WineSection, BottleSlot } from '@/types';

interface SectionCardProps {
  section: WineSection;
  bottles: BottleSlot[];
  isComplete: boolean;
  isLocked: boolean;
}

export function SectionCard({ section, bottles, isComplete, isLocked }: SectionCardProps) {
  const logged = bottles.length;

  const content = (
    <div
      className="relative rounded-2xl overflow-hidden transition-all active:scale-[0.985]"
      style={{
        background: 'var(--color-bg-surface)',
        boxShadow: '0 2px 12px rgba(44,26,16,0.08)',
        opacity: isLocked ? 0.55 : 1,
      }}
    >
      {/* Top colour strip */}
      <div
        style={{
          height: 5,
          background: `linear-gradient(90deg, ${section.color}, ${section.colorDark})`,
        }}
      />

      <div className="px-5 py-4 flex items-center gap-4">
        {/* Section number */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, ${section.color}25, ${section.colorDark}35)`,
            border: `1.5px solid ${section.color}40`,
          }}
        >
          <span
            className="fraunces-display font-black text-[18px]"
            style={{ color: section.color }}
          >
            {String(section.id).padStart(2, '0')}
          </span>
        </div>

        {/* Section info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p
              className="fraunces-card font-bold text-[16px] leading-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {section.name}
            </p>
            {isComplete && (
              <span
                className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: `${section.color}20`,
                  color: section.color,
                  border: `1px solid ${section.color}40`,
                }}
              >
                ✓ Done
              </span>
            )}
          </div>
          <p className="text-[12px] mb-2" style={{ color: 'var(--color-text-muted)' }}>
            {section.grapes.join(' · ')}
          </p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i < logged ? 20 : 8,
                  height: 8,
                  background: i < logged
                    ? `linear-gradient(90deg, ${section.color}, ${section.colorDark})`
                    : 'var(--color-border-subtle)',
                }}
              />
            ))}
            <span
              className="text-[11px] ml-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {logged}/3
            </span>
          </div>
        </div>

        {/* Right arrow / lock */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: isLocked
              ? 'var(--color-border-subtle)'
              : `linear-gradient(135deg, ${section.color}, ${section.colorDark})`,
          }}
        >
          <span className="text-[14px] text-white">
            {isLocked ? '🔒' : '→'}
          </span>
        </div>
      </div>
    </div>
  );

  if (isLocked) return content;
  return <Link href={`/learn/${section.slug}`}>{content}</Link>;
}
