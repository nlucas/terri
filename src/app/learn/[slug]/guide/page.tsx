import { notFound, redirect } from 'next/navigation';
import { readFileSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SECTION_BY_SLUG, SECTIONS } from '@/lib/sections';
import { AppShell } from '@/components/layout/AppShell';
import { markdownToHtml } from '@/lib/markdown';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SECTIONS.map((s) => ({ slug: s.slug }));
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const section = SECTION_BY_SLUG[slug];
  if (!section) notFound();

  // Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Read guide content — file lives at ../../content/ relative to Next.js root (vinora/)
  let html = '';
  try {
    const contentPath = join(process.cwd(), '..', 'content', `${section.contentFile}.md`);
    const raw = readFileSync(contentPath, 'utf-8');
    html = markdownToHtml(raw);
  } catch {
    html = '<p>Guide content coming soon.</p>';
  }

  return (
    <AppShell>

      {/* ── Coloured hero ───────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          height: 140,
          background: `linear-gradient(145deg, ${section.color} 0%, ${section.colorDark} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(44,26,16,0.5) 100%)' }}
        />

        {/* Back */}
        <Link
          href={`/learn/${slug}`}
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-white text-[13px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
        >
          ← Back
        </Link>

        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 z-10">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/60 mb-0.5">
            Section {section.id} · The Guide
          </p>
          <h1
            className="fraunces-display font-bold text-white leading-tight"
            style={{ fontSize: 22 }}
          >
            {section.name}
          </h1>
        </div>
      </div>

      {/* ── Article body ────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-24">
        <div
          className="guide-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* CTA — go log a bottle */}
        <div
          className="mt-8 rounded-xl p-5 text-center"
          style={{
            background: `linear-gradient(135deg, ${section.color}20, ${section.colorDark}30)`,
            border: `1.5px solid ${section.color}40`,
          }}
        >
          <p className="text-2xl mb-2">🍷</p>
          <p className="fraunces-card font-bold text-[17px] mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Ready to drink?
          </p>
          <p className="text-[13px] mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Log your first {section.shortName.toLowerCase()} to unlock your AI sommelier.
          </p>
          <Link
            href={`/log?section=${slug}&slot=0`}
            className="inline-block px-5 py-2.5 rounded-xl text-[14px] font-bold text-white"
            style={{ background: section.color }}
          >
            Log Bottle 1 →
          </Link>
        </div>
      </div>

      {/* ── Guide body styles ────────────────────────────────── */}
      <style>{`
        .guide-body h1 {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 800;
          color: var(--color-text-primary);
          line-height: 1.2;
          margin-bottom: 6px;
          margin-top: 32px;
        }
        .guide-body h1:first-child { margin-top: 0; }
        .guide-body h2 {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1.3;
          margin-top: 36px;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1.5px solid var(--color-border-subtle);
        }
        .guide-body h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text-secondary);
          margin-top: 24px;
          margin-bottom: 8px;
        }
        .guide-body p {
          font-size: 15px;
          line-height: 1.75;
          color: var(--color-text-secondary);
          margin-bottom: 14px;
        }
        .guide-body strong {
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .guide-body em {
          font-style: italic;
          color: var(--color-text-muted);
        }
        .guide-body hr {
          border: none;
          border-top: 1.5px solid var(--color-border-subtle);
          margin: 28px 0;
        }
        .guide-body blockquote {
          border-left: 3px solid ${section?.color ?? 'var(--color-primary)'};
          padding: 12px 16px;
          margin: 20px 0;
          border-radius: 0 10px 10px 0;
          background: var(--color-bg-subtle);
          font-size: 14px;
          line-height: 1.65;
          color: var(--color-text-secondary);
          font-style: italic;
        }
        .guide-body ul, .guide-body ol {
          margin: 12px 0 18px 0;
          padding-left: 20px;
        }
        .guide-body li {
          font-size: 14px;
          line-height: 1.7;
          color: var(--color-text-secondary);
          margin-bottom: 6px;
        }
        .guide-body code {
          font-size: 13px;
          background: var(--color-bg-subtle);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--color-primary);
        }
      `}</style>

    </AppShell>
  );
}
