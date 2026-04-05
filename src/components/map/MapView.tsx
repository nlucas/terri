'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SECTIONS } from '@/lib/sections';
import type { LoggedBottle } from '@/types';

// ─── Wine World Atlas data ─────────────────────────────────────────

interface WineCountry {
  name: string;
  flag: string;
  regions: string[];
  grapeHighlights: string[];
  infoLine: string;
}

interface WineContinent {
  continent: string;
  emoji: string;
  description: string;
  countries: WineCountry[];
}

const WINE_WORLD: WineContinent[] = [
  {
    continent: 'Europe',
    emoji: '🏰',
    description: 'Where modern wine was born. Old World wines are named by region, not grape.',
    countries: [
      {
        name: 'France',
        flag: '🇫🇷',
        regions: ['Bordeaux', 'Burgundy', 'Champagne', 'Rhône', 'Alsace', 'Loire'],
        grapeHighlights: ['Cabernet Sauvignon', 'Pinot Noir', 'Chardonnay', 'Sauvignon Blanc'],
        infoLine: 'The benchmark. Every major style has a French archetype.',
      },
      {
        name: 'Italy',
        flag: '🇮🇹',
        regions: ['Tuscany', 'Piedmont', 'Veneto', 'Sicily', 'Abruzzo'],
        grapeHighlights: ['Sangiovese', 'Nebbiolo', 'Pinot Grigio', 'Barbera'],
        infoLine: 'More indigenous grape varieties than any country on earth.',
      },
      {
        name: 'Spain',
        flag: '🇪🇸',
        regions: ['Rioja', 'Ribera del Duero', 'Priorat', 'Rías Baixas', 'Albariño'],
        grapeHighlights: ['Tempranillo', 'Grenache', 'Albariño', 'Garnacha'],
        infoLine: 'Deep reds, crisp whites, and unbeatable value.',
      },
      {
        name: 'Portugal',
        flag: '🇵🇹',
        regions: ['Douro', 'Alentejo', 'Minho', 'Dão'],
        grapeHighlights: ['Touriga Nacional', 'Vinho Verde', 'Aragonez'],
        infoLine: 'Underrated. Extraordinary value and unique native grapes.',
      },
      {
        name: 'Germany',
        flag: '🇩🇪',
        regions: ['Mosel', 'Rheingau', 'Pfalz', 'Baden'],
        grapeHighlights: ['Riesling', 'Spätburgunder', 'Müller-Thurgau'],
        infoLine: 'World-class Riesling from slate soils above the Rhine.',
      },
      {
        name: 'Austria',
        flag: '🇦🇹',
        regions: ['Wachau', 'Kremstal', 'Burgenland'],
        grapeHighlights: ['Grüner Veltliner', 'Blaufränkisch', 'Riesling'],
        infoLine: 'Grüner Veltliner is Austria\'s calling card — peppery, racy, food-friendly.',
      },
      {
        name: 'Greece',
        flag: '🇬🇷',
        regions: ['Nemea', 'Santorini', 'Naoussa', 'Crete'],
        grapeHighlights: ['Assyrtiko', 'Agiorgitiko', 'Xinomavro'],
        infoLine: '6,000 years of winemaking. Santorini\'s Assyrtiko is electric.',
      },
    ],
  },
  {
    continent: 'Americas',
    emoji: '🗽',
    description: 'New World wines label by grape, not region — a gift to beginners.',
    countries: [
      {
        name: 'United States',
        flag: '🇺🇸',
        regions: ['Napa Valley', 'Sonoma', 'Willamette Valley', 'Columbia Valley'],
        grapeHighlights: ['Cabernet Sauvignon', 'Chardonnay', 'Pinot Noir', 'Zinfandel'],
        infoLine: 'Napa made Cabernet famous. Oregon made Pinot Noir an obsession.',
      },
      {
        name: 'Argentina',
        flag: '🇦🇷',
        regions: ['Mendoza', 'Luján de Cuyo', 'Salta', 'Patagonia'],
        grapeHighlights: ['Malbec', 'Torrontés', 'Cabernet Franc'],
        infoLine: 'High-altitude vineyards produce bold, fruit-forward Malbec.',
      },
      {
        name: 'Chile',
        flag: '🇨🇱',
        regions: ['Maipo Valley', 'Casablanca', 'Colchagua', 'Elqui'],
        grapeHighlights: ['Carmenère', 'Sauvignon Blanc', 'Cabernet Sauvignon'],
        infoLine: 'Home of Carmenère — a grape thought extinct until the 1990s.',
      },
    ],
  },
  {
    continent: 'Oceania & Africa',
    emoji: '🦘',
    description: 'Young wine cultures punching well above their weight.',
    countries: [
      {
        name: 'Australia',
        flag: '🇦🇺',
        regions: ['Barossa Valley', 'McLaren Vale', 'Yarra Valley', 'Margaret River', 'Hunter Valley'],
        grapeHighlights: ['Shiraz', 'Chardonnay', 'Cabernet Sauvignon', 'Grenache'],
        infoLine: 'Barossa Shiraz is bold and spicy. Clare Valley Riesling is a world-beater.',
      },
      {
        name: 'New Zealand',
        flag: '🇳🇿',
        regions: ['Marlborough', 'Central Otago', 'Hawke\'s Bay', 'Martinborough'],
        grapeHighlights: ['Sauvignon Blanc', 'Pinot Noir', 'Riesling'],
        infoLine: 'Marlborough Sauvignon Blanc redefined the style for the whole world.',
      },
      {
        name: 'South Africa',
        flag: '🇿🇦',
        regions: ['Stellenbosch', 'Swartland', 'Hemel-en-Aarde', 'Constantia'],
        grapeHighlights: ['Pinotage', 'Chenin Blanc', 'Syrah', 'Cabernet Sauvignon'],
        infoLine: 'Chenin Blanc thrives here in ways it rarely does in the Loire.',
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────

function normalizeCountry(raw: string): string {
  // Normalize common variations
  const map: Record<string, string> = {
    'usa': 'United States',
    'us': 'United States',
    'u.s.': 'United States',
    'u.s.a.': 'United States',
    'america': 'United States',
    'united states of america': 'United States',
    'new zealand': 'New Zealand',
    'nz': 'New Zealand',
    'south africa': 'South Africa',
    'aus': 'Australia',
    'arg': 'Argentina',
    'uk': 'United Kingdom',
  };
  const lower = raw.toLowerCase().trim();
  return map[lower] ?? (raw.charAt(0).toUpperCase() + raw.slice(1));
}

// ─── Globe decoration ────────────────────────────────────────────

function GlobeArc({ discovered }: { discovered: number }) {
  // A simple decorative SVG globe with animated "ping" dots for discovered countries
  return (
    <div className="flex justify-center mb-6">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Outer circle */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-border-subtle)" strokeWidth="1.5" />
          {/* Latitude lines */}
          {[30, 50, 70].map((y) => (
            <ellipse key={y} cx="50" cy={y} rx="44" ry={Math.abs(y - 50) * 0.8} fill="none" stroke="var(--color-border-subtle)" strokeWidth="0.8" />
          ))}
          {/* Longitude lines */}
          {[20, 35, 50, 65, 80].map((x) => (
            <ellipse key={x} cx="50" cy="50" rx={Math.abs(x - 50) * 0.88} ry="44" fill="none" stroke="var(--color-border-subtle)" strokeWidth="0.8" />
          ))}
          {/* Fill */}
          <circle cx="50" cy="50" r="44" fill="var(--color-primary)" opacity="0.04" />
          {/* Ping dots for each discovered country (positioned roughly) */}
          {discovered > 0 && (
            <>
              <circle cx="35" cy="38" r="3" fill="var(--color-primary)" opacity="0.7" />
              {discovered > 1 && <circle cx="55" cy="42" r="3" fill="var(--color-honey-dark)" opacity="0.7" />}
              {discovered > 2 && <circle cx="28" cy="55" r="3" fill="#5C8C6C" opacity="0.7" />}
              {discovered > 3 && <circle cx="70" cy="48" r="3" fill="#D4A850" opacity="0.7" />}
              {discovered > 4 && <circle cx="65" cy="62" r="3" fill="#C490A8" opacity="0.7" />}
            </>
          )}
        </svg>
        {discovered > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
            className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            {discovered}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Country Card ─────────────────────────────────────────────────

function CountryCard({
  country,
  userBottles,
}: {
  country: WineCountry;
  userBottles: LoggedBottle[];
}) {
  const [open, setOpen] = useState(false);
  const discovered = userBottles.length > 0;

  // Which sections did the user log wines from this country in?
  const sectionsLogged = [...new Set(userBottles.map((b) => b.sectionId))];

  return (
    <motion.div
      layout
      className="rounded-xl overflow-hidden"
      style={{
        background: discovered
          ? 'var(--color-bg-surface)'
          : 'var(--color-bg-subtle)',
        border: discovered
          ? '1.5px solid var(--color-border-default)'
          : '1px solid var(--color-border-subtle)',
        opacity: discovered ? 1 : 0.7,
      }}
    >
      {/* Card header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 p-3.5 text-left"
      >
        <span style={{ fontSize: 26, lineHeight: 1 }}>{country.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span
              className="text-[15px] font-bold"
              style={{ color: discovered ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
            >
              {country.name}
            </span>
            {discovered ? (
              <div className="flex items-center gap-1.5">
                {/* Section color dots */}
                <div className="flex gap-1">
                  {sectionsLogged.map((sid) => {
                    const sec = SECTIONS.find((s) => s.id === sid);
                    return sec ? (
                      <span
                        key={sid}
                        className="w-2 h-2 rounded-full"
                        style={{ background: sec.color }}
                      />
                    ) : null;
                  })}
                </div>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(94,186,138,0.15)', color: '#5EBA8A' }}
                >
                  {userBottles.length} {userBottles.length === 1 ? 'bottle' : 'bottles'}
                </span>
              </div>
            ) : (
              <span
                className="text-[11px] px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--color-border-subtle)',
                  color: 'var(--color-text-muted)',
                }}
              >
                Undiscovered
              </span>
            )}
          </div>
          <p
            className="text-[12px] mt-0.5 leading-snug"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {country.infoLine}
          </p>
        </div>
        <span
          className="text-[14px] shrink-0 mt-0.5"
          style={{ color: 'var(--color-text-muted)', transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          ›
        </span>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="px-3.5 pb-3.5 pt-1"
              style={{ borderTop: '1px solid var(--color-border-subtle)' }}
            >
              {/* Regions */}
              <p
                className="text-[10px] font-bold tracking-widest uppercase mb-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Key Regions
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {country.regions.map((r) => (
                  <span
                    key={r}
                    className="text-[12px] px-2 py-0.5 rounded-full"
                    style={{
                      background: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border-subtle)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {r}
                  </span>
                ))}
              </div>

              {/* Grapes */}
              <p
                className="text-[10px] font-bold tracking-widest uppercase mb-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Key Grapes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {country.grapeHighlights.map((g) => (
                  <span
                    key={g}
                    className="text-[12px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: 'var(--color-primary-muted)',
                      color: 'var(--color-primary-dark)',
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* User's bottles from this country */}
              {userBottles.length > 0 && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                  <p
                    className="text-[10px] font-bold tracking-widest uppercase mb-2"
                    style={{ color: '#5EBA8A' }}
                  >
                    Your Bottles
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {userBottles.map((b) => {
                      const sec = SECTIONS.find((s) => s.id === b.sectionId);
                      return (
                        <div key={b.id} className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: sec?.color ?? 'var(--color-primary)' }}
                          />
                          <span
                            className="text-[13px]"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {b.wineName}
                          </span>
                          {b.vintage && (
                            <span
                              className="text-[11px] ml-auto shrink-0"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              {b.vintage}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Continent Section ────────────────────────────────────────────

function ContinentSection({
  continent,
  userBottles,
}: {
  continent: WineContinent;
  userBottles: LoggedBottle[];
}) {
  const discoveredInContinent = continent.countries.filter((c) =>
    userBottles.some(
      (b) => normalizeCountry(b.country ?? '') === c.name
    )
  ).length;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5 mb-3">
        <span style={{ fontSize: 24 }}>{continent.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2
              className="fraunces-card font-bold text-[17px]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {continent.continent}
            </h2>
            {discoveredInContinent > 0 && (
              <span
                className="text-[11px] font-semibold"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {discoveredInContinent}/{continent.countries.length} countries
              </span>
            )}
          </div>
          <p
            className="text-[12px] leading-snug"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {continent.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {continent.countries.map((country) => {
          const bottles = userBottles.filter(
            (b) => normalizeCountry(b.country ?? '') === country.name
          );
          return (
            <CountryCard key={country.name} country={country} userBottles={bottles} />
          );
        })}
      </div>
    </div>
  );
}

// ─── Main MapView ─────────────────────────────────────────────────

export function MapView({
  bottles,
  uniqueCountries,
}: {
  bottles: LoggedBottle[];
  uniqueCountries: string[];
}) {
  // Count total wine world countries
  const totalCountries = WINE_WORLD.reduce(
    (sum, c) => sum + c.countries.length,
    0
  );
  const discovered = uniqueCountries.length;

  return (
    <div className="px-4 pt-12 pb-4">
      {/* Header */}
      <div className="mb-6">
        <p
          className="text-[11px] font-semibold tracking-widest uppercase mb-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Wine Geography
        </p>
        <h1
          className="fraunces-display font-bold leading-tight"
          style={{ fontSize: 34, color: 'var(--color-text-primary)' }}
        >
          Wine World.
        </h1>
        <p
          className="text-[14px] mt-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {discovered === 0
            ? `${totalCountries} wine countries to explore. Start logging bottles.`
            : `You've explored ${discovered} of ${totalCountries} wine countries so far.`}
        </p>
      </div>

      {/* Globe */}
      <GlobeArc discovered={discovered} />

      {/* Discovery counter */}
      <div className="grid grid-cols-3 gap-2 mb-7">
        {[
          { label: 'Countries', value: `${discovered}/${totalCountries}`, emoji: '🌍' },
          { label: 'Bottles', value: `${bottles.length}/18`, emoji: '🍷' },
          { label: 'Regions', value: `${[...new Set(bottles.map(b => b.region).filter(Boolean))].length}`, emoji: '📍' },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center py-3 rounded-xl"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)' }}
          >
            <span style={{ fontSize: 20 }}>{s.emoji}</span>
            <span className="text-[14px] font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>{s.value}</span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Discovered countries callout */}
      {discovered > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl flex flex-wrap gap-2"
          style={{ background: 'var(--color-primary-muted)', border: '1px solid rgba(124,58,82,0.15)' }}
        >
          <p
            className="w-full text-[11px] font-bold tracking-widest uppercase mb-1"
            style={{ color: 'var(--color-primary)' }}
          >
            Countries You&apos;ve Explored
          </p>
          {uniqueCountries.map((c) => (
            <span
              key={c}
              className="text-[13px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'var(--color-primary)', color: '#fff' }}
            >
              {c}
            </span>
          ))}
        </motion.div>
      )}

      {/* Continental breakdown */}
      {WINE_WORLD.map((continent) => (
        <ContinentSection
          key={continent.continent}
          continent={continent}
          userBottles={bottles}
        />
      ))}
    </div>
  );
}
