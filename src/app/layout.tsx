import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vinora — Learn Wine the Fun Way',
  description: 'A structured, opinionated wine curriculum. Taste your way through 6 sections and actually learn.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F4EDE3',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full" style={{ fontFamily: 'var(--font-body)' }}>
        {children}
      </body>
    </html>
  );
}
