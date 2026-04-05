import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Logo */}
      <div className="mb-10 text-center">
        <h1
          className="fraunces-display font-bold"
          style={{ fontSize: 48, color: 'var(--color-text-primary)', letterSpacing: -1 }}
        >
          Terri
        </h1>
        <p className="text-[15px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Learn wine the fun way.
        </p>
      </div>

      <LoginForm />

      <p className="mt-8 text-[12px] text-center" style={{ color: 'var(--color-text-muted)', maxWidth: 280 }}>
        By continuing, you agree to learn something new about wine.
      </p>
    </div>
  );
}
