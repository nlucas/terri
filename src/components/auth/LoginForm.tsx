'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type Mode = 'password' | 'magic' | 'sent';

export function LoginForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<Mode>('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/learn');
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
    } else {
      setMode('sent');
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (mode === 'sent') {
    return (
      <div className={dark ? 'login-card' : 'w-full max-w-sm rounded-2xl p-8 text-center shadow-warm-card'} style={dark ? {} : { background: 'var(--color-bg-surface)' }}>
        <span className="text-5xl block mb-4">📬</span>
        <h2
          className="fraunces-display font-bold text-[22px] mb-2"
          style={{ color: dark ? 'white' : 'var(--color-text-primary)' }}
        >
          Check your email
        </h2>
        <p className="text-[14px]" style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--color-text-muted)' }}>
          We sent a magic link to{' '}
          <strong style={{ color: dark ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>{email}</strong>.
          Click it to sign in.
        </p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = dark ? {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    fontFamily: 'var(--font-body)',
  } : {
    background: 'var(--color-bg-subtle)',
    border: '1.5px solid var(--color-border-default)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-body)',
  };

  return (
    <div
      className={dark ? 'login-card' : 'w-full max-w-sm rounded-2xl p-8 shadow-warm-card'}
      style={dark ? {} : { background: 'var(--color-bg-surface)' }}
    >
      {/* Sign in header — only shown in light mode */}
      {!dark && (
        <>
          <h2
            className="fraunces-display font-bold text-[24px] mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Sign in
          </h2>
          <p className="text-[13px] mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Your progress saves across devices.
          </p>
        </>
      )}

      {/* Google OAuth */}
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-[14px] mb-4 transition-all disabled:opacity-50 active:scale-[0.98]"
        style={dark ? {
          background: 'white',
          color: '#1a1a1a',
          border: 'none',
        } : {
          background: 'var(--color-bg-subtle)',
          border: '1.5px solid var(--color-border-default)',
          color: 'var(--color-text-primary)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: dark ? 'rgba(255,255,255,0.1)' : 'var(--color-border-subtle)' }} />
        <span className="text-[11px] font-medium" style={{ color: dark ? 'rgba(255,255,255,0.3)' : 'var(--color-text-muted)' }}>or</span>
        <div className="flex-1 h-px" style={{ background: dark ? 'rgba(255,255,255,0.1)' : 'var(--color-border-subtle)' }} />
      </div>

      {/* Password login */}
      {mode === 'password' && (
        <form onSubmit={handlePassword} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none login-input"
            style={inputStyle}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none login-input"
            style={inputStyle}
          />
          {error && (
            <p className="text-[12px]" style={{ color: dark ? '#E8A0A0' : 'var(--color-primary)' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full py-3 rounded-xl font-semibold text-[14px] text-white transition-all disabled:opacity-40 active:scale-[0.98]"
            style={dark ? {
              background: 'linear-gradient(135deg, #8B2020, #7C3A52)',
              boxShadow: '0 4px 20px rgba(124,58,82,0.4)',
            } : {
              background: 'var(--color-primary)',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={() => setMode('magic')}
            className="text-[12px] text-center mt-1 underline underline-offset-2"
            style={{ color: dark ? 'rgba(255,255,255,0.3)' : 'var(--color-text-muted)' }}
          >
            Send a magic link instead
          </button>
        </form>
      )}

      {/* Magic link */}
      {mode === 'magic' && (
        <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none login-input"
            style={inputStyle}
          />
          {error && (
            <p className="text-[12px]" style={{ color: dark ? '#E8A0A0' : 'var(--color-primary)' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-3 rounded-xl font-semibold text-[14px] text-white transition-all disabled:opacity-40 active:scale-[0.98]"
            style={dark ? {
              background: 'linear-gradient(135deg, #8B2020, #7C3A52)',
              boxShadow: '0 4px 20px rgba(124,58,82,0.4)',
            } : {
              background: 'var(--color-primary)',
            }}
          >
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
          <button
            type="button"
            onClick={() => setMode('password')}
            className="text-[12px] text-center mt-1 underline underline-offset-2"
            style={{ color: dark ? 'rgba(255,255,255,0.3)' : 'var(--color-text-muted)' }}
          >
            Sign in with password instead
          </button>
        </form>
      )}
    </div>
  );
}
