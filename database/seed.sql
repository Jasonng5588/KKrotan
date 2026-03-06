-- seed.sql: Clean seed data for KK Rotan
-- Run this AFTER schema.sql and update.sql in Supabase SQL Editor

-- ===================================
-- Clean existing data first (safe order)
-- ===================================
DELETE FROM public.wholesale_tiers;
DELETE FROM public.product_images;
DELETE FROM public.cart_items;
DELETE FROM public.products;
DELETE FROM public.categories;

-- ===================================
-- CATEGORIES
-- ===================================
INSERT INTO public.categories (id, name, slug, description, is_active) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Raw Rattan', 'raw-rattan', 'High quality raw rattan poles and canes for crafting and manufacturing.', true),
  ('c1000000-0000-0000-0000-000000000002', 'Semi Processed', 'semi-processed', 'Cleaned, graded and treated rattan materials ready for production use.', true),
  ('c1000000-0000-0000-0000-000000000003', 'Rattan Furniture', 'rattan-furniture', 'Premium handcrafted rattan chairs, sofas, tables and wardrobes.', true),
  ('c1000000-0000-0000-0000-000000000004', 'Baskets & Decor', 'baskets-decor', 'Beautifully woven rattan baskets, storage bins, and decorative items.', true);

-- ===================================
-- PRODUCTS
-- ===================================
INSERT INTO public.products (id, category_id, name, slug, description, price, stock, is_active) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
   'Manau Rattan Pole (3m)', 'manau-rattan-pole',
   'Premium grade Manau rattan pole, 3 meters in length, 20-30mm diameter. One of the strongest rattan species, ideal for furniture frames and structural components.',
   45.00, 200, true),

  ('a0000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001',
   'Mantang Rattan Bundle', 'mantang-rattan-bundle',
   'Bundle of 50 thin Mantang rattan canes, approximately 3m long. Perfect for weaving, basket making, and decorative coiling work. Natural cream-brown color.',
   38.00, 150, true),

  ('a0000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003',
   'Classic Rattan Lounge Chair', 'classic-rattan-lounge-chair',
   'Expertly handcrafted classic rattan lounge chair. Features solid Manau frame with natural cane weaving. Suitable for indoor and covered outdoor areas. Cushion sold separately.',
   350.00, 20, true),

  ('a0000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003',
   'Rattan Round Coffee Table', 'rattan-round-coffee-table',
   'Elegant round coffee table made from woven rattan with a tempered glass top. 70cm diameter. Matches perfectly with our lounge chairs and sofas.',
   220.00, 12, true),

  ('a0000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003',
   'Rattan Wardrobe Cabinet', 'rattan-wardrobe-cabinet',
   'Spacious 2-door wardrobe with natural rattan woven panels. Solid wood frame with rattan detailing. Dimensions: 180cm H x 90cm W x 50cm D. Assembly required.',
   980.00, 5, true),

  ('a0000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000003',
   'Rattan Dining Set (4 chairs + table)', 'rattan-dining-set',
   'Complete dining room set featuring a round rattan dining table (120cm) with 4 matching arm chairs. Perfect for indoor and patio dining. Weather resistant coating applied.',
   1850.00, 3, true),

  ('a0000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000004',
   'Natural Rattan Storage Baskets (Set of 3)', 'rattan-storage-baskets-set',
   'Set of 3 hand-woven natural rattan storage baskets in graduated sizes (S/M/L). Perfect for organizing toys, laundry, magazines, or using as planters.',
   125.00, 45, true),

  ('a0000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000002',
   'Sega Rattan Core (Per KG)', 'sega-rattan-core',
   'Sega rattan core strips, sold per kilogram. Available in 3mm, 4mm, and 6mm widths. Used for seat and back weaving in high-end furniture production.',
   22.00, 500, true);

-- ===================================
-- PRODUCT IMAGES
-- ===================================
INSERT INTO public.product_images (product_id, image_url, is_primary) VALUES
  ('a0000000-0000-0000-0000-000000000001', '/images/manau_rattan.png', true),
  ('a0000000-0000-0000-0000-000000000002', '/images/mantang_rattan.png', true),
  ('a0000000-0000-0000-0000-000000000003', '/images/rattan_chair.png', true),
  ('a0000000-0000-0000-0000-000000000003', '/images/rattan_dining_set.png', false),
  ('a0000000-0000-0000-0000-000000000004', '/images/rattan_table.png', true),
  ('a0000000-0000-0000-0000-000000000005', '/images/rattan_wardrobe.png', true),
  ('a0000000-0000-0000-0000-000000000006', '/images/rattan_dining_set.png', true),
  ('a0000000-0000-0000-0000-000000000006', '/images/rattan_chair.png', false),
  ('a0000000-0000-0000-0000-000000000007', '/images/rattan_basket.png', true),
  ('a0000000-0000-0000-0000-000000000008', '/images/mantang_rattan.png', true);

-- ===================================
-- WHOLESALE PRICE TIERS
-- ===================================
INSERT INTO public.wholesale_tiers (product_id, min_quantity, price) VALUES
  ('a0000000-0000-0000-0000-000000000001', 50, 40.00),
  ('a0000000-0000-0000-0000-000000000001', 100, 35.00),
  ('a0000000-0000-0000-0000-000000000002', 20, 33.00),
  ('a0000000-0000-0000-0000-000000000002', 50, 28.00),
  ('a0000000-0000-0000-0000-000000000003', 10, 300.00),
  ('a0000000-0000-0000-0000-000000000004', 10, 190.00),
  ('a0000000-0000-0000-0000-000000000007', 20, 100.00),
  ('a0000000-0000-0000-0000-000000000008', 50, 18.00),
  ('a0000000-0000-0000-0000-000000000008', 100, 15.00);
