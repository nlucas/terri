'use client';

import Link from 'next/link';
import { BottleSlot } from '@/types';

interface SlotPillLargeProps {
  slot: BottleSlot;
  slotNumber: number;
  sectionSlug: string;
  sectionColor: string;
  sectionColorDark: string;
}

export function SlotPillLarge({
  slot,
  slotNumber,
  sectionSlug,
  sectionColor,
  sectionColorDark,
}: SlotPillLargeProps) {
  if (slot.status === 'logged' && slot.wineName) {
    return (
      <Link
        href={`/learn/${sectionSlug}/bottle/${slot.index}`}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-white transition-all active:scale-[0.98]"
        style={{ background: `linear-gradient(90deg, ${sectionColor}, ${sectionColorDark})` }}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
          style={{ background: 'rgba(255,255,255,0.22)' }}
        >
          ✓
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold truncate">{slot.wineName}</p>
          <p className="text-[11px] opacity-70">Bottle {slotNumber} · Tap for sommelier →</p>
        </div>
        <span className="text-[18px]">🍷</span>
      </Link>
    );
  }

  return (
    <Link
      href={`/log?section=${sectionSlug}&slot=${slot.index}`}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors active:scale-[0.98]"
      style={{
        border: '1.5px dashed var(--color-border-default)',
        background: 'transparent',
        color: 'var(--color-text-muted)',
      }}
    >
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] shrink-0"
        style={{ border: '1.5px dashed var(--color-border-default)' }}
      >
        +
      </span>
      <div className="flex-1">
        <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Bottle {slotNumber}
        </p>
        <p className="text-[12px]">Tap to log a wine</p>
      </div>
      <span className="text-[13px] font-semibold" style={{ color: 'var(--color-primary)' }}>
        Log →
      </span>
    </Link>
  );
}
