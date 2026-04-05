'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LogBottleFormProps {
  userId: string;
  sectionId: number | null;
  slotIndex: 0 | 1 | 2;
  sectionColor?: string;
  sectionColorDark?: string;
}

export function LogBottleForm({
  userId,
  sectionId,
  slotIndex,
  sectionColor = 'var(--color-primary)',
  sectionColorDark = 'var(--color-primary-dark)',
}: LogBottleFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [fields, setFields] = useState({
    wineName: '',
    producer: '',
    vintage: '',
    region: '',
    country: '',
    grapeVariety: '',
    notes: '',
  });

  const [sliders, setSliders] = useState({
    sweetness: 3,
    acidity:   3,
    tannin:    3,
    body:      3,
  });

  const [rating, setRating] = useState(0);

  function set(key: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.wineName.trim()) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/bottles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sectionId,
          slotIndex,
          wineName:     fields.wineName.trim(),
          producer:     fields.producer.trim() || null,
          vintage:      fields.vintage ? parseInt(fields.vintage) : null,
          region:       fields.region.trim() || null,
          country:      fields.country.trim() || null,
          grapeVariety: fields.grapeVariety.trim() || null,
          sweetness:    sliders.sweetness,
          acidity:      sliders.acidity,
          tannin:       sectionId && sectionId <= 3 ? sliders.tannin : null,
          body:         sliders.body,
          rating:       rating || null,
          notes:        fields.notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Failed to save');
      }

      // Navigate back to section page — server component will re-fetch fresh data
      if (sectionId) {
        router.push(`/learn/${getSectionSlug(sectionId)}`);
        router.refresh();
      } else {
        router.push('/learn');
        router.refresh();
      }
    } catch (err) {
      console.error('Save bottle error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      setSaving(false);
    }
  }

  const isRed = sectionId !== null && sectionId <= 3;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* ── Wine name (required) ─────────────────────────────── */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}
      >
        <Label>Wine name *</Label>
        <input
          value={fields.wineName}
          onChange={(e) => set('wineName', e.target.value)}
          placeholder="e.g. Meiomi Pinot Noir"
          required
          className="field"
          style={fieldStyle}
        />

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <Label>Producer</Label>
            <input value={fields.producer} onChange={(e) => set('producer', e.target.value)} placeholder="Winery" className="field" style={fieldStyle} />
          </div>
          <div>
            <Label>Vintage</Label>
            <input value={fields.vintage} onChange={(e) => set('vintage', e.target.value)} placeholder="2022" type="number" min="1900" max="2099" className="field" style={fieldStyle} />
          </div>
          <div>
            <Label>Region</Label>
            <input value={fields.region} onChange={(e) => set('region', e.target.value)} placeholder="Sonoma Coast" className="field" style={fieldStyle} />
          </div>
          <div>
            <Label>Country</Label>
            <input value={fields.country} onChange={(e) => set('country', e.target.value)} placeholder="USA" className="field" style={fieldStyle} />
          </div>
        </div>

        <div className="mt-3">
          <Label>Grape variety</Label>
          <input value={fields.grapeVariety} onChange={(e) => set('grapeVariety', e.target.value)} placeholder="Pinot Noir" style={fieldStyle} />
        </div>
      </div>

      {/* ── Tasting sliders ──────────────────────────────────── */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}
      >
        <p className="fraunces-card font-bold text-[16px] mb-4" style={{ color: 'var(--color-text-primary)' }}>
          What did you taste?
        </p>

        <TastingSlider label="Sweetness" left="Bone dry" right="Sweet" value={sliders.sweetness} onChange={(v) => setSliders((s) => ({ ...s, sweetness: v }))} color={sectionColor} />
        <TastingSlider label="Acidity" left="Low" right="High" value={sliders.acidity} onChange={(v) => setSliders((s) => ({ ...s, acidity: v }))} color={sectionColor} />
        {isRed && <TastingSlider label="Tannin" left="Silky" right="Grippy" value={sliders.tannin} onChange={(v) => setSliders((s) => ({ ...s, tannin: v }))} color={sectionColor} />}
        <TastingSlider label="Body" left="Light" right="Full" value={sliders.body} onChange={(v) => setSliders((s) => ({ ...s, body: v }))} color={sectionColor} />
      </div>

      {/* ── Star rating ──────────────────────────────────────── */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}
      >
        <Label>Would you drink it again?</Label>
        <div className="flex gap-3 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star === rating ? 0 : star)}
              className="text-[32px] transition-transform active:scale-90"
              style={{ color: star <= rating ? 'var(--color-honey)' : 'var(--color-border-default)' }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* ── Notes ────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}
      >
        <Label>Notes (optional)</Label>
        <textarea
          value={fields.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="What did you taste? What food did you pair it with? Would you buy it again?"
          rows={3}
          style={{
            ...fieldStyle,
            resize: 'none',
            lineHeight: 1.6,
          }}
        />
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-[13px] text-center font-medium" style={{ background: '#FDE8E8', color: '#B91C1C', border: '1px solid #FECACA' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={saving || !fields.wineName.trim()}
        className="w-full py-4 rounded-xl font-bold text-[16px] text-white transition-all active:scale-[0.98] disabled:opacity-50"
        style={{
          background: `linear-gradient(135deg, ${sectionColor}, ${sectionColorDark})`,
          boxShadow: '0 4px 20px rgba(124,58,82,0.25)',
        }}
      >
        {saving ? 'Saving…' : 'Log Bottle 🍷'}
      </button>

    </form>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
      {children}
    </p>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1.5px solid var(--color-border-subtle)',
  background: 'var(--color-bg-subtle)',
  color: 'var(--color-text-primary)',
  fontSize: 14,
  fontFamily: 'var(--font-body)',
  outline: 'none',
};

function TastingSlider({
  label, left, right, value, onChange, color,
}: {
  label: string; left: string; right: string;
  value: number; onChange: (v: number) => void; color: string;
}) {
  const pct = ((value - 1) / 4) * 100;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          {left} → {right}
        </span>
      </div>
      <div className="relative" style={{ height: 6 }}>
        <div className="absolute inset-0 rounded-full" style={{ background: 'var(--color-border-subtle)' }} />
        <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        <input
          type="range"
          min={1} max={5} step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: 24, top: -9 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 shadow-sm pointer-events-none"
          style={{ left: `calc(${pct}% - 10px)`, borderColor: color }}
        />
      </div>
    </div>
  );
}

function getSectionSlug(sectionId: number): string {
  const slugs: Record<number, string> = {
    1: 'light-elegant-reds',
    2: 'medium-bodied-reds',
    3: 'bold-full-reds',
    4: 'crisp-dry-whites',
    5: 'rich-oaky-whites',
    6: 'sparkling-rose',
  };
  return slugs[sectionId] ?? '';
}
