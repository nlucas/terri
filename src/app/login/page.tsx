import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div
      className="min-h-dvh relative overflow-hidden flex flex-col items-center justify-center px-6 py-12"
      style={{ background: '#0D0604' }}
    >
      {/* ── Animated atmosphere orbs ──────────────────────────── */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      {/* ── Subtle grain overlay ───────────────────────────────── */}
      <div className="login-grain" />

      {/* ── Hero wordmark ──────────────────────────────────────── */}
      <div className="relative z-10 text-center mb-10 login-fade-up">
        {/* Eyebrow */}
        <p className="login-eyebrow">Save your progress</p>

        {/* The name — big, confident, warm */}
        <h1 className="login-wordmark fraunces-display">Terri</h1>

        {/* Gold accent rule */}
        <div className="login-rule" />

        {/* Tagline */}
        <p className="login-tagline fraunces-italic">
          Back up your bottles. Sync across devices.
        </p>
      </div>

      {/* ── Auth form ──────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm login-fade-up-delay">
        <LoginForm dark />
      </div>

      {/* ── Legal ──────────────────────────────────────────────── */}
      <p
        className="relative z-10 mt-8 text-[11px] text-center login-fade-up-delay"
        style={{ color: 'rgba(255,255,255,0.18)', maxWidth: 280 }}
      >
        Your bottles stay attached to your account.
      </p>
    </div>
  );
}
