'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function IntroCard() {
  const [complete, setComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setComplete(localStorage.getItem('vinora_intro_complete') === '1');
  }, []);

  // Avoid hydration mismatch — render neutral state on server
  if (!mounted) {
    return <IntroCardShell complete={false} />;
  }

  return <IntroCardShell complete={complete} />;
}

function IntroCardShell({ complete }: { complete: boolean }) {
  return (
    <Link href="/learn/intro" className="block">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: complete
            ? 'linear-gradient(135deg, #2A1A0E, #1C0D08)'
            : 'linear-gradient(135deg, #3A1E12, #2C1A10)',
          border: complete
            ? '1.5px solid rgba(94,186,138,0.30)'
            : '1.5px solid rgba(196,144,64,0.22)',
          boxShadow: '0 4px 16px rgba(44,26,16,0.15)',
        }}
      >
        {/* Top accent strip */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: 3,
            background: complete
              ? 'linear-gradient(90deg, #5EBA8A, #3D9E6A)'
              : 'linear-gradient(90deg, rgba(196,144,64,0.8), rgba(196,144,64,0.4))',
          }}
        />

        <div className="px-4 pt-5 pb-4">
          <div className="flex items-start gap-3.5">
            {/* Icon */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-2xl"
              style={{
                background: complete
                  ? 'rgba(94,186,138,0.15)'
                  : 'rgba(196,144,64,0.15)',
              }}
            >
              {complete ? '✅' : '📖'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p
                    className="text-[10px] font-bold tracking-widest uppercase mb-0.5"
                    style={{ color: complete ? 'rgba(94,186,138,0.7)' : 'rgba(196,144,64,0.7)' }}
                  >
                    Module 00
                  </p>
                  <p
                    className="fraunces-card font-bold text-[17px] leading-tight text-white"
                  >
                    Introduction to Wine
                  </p>
                </div>
                <div className="shrink-0">
                  {complete ? (
                    <span
                      className="text-[12px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(94,186,138,0.18)', color: '#5EBA8A' }}
                    >
                      ✓ Done
                    </span>
                  ) : (
                    <span
                      className="text-[12px] font-semibold"
                      style={{ color: 'rgba(255,255,255,0.30)' }}
                    >
                      →
                    </span>
                  )}
                </div>
              </div>

              <p
                className="text-[13px] leading-snug mt-1.5"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                {complete
                  ? 'The five variables, how to taste, reading a label, and more.'
                  : 'Start here. The only thing you need before your first bottle.'}
              </p>
            </div>
          </div>

          {/* Reading estimate */}
          {!complete && (
            <div className="flex items-center gap-1.5 mt-3 pl-[3.375rem]">
              <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>~10 min read</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
