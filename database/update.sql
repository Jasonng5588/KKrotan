-- update.sql: Run this in Supabase SQL Editor
-- Safe to re-run: uses DO blocks and IF NOT EXISTS where supported

-- ===================================
-- Wishlists Table
-- ===================================
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, product_id)
);

-- ===================================
-- Quotes Table
-- ===================================
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'responded', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- Add is_active column to categories if missing
-- ===================================
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ===================================
-- Enable RLS
-- ===================================
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- ===================================
-- Policies (drop first so it's safe to re-run)
-- ===================================

-- Wishlist policies
DROP POLICY IF EXISTS "Users can manage their own wishlists" ON public.wishlists;
CREATE POLICY "Users can manage their own wishlists" ON public.wishlists
  FOR ALL USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Admins have full access to wishlists" ON public.wishlists;
CREATE POLICY "Admins have full access to wishlists" ON public.wishlists
  FOR ALL USING (is_admin());

-- Quote policies
DROP POLICY IF EXISTS "Users can manage their own quotes" ON public.quotes;
CREATE POLICY "Users can manage their own quotes" ON public.quotes
  FOR ALL USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Admins have full access to quotes" ON public.quotes;
CREATE POLICY "Admins have full access to quotes" ON public.quotes
  FOR ALL USING (is_admin());

-- Order INSERT policy (so customers can place orders at checkout)
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Order items INSERT policy
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
CREATE POLICY "Users can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id AND profile_id = auth.uid()
    )
  );
