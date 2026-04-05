'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// ─── What gets wiped ──────────────────────────────────────────────

const WHAT_GETS_DELETED = [
  'All 18 bottle slots across every section',
  'All tasting notes and ratings',
  'All AI sommelier conversations',
  'Your section completion progress',
  'Introduction module completion',
];

// ─── ResetJourneySheet ────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ResetJourneySheet({ open, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<'warn' | 'confirm' | 'resetting' | 'done'>('warn');
  const [error, setError] = useState<string | null>(null);

  // Reset internal step state whenever the sheet opens/closes
  function handleClose() {
    onClose();
    // Delay state reset so exit animation completes cleanly
    setTimeout(() => {
      setStep('warn');
      setError(null);
    }, 350);
  }

  async function executeReset() {
    setStep('resetting');
    setError(null);

    try {
      const res = await fetch('/api/user/reset', { method: 'DELETE' });
      if (!res.ok) throw new Error('Reset failed');

      // Clear all localStorage progress flags
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vinora_onboarded');
        localStorage.removeItem('vinora_intro_complete');
      }

      setStep('done');

      // Brief pause so the user sees the success state, then redirect
      setTimeout(() => {
        router.push('/learn');
        router.refresh();
      }, 1400);

    } catch {
      setError('Something went wrong. Please try again.');
      setStep('confirm');
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(44,26,16,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={step === 'resetting' || step === 'done' ? undefined : handleClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.9 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
            style={{
              background: 'var(--color-bg-surface)',
              maxWidth: 430,
              margin: '0 auto',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: 'var(--color-border-default)' }}
              />
            </div>

            <AnimatePresence mode="wait">

              {/* ── Step 1: Warning ─────────────────────────────── */}
              {(step === 'warn' || step === 'confirm') && (
                <motion.div
                  key="warn"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="px-5 pt-3 pb-2"
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ background: 'rgba(220,53,53,0.10)', border: '1.5px solid rgba(220,53,53,0.20)' }}
                    >
                      ⚠️
                    </div>
                  </div>

                  {/* Heading */}
                  <h2
                    className="fraunces-display font-black text-center leading-tight mb-2"
                    style={{ fontSize: 26, color: 'var(--color-text-primary)' }}
                  >
                    Reset your journey?
                  </h2>
                  <p
                    className="text-[14px] text-center leading-relaxed mb-5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    This is permanent and cannot be undone. Everything below will be erased.
                  </p>

                  {/* What gets deleted */}
                  <div
                    className="rounded-xl p-4 mb-5"
                    style={{
                      background: 'rgba(220,53,53,0.05)',
                      border: '1px solid rgba(220,53,53,0.15)',
                    }}
                  >
                    {WHAT_GETS_DELETED.map((item) => (
                      <div key={item} className="flex items-start gap-2.5 mb-2 last:mb-0">
                        <span style={{ color: '#DC3535', fontSize: 14, marginTop: 2, flexShrink: 0 }}>✕</span>
                        <span className="text-[13px] leading-snug" style={{ color: 'var(--color-text-secondary)' }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* What stays */}
                  <div
                    className="rounded-xl px-4 py-3 mb-6 flex items-center gap-2.5"
                    style={{
                      background: 'rgba(94,186,138,0.08)',
                      border: '1px solid rgba(94,186,138,0.20)',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>✓</span>
                    <p className="text-[13px]" style={{ color: '#3D9E6A' }}>
                      Your account and login details are kept. You won&apos;t be signed out.
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <p
                      className="text-[13px] text-center mb-3"
                      style={{ color: '#DC3535' }}
                    >
                      {error}
                    </p>
                  )}

                  {/* Actions */}
                  {step === 'warn' ? (
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={() => setStep('confirm')}
                        className="w-full py-3.5 rounded-2xl font-bold text-[15px] transition-all active:scale-[0.98]"
                        style={{
                          background: 'rgba(220,53,53,0.10)',
                          border: '1.5px solid rgba(220,53,53,0.25)',
                          color: '#DC3535',
                        }}
                      >
                        I understand — show me the confirmation
                      </button>
                      <button
                        onClick={handleClose}
                        className="w-full py-3.5 rounded-2xl font-semibold text-[15px]"
                        style={{
                          background: 'var(--color-bg-subtle)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    // Step 2 — final confirm
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={executeReset}
                        className="w-full py-4 rounded-2xl font-black text-[16px] text-white transition-all active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #DC3535, #B02020)',
                          boxShadow: '0 6px 20px rgba(220,53,53,0.30)',
                        }}
                      >
                        Yes, delete everything
                      </button>
                      <button
                        onClick={() => setStep('warn')}
                        className="w-full py-3.5 rounded-2xl font-semibold text-[15px]"
                        style={{
                          background: 'var(--color-bg-subtle)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        Go back
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Step 3: Resetting ───────────────────────────── */}
              {step === 'resetting' && (
                <motion.div
                  key="resetting"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center justify-center px-5 py-14"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full mb-5"
                    style={{
                      border: '3px solid var(--color-border-subtle)',
                      borderTopColor: '#DC3535',
                    }}
                  />
                  <p
                    className="fraunces-card font-bold text-[18px] mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Clearing your journey…
                  </p>
                  <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                    This will only take a moment.
                  </p>
                </motion.div>
              )}

              {/* ── Step 4: Done ────────────────────────────────── */}
              {step === 'done' && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className="flex flex-col items-center justify-center px-5 py-14"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 18 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5"
                    style={{ background: 'rgba(94,186,138,0.15)', border: '1.5px solid rgba(94,186,138,0.30)' }}
                  >
                    ✓
                  </motion.div>
                  <p
                    className="fraunces-display font-black text-[22px] mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Journey reset.
                  </p>
                  <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                    Taking you back to the beginning…
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
