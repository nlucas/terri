'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// ─── Slide data ───────────────────────────────────────────────────

const SECTION_BADGES = [
  { id: 1, name: 'Light Reds',    color: '#D49080', emoji: '🍒' },
  { id: 2, name: 'Medium Reds',   color: '#9B5070', emoji: '🍇' },
  { id: 3, name: 'Bold Reds',     color: '#4A3020', emoji: '🪨' },
  { id: 4, name: 'Crisp Whites',  color: '#5C8C6C', emoji: '🍋' },
  { id: 5, name: 'Rich Whites',   color: '#D4A850', emoji: '🧈' },
  { id: 6, name: 'Sparkling',     color: '#C490A8', emoji: '✨' },
];

const STEPS = [
  {
    emoji: '📖',
    title: 'Read the guide',
    desc: 'Each section starts with a short, honest guide on the wine style. No gatekeeping.',
  },
  {
    emoji: '🍷',
    title: 'Open a bottle',
    desc: 'We identify your wine and fill in the details. Any bottle in the style counts.',
  },
  {
    emoji: '💬',
    title: 'Talk to your sommelier',
    desc: 'Your AI sommelier teaches you what you\'re experiencing — right in the glass.',
  },
];

// ─── Animation helpers ────────────────────────────────────────────

function slideVariants(direction: number) {
  return {
    enter:  { x: direction * 72, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit:   { x: direction * -72, opacity: 0 },
  };
}

const stagger = (i: number, base = 0.08) => ({
  delay: 0.12 + i * base,
  duration: 0.44,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
});

// ─── Main component ───────────────────────────────────────────────

export function OnboardingSlides() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const TOTAL = 4;

  function markOnboarded() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vinora_onboarded', '1');
    }
  }

  function next() {
    if (slide === TOTAL - 1) return;
    setDirection(1);
    setSlide((s) => s + 1);
  }

  function back() {
    if (slide === 0) return;
    setDirection(-1);
    setSlide((s) => s - 1);
  }

  function goToIntro() {
    markOnboarded();
    router.push('/learn/intro');
  }

  function goToCurriculum() {
    markOnboarded();
    router.push('/learn');
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'var(--color-bg-base)' }}>

      {/* Back button */}
      {slide > 0 && (
        <button
          onClick={back}
          className="absolute top-5 left-5 z-30 text-[13px] font-semibold px-3 py-1.5 rounded-full"
          style={{ color: 'var(--color-text-muted)', background: 'rgba(0,0,0,0.06)' }}
        >
          ← Back
        </button>
      )}

      {/* Skip — only on first 3 slides */}
      {slide < TOTAL - 1 && (
        <button
          onClick={goToCurriculum}
          className="absolute top-5 right-5 z-30 text-[13px] font-semibold px-3 py-1.5 rounded-full"
          style={{ color: 'var(--color-text-muted)', background: 'rgba(0,0,0,0.06)' }}
        >
          Skip
        </button>
      )}

      {/* Slide */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slide}
          custom={direction}
          variants={slideVariants(direction)}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.36, ease: [0.4, 0, 0.2, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.07}
          onDragEnd={(_, info) => {
            if (info.offset.x < -40) next();
            if (info.offset.x > 40) back();
          }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6"
          style={{ cursor: 'grab' }}
        >
          {slide === 0 && <SlideHook />}
          {slide === 1 && <SlideCurriculum />}
          {slide === 2 && <SlideHowItWorks />}
          {slide === 3 && <SlideBegin onIntro={goToIntro} onSkip={goToCurriculum} />}
        </motion.div>
      </AnimatePresence>

      {/* Progress dots + Next button */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-5 pb-10 px-6">
        <div className="flex gap-2 items-center">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > slide ? 1 : -1); setSlide(i); }}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === slide ? 24 : 8,
                height: 8,
                background: i === slide
                  ? 'var(--color-primary)'
                  : 'var(--color-border-default)',
              }}
            />
          ))}
        </div>

        {slide < TOTAL - 1 && (
          <button
            onClick={next}
            className="w-full max-w-xs py-4 rounded-2xl font-bold text-[16px] text-white transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
              boxShadow: '0 6px 24px rgba(124,58,82,0.30)',
            }}
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// SLIDE 0 — Hook (dark, bold)
// ════════════════════════════════════════════════════════
function SlideHook() {
  return (
    <div
      className="w-full max-w-md rounded-3xl overflow-hidden flex flex-col items-center justify-center text-center p-10"
      style={{
        background: 'linear-gradient(160deg, #3A1E12 0%, #1C0D08 100%)',
        minHeight: 460,
        boxShadow: '0 24px 80px rgba(44,26,16,0.40)',
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <span style={{ fontSize: 80 }}>🍷</span>
      </motion.div>

      <motion.p
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(1)}
        className="text-[11px] font-bold tracking-widest uppercase mt-6 mb-3"
        style={{ color: 'rgba(196,144,64,0.8)' }}
      >
        Welcome to Vinora
      </motion.p>

      <motion.h1
        initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(2)}
        className="fraunces-display font-black text-white leading-[1.1] mb-4"
        style={{ fontSize: 38, textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
      >
        Wine shouldn&apos;t be intimidating.
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(3)}
        className="text-[16px] leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.58)' }}
      >
        Wine people made it complicated. We&apos;re making it simple again.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
        className="mt-8 flex items-center gap-2"
        style={{ color: 'rgba(255,255,255,0.22)', fontSize: 13 }}
      >
        <span>Swipe or tap Continue</span>
        <span>→</span>
      </motion.div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// SLIDE 1 — The Curriculum (section badges)
// ════════════════════════════════════════════════════════
function SlideCurriculum() {
  return (
    <div className="w-full max-w-md" style={{ paddingBottom: 130 }}>
      <motion.p
        initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(0)}
        className="text-[11px] font-bold tracking-widest uppercase mb-2"
        style={{ color: 'var(--color-honey-dark)' }}
      >
        Your curriculum
      </motion.p>
      <motion.h2
        initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(1)}
        className="fraunces-display font-black leading-tight mb-2"
        style={{ fontSize: 32, color: 'var(--color-text-primary)' }}
      >
        6 styles. 18 bottles.
      </motion.h2>
      <motion.p
        initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(2)}
        className="text-[15px] mb-7"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Master one wine style at a time. Each section unlocks the next.
      </motion.p>

      <div className="grid grid-cols-2 gap-3">
        {SECTION_BADGES.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.07, duration: 0.44, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: `${s.color}18`, border: `1.5px solid ${s.color}35` }}
          >
            <span style={{ fontSize: 22 }}>{s.emoji}</span>
            <div>
              <p className="text-[11px] font-bold" style={{ color: 'var(--color-text-muted)' }}>
                {String(s.id).padStart(2, '0')}
              </p>
              <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                {s.name}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
        className="text-[13px] mt-5 text-center"
        style={{ color: 'var(--color-text-muted)' }}
      >
        3 bottles per style. Try before you theorize.
      </motion.p>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// SLIDE 2 — How it works (3 steps)
// ════════════════════════════════════════════════════════
function SlideHowItWorks() {
  return (
    <div className="w-full max-w-md" style={{ paddingBottom: 130 }}>
      <motion.p
        initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(0)}
        className="text-[11px] font-bold tracking-widest uppercase mb-2"
        style={{ color: 'var(--color-primary)' }}
      >
        The loop
      </motion.p>
      <motion.h2
        initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(1)}
        className="fraunces-display font-black leading-tight mb-7"
        style={{ fontSize: 32, color: 'var(--color-text-primary)' }}
      >
        Here&apos;s how it works.
      </motion.h2>

      <div className="flex flex-col gap-4">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={stagger(i + 2, 0.11)}
            className="flex items-start gap-4 p-4 rounded-2xl"
            style={{ background: 'var(--color-bg-surface)', boxShadow: '0 2px 10px rgba(44,26,16,0.07)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: 'var(--color-primary-muted)' }}
            >
              {step.emoji}
            </div>
            <div>
              <p className="fraunces-card font-bold text-[16px] mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                {step.title}
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
        className="flex items-center gap-3 mt-5 px-4 py-3 rounded-xl"
        style={{ background: 'var(--color-honey-muted)', border: '1px solid rgba(196,144,64,0.22)' }}
      >
        <span style={{ fontSize: 18 }}>💡</span>
        <p className="text-[13px]" style={{ color: 'var(--color-espresso-soft)' }}>
          Reading the guide before you taste makes the sommelier&apos;s teaching land so much faster.
        </p>
      </motion.div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// SLIDE 3 — Begin (CTA → /learn/intro)
// ════════════════════════════════════════════════════════
function SlideBegin({ onIntro, onSkip }: { onIntro: () => void; onSkip: () => void }) {
  return (
    <div className="w-full max-w-md flex flex-col items-center text-center" style={{ paddingBottom: 60 }}>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-7"
        style={{
          background: 'linear-gradient(135deg, #3A1E12, #2C1A10)',
          boxShadow: '0 12px 40px rgba(44,26,16,0.30)',
          fontSize: 40,
        }}
      >
        📖
      </motion.div>

      <motion.p
        initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(1)}
        className="text-[11px] font-bold tracking-widest uppercase mb-3"
        style={{ color: 'var(--color-primary)' }}
      >
        Before your first bottle
      </motion.p>

      <motion.h2
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(2)}
        className="fraunces-display font-black leading-tight mb-3"
        style={{ fontSize: 34, color: 'var(--color-text-primary)' }}
      >
        Start with the Introduction.
      </motion.h2>

      <motion.p
        initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(3)}
        className="text-[15px] leading-relaxed mb-8"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        A 10-minute read on how wine works, what to look for in every glass, and exactly how to get the most out of this app.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(4)}
        className="w-full flex flex-col gap-3"
      >
        <button
          onClick={onIntro}
          className="w-full py-4 rounded-2xl font-bold text-[17px] text-white transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            boxShadow: '0 8px 28px rgba(124,58,82,0.32)',
          }}
        >
          Read the Introduction →
        </button>
        <button
          onClick={onSkip}
          className="w-full py-3.5 rounded-2xl font-semibold text-[15px] transition-colors"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1.5px solid var(--color-border-default)',
            color: 'var(--color-text-muted)',
          }}
        >
          Skip to curriculum
        </button>
      </motion.div>
    </div>
  );
}
