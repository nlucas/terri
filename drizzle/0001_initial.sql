-- ═══════════════════════════════════════════════════════════════
-- Vinora — Initial Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- ── Profiles ──────────────────────────────────────────────────────
-- Mirrors auth.users, auto-created on sign-up via trigger below.

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── Logged Bottles ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.logged_bottles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  section_id    INTEGER NOT NULL CHECK (section_id BETWEEN 1 AND 6),
  slot_index    INTEGER NOT NULL CHECK (slot_index BETWEEN 0 AND 2),

  -- Wine identity
  wine_name     TEXT NOT NULL,
  producer      TEXT,
  vintage       INTEGER CHECK (vintage BETWEEN 1900 AND 2099),
  region        TEXT,
  country       TEXT,
  grape_variety TEXT,

  -- Tasting attributes (1–5)
  sweetness     INTEGER CHECK (sweetness BETWEEN 1 AND 5),
  acidity       INTEGER CHECK (acidity BETWEEN 1 AND 5),
  tannin        INTEGER CHECK (tannin BETWEEN 1 AND 5),
  body          INTEGER CHECK (body BETWEEN 1 AND 5),

  -- Rating & notes
  rating        INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes         TEXT,

  logged_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- One bottle per slot per user
  CONSTRAINT unique_user_section_slot UNIQUE (user_id, section_id, slot_index)
);

-- ── Row Level Security ────────────────────────────────────────────
-- Users can only see and modify their own data.

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logged_bottles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies so this script is safe to re-run
DROP POLICY IF EXISTS "Users can view own profile"    ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"  ON public.profiles;
DROP POLICY IF EXISTS "Users can view own bottles"    ON public.logged_bottles;
DROP POLICY IF EXISTS "Users can insert own bottles"  ON public.logged_bottles;
DROP POLICY IF EXISTS "Users can update own bottles"  ON public.logged_bottles;
DROP POLICY IF EXISTS "Users can delete own bottles"  ON public.logged_bottles;

-- Profiles: users manage their own row
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Logged bottles: users manage their own bottles
CREATE POLICY "Users can view own bottles"
  ON public.logged_bottles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bottles"
  ON public.logged_bottles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bottles"
  ON public.logged_bottles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bottles"
  ON public.logged_bottles FOR DELETE
  USING (auth.uid() = user_id);

-- ── Auto-create profile on sign-up ────────────────────────────────
-- Trigger fires after a new user signs up via Supabase Auth.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
