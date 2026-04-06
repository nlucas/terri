'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SLIDER_LABELS: Record<string, [string, string]> = {
  sweetness: ['Bone Dry', 'Very Sweet'],
  acidity:   ['Low Acid', 'High Acid'],
  body:      ['Light', 'Full'],
};

export function JournalLogPage() {
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

  const [sliders, setSliders] = useState({ sweetness: 3, acidity: 3, body: 3 });
  const [rating, setRating] = useState(0);

  function set(key: keyof typeof fields, val: string) {
    setFields((f) => ({ ...f, [key]: val }));
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
          sectionId:    null,
          slotIndex:    null,
          wineName:     fields.wineName.trim(),
          producer:     fields.producer.trim() || null,
          vintage:      fields.vintage ? parseInt(fields.vintage) : null,
          region:       fields.region.trim() || null,
          country:      fields.country.trim() || null,
          grapeVariety: fields.grapeVariety.trim() || null,
          sweetness:    sliders.sweetness,
          acidity:      sliders.acidity,
          tannin:       null,
          body:         sliders.body,
          rating:       rating || null,
          notes:        fields.notes.trim() || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');
      router.push('/journal');
    } catch {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 12,
    border: '1.5px solid var(--color-border-default)',
    background: 'var(--color-bg-subtle)',
    color: 'var(--color-text-primary)',
    fontSize: 15,
    fontFamily: 'var(--font-body)',
    outline: 'none',
  };

  return (
    <div className="px-4 pb-28">

      {/* ── Header ────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 py-4 mb-4"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <button
          onClick={() => router.push('/log')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] shrink-0"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
          }}
        >
          ←
        </button>
        <div>
          <p
            className="text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Journal Entry
          </p>
          <h1
            className="fraunces-display font-bold leading-tight"
            style={{ fontSize: 22, color: 'var(--color-text-primary)' }}
          >
            Add to Journal 📔
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Wine name */}
        <div>
          <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Wine Name *
          </label>
          <input
            type="text"
            value={fields.wineName}
            onChange={(e) => set('wineName', e.target.value)}
            placeholder="e.g. Château Pichon Baron 2018"
            required
            style={inputStyle}
          />
        </div>

        {/* Producer + Vintage */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Producer</label>
            <input type="text" value={fields.producer} onChange={(e) => set('producer', e.target.value)} placeholder="Producer" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Vintage</label>
            <input type="number" value={fields.vintage} onChange={(e) => set('vintage', e.target.value)} placeholder="2020" min={1900} max={new Date().getFullYear()} style={inputStyle} />
          </div>
        </div>

        {/* Region + Country */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Region</label>
            <input type="text" value={fields.region} onChange={(e) => set('region', e.target.value)} placeholder="Bordeaux" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Country</label>
            <input type="text" value={fields.country} onChange={(e) => set('country', e.target.value)} placeholder="France" style={inputStyle} />
          </div>
        </div>

        {/* Grape */}
        <div>
          <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Grape Variety</label>
          <input type="text" value={fields.grapeVariety} onChange={(e) => set('grapeVariety', e.target.value)} placeholder="e.g. Cabernet Sauvignon" style={inputStyle} />
        </div>

        {/* Tasting sliders */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
        >
          <p className="text-[12px] font-semibold mb-4" style={{ color: 'var(--color-text-muted)' }}>TASTING NOTES</p>
          <div className="flex flex-col gap-5">
            {(Object.keys(sliders) as Array<keyof typeof sliders>).map((key) => (
              <div key={key}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12px] font-semibold capitalize" style={{ color: 'var(--color-text-secondary)' }}>{key}</span>
                  <div className="flex gap-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    <span>{SLIDER_LABELS[key][0]}</span>
                    <span>·</span>
                    <span>{SLIDER_LABELS[key][1]}</span>
                  </div>
                </div>
                <input
                  type="range" min={1} max={5} value={sliders[key]}
                  onChange={(e) => setSliders((s) => ({ ...s, [key]: parseInt(e.target.value) }))}
                  className="w-full accent-primary"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Star rating */}
        <div>
          <label className="block text-[12px] font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Your Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(rating === s ? 0 : s)}
                className="text-3xl transition-transform active:scale-90"
              >
                {s <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Notes</label>
          <textarea
            value={fields.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="What did you notice? How did it taste?"
            rows={3}
            style={{ ...inputStyle, resize: 'none' }}
          />
        </div>

        {error && <p className="text-[13px]" style={{ color: 'var(--color-primary)' }}>{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || !fields.wineName.trim()}
          className="w-full py-4 rounded-2xl font-bold text-[15px] text-white transition-all disabled:opacity-40 active:scale-[0.98]"
          style={{
            background: 'var(--color-primary)',
            boxShadow: '0 4px 20px rgba(124,58,82,0.30)',
          }}
        >
          {saving ? 'Saving…' : 'Save to Journal ✓'}
        </button>

      </form>
    </div>
  );
}
