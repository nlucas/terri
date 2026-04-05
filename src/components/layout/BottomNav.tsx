'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/learn', label: 'Learn', icon: '📚' },
  { href: '/map',   label: 'Map',   icon: '🗺️' },
  { href: '/journal', label: 'Journal', icon: '📔' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

interface BottomNavProps {
  showLogButton?: boolean; // only shown post-foundational
}

export function BottomNav({ showLogButton = false }: BottomNavProps) {
  const pathname = usePathname();

  // Split nav items to put Log button in the middle
  const leftItems  = NAV_ITEMS.slice(0, 2);
  const rightItems = NAV_ITEMS.slice(2);

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40"
      style={{
        background: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border-subtle)',
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-safe-area-inset-bottom"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>

        {/* Left items */}
        {leftItems.map((item) => (
          <NavItem key={item.href} item={item} active={pathname.startsWith(item.href)} />
        ))}

        {/* Center — Log button (only post-foundational) or spacer */}
        {showLogButton ? (
          <Link
            href="/log"
            className="flex flex-col items-center justify-center w-14 h-14 rounded-full text-white transition-transform active:scale-95"
            style={{
              background: 'var(--color-primary)',
              boxShadow: '0 4px 16px rgba(124,58,82,0.40), 0 2px 6px rgba(124,58,82,0.25)',
              marginTop: '-20px',
            }}
          >
            <span className="text-2xl leading-none">+</span>
          </Link>
        ) : (
          <div className="w-14" /> /* spacer to keep layout balanced */
        )}

        {/* Right items */}
        {rightItems.map((item) => (
          <NavItem key={item.href} item={item} active={pathname.startsWith(item.href)} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  item,
  active,
}: {
  item: { href: string; label: string; icon: string };
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        'relative flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors min-w-[52px]',
        active ? 'opacity-100' : 'opacity-50 hover:opacity-75'
      )}
    >
      <span className="text-xl leading-none">{item.icon}</span>
      <span
        className="text-[10px] font-semibold leading-none"
        style={{
          color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
          fontWeight: active ? 700 : 500,
        }}
      >
        {item.label}
      </span>
      {active && (
        <span
          className="absolute bottom-0 w-5 h-[3px] rounded-t-full"
          style={{ background: 'var(--color-primary)' }}
        />
      )}
    </Link>
  );
}
