'use client';

import { useState, useEffect, useRef } from 'react';

interface BottleContext {
  wineName: string;
  producer?: string | null;
  vintage?: number | null;
  region?: string | null;
  country?: string | null;
  grapeVariety?: string | null;
  sweetness?: number | null;
  acidity?: number | null;
  tannin?: number | null;
  body?: number | null;
  rating?: number | null;
  notes?: string | null;
  sectionName: string;
  grapes: string[];
  sectionColor: string;
}

interface Message {
  role: 'sommelier' | 'user';
  content: string;
}

export function BottleSommelierCard({ bottleContext }: { bottleContext: BottleContext }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [initiated, setInitiated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);

  // Auto-initiate on mount
  useEffect(() => {
    if (initiated) return;
    setInitiated(true);
    streamSommelier(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only scroll when a NEW message is added, not on every streaming chunk
  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      prevMessageCount.current = messages.length;
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }, [messages.length]);

  async function streamSommelier(userQuestion: string | null) {
    setLoading(true);

    // Add user message if it's a follow-up
    if (userQuestion) {
      setMessages((prev) => [...prev, { role: 'user', content: userQuestion }]);
    }

    // Add empty sommelier message that we'll fill
    setMessages((prev) => [...prev, { role: 'sommelier', content: '' }]);

    try {
      const body = userQuestion
        ? {
            question: userQuestion,
            context: {
              sectionName: bottleContext.sectionName,
              grapes: bottleContext.grapes,
            },
          }
        : { bottleContext };

      const res = await fetch('/api/sommelier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'sommelier',
          content: "Sorry, I couldn't connect right now. Try again in a moment.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAsk() {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion('');
    await streamSommelier(q);
  }

  const followUpSuggestions = [
    `What food would pair best with ${bottleContext.wineName}?`,
    `What's a similar bottle I should try next?`,
    `What makes this different from other ${bottleContext.grapes[0]}s?`,
    `How should I serve this wine?`,
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--color-espresso)', position: 'relative' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 70% 0%, rgba(196,144,64,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 20% 100%, ${bottleContext.sectionColor}40 0%, transparent 60%)
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
              Teaching you about {bottleContext.wineName}
            </p>
          </div>
          {loading && (
            <div className="flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'var(--color-honey)',
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Message thread */}
        <div className="flex flex-col gap-3 mb-4 max-h-[420px] overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={msg.role === 'sommelier' ? '' : 'flex justify-end'}
            >
              {msg.role === 'sommelier' ? (
                <div
                  className="text-[14px] leading-relaxed p-4 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '4px 16px 16px 16px',
                    color: 'rgba(255,255,255,0.88)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                  {loading && i === messages.length - 1 && (
                    <span
                      className="inline-block w-[2px] h-[14px] ml-0.5 align-text-bottom"
                      style={{ background: 'var(--color-honey)', animation: 'blink 1s step-end infinite' }}
                    />
                  )}
                </div>
              ) : (
                <div
                  className="text-[13px] px-4 py-2.5 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.14)',
                    color: 'rgba(255,255,255,0.80)',
                    maxWidth: '80%',
                    borderRadius: '16px 4px 16px 16px',
                  }}
                >
                  {msg.content}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Follow-up suggestions (after first response) */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-col gap-2 mb-4">
            {followUpSuggestions.slice(0, 2).map((s) => (
              <button
                key={s}
                onClick={() => { setQuestion(s); }}
                className="text-left text-[12px] px-3 py-2 rounded-lg transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {s}
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
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask a follow-up..."
            className="flex-1 bg-transparent outline-none text-[14px]"
            style={{ color: 'rgba(255,255,255,0.70)', fontFamily: 'var(--font-body)' }}
          />
          <button
            onClick={handleAsk}
            disabled={!question.trim() || loading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[14px] transition-opacity disabled:opacity-40"
            style={{ background: 'var(--color-primary)' }}
          >
            →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
