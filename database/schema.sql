-- C:\KKRotan\database\schema.sql

-- Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Roles: 'customer', 'admin'
-- Supabase auth.users already exists, we will link to a public.users table or public.profiles.
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  specifications JSONB, -- storing width, height, materials
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wholesale Price Tiers
CREATE TABLE public.wholesale_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Images
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Addresses
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_billing BOOLEAN DEFAULT TRUE,
  is_shipping BOOLEAN DEFAULT TRUE,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'Malaysia',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carts
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart Items
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  shipping_address_id UUID REFERENCES public.addresses(id),
  billing_address_id UUID REFERENCES public.addresses(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, -- snapshot
  product_price DECIMAL(10, 2) NOT NULL, -- snapshot
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  provider TEXT NOT NULL, -- e.g. stripe, manual_transfer
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  provider_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public read access policies for products and categories
CREATE POLICY "Public profiles are visible to everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Categories are visible to everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Products are visible to everyone" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Wholesale tiers are visible to everyone" ON public.wholesale_tiers FOR SELECT USING (true);
CREATE POLICY "Product images are visible to everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Reviews are visible to everyone" ON public.reviews FOR SELECT USING (true);

-- User specific access
CREATE POLICY "Users can view own profiles" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage their own addresses" ON public.addresses FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users can manage their own carts" ON public.carts FOR ALL USING (auth.uid() = profile_id);
-- Join on cart items to check access (assuming auth.uid is on carts)
CREATE POLICY "Users can view their own cart items" ON public.cart_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND profile_id = auth.uid())
);
CREATE POLICY "Users can insert their own cart items" ON public.cart_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND profile_id = auth.uid())
);
CREATE POLICY "Users can update their own cart items" ON public.cart_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND profile_id = auth.uid())
);
CREATE POLICY "Users can delete their own cart items" ON public.cart_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND profile_id = auth.uid())
);

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND profile_id = auth.uid())
);
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND profile_id = auth.uid())
);

CREATE POLICY "Users can insert their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = profile_id);

-- Admin policies
-- Need a secure way to check for admin. Typically via JWT claims, but we will use the profiles table.
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  DECLARE
    _role TEXT;
  BEGIN
    SELECT role INTO _role FROM public.profiles WHERE id = auth.uid();
    RETURN _role = 'admin';
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Overwrite admin access
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to categories" ON public.categories FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to products" ON public.products FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to wholesale tiers" ON public.wholesale_tiers FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to product images" ON public.product_images FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to addresses" ON public.addresses FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to carts" ON public.carts FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to cart items" ON public.cart_items FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to orders" ON public.orders FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to order items" ON public.order_items FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to payments" ON public.payments FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to reviews" ON public.reviews FOR ALL USING (is_admin());

-- Create bucket for product images if applicable
-- insert into storage.buckets (id, name, public) values ('products', 'products', true);
-- create policy "Avatar images are publicly accessible." on storage.objects for select using ( bucket_id = 'products' );
-- create policy "Anyone can upload an avatar." on storage.objects for insert with check ( bucket_id = 'products' );

