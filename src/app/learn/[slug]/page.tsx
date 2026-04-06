import { notFound, redirect } from 'next/navigation';
import { readFileSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SECTION_BY_SLUG, SECTIONS, getSectionProgress } from '@/lib/sections';
import { getUserBottles } from '@/lib/db/queries';
import { markdownToHtml } from '@/lib/markdown';
import { AppShell } from '@/components/layout/AppShell';
import { SectionTabs } from '@/components/learn/SectionTabs';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateStaticParams() {
  return SECTIONS.map((s) => ({ slug: s.slug }));
}

export default async function SectionPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;

  const section = SECTION_BY_SLUG[slug];
  if (!section) notFound();

  // Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Real data
  const bottles = await getUserBottles(user.id);
  const progress = getSectionProgress(section.id, bottles);

  // Guide content
  let guideHtml = '<p>Guide coming soon.</p>';
  try {
    const raw = readFileSync(
      join(process.cwd(), 'content', `${section.contentFile}.md`),
      'utf-8'
    );
    guideHtml = markdownToHtml(raw);
  } catch { /* file not found */ }

  // Next section (for complete banner)
  const nextSection = SECTIONS[section.id]; // sections are 1-indexed, array is 0-indexed so [id] gives next

  return (
    <AppShell>

      {/* ── Hero header ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden flex flex-col justify-end"
        style={{
          height: 180,
          background: `linear-gradient(145deg, ${section.color} 0%, ${section.colorDark} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(44,26,16,0.55) 100%)' }}
        />
        <span
          className="absolute -top-8 -right-4 select-none pointer-events-none fraunces-display font-black"
          style={{ fontSize: 160, lineHeight: 1, color: 'rgba(255,255,255,0.09)', letterSpacing: -6 }}
        >
          {String(section.id).padStart(2, '0')}
        </span>

        <Link
          href="/learn"
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-white text-[13px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
        >
          ← Back
        </Link>

        <div className="relative z-10 px-5 pb-4">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/60 mb-1">
            Section {section.id} of 6
          </p>
          <h1
            className="fraunces-display font-bold text-white leading-tight"
            style={{ fontSize: 26, textShadow: '0 1px 8px rgba(0,0,0,0.20)' }}
          >
            {section.name}
          </h1>
          <p className="text-white/70 text-[13px] mt-1">{section.grapes.join(' · ')}</p>
        </div>
      </div>

      {/* ── Tabbed content ──────────────────────────────────── */}
      <SectionTabs
        section={section}
        bottles={progress.bottles}
        isComplete={progress.isComplete}
        guideHtml={guideHtml}
        nextSectionSlug={nextSection?.slug}
        nextSectionShortName={nextSection?.shortName}
        defaultTab={tab === 'bottles' ? 'bottles' : 'learn'}
      />

    </AppShell>
  );
}
