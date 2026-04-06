import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
  contentBg?: string;
}

export function AppShell({ children, contentBg }: AppShellProps) {
  return (
    <div className="app-shell">
      <main
        className="w-full overflow-y-auto"
        style={{
          paddingBottom: 80,
          background: contentBg ?? 'var(--color-bg-base)',
          minHeight: '100dvh',
        }}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
