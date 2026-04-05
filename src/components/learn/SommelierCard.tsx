'use client';

import { useState } from 'react';

interface SommelierCardProps {
  sectionName: string;
  grapes: string[];
}

export function SommelierCard({ sectionName, grapes }: SommelierCardProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!question.trim() || loading) return;
    setLoading(true);
    setAnswer('');

    try {
      const res = await fetch('/api/sommelier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: { sectionName, grapes },
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
        setAnswer(text);
      }
    } catch {
      setAnswer('Sorry, I couldn\'t connect right now. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  const placeholders = [
    `What should I look for in a ${grapes[0]}?`,
    `How do ${grapes[0]} and ${grapes[1] ?? grapes[0]} differ?`,
    'What food would you pair with this?',
    'What makes a good value bottle here?',
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--color-espresso)', position: 'relative' }}
    >
      {/* Dual ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 70% 0%, rgba(196,144,64,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 20% 100%, rgba(124,58,82,0.25) 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
            style={{
              background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))`,
              border: '2px solid rgba(255,255,255,0.12)',
              boxShadow: '0 4px 16px rgba(124,58,82,0.40)',
            }}
          >
            🍷
          </div>
          <div className="flex-1">
            <p
              className="fraunces-card font-bold text-[15px] text-white"
              style={{ fontVariationSettings: "'opsz' 24, 'WONK' 0" }}
            >
              Your Sommelier
            </p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.40)' }}>
              Ask anything about {sectionName}
            </p>
          </div>
          {/* Live dot */}
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: '#5EBA8A',
              boxShadow: '0 0 0 3px rgba(94,186,138,0.20)',
            }}
          />
        </div>

        {/* Answer bubble */}
        {(answer || loading) && (
          <div
            className="mb-4 p-4 rounded-tl rounded-xl text-[14px] italic leading-relaxed"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '4px 16px 16px 16px',
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {answer}
            {loading && (
              <span
                className="inline-block w-[2px] h-[14px] ml-0.5 align-text-bottom"
                style={{
                  background: 'var(--color-honey-light)',
                  animation: 'blink 1s step-end infinite',
                }}
              />
            )}
          </div>
        )}

        {/* Prompt suggestions (shown before first question) */}
        {!answer && !loading && (
          <div className="flex flex-col gap-2 mb-4">
            {placeholders.slice(0, 2).map((p) => (
              <button
                key={p}
                onClick={() => { setQuestion(p); }}
                className="text-left text-[12px] px-3 py-2 rounded-lg transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask()}
            placeholder="Ask anything about wine..."
            className="flex-1 bg-transparent outline-none text-[14px]"
            style={{
              color: 'rgba(255,255,255,0.70)',
              fontFamily: 'var(--font-body)',
            }}
          />
          <button
            onClick={ask}
            disabled={!question.trim() || loading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[14px] transition-opacity disabled:opacity-40"
            style={{ background: 'var(--color-primary)' }}
          >
            →
          </button>
        </div>
      </div>

      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}
