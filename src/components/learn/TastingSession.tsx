'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TastingSessionProps {
  sectionSlug: string;
  sectionId: number;
  sectionName: string;
  sectionColor: string;
  sectionColorDark: string;
  grapes: string[];
  slotIndex: number;
  slotNumber: number;
  /** Optional initial value for the wine-identification field — used when the
   *  user lands here from a Classics tab pick so they don't have to retype. */
  prefill?: string;
}

interface Message {
  role: 'sommelier' | 'user';
  content: string;
}

// Phase 1 sub-states
type SearchState = 'idle' | 'searching' | 'confirming' | 'mismatch' | 'not-found';
// Main phases
type Phase = 'identify' | 'tasting';

interface IdentifiedWine {
  found: boolean;
  confidence: 'high' | 'medium' | 'low';
  canonicalName?: string;
  producer?: string;
  vintage?: number;
  region?: string;
  country?: string;
  grapeVariety?: string;
  wineType?: string;
  oneLiner?: string;
  matchesSection: boolean;
  mismatchMessage?: string;
}

const fieldStyle: React.CSSProperties = {
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

export function TastingSession({
  sectionSlug,
  sectionId,
  sectionName,
  sectionColor,
  sectionColorDark,
  grapes,
  slotIndex,
  slotNumber,
  prefill,
}: TastingSessionProps) {
  const router = useRouter();

  // ── Phase 1 ────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('identify');
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [rawInput, setRawInput] = useState(prefill ?? ''); // what user typed (or prefilled from Classics pick)
  const [identified, setIdentified] = useState<IdentifiedWine | null>(null);

  // Final identity (pre-filled or manually edited after confirm)
  const [identity, setIdentity] = useState({
    wineName: '',
    producer: '',
    vintage: '',
    region: '',
    country: '',
    grapeVariety: '',
  });

  // ── Phase 2 ────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [followUp, setFollowUp] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [sliders, setSliders] = useState({ sweetness: 3, acidity: 3, tannin: 3, body: 3 });
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);
  const isRed = sectionId <= 3;

  // Scroll to top when tasting phase begins so sommelier is visible
  useEffect(() => {
    if (phase === 'tasting') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      prevMessageCount.current = 1; // skip auto-scroll for the initial message
    }
  }, [phase]);

  // Scroll to bottom only for follow-up replies
  useEffect(() => {
    if (phase === 'tasting' && messages.length > prevMessageCount.current) {
      prevMessageCount.current = messages.length;
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }, [messages.length, phase]);

  // ── Step 1: Look up the wine ───────────────────────────
  async function lookUpWine() {
    if (!rawInput.trim()) return;
    setSearchState('searching');

    try {
      const res = await fetch('/api/identify-wine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wineName: rawInput.trim(), sectionId }),
      });
      const data: IdentifiedWine = await res.json();
      setIdentified(data);

      if (!data.found || data.confidence === 'low') {
        // Couldn't find it — fall through to manual form
        setIdentity((p) => ({ ...p, wineName: rawInput.trim() }));
        setSearchState('not-found');
      } else if (!data.matchesSection) {
        setSearchState('mismatch');
      } else {
        // Found and matches — show confirmation
        setSearchState('confirming');
      }
    } catch {
      // Network error — fall through to manual
      setIdentity((p) => ({ ...p, wineName: rawInput.trim() }));
      setSearchState('not-found');
    }
  }

  // ── Step 2a: User confirms the identified wine ─────────
  function confirmWine() {
    if (!identified) return;
    setIdentity({
      wineName:     identified.canonicalName ?? rawInput.trim(),
      producer:     identified.producer ?? '',
      vintage:      identified.vintage ? String(identified.vintage) : '',
      region:       identified.region ?? '',
      country:      identified.country ?? '',
      grapeVariety: identified.grapeVariety ?? '',
    });
    startTasting(identified);
  }

  // ── Step 2b: User logs anyway despite mismatch ─────────
  function logAnyway() {
    if (!identified) return;
    setIdentity({
      wineName:     identified.canonicalName ?? rawInput.trim(),
      producer:     identified.producer ?? '',
      vintage:      identified.vintage ? String(identified.vintage) : '',
      region:       identified.region ?? '',
      country:      identified.country ?? '',
      grapeVariety: identified.grapeVariety ?? '',
    });
    startTasting(identified);
  }

  // ── Step 3: Begin tasting session ─────────────────────
  async function startTasting(wine?: IdentifiedWine) {
    const wineInfo = wine ?? identified;
    const name = (wineInfo?.canonicalName ?? identity.wineName) || rawInput.trim();
    if (!name) return;

    setPhase('tasting');
    setAiLoading(true);
    setMessages([{ role: 'sommelier', content: '' }]);

    try {
      const res = await fetch('/api/sommelier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bottleContext: {
            wineName:     name,
            producer:     (wineInfo?.producer ?? identity.producer) || null,
            vintage:      wineInfo?.vintage ?? (identity.vintage ? parseInt(identity.vintage) : null),
            region:       (wineInfo?.region ?? identity.region) || null,
            country:      (wineInfo?.country ?? identity.country) || null,
            grapeVariety: (wineInfo?.grapeVariety ?? identity.grapeVariety) || null,
            sectionName,
            grapes,
          },
        }),
      });

      if (!res.ok || !res.body) throw new Error('Failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setMessages([{ role: 'sommelier', content: text }]);
      }
    } catch {
      setMessages([{ role: 'sommelier', content: "I'm having trouble connecting right now. You can still fill in your tasting notes below while you drink!" }]);
    } finally {
      setAiLoading(false);
    }
  }

  // ── Follow-up questions ────────────────────────────────
  async function askFollowUp() {
    if (!followUp.trim() || aiLoading) return;
    const q = followUp.trim();
    setFollowUp('');
    setAiLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: q }, { role: 'sommelier', content: '' }]);

    try {
      const res = await fetch('/api/sommelier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, context: { sectionName, grapes } }),
      });
      if (!res.ok || !res.body) throw new Error('Failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'sommelier', content: text };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: 'sommelier', content: 'Lost connection — try again.' }; return u; });
    } finally {
      setAiLoading(false);
    }
  }

  // ── Save bottle ───────────────────────────────────────
  async function saveBottle() {
    const name = identity.wineName || rawInput.trim();
    if (!name) return;
    setSaving(true);
    setSaveError('');

    try {
      const res = await fetch('/api/bottles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId,
          slotIndex,
          wineName:     name,
          producer:     identity.producer || null,
          vintage:      identity.vintage ? parseInt(identity.vintage) : null,
          region:       identity.region || null,
          country:      identity.country || null,
          grapeVariety: identity.grapeVariety || null,
          sweetness:    sliders.sweetness,
          acidity:      sliders.acidity,
          tannin:       isRed ? sliders.tannin : null,
          body:         sliders.body,
          rating:       rating || null,
          notes:        notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Failed to save');
      }
      router.push(`/learn/${sectionSlug}?tab=bottles`);
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.');
      setSaving(false);
    }
  }

  // ════════════════════════════════════════════════════════
  // RENDER — Phase 1: Identify
  // ════════════════════════════════════════════════════════
  if (phase === 'identify') {

    // ── Searching spinner ─────────────────────────────────
    if (searchState === 'searching') {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{
                  background: sectionColor,
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <p className="text-[15px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Looking up <span style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>{rawInput}</span>…
          </p>
          <style>{`@keyframes bounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-6px);opacity:1} }`}</style>
        </div>
      );
    }

    // ── Confirmed match ───────────────────────────────────
    if (searchState === 'confirming' && identified) {
      return (
        <div className="flex flex-col gap-4">
          <FoundWineCard wine={identified} sectionColor={sectionColor} />

          {identified.oneLiner && (
            <p className="text-[14px] leading-relaxed px-1" style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              "{identified.oneLiner}"
            </p>
          )}

          <button
            onClick={confirmWine}
            className="w-full py-4 rounded-2xl font-bold text-[17px] text-white transition-all active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${sectionColor}, ${sectionColorDark})`, boxShadow: `0 6px 24px ${sectionColor}45` }}
          >
            Yes, let&apos;s taste it 🍷
          </button>

          <button
            onClick={() => { setSearchState('idle'); setRawInput(''); setIdentified(null); }}
            className="w-full py-3 rounded-2xl font-semibold text-[15px] transition-colors"
            style={{ background: 'var(--color-bg-subtle)', border: '1.5px solid var(--color-border-default)', color: 'var(--color-text-muted)' }}
          >
            Not quite — search again
          </button>
        </div>
      );
    }

    // ── Section mismatch ──────────────────────────────────
    if (searchState === 'mismatch' && identified) {
      return (
        <div className="flex flex-col gap-4">
          {/* Mismatch warning */}
          <div
            className="rounded-2xl p-5"
            style={{ background: '#FEF3CD', border: '1.5px solid #F6CC5A' }}
          >
            <p className="text-[16px] font-bold mb-1" style={{ color: '#92660A' }}>
              ⚠️ Wrong wine type
            </p>
            <p className="text-[14px] leading-relaxed" style={{ color: '#7A540D' }}>
              {identified.mismatchMessage}
            </p>
          </div>

          <FoundWineCard wine={identified} sectionColor="#92660A" />

          <button
            onClick={() => { setSearchState('idle'); setRawInput(''); setIdentified(null); }}
            className="w-full py-4 rounded-2xl font-bold text-[16px] text-white"
            style={{ background: `linear-gradient(135deg, ${sectionColor}, ${sectionColorDark})` }}
          >
            Try a different wine
          </button>

          <button
            onClick={logAnyway}
            className="w-full py-3 rounded-2xl font-semibold text-[14px]"
            style={{ background: 'var(--color-bg-subtle)', border: '1.5px solid var(--color-border-default)', color: 'var(--color-text-muted)' }}
          >
            I know — log it anyway
          </button>
        </div>
      );
    }

    // ── Not found — manual form ───────────────────────────
    if (searchState === 'not-found') {
      return (
        <div className="flex flex-col gap-4">
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-subtle)' }}
          >
            <span className="text-xl mt-0.5">🔍</span>
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              I couldn't find an exact match for <strong style={{ color: 'var(--color-text-primary)' }}>{rawInput}</strong>. Fill in what you know — your sommelier will still guide you.
            </p>
          </div>

          <ManualForm
            identity={identity}
            setIdentity={setIdentity}
            grapes={grapes}
            sectionColor={sectionColor}
            sectionColorDark={sectionColorDark}
            onStart={() => startTasting()}
            onBack={() => { setSearchState('idle'); setIdentity({ wineName: '', producer: '', vintage: '', region: '', country: '', grapeVariety: '' }); }}
          />
        </div>
      );
    }

    // ── Default: idle search input ────────────────────────
    return (
      <div className="flex flex-col gap-5">
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}
        >
          <p className="text-[14px] font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            What wine are you opening? <span style={{ color: 'var(--color-primary)' }}>*</span>
          </p>
          <input
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookUpWine()}
            placeholder={`e.g. ${grapes[0] === 'Pinot Noir' ? 'Meiomi Pinot Noir' : grapes[0] === 'Chardonnay' ? 'Rombauer Chardonnay' : grapes[0] === 'Cabernet Sauvignon' ? 'Jordan Cabernet' : 'Wine name...'}`}
            autoFocus
            style={{ ...fieldStyle, fontSize: 16 }}
          />
          <p className="text-[12px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Just the name — we'll look it up and fill in the rest
          </p>
        </div>

        <button
          onClick={lookUpWine}
          disabled={!rawInput.trim()}
          className="w-full py-4 rounded-2xl font-bold text-[17px] text-white transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${sectionColor}, ${sectionColorDark})`, boxShadow: `0 6px 24px ${sectionColor}45` }}
        >
          Find This Wine 🔍
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border-subtle)' }} />
          <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border-subtle)' }} />
        </div>

        <button
          onClick={() => setSearchState('not-found')}
          className="w-full py-3 rounded-2xl font-semibold text-[14px]"
          style={{ background: 'var(--color-bg-subtle)', border: '1.5px solid var(--color-border-default)', color: 'var(--color-text-muted)' }}
        >
          Enter details manually
        </button>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // RENDER — Phase 2: Tasting
  // ════════════════════════════════════════════════════════
  const displayName = identity.wineName || rawInput.trim();

  return (
    <div className="flex flex-col gap-5">

      {/* Wine summary chip */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: `linear-gradient(90deg, ${sectionColor}22, ${sectionColorDark}30)`, border: `1px solid ${sectionColor}40` }}
      >
        <span className="text-xl">🍷</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[15px] truncate" style={{ color: 'var(--color-text-primary)' }}>{displayName}</p>
          {(identity.producer || identity.vintage || identity.region) && (
            <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              {[identity.producer, identity.vintage, identity.region].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Sommelier conversation */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-espresso)', position: 'relative' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 70% 0%, rgba(196,144,64,0.18) 0%, transparent 55%), radial-gradient(ellipse at 20% 100%, ${sectionColor}35 0%, transparent 60%)` }} />
        <div className="relative z-10 p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', border: '2px solid rgba(255,255,255,0.12)', boxShadow: '0 4px 16px rgba(124,58,82,0.40)' }}>🍷</div>
            <div className="flex-1">
              <p className="fraunces-card font-bold text-[15px] text-white">Terri, your AI Sommelier</p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.40)' }}>Teaching you about {displayName}</p>
            </div>
            {aiLoading && (
              <div className="flex gap-1">
                {[0,1,2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-honey)', animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-3 mb-4">
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'flex justify-end' : ''}>
                {msg.role === 'sommelier' ? (
                  <div className="text-[14px] leading-relaxed p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 16px 16px 16px', color: 'rgba(255,255,255,0.88)', whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                    {aiLoading && i === messages.length - 1 && (
                      <span className="inline-block w-[2px] h-[14px] ml-0.5 align-text-bottom" style={{ background: 'var(--color-honey)', animation: 'blink 1s step-end infinite' }} />
                    )}
                  </div>
                ) : (
                  <div className="text-[13px] px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.80)', maxWidth: '80%', borderRadius: '16px 4px 16px 16px' }}>
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Follow-up input */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
            <input type="text" value={followUp} onChange={(e) => setFollowUp(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && askFollowUp()} placeholder="Ask anything about this wine…" className="flex-1 bg-transparent outline-none text-[14px]" style={{ color: 'rgba(255,255,255,0.70)', fontFamily: 'var(--font-body)' }} />
            <button onClick={askFollowUp} disabled={!followUp.trim() || aiLoading} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[14px] transition-opacity disabled:opacity-40" style={{ background: 'var(--color-primary)' }}>→</button>
          </div>
        </div>
        <style>{`@keyframes blink{50%{opacity:0}} @keyframes bounce{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-4px);opacity:1}}`}</style>
      </div>

      {/* Tasting notes */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}>
        <p className="fraunces-card font-bold text-[16px] mb-0.5" style={{ color: 'var(--color-text-primary)' }}>Your Tasting Notes</p>
        <p className="text-[12px] mb-4" style={{ color: 'var(--color-text-muted)' }}>Fill these in as you drink — take your time.</p>
        <TastingSlider label="Sweetness" left="Bone dry" right="Sweet" value={sliders.sweetness} onChange={(v) => setSliders((s) => ({ ...s, sweetness: v }))} color={sectionColor} />
        <TastingSlider label="Acidity" left="Low" right="High" value={sliders.acidity} onChange={(v) => setSliders((s) => ({ ...s, acidity: v }))} color={sectionColor} />
        {isRed && <TastingSlider label="Tannin" left="Silky" right="Grippy" value={sliders.tannin} onChange={(v) => setSliders((s) => ({ ...s, tannin: v }))} color={sectionColor} />}
        <TastingSlider label="Body" left="Light" right="Full" value={sliders.body} onChange={(v) => setSliders((s) => ({ ...s, body: v }))} color={sectionColor} />
      </div>

      {/* Rating */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}>
        <p className="text-[14px] font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>Would you drink it again?</p>
        <div className="flex gap-3">
          {[1,2,3,4,5].map((star) => (
            <button key={star} type="button" onClick={() => setRating(star === rating ? 0 : star)} className="text-[34px] transition-transform active:scale-90" style={{ color: star <= rating ? 'var(--color-honey)' : 'var(--color-border-default)' }}>★</button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}>
        <p className="text-[14px] font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Notes (optional)</p>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What did you taste? What food did you pair it with? Would you buy it again?" rows={3} style={{ ...fieldStyle, marginTop: 4, resize: 'none', lineHeight: 1.6, fontSize: 14 }} />
      </div>

      <div ref={bottomRef} />

      {saveError && (
        <div className="rounded-xl px-4 py-3 text-[13px] text-center font-medium" style={{ background: '#FDE8E8', color: '#B91C1C', border: '1px solid #FECACA' }}>⚠️ {saveError}</div>
      )}

      <button
        onClick={saveBottle}
        disabled={saving}
        className="w-full py-4 rounded-2xl font-bold text-[17px] text-white transition-all active:scale-[0.98] disabled:opacity-50"
        style={{ background: `linear-gradient(135deg, ${sectionColor}, ${sectionColorDark})`, boxShadow: `0 6px 24px ${sectionColor}45` }}
      >
        {saving ? 'Saving…' : `Save Bottle ${slotNumber} ✓`}
      </button>
    </div>
  );
}

// ─── Found wine confirmation card ─────────────────────────────────

function FoundWineCard({ wine, sectionColor }: { wine: IdentifiedWine; sectionColor: string }) {
  const details = [
    wine.producer,
    wine.vintage ? String(wine.vintage) : undefined,
    wine.region,
    wine.country,
  ].filter(Boolean);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: sectionColor }} />
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: sectionColor }}>
          {wine.confidence === 'high' ? 'Found it' : 'Best match'}
        </span>
      </div>

      <p className="fraunces-card font-bold text-[20px] leading-tight mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {wine.canonicalName}
      </p>

      {details.length > 0 && (
        <p className="text-[13px] mb-3" style={{ color: 'var(--color-text-muted)' }}>
          {details.join(' · ')}
        </p>
      )}

      {wine.grapeVariety && (
        <div className="flex items-center gap-2">
          <span
            className="text-[12px] font-semibold px-3 py-1 rounded-full"
            style={{ background: `${sectionColor}20`, color: sectionColor, border: `1px solid ${sectionColor}40` }}
          >
            {wine.grapeVariety}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Manual entry form ────────────────────────────────────────────

function ManualForm({
  identity, setIdentity, grapes, sectionColor, sectionColorDark, onStart, onBack,
}: {
  identity: { wineName: string; producer: string; vintage: string; region: string; country: string; grapeVariety: string };
  setIdentity: React.Dispatch<React.SetStateAction<typeof identity>>;
  grapes: string[];
  sectionColor: string;
  sectionColorDark: string;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-5" style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}>
        <div className="flex flex-col gap-3">
          <div>
            <SmallLabel required>Wine name</SmallLabel>
            <input value={identity.wineName} onChange={(e) => setIdentity((p) => ({ ...p, wineName: e.target.value }))} placeholder="e.g. Meiomi Pinot Noir" style={{ ...fieldStyle, fontSize: 15 }} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div><SmallLabel>Producer</SmallLabel><input value={identity.producer} onChange={(e) => setIdentity((p) => ({ ...p, producer: e.target.value }))} placeholder="Winery" style={{ ...fieldStyle, fontSize: 14, padding: '9px 12px' }} /></div>
            <div><SmallLabel>Vintage</SmallLabel><input type="number" value={identity.vintage} onChange={(e) => setIdentity((p) => ({ ...p, vintage: e.target.value }))} placeholder="2022" min="1900" max="2099" style={{ ...fieldStyle, fontSize: 14, padding: '9px 12px' }} /></div>
            <div><SmallLabel>Region</SmallLabel><input value={identity.region} onChange={(e) => setIdentity((p) => ({ ...p, region: e.target.value }))} placeholder="Napa Valley" style={{ ...fieldStyle, fontSize: 14, padding: '9px 12px' }} /></div>
            <div><SmallLabel>Country</SmallLabel><input value={identity.country} onChange={(e) => setIdentity((p) => ({ ...p, country: e.target.value }))} placeholder="USA" style={{ ...fieldStyle, fontSize: 14, padding: '9px 12px' }} /></div>
          </div>
          <div><SmallLabel>Grape</SmallLabel><input value={identity.grapeVariety} onChange={(e) => setIdentity((p) => ({ ...p, grapeVariety: e.target.value }))} placeholder={grapes[0]} style={{ ...fieldStyle, fontSize: 14, padding: '9px 12px' }} /></div>
        </div>
      </div>

      <button onClick={onStart} disabled={!identity.wineName.trim()} className="w-full py-4 rounded-2xl font-bold text-[17px] text-white active:scale-[0.98] disabled:opacity-40" style={{ background: `linear-gradient(135deg, ${sectionColor}, ${sectionColorDark})`, boxShadow: `0 6px 24px ${sectionColor}45` }}>
        Let&apos;s Taste It 🍷
      </button>
      <button onClick={onBack} className="text-center text-[13px] underline underline-offset-2" style={{ color: 'var(--color-text-muted)' }}>
        ← Back to search
      </button>
    </div>
  );
}

// ─── Shared sub-components ───────────────────────────────────────

function SmallLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p className="text-[11px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
      {children}{required && <span style={{ color: 'var(--color-primary)' }}> *</span>}
    </p>
  );
}

function TastingSlider({ label, left, right, value, onChange, color }: { label: string; left: string; right: string; value: number; onChange: (v: number) => void; color: string }) {
  const pct = ((value - 1) / 4) * 100;
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{left} → {right}</span>
      </div>
      <div className="relative" style={{ height: 6 }}>
        <div className="absolute inset-0 rounded-full" style={{ background: 'var(--color-border-subtle)' }} />
        <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        <input type="range" min={1} max={5} step={1} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: 24, top: -9 }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 shadow-sm pointer-events-none" style={{ left: `calc(${pct}% - 10px)`, borderColor: color }} />
      </div>
    </div>
  );
}
