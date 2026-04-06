'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { SECTIONS } from '@/lib/sections';
import { ResetJourneySheet } from './ResetJourneySheet';
import type { LoggedBottle } from '@/types';

// ─── Types ────────────────────────────────────────────────────────

interface ProfileData {
  name: string | null;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  bottles: LoggedBottle[];
  completedSections: number[];
  uniqueCountries: string[];
}

// ─── Radial Progress Ring ─────────────────────────────────────────

function ProgressRing({
  value,
  max,
  size = 100,
  stroke = 8,
  color,
  label,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color: string;
  label: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? value / max : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-border-subtle)"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - pct) }}
            transition={{ duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>
        {/* Center value */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <span
            className="text-[20px] font-black"
            style={{ color: 'var(--color-text-primary)', lineHeight: 1 }}
          >
            {value}
          </span>
          <span
            className="text-[10px]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            of {max}
          </span>
        </div>
      </div>
      <span
        className="text-[12px] font-semibold"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Section Progress Grid ────────────────────────────────────────

function SectionGrid({
  completedSections,
  introComplete,
}: {
  completedSections: number[];
  introComplete: boolean;
}) {
  const items = [
    {
      id: 0,
      label: 'Intro',
      color: '#D4A850',
      colorDark: '#C49040',
      done: introComplete,
      href: '/learn/intro',
    },
    ...SECTIONS.map((s) => ({
      id: s.id,
      label: s.shortName,
      color: s.color,
      colorDark: s.colorDark,
      done: completedSections.includes(s.id),
      href: `/learn/${s.slug}`,
    })),
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item, i) => (
        <Link key={item.id} href={item.href}>
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 + i * 0.06, duration: 0.3 }}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl"
            style={{
              background: item.done
                ? `${item.color}22`
                : 'var(--color-bg-subtle)',
              border: item.done
                ? `1.5px solid ${item.color}55`
                : '1px solid var(--color-border-subtle)',
            }}
          >
            {item.done ? (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[14px]"
                style={{
                  background: `linear-gradient(135deg, ${item.color}, ${item.colorDark})`,
                }}
              >
                ✓
              </div>
            ) : (
              <div
                className="w-7 h-7 rounded-lg"
                style={{ background: 'var(--color-border-default)' }}
              />
            )}
            <span
              className="text-[10px] font-semibold leading-tight text-center"
              style={{
                color: item.done ? item.colorDark : 'var(--color-text-muted)',
              }}
            >
              {item.label}
            </span>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

// ─── Sign Out Button ──────────────────────────────────────────────

function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="w-full flex items-center gap-3 px-4 py-4 text-left transition-colors active:opacity-70"
      style={{ background: 'var(--color-bg-surface)' }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[18px] shrink-0"
        style={{ background: 'var(--color-bg-subtle)' }}
      >
        🚪
      </div>
      <span
        className="flex-1 text-[15px] font-semibold"
        style={{ color: loading ? 'var(--color-text-muted)' : 'var(--color-text-secondary)' }}
      >
        {loading ? 'Signing out…' : 'Sign Out'}
      </span>
      {!loading && <span style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>›</span>}
    </button>
  );
}

// ─── Initials Avatar ─────────────────────────────────────────────

function InitialsAvatar({ name, email }: { name: string | null; email: string }) {
  const source = name ?? email;
  const initials = source
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-[28px] text-white mb-4"
      style={{
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
        boxShadow: '0 8px 28px rgba(124,58,82,0.35)',
      }}
    >
      {initials || '🍷'}
    </motion.div>
  );
}

// ─── Format member since ──────────────────────────────────────────

function memberSince(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

// ─── Main ProfileView ─────────────────────────────────────────────

export function ProfileView({ data }: { data: ProfileData }) {
  const [introComplete, setIntroComplete] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    setIntroComplete(localStorage.getItem('terri_intro_complete') === '1');
  }, []);

  const { name, email, createdAt, bottles, completedSections, uniqueCountries } = data;

  const displayName = name || email.split('@')[0];
  const bottleCount = bottles.length;

  // Avg rating
  const ratedBottles = bottles.filter((b) => b.rating != null);
  const avgRating = ratedBottles.length > 0
    ? (ratedBottles.reduce((s, b) => s + (b.rating ?? 0), 0) / ratedBottles.length)
    : null;

  // Favorite section (most bottles)
  const countBySec = bottles.reduce<Record<number, number>>((acc, b) => {
    if (b.sectionId != null) {
      acc[b.sectionId] = (acc[b.sectionId] ?? 0) + 1;
    }
    return acc;
  }, {});
  const favSectionId = Object.entries(countBySec).sort(([, a], [, b]) => b - a)[0]?.[0];
  const favSection = SECTIONS.find((s) => s.id === Number(favSectionId));

  return (
    <div style={{ background: 'var(--color-bg-base)', minHeight: '100dvh' }}>
      {/* ── Dark hero ─────────────────────────────────────────── */}
      <div
        className="relative flex flex-col items-center text-center px-6 pt-16 pb-8"
        style={{
          background: 'linear-gradient(175deg, #2C1A10 0%, #1C0D08 100%)',
        }}
      >
        <InitialsAvatar name={name} email={email} />

        <motion.h1
          initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="fraunces-display font-black text-white text-[26px] leading-tight mb-1"
        >
          {displayName}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-[13px] mb-1"
          style={{ color: 'rgba(255,255,255,0.40)' }}
        >
          {email}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="text-[12px]"
          style={{ color: 'rgba(196,144,64,0.6)' }}
        >
          Wine student since {memberSince(createdAt)}
        </motion.p>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="px-4 pb-8">

        {/* Progress rings */}
        <div
          className="-mt-6 mb-6 py-5 px-4 rounded-2xl relative z-10"
          style={{
            background: 'var(--color-bg-surface)',
            boxShadow: '0 4px 24px rgba(44,26,16,0.12)',
          }}
        >
          <p
            className="text-[11px] font-bold tracking-widest uppercase mb-4 text-center"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Progress
          </p>
          <div className="flex justify-around">
            <ProgressRing
              value={bottleCount}
              max={18}
              size={88}
              color="var(--color-primary)"
              label="Bottles"
            />
            <ProgressRing
              value={completedSections.length}
              max={6}
              size={88}
              color="var(--color-honey-dark)"
              label="Sections"
            />
            <ProgressRing
              value={uniqueCountries.length}
              max={13}
              size={88}
              color="#5C8C6C"
              label="Countries"
            />
          </div>
        </div>

        {/* Highlights */}
        {(avgRating != null || favSection) && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {avgRating != null && (
              <div
                className="flex flex-col items-center py-4 rounded-xl"
                style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
              >
                <span style={{ fontSize: 26 }}>⭐</span>
                <span
                  className="text-[22px] font-black mt-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {avgRating.toFixed(1)}
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Avg Rating
                </span>
              </div>
            )}
            {favSection && (
              <div
                className="flex flex-col items-center py-4 rounded-xl"
                style={{
                  background: `${favSection.color}15`,
                  border: `1px solid ${favSection.color}30`,
                }}
              >
                <span style={{ fontSize: 26 }}>🍷</span>
                <span
                  className="text-[13px] font-bold mt-1 text-center leading-tight"
                  style={{ color: favSection.colorDark }}
                >
                  {favSection.shortName}
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Favourite style
                </span>
              </div>
            )}
          </div>
        )}

        {/* Curriculum progress grid */}
        <div
          className="mb-6 p-4 rounded-2xl"
          style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
        >
          <p
            className="text-[11px] font-bold tracking-widest uppercase mb-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Curriculum
          </p>
          <SectionGrid
            completedSections={completedSections}
            introComplete={introComplete}
          />

          {/* Unlock bar */}
          <div className="mt-4">
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Foundational Track
              </span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: 'var(--color-primary)' }}
              >
                {completedSections.length}/6 sections
              </span>
            </div>
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: 6, background: 'var(--color-border-subtle)' }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedSections.length / 6) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, var(--color-primary-light), var(--color-primary))',
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div
          className="mb-6 rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--color-border-subtle)' }}
        >
          {[
            { label: 'Curriculum', href: '/learn', emoji: '📚' },
            { label: 'Wine Journal', href: '/journal', emoji: '📔' },
            { label: 'Wine World Map', href: '/map', emoji: '🗺️' },
            { label: 'Introduction Module', href: '/learn/intro', emoji: '📖' },
          ].map((item, i, arr) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 transition-colors"
              style={{
                background: 'var(--color-bg-surface)',
                borderBottom: i < arr.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
              }}
            >
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
              <span
                className="flex-1 text-[15px] font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {item.label}
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>›</span>
            </Link>
          ))}
        </div>

        {/* ── Settings ─────────────────────────────────────── */}
        <div
          className="mb-4 rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--color-border-subtle)' }}
        >
          <div
            className="px-4 py-2"
            style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border-subtle)' }}
          >
            <p
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Settings
            </p>
          </div>

          {/* Sign out */}
          <SignOutButton />

          {/* Reset Journey */}
          <div style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
            <button
              onClick={() => setResetOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left transition-colors active:opacity-70"
              style={{ background: 'var(--color-bg-surface)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[18px] shrink-0"
                style={{ background: 'rgba(220,53,53,0.08)' }}
              >
                🔄
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold" style={{ color: '#DC3535' }}>
                  Reset Journey
                </p>
                <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                  Erase all progress and start from the beginning
                </p>
              </div>
              <span style={{ color: 'rgba(220,53,53,0.40)', fontSize: 18 }}>›</span>
            </button>
          </div>
        </div>

        {/* Version tag */}
        <p
          className="text-center text-[11px] mt-3 mb-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Terri · Foundational Track v1.0
        </p>

      </div>

      {/* Reset Journey confirmation sheet */}
      <ResetJourneySheet open={resetOpen} onClose={() => setResetOpen(false)} />
    </div>
  );
}
