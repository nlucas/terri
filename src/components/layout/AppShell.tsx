import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
  showLogButton?: boolean;
  /** Override the background of the content area */
  contentBg?: string;
}

export function AppShell({ children, showLogButton = false, contentBg }: AppShellProps) {
  return (
    <div className="app-shell">
      {/* Scrollable content area — padded at the bottom for the nav bar */}
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

      <BottomNav showLogButton={showLogButton} />
    </div>
  );
}
