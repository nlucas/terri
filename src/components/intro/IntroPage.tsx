'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── Five Variables data ─────────────────────────────────────────

const VARIABLES = [
  {
    label: 'Sweetness',
    emoji: '🍬',
    range: 'Bone dry → Luscious',
    pct: 22,
    detail: 'Most still wines are completely dry — the yeast converts nearly all the sugar to alcohol during fermentation. Notice any sweetness on the tip of your tongue when you taste.',
  },
  {
    label: 'Acidity',
    emoji: '⚡',
    range: 'Soft → Electric',
    pct: 72,
    detail: 'The bright, tangy quality that makes your mouth water. High acidity makes a wine feel crisp and lively. Low acidity makes it feel soft and round. Do you salivate after a sip? That\'s acidity doing its job.',
  },
  {
    label: 'Tannin',
    emoji: '🍂',
    range: 'Silky → Grippy',
    pct: 55,
    detail: 'Found only in red wines. That drying, slightly grippy sensation when your tongue sticks to the roof of your mouth. Not a flaw — it\'s structure. Tannins soften over time, which is why great reds age so well.',
  },
  {
    label: 'Body',
    emoji: '⚖️',
    range: 'Light as water → Rich as cream',
    pct: 60,
    detail: 'The weight and texture of the wine in your mouth. Light-bodied reds like Pinot Noir feel silky and delicate. Full-bodied reds like Cabernet Sauvignon feel rich and substantial. Neither is better — it\'s what you prefer.',
  },
  {
    label: 'Alcohol',
    emoji: '🔥',
    range: '11% – 15% ABV',
    pct: 45,
    detail: 'Higher alcohol generally means riper grapes and a fuller, warmer feel on the finish. Before you even taste, check the label. Then try to feel that warmth and richness in the glass. The connection clicks fast.',
  },
];

// ─── Tasting Steps ───────────────────────────────────────────────

const TASTING_STEPS = [
  {
    word: 'Look',
    emoji: '👁',
    text: 'Hold the glass against a white background. Reds range from pale ruby to deep purple. Whites from pale straw to golden amber. Deeper color in a red often signals a bolder, more tannic wine.',
  },
  {
    word: 'Swirl',
    emoji: '🌀',
    text: 'Give the glass a few rotations. This exposes the wine to oxygen, opens up the aromas, and releases what was hiding. It also looks confident, which never hurts.',
  },
  {
    word: 'Smell',
    emoji: '👃',
    text: 'Put your nose just inside the rim and inhale slowly. Don\'t overthink it — just notice what comes up. Fruit? Earth? Flowers? Toast? You\'re not being graded. The goal is to start building a vocabulary your brain can recognize over time.',
  },
  {
    word: 'Sip',
    emoji: '👅',
    text: 'Don\'t swallow immediately. Let it sit. Notice the five variables. Then swallow and pay attention to the finish — how long does the taste linger, and is it pleasant? A long, complex finish is one of the hallmarks of a truly great wine.',
  },
  {
    word: 'Think',
    emoji: '🧠',
    text: 'What does this remind you of? What do you like? What would be better? The simple act of pausing to notice — even with no words for it yet — is what separates a taster from a drinker. Both are fine. But the taster has more fun.',
  },
];

// ─── Reading progress ────────────────────────────────────────────

function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(scrolled / total, 1) : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return progress;
}

// ─── Variable Bar (animates in on scroll) ────────────────────────

function VariableBar({ variable, index }: { variable: typeof VARIABLES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <span style={{ fontSize: 22 }}>{variable.emoji}</span>
        <div className="flex-1">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-[15px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {variable.label}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {variable.range}
            </span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 7, background: 'var(--color-border-subtle)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: inView ? `${variable.pct}%` : 0 }}
              transition={{ delay: 0.1 + index * 0.08, duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--color-primary-light), var(--color-primary))' }}
            />
          </div>
        </div>
      </div>
      <p className="text-[13px] leading-relaxed pl-9" style={{ color: 'var(--color-text-secondary)' }}>
        {variable.detail}
      </p>
    </div>
  );
}

// ─── Article helpers ──────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="fraunces-display font-black leading-tight mt-12 mb-4"
      style={{ fontSize: 26, color: 'var(--color-text-primary)', borderTop: '2px solid var(--color-primary)', paddingTop: 24 }}
    >
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[16px] leading-[1.75] mb-5" style={{ color: 'var(--color-text-secondary)' }}>
      {children}
    </p>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
      {children}
    </strong>
  );
}

function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="my-6 px-5 py-4 rounded-xl"
      style={{
        borderLeft: '3px solid var(--color-primary)',
        background: 'var(--color-primary-muted)',
      }}
    >
      <p className="text-[15px] leading-relaxed" style={{ color: 'var(--color-primary-dark)', fontStyle: 'italic' }}>
        {children}
      </p>
    </div>
  );
}

// ─── Main IntroPage component ─────────────────────────────────────

export function IntroPage() {
  const router = useRouter();
  const progress = useReadingProgress();
  const [isComplete, setIsComplete] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('terri_intro_complete') === '1') {
      setIsComplete(true);
    }
  }, []);

  function markComplete() {
    localStorage.setItem('terri_intro_complete', '1');
    setIsComplete(true);
    setJustCompleted(true);
  }

  return (
    <div style={{ background: 'var(--color-bg-base)', minHeight: '100dvh' }}>

      {/* ── Sticky reading progress bar ─────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50" style={{ height: 3, background: 'var(--color-border-subtle)' }}>
        <div
          className="h-full transition-none"
          style={{
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, var(--color-primary-light), var(--color-primary))',
          }}
        />
      </div>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <div
        className="relative flex flex-col justify-end px-6 pt-14 pb-10"
        style={{
          background: 'linear-gradient(175deg, #2C1A10 0%, #1C0D08 60%, #3A1E1290 100%)',
          minHeight: 260,
        }}
      >
        {/* Back nav */}
        <Link
          href="/learn"
          className="absolute top-8 left-6 flex items-center gap-1.5 text-[13px] font-semibold"
          style={{ color: 'rgba(255,255,255,0.40)' }}
        >
          ← Curriculum
        </Link>

        {/* Completion badge */}
        {isComplete && (
          <div
            className="absolute top-8 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
            style={{ background: 'rgba(94,186,138,0.18)', color: '#5EBA8A', border: '1px solid rgba(94,186,138,0.30)' }}
          >
            ✓ Complete
          </div>
        )}

        <motion.p
          initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}
          className="text-[11px] font-bold tracking-widest uppercase mb-3"
          style={{ color: 'rgba(196,144,64,0.8)' }}
        >
          Module 00 · Introduction
        </motion.p>

        <motion.h1
          initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18, duration: 0.5 }}
          className="fraunces-display font-black text-white leading-[1.08] mb-3"
          style={{ fontSize: 36 }}
        >
          Introduction to Wine
        </motion.h1>

        <motion.p
          initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.26, duration: 0.5 }}
          className="text-[14px]"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          The only thing you need to read before your first bottle
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex items-center gap-3 mt-5"
          style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}
        >
          <span>~10 min read</span>
          <span>·</span>
          <span>~1,050 words</span>
        </motion.div>
      </div>

      {/* ── Article body ─────────────────────────────────────────── */}
      <div className="px-5 pb-40 max-w-2xl mx-auto">

        {/* Section 1: Reputation Problem */}
        <SectionHeader>Wine Has a Reputation Problem</SectionHeader>

        <P>
          Walk into a nice restaurant and get handed a wine list. Watch as it immediately turns a perfectly confident adult into someone who just forgot their own name.
        </P>
        <P>
          It shouldn&apos;t be like this. Wine is fermented grape juice. It has been made by ordinary people in every culture on earth for over 8,000 years. And yet somewhere along the way, it acquired an aura of exclusivity — the hushed reverence, the impenetrable vocabulary, the anxiety about saying the wrong thing.
        </P>
        <P>
          Here&apos;s the truth: wine is not complicated. <Strong>Wine people made it complicated.</Strong> Terri is here to undo that.
        </P>
        <P>
          You don&apos;t need to memorize every French appellation or know how to identify 22 different types of oak. You need to understand a handful of core ideas, develop a sense of your own taste, and drink some great wine while you do it. That&apos;s the whole plan.
        </P>

        {/* Section 2: What Wine Is */}
        <SectionHeader>What Wine Actually Is</SectionHeader>

        <P>
          Wine is made from grapes that have been crushed, fermented (the sugars turned to alcohol by yeast), and bottled. That&apos;s it.
        </P>
        <P>
          But here&apos;s the thing: grapes are extraordinary. Unlike most other fruits, they contain everything they need to make wine on their own — sugar, acid, and naturally occurring yeast on their skins. Wine is one of the only beverages in the world that doesn&apos;t need a recipe. The grape does almost all the work.
        </P>
        <P>
          What makes wine so wildly varied comes down to two big factors:
        </P>
        <P>
          <Strong>1. The grape variety.</Strong> A Cabernet Sauvignon grape and a Pinot Noir grape are as different as an apple and a plum. They have different thicknesses of skin, different sugar levels, different flavors. The grape variety is the most important single factor in how a wine tastes.
        </P>
        <P>
          <Strong>2. Where and how it was grown.</Strong> The same grape grown in a cool, foggy region versus a hot, sunny one will produce completely different wine. Winemakers call this <em>terroir</em> — a French word that roughly means &quot;a sense of place.&quot; The soil, the climate, the elevation, even the direction the vineyard faces all leave a mark on the wine. This is why a Pinot Noir from Burgundy, France and one from Sonoma, California can taste like completely different wines even though they&apos;re made from the same grape.
        </P>
        <P>
          Everything else — how it was fermented, whether it was aged in oak barrels, how long it sat before bottling — layers on top of these two fundamentals.
        </P>

        {/* Section 3: Five Variables */}
        <SectionHeader>The Five Variables: Your Cheat Code</SectionHeader>

        <P>
          Every wine in the world can be understood through five variables. Once you can read these, you can describe any wine with confidence.
        </P>

        <div className="flex flex-col gap-7 my-7 p-5 rounded-2xl" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}>
          {VARIABLES.map((v, i) => (
            <VariableBar key={v.label} variable={v} index={i} />
          ))}
        </div>

        <Blockquote>
          Quick test: Pick up any wine you&apos;re about to try. Before you even open it, check the label for alcohol percentage. Then, once you taste it, see if you can feel that warmth and richness. The connection will click fast.
        </Blockquote>

        {/* Section 4: How to Taste */}
        <SectionHeader>How to Taste With Intention</SectionHeader>

        <P>
          You don&apos;t need to do anything elaborate. Just slow down for 30 seconds before your first gulp.
        </P>

        <div className="flex flex-col gap-3 my-6">
          {TASTING_STEPS.map((step, i) => (
            <div
              key={step.word}
              className="flex items-start gap-4 p-4 rounded-2xl"
              style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: 'var(--color-primary-muted)' }}
              >
                {step.emoji}
              </div>
              <div>
                <p className="fraunces-card font-bold text-[15px] mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {i + 1}. {step.word}
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Section 5: Reading a Label */}
        <SectionHeader>Reading a Label (The Quick Version)</SectionHeader>

        <P>
          Wine labels are designed to be confusing. Here&apos;s what to look for.
        </P>
        <P>
          <Strong>Old World vs. New World.</Strong> European wines (French, Italian, Spanish, German) are often labeled by <em>region</em> rather than grape. A bottle that says &quot;Chablis&quot; is a white wine from the Chablis region of France — it won&apos;t tell you it&apos;s Chardonnay, even though it is. American, Australian, Chilean, and South African wines (the &quot;New World&quot;) almost always show the grape variety right on the label, which makes them much easier to decode as a beginner.
        </P>
        <P>
          The four things worth reading:
        </P>

        <div className="grid grid-cols-2 gap-3 my-5">
          {[
            { num: '01', label: 'Producer', desc: 'Who made it' },
            { num: '02', label: 'Region', desc: 'Where the grapes came from' },
            { num: '03', label: 'Grape variety', desc: 'If listed (often is in New World)' },
            { num: '04', label: 'Vintage', desc: 'The year the grapes were harvested' },
          ].map((item) => (
            <div
              key={item.num}
              className="p-3.5 rounded-xl"
              style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
            >
              <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-primary)' }}>{item.num}</p>
              <p className="text-[14px] font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>{item.label}</p>
              <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <P>
          Everything else — awards, flowery descriptions, illustrations of chateaux — is marketing.
        </P>

        {/* Section 6: Price */}
        <SectionHeader>The Price Myth</SectionHeader>

        <P>
          Here&apos;s something almost nobody tells beginners: the relationship between price and quality in wine is real but non-linear. A $30 bottle is reliably better than a $10 bottle. A $100 bottle is <em>sometimes</em> better than a $30 bottle. But a $300 bottle is not ten times better than a $30 bottle.
        </P>

        <div
          className="my-5 px-5 py-4 rounded-2xl flex items-start gap-4"
          style={{ background: 'var(--color-honey-muted)', border: '1.5px solid rgba(196,144,64,0.25)' }}
        >
          <span style={{ fontSize: 28 }}>💡</span>
          <div>
            <p className="text-[14px] font-bold mb-1" style={{ color: 'var(--color-espresso)' }}>
              The sweet spot
            </p>
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-espresso-soft)' }}>
              Roughly <Strong>$18–$35</Strong>. In this range you&apos;ll find genuinely excellent wines from small producers, well-made examples of classic styles, and bottles you&apos;d happily serve to anyone. This is also where Terri&apos;s recommendations will live for most of the foundational track.
            </p>
          </div>
        </div>

        <P>
          Above $50, you&apos;re paying partly for scarcity, reputation, and age-worthiness. Below $15, quality is variable but not hopeless — there are diamonds in the discount bin, and you&apos;ll learn to find them.
        </P>

        {/* Section 7: Your Path */}
        <SectionHeader>Your Path from Here</SectionHeader>

        <P>
          You&apos;ve just absorbed the most important 10% of wine knowledge. The other 90% comes from drinking.
        </P>
        <P>
          Terri is structured around six foundational styles of wine. Each one gives you a short learning module like this one, a set of specific bottles to try, and the tools to understand what you&apos;re experiencing while you drink them. You need to try three bottles in each style before moving on.
        </P>
        <P>
          That&apos;s it. No tests. No memorization. Just intentional drinking with a guide alongside you.
        </P>
        <P>
          By the time you finish the foundational track, you&apos;ll have tried 18 different wines across every major style, you&apos;ll know what you love (and what leaves you cold), and you&apos;ll have a map of the world&apos;s wine regions dotted with your own experiences.
        </P>

        <div
          className="my-6 p-5 rounded-2xl text-center"
          style={{
            background: 'linear-gradient(160deg, #3A1E12 0%, #2C1A10 100%)',
          }}
        >
          <p className="text-[15px] font-semibold text-white leading-relaxed">
            Your first section is waiting.
          </p>
          <p className="text-[14px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Time to open a bottle.
          </p>
        </div>

      </div>

      {/* ── Sticky bottom CTA ────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-8 pt-4"
        style={{
          background: 'linear-gradient(to top, var(--color-bg-base) 70%, transparent)',
        }}
      >
        {!isComplete ? (
          <button
            onClick={markComplete}
            className="w-full py-4 rounded-2xl font-bold text-[16px] text-white transition-all active:scale-[0.98] max-w-lg mx-auto block"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
              boxShadow: '0 6px 24px rgba(124,58,82,0.30)',
            }}
          >
            Mark as Complete ✓
          </button>
        ) : (
          <motion.div
            initial={justCompleted ? { y: 20, opacity: 0 } : { y: 0, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col gap-2.5 max-w-lg mx-auto"
          >
            <div
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[14px] font-semibold"
              style={{ background: 'rgba(94,186,138,0.14)', color: '#5EBA8A', border: '1px solid rgba(94,186,138,0.25)' }}
            >
              ✓ Introduction complete
            </div>
            <Link
              href="/learn/light-elegant-reds"
              className="w-full py-4 rounded-2xl font-bold text-[16px] text-white text-center transition-all active:scale-[0.98] block"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                boxShadow: '0 6px 24px rgba(124,58,82,0.28)',
              }}
            >
              Begin Section 1: Light Reds →
            </Link>
          </motion.div>
        )}
      </div>

    </div>
  );
}
