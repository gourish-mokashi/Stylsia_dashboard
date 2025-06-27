/*
  # Product Platform Database Schema
  
  Complete PostgreSQL schema for multi-brand product platform with:
  1. Multi-brand onboarding
  2. Product listing with detailed attributes & sizes
  3. Multiple images per product
  4. Anonymous behavior tracking (views)
  5. Daily analytics roll-ups
  6. Future integration of user authentication
  
  1. Extensions
  2. Core Tables (brands, products)
  3. Product Details (attributes, images, sizes)
  4. Analytics & Tracking (views, metrics)
  5. Indexes for Performance
  6. Row Level Security
  7. Triggers for Automation
*/

-- =============================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- =============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. BRANDS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS brands (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    website       TEXT,
    logo_url      TEXT,
    description   TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for brands
CREATE INDEX IF NOT EXISTS idx_brands_status ON brands(status);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

-- =============================================
-- 3. PRODUCTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    source_url          TEXT NOT NULL UNIQUE,
    brand_id            UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    original_price      NUMERIC(10,2) NOT NULL CHECK (original_price >= 0),
    current_price       NUMERIC(10,2) NOT NULL CHECK (current_price >= 0),
    discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    category            TEXT,
    sub_category        TEXT,
    main_image_url      TEXT,
    description         TEXT,
    sku                 TEXT,
    status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'out_of_stock')),
    is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(current_price);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- =============================================
-- 4. PRODUCT_ATTRIBUTES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS product_attributes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    fabric      TEXT,
    fit         TEXT,
    collar      TEXT,
    sleeve      TEXT,
    closure     TEXT,
    pattern     TEXT,
    occasion    TEXT,
    care_instructions TEXT,
    material    TEXT,
    color       TEXT,
    style       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for product attributes
CREATE INDEX IF NOT EXISTS idx_product_attributes_pid ON product_attributes(product_id);

-- =============================================
-- 5. PRODUCT_IMAGES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS product_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url   TEXT NOT NULL,
    alt_text    TEXT,
    is_main     BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for product images
CREATE INDEX IF NOT EXISTS idx_product_images_pid ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_main ON product_images(product_id, is_main);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(product_id, display_order);

-- =============================================
-- 6. PRODUCT_SIZES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS product_sizes (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size         TEXT NOT NULL CHECK (size IN ('XS','S','M','L','XL','XXL','2XL','3XL','Free Size')),
    is_available BOOLEAN NOT NULL DEFAULT FALSE,
    stock_count  INTEGER DEFAULT 0 CHECK (stock_count >= 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for product sizes
CREATE INDEX IF NOT EXISTS idx_product_sizes_pid ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_available ON product_sizes(product_id, is_available);

-- Unique constraint to prevent duplicate sizes per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_sizes_unique ON product_sizes(product_id, size);

-- =============================================
-- 7. PRODUCT_VIEWS TABLE (Anonymous Tracking)
-- =============================================

CREATE TABLE IF NOT EXISTS product_views (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    session_id  TEXT NOT NULL,
    user_id     UUID,                       -- NULL during MVP, for future auth
    ip_address  INET,
    user_agent  TEXT,
    referrer    TEXT,
    viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for product views
CREATE INDEX IF NOT EXISTS idx_product_views_pid ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_session ON product_views(session_id);
CREATE INDEX IF NOT EXISTS idx_product_views_date ON product_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_views_user ON product_views(user_id) WHERE user_id IS NOT NULL;

-- =============================================
-- 8. PRODUCT_METRICS_DAILY TABLE (Analytics)
-- =============================================

CREATE TABLE IF NOT EXISTS product_metrics_daily (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    date           DATE NOT NULL,
    views          INTEGER NOT NULL DEFAULT 0,
    unique_views   INTEGER NOT NULL DEFAULT 0,
    clicks         INTEGER NOT NULL DEFAULT 0,
    conversions    INTEGER NOT NULL DEFAULT 0,
    saves          INTEGER NOT NULL DEFAULT 0,
    avg_price      NUMERIC(10,2),
    discount_rate  INTEGER,
    bounce_rate    NUMERIC(5,2),
    avg_time_spent INTEGER, -- in seconds
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for metrics
CREATE INDEX IF NOT EXISTS idx_metrics_date_pid ON product_metrics_daily(date, product_id);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON product_metrics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_product ON product_metrics_daily(product_id);

-- Unique constraint to prevent duplicate daily metrics
CREATE UNIQUE INDEX IF NOT EXISTS idx_metrics_unique_daily ON product_metrics_daily(product_id, date);

-- =============================================
-- 9. BRAND_METRICS_DAILY TABLE (Brand Analytics)
-- =============================================

CREATE TABLE IF NOT EXISTS brand_metrics_daily (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id       UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    date           DATE NOT NULL,
    total_views    INTEGER NOT NULL DEFAULT 0,
    total_products INTEGER NOT NULL DEFAULT 0,
    active_products INTEGER NOT NULL DEFAULT 0,
    avg_price      NUMERIC(10,2),
    total_revenue  NUMERIC(12,2) DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for brand metrics
CREATE INDEX IF NOT EXISTS idx_brand_metrics_date ON brand_metrics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_brand_metrics_brand ON brand_metrics_daily(brand_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_metrics_unique_daily ON brand_metrics_daily(brand_id, date);

-- =============================================
-- 10. TRIGGERS FOR AUTOMATION
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_brands_updated_at 
    BEFORE UPDATE ON brands 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_metrics_daily_updated_at 
    BEFORE UPDATE ON product_metrics_daily 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_metrics_daily_updated_at 
    BEFORE UPDATE ON brand_metrics_daily 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate discount percentage
CREATE OR REPLACE FUNCTION calculate_discount_percentage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.original_price > 0 AND NEW.current_price < NEW.original_price THEN
        NEW.discount_percentage = ROUND(((NEW.original_price - NEW.current_price) / NEW.original_price * 100)::NUMERIC);
    ELSE
        NEW.discount_percentage = 0;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-calculate discount percentage
CREATE TRIGGER calculate_product_discount 
    BEFORE INSERT OR UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION calculate_discount_percentage();

-- =============================================
-- 11. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on tables that will eventually be user-scoped
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_metrics_daily ENABLE ROW LEVEL SECURITY;

-- Policies for admin access (current admin system)
CREATE POLICY "Admins can access all product views" ON product_views
    FOR ALL 
    USING (
        auth.role() = 'authenticated' 
        AND (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can access all product metrics" ON product_metrics_daily
    FOR ALL 
    USING (
        auth.role() = 'authenticated' 
        AND (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can access all brand metrics" ON brand_metrics_daily
    FOR ALL 
    USING (
        auth.role() = 'authenticated' 
        AND (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    );

-- Policies for public read access (for anonymous users)
CREATE POLICY "Public can view active brands" ON brands
    FOR SELECT 
    USING (status = 'active');

CREATE POLICY "Public can view active products" ON products
    FOR SELECT 
    USING (status = 'active');

CREATE POLICY "Public can view product attributes" ON product_attributes
    FOR SELECT 
    USING (
        product_id IN (
            SELECT id FROM products WHERE status = 'active'
        )
    );

CREATE POLICY "Public can view product images" ON product_images
    FOR SELECT 
    USING (
        product_id IN (
            SELECT id FROM products WHERE status = 'active'
        )
    );

CREATE POLICY "Public can view product sizes" ON product_sizes
    FOR SELECT 
    USING (
        product_id IN (
            SELECT id FROM products WHERE status = 'active'
        )
    );

-- Policy for anonymous view tracking
CREATE POLICY "Anyone can insert product views" ON product_views
    FOR INSERT 
    WITH CHECK (true);

-- =============================================
-- 12. HELPER FUNCTIONS
-- =============================================

-- Function to get product with all details
CREATE OR REPLACE FUNCTION get_product_details(product_uuid UUID)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    brand_name TEXT,
    current_price NUMERIC,
    original_price NUMERIC,
    discount_percentage INTEGER,
    main_image_url TEXT,
    category TEXT,
    description TEXT,
    attributes JSONB,
    images JSONB,
    sizes JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        b.name,
        p.current_price,
        p.original_price,
        p.discount_percentage,
        p.main_image_url,
        p.category,
        p.description,
        to_jsonb(pa.*) - 'id' - 'product_id' - 'created_at' as attributes,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', pi.id,
                    'url', pi.image_url,
                    'alt_text', pi.alt_text,
                    'is_main', pi.is_main,
                    'display_order', pi.display_order
                ) ORDER BY pi.display_order, pi.created_at
            ) FROM product_images pi WHERE pi.product_id = p.id),
            '[]'::jsonb
        ) as images,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'size', ps.size,
                    'is_available', ps.is_available,
                    'stock_count', ps.stock_count
                ) ORDER BY 
                    CASE ps.size 
                        WHEN 'XS' THEN 1 
                        WHEN 'S' THEN 2 
                        WHEN 'M' THEN 3 
                        WHEN 'L' THEN 4 
                        WHEN 'XL' THEN 5 
                        WHEN 'XXL' THEN 6 
                        WHEN '2XL' THEN 7 
                        WHEN '3XL' THEN 8 
                        ELSE 9 
                    END
            ) FROM product_sizes ps WHERE ps.product_id = p.id),
            '[]'::jsonb
        ) as sizes
    FROM products p
    JOIN brands b ON p.brand_id = b.id
    LEFT JOIN product_attributes pa ON p.id = pa.product_id
    WHERE p.id = product_uuid AND p.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record product view
CREATE OR REPLACE FUNCTION record_product_view(
    product_uuid UUID,
    session_uuid TEXT,
    user_uuid UUID DEFAULT NULL,
    ip_addr INET DEFAULT NULL,
    user_agent_str TEXT DEFAULT NULL,
    referrer_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    view_id UUID;
BEGIN
    INSERT INTO product_views (
        product_id, 
        session_id, 
        user_id, 
        ip_address, 
        user_agent, 
        referrer
    )
    VALUES (
        product_uuid, 
        session_uuid, 
        user_uuid, 
        ip_addr, 
        user_agent_str, 
        referrer_url
    )
    RETURNING id INTO view_id;
    
    RETURN view_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 13. GRANT PERMISSIONS
-- =============================================

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON brands TO authenticated;
GRANT SELECT ON products TO authenticated;
GRANT SELECT ON product_attributes TO authenticated;
GRANT SELECT ON product_images TO authenticated;
GRANT SELECT ON product_sizes TO authenticated;
GRANT INSERT ON product_views TO authenticated;

-- Grant permissions for anonymous users (public access)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON brands TO anon;
GRANT SELECT ON products TO anon;
GRANT SELECT ON product_attributes TO anon;
GRANT SELECT ON product_images TO anon;
GRANT SELECT ON product_sizes TO anon;
GRANT INSERT ON product_views TO anon;

-- Grant full access to admin users (handled by RLS policies)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================
-- 14. VERIFICATION
-- =============================================

-- Verify tables were created
SELECT 'Tables created successfully!' as status;

SELECT 
    'Table: ' || table_name as info,
    'Columns: ' || COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN (
    'brands', 'products', 'product_attributes', 
    'product_images', 'product_sizes', 'product_views', 
    'product_metrics_daily', 'brand_metrics_daily'
  )
GROUP BY table_name
ORDER BY table_name;

-- Show indexes created
SELECT 
    'Index: ' || indexname as info,
    'Table: ' || tablename as table_name
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN (
    'brands', 'products', 'product_attributes', 
    'product_images', 'product_sizes', 'product_views', 
    'product_metrics_daily', 'brand_metrics_daily'
  )
ORDER BY tablename, indexname;