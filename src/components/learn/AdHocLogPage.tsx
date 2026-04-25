'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SECTION_BY_ID } from '@/lib/sections';

// Map Claude's wineType to a section id
const WINE_TYPE_TO_SECTION: Record<string, number> = {
  light_red:   1,
  medium_red:  2,
  bold_red:    3,
  crisp_white: 4,
  rich_white:  5,
  sparkling:   6,
  rose:        6,
};

type SearchState = 'idle' | 'previewing' | 'searching' | 'confirming' | 'not-found';
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
}

interface Message {
  role: 'sommelier' | 'user';
  content: string;
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

// Neutral color used before section is detected
const PRIMARY = 'var(--color-primary)';
const PRIMARY_DARK = 'var(--color-primary-dark)';

export function AdHocLogPage() {
  const router = useRouter();

  // ── Phase 1 state ──────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('identify');
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [rawInput, setRawInput] = useState('');
  const [identified, setIdentified] = useState<IdentifiedWine | null>(null);
  const [detectedSectionId, setDetectedSectionId] = useState<number | null>(null);

  // Image capture state
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [identity, setIdentity] = useState({
    wineName: '',
    producer: '',
    vintage: '',
    region: '',
    country: '',
    grapeVariety: '',
  });

  // ── Phase 2 state ──────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [followUp, setFollowUp] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [sliders, setSliders] = useState({ sweetness: 3, acidity: 3, tannin: 3, body: 3 });
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);

  const detectedSection = detectedSectionId ? SECTION_BY_ID[detectedSectionId] : null;
  const sectionColor = detectedSection?.color ?? PRIMARY;
  const sectionColorDark = detectedSection?.colorDark ?? PRIMARY_DARK;
  // Show tannin slider for reds (sections 1-3)
  const isRed = detectedSectionId != null && detectedSectionId <= 3;

  // Scroll to top when tasting phase begins
  useEffect(() => {
    if (phase === 'tasting') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      prevMessageCount.current = 1; // skip auto-scroll for first message
    }
  }, [phase]);

  // Scroll to bottom only for follow-up replies (not initial streaming)
  useEffect(() => {
    if (phase === 'tasting' && messages.length > prevMessageCount.current) {
      prevMessageCount.current = messages.length;
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }, [messages.length, phase]);

  // ── Step 1: Look up wine via Claude ───────────────────
  async function lookUpWine() {
    if (!rawInput.trim()) return;
    setSearchState('searching');

    try {
      const res = await fetch('/api/identify-wine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // No sectionId — we don't care about section mismatch here
        body: JSON.stringify({ wineName: rawInput.trim() }),
      });
      const data: IdentifiedWine = await res.json();
      setIdentified(data);

      if (!data.found || data.confidence === 'low') {
        setIdentity((p) => ({ ...p, wineName: rawInput.trim() }));
        setSearchState('not-found');
      } else {
        // Detect section from wineType
        const sid = data.wineType ? (WINE_TYPE_TO_SECTION[data.wineType] ?? null) : null;
        setDetectedSectionId(sid);
        setSearchState('confirming');
      }
    } catch {
      setIdentity((p) => ({ ...p, wineName: rawInput.trim() }));
      setSearchState('not-found');
    }
  }

  // ── Step 1b: Capture & identify from photo ────────────
  function openCamera() {
    setCaptureError('');
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset the input so picking the same file again still fires onChange
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCaptureError('Please choose an image file.');
      return;
    }

    try {
      const { dataUrl, base64 } = await resizeImageToBase64(file, 1024, 0.85);
      setCapturedImageUrl(dataUrl);
      setCapturedBase64(base64);
      setSearchState('previewing');
    } catch (err) {
      console.error('image resize error:', err);
      setCaptureError('Could not read that photo. Try again?');
    }
  }

  function retakePhoto() {
    setCapturedImageUrl(null);
    setCapturedBase64(null);
    setCaptureError('');
    setSearchState('idle');
    // Re-open the camera so the user lands back on capture, not the search box
    setTimeout(() => fileInputRef.current?.click(), 0);
  }

  async function lookUpFromImage() {
    if (!capturedBase64) return;
    setSearchState('searching');

    try {
      const res = await fetch('/api/identify-wine-from-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: capturedBase64, mediaType: 'image/jpeg' }),
      });
      const data: IdentifiedWine = await res.json();
      setIdentified(data);

      if (!data.found || data.confidence === 'low') {
        // Fallback: drop into manual form, pre-filling whatever Claude could read
        setIdentity({
          wineName:     data.canonicalName ?? '',
          producer:     data.producer ?? '',
          vintage:      data.vintage ? String(data.vintage) : '',
          region:       data.region ?? '',
          country:      data.country ?? '',
          grapeVariety: data.grapeVariety ?? '',
        });
        setRawInput(data.canonicalName ?? 'this bottle');
        setSearchState('not-found');
      } else {
        const sid = data.wineType ? (WINE_TYPE_TO_SECTION[data.wineType] ?? null) : null;
        setDetectedSectionId(sid);
        setRawInput(data.canonicalName ?? '');
        setSearchState('confirming');
      }
    } catch {
      setIdentity((p) => ({ ...p, wineName: '' }));
      setRawInput('this bottle');
      setSearchState('not-found');
    }
  }

  // ── Step 2: Confirm wine and start tasting ─────────────
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

  // ── Step 3: Begin tasting (sommelier intro) ────────────
  async function startTasting(wine?: IdentifiedWine) {
    const wineInfo = wine ?? identified;
    const name = (wineInfo?.canonicalName ?? identity.wineName) || rawInput.trim();
    if (!name) return;

    setPhase('tasting');
    setAiLoading(true);
    setMessages([{ role: 'sommelier', content: '' }]);

    const section = detectedSectionId ? SECTION_BY_ID[detectedSectionId] : null;

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
            sectionName:  section?.name ?? 'Wine',
            grapes:       section?.grapes ?? [],
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
      setMessages([{ role: 'sommelier', content: "I'm having trouble connecting right now. Fill in your tasting notes below while you drink!" }]);
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
        body: JSON.stringify({ question: q }),
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
          const u = [...prev];
          u[u.length - 1] = { role: 'sommelier', content: text };
          return u;
        });
      }
    } catch {
      setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: 'sommelier', content: 'Lost connection — try again.' }; return u; });
    } finally {
      setAiLoading(false);
    }
  }

  // ── Save bottle ────────────────────────────────────────
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
          sectionId:    detectedSectionId ?? null,
          slotIndex:    null, // server will auto-assign
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

      // Redirect to the detected section or to journal
      if (detectedSection) {
        router.push(`/learn/${detectedSection.slug}?tab=bottles`);
      } else {
        router.push('/journal');
      }
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.');
      setSaving(false);
    }
  }

  // ══════════════════════════════════════════════════════
  // RENDER — Phase 1: Identify
  // ══════════════════════════════════════════════════════
  if (phase === 'identify') {

    // Header
    const Header = (
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] mb-4"
          style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}
        >
          ←
        </button>
        <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Log a Bottle
        </p>
        <h1 className="fraunces-display font-bold leading-tight" style={{ fontSize: 30, color: 'var(--color-text-primary)' }}>
          What are you drinking?
        </h1>
      </div>
    );

    // Searching spinner
    if (searchState === 'searching') {
      const isImageSearch = !!capturedBase64;
      return (
        <div className="px-4 pt-6 pb-28">
          {Header}
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-3 h-3 rounded-full"
                  style={{ background: PRIMARY, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
            {isImageSearch ? (
              <p className="text-[15px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Reading the label…
              </p>
            ) : (
              <p className="text-[15px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Looking up <span style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>{rawInput}</span>…
              </p>
            )}
            <style>{`@keyframes bounce{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-6px);opacity:1}}`}</style>
          </div>
        </div>
      );
    }

    // Photo preview — let the user confirm or retake before we send to Claude
    if (searchState === 'previewing' && capturedImageUrl) {
      return (
        <div className="px-4 pt-6 pb-28 flex flex-col gap-4">
          {Header}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedImageUrl}
              alt="Captured wine label"
              className="w-full block"
              style={{ maxHeight: '60vh', objectFit: 'contain', background: 'var(--color-bg-subtle)' }}
            />
            <div className="p-4">
              <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                Make sure the label is clear and readable. We&apos;ll try to identify the wine for you.
              </p>
            </div>
          </div>

          <button
            onClick={lookUpFromImage}
            className="w-full py-4 rounded-2xl font-bold text-[17px] text-white transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', boxShadow: '0 6px 24px rgba(124,58,82,0.35)' }}
          >
            Identify This Wine 🔍
          </button>

          <button
            onClick={retakePhoto}
            className="w-full py-3 rounded-2xl font-semibold text-[15px]"
            style={{ background: 'var(--color-bg-subtle)', border: '1.5px solid var(--color-border-default)', color: 'var(--color-text-muted)' }}
          >
            Retake photo
          </button>

          <button
            onClick={() => { setSearchState('idle'); setCapturedImageUrl(null); setCapturedBase64(null); }}
            className="text-center text-[13px] underline underline-offset-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ← Cancel
          </button>
        </div>
      );
    }

    // Confirmed match
    if (searchState === 'confirming' && identified) {
      return (
        <div className="px-4 pt-6 pb-28 flex flex-col gap-4">
          {Header}

          <FoundWineCard wine={identified} detectedSection={detectedSection} />

          {identified.oneLiner && (
            <p className="text-[14px] leading-relaxed px-1 italic" style={{ color: 'var(--color-text-muted)' }}>
              &ldquo;{identified.oneLiner}&rdquo;
            </p>
          )}

          <button
            onClick={confirmWine}
            className="w-full py-4 rounded-2xl font-bold text-[17px] text-white transition-all active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${sectionColor}, ${sectionColorDark})`, boxShadow: `0 6px 24px rgba(124,58,82,0.35)` }}
          >
            Yes, let&apos;s taste it 🍷
          </button>

          <button
            onClick={() => { setSearchState('idle'); setRawInput(''); setIdentified(null); setDetectedSectionId(null); }}
            className="w-full py-3 rounded-2xl font-semibold text-[15px]"
            style={{ background: 'var(--color-bg-subtle)', border: '1.5px solid var(--color-border-default)', color: 'var(--color-text-muted)' }}
          >
            Not quite — search again
          </button>
        </div>
      );
    }

    // Not found — manual form
    if (searchState === 'not-found') {
      return (
        <div className="px-4 pt-6 pb-28 flex flex-col gap-4">
          {Header}

          <div className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-subtle)' }}
          >
            <span className="text-xl mt-0.5">🔍</span>
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Couldn&apos;t find <strong style={{ color: 'var(--color-text-primary)' }}>{rawInput}</strong>. Fill in what you know — your sommelier will still guide you.
            </p>
          </div>

          <ManualForm
            identity={identity}
            setIdentity={setIdentity}
            onStart={() => startTasting()}
            onBack={() => { setSearchState('idle'); setIdentity({ wineName: '', producer: '', vintage: '', region: '', country: '', grapeVariety: '' }); }}
          />
        </div>
      );
    }

    // Idle — search input
    return (
      <div className="px-4 pt-6 pb-28 flex flex-col gap-5">
        {Header}

        {/* Hidden file input — triggered by the camera button.
            NOTE: iOS Safari refuses programmatic .click() on inputs with
            display:none, so we hide it via position/opacity instead. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelected}
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
            left: -9999,
          }}
        />

        <div className="rounded-2xl p-5" style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}>
          <p className="text-[14px] font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            What wine are you opening? <span style={{ color: 'var(--color-primary)' }}>*</span>
          </p>
          <input
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookUpWine()}
            placeholder="e.g. Meiomi Pinot Noir, Jordan Cabernet…"
            autoFocus
            style={{ ...fieldStyle, fontSize: 16 }}
          />
          <p className="text-[12px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Just the name — we&apos;ll look it up and fill in the rest
          </p>
        </div>

        <button
          onClick={lookUpWine}
          disabled={!rawInput.trim()}
          className="w-full py-4 rounded-2xl font-bold text-[17px] text-white transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', boxShadow: '0 6px 24px rgba(124,58,82,0.35)' }}
        >
          Find This Wine 🔍
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border-subtle)' }} />
          <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border-subtle)' }} />
        </div>

        <button
          onClick={openCamera}
          className="w-full py-4 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: 'var(--color-bg-surface)', border: '1.5px solid var(--color-primary)', color: 'var(--color-primary)' }}
        >
          <span style={{ fontSize: 18 }}>📷</span>
          Snap the label
        </button>

        {captureError && (
          <p className="text-[13px] text-center" style={{ color: '#B91C1C' }}>
            {captureError}
          </p>
        )}

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

  // ══════════════════════════════════════════════════════
  // RENDER — Phase 2: Tasting
  // ══════════════════════════════════════════════════════
  const displayName = identity.wineName || rawInput.trim();

  return (
    <div className="px-4 pt-6 pb-28 flex flex-col gap-5">

      <div ref={topRef} />

      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setPhase('identify'); setSearchState('idle'); setMessages([]); }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] shrink-0"
          style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}
        >
          ←
        </button>
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
            {detectedSection ? detectedSection.name : 'Journal'}
          </p>
          <h1 className="fraunces-display font-bold leading-tight" style={{ fontSize: 20, color: 'var(--color-text-primary)' }}>
            Open a Bottle 🍷
          </h1>
        </div>
      </div>

      {/* Wine summary chip */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: `${sectionColor}18`, border: `1px solid ${sectionColor}40` }}
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
        {detectedSection && (
          <span className="text-[11px] font-bold px-2 py-1 rounded-full shrink-0"
            style={{ background: `${sectionColor}25`, color: sectionColor, border: `1px solid ${sectionColor}40` }}
          >
            {detectedSection.shortName}
          </span>
        )}
      </div>

      {/* Sommelier conversation */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-espresso)', position: 'relative' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 70% 0%, rgba(196,144,64,0.18) 0%, transparent 55%), radial-gradient(ellipse at 20% 100%, ${sectionColor}35 0%, transparent 60%)` }} />
        <div className="relative z-10 p-5">
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
        <div className="rounded-xl px-4 py-3 text-[13px] text-center font-medium" style={{ background: '#FDE8E8', color: '#B91C1C', border: '1px solid #FECACA' }}>
          ⚠️ {saveError}
        </div>
      )}

      {/* Save — label shows section or "to Journal" */}
      <button
        onClick={saveBottle}
        disabled={saving}
        className="w-full py-4 rounded-2xl font-bold text-[17px] text-white transition-all active:scale-[0.98] disabled:opacity-50"
        style={{ background: `linear-gradient(135deg, ${sectionColor}, ${sectionColorDark})`, boxShadow: `0 6px 24px rgba(124,58,82,0.35)` }}
      >
        {saving ? 'Saving…' : detectedSection ? `Save to ${detectedSection.shortName} ✓` : 'Save to Journal ✓'}
      </button>
    </div>
  );
}

// ─── Found wine confirmation card ───────────────────────────────

function FoundWineCard({
  wine,
  detectedSection,
}: {
  wine: IdentifiedWine;
  detectedSection: { name: string; shortName: string; color: string } | null;
}) {
  const color = detectedSection?.color ?? PRIMARY;
  const details = [wine.producer, wine.vintage ? String(wine.vintage) : undefined, wine.region, wine.country].filter(Boolean);

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 8px rgba(44,26,16,0.06)' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color }}>
          {wine.confidence === 'high' ? 'Found it' : 'Best match'}
        </span>
        {detectedSection && (
          <span className="ml-auto text-[11px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
          >
            {detectedSection.shortName}
          </span>
        )}
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
          <span className="text-[12px] font-semibold px-3 py-1 rounded-full"
            style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
          >
            {wine.grapeVariety}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Manual form ────────────────────────────────────────────────

function ManualForm({
  identity, setIdentity, onStart, onBack,
}: {
  identity: { wineName: string; producer: string; vintage: string; region: string; country: string; grapeVariety: string };
  setIdentity: React.Dispatch<React.SetStateAction<typeof identity>>;
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
          <div><SmallLabel>Grape</SmallLabel><input value={identity.grapeVariety} onChange={(e) => setIdentity((p) => ({ ...p, grapeVariety: e.target.value }))} placeholder="e.g. Pinot Noir" style={{ ...fieldStyle, fontSize: 14, padding: '9px 12px' }} /></div>
        </div>
      </div>

      <button onClick={onStart} disabled={!identity.wineName.trim()} className="w-full py-4 rounded-2xl font-bold text-[17px] text-white active:scale-[0.98] disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', boxShadow: '0 6px 24px rgba(124,58,82,0.35)' }}
      >
        Let&apos;s Taste It 🍷
      </button>
      <button onClick={onBack} className="text-center text-[13px] underline underline-offset-2" style={{ color: 'var(--color-text-muted)' }}>
        ← Back to search
      </button>
    </div>
  );
}

// ─── Shared sub-components ──────────────────────────────────────

function SmallLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p className="text-[11px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
      {children}{required && <span style={{ color: 'var(--color-primary)' }}> *</span>}
    </p>
  );
}

// ─── Client-side image resize ───────────────────────────────────
// Reads a File, scales the longest edge down to maxEdge, and returns
// a JPEG data URL plus the bare base64 payload (no data: prefix).

async function resizeImageToBase64(
  file: File,
  maxEdge = 1024,
  quality = 0.85,
): Promise<{ dataUrl: string; base64: string }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Failed to decode image'));
      i.src = objectUrl;
    });

    const longest = Math.max(img.width, img.height);
    const scale = longest > maxEdge ? maxEdge / longest : 1;
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(img, 0, 0, w, h);

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
    return { dataUrl, base64 };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
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
