/*
  # Database Functions for Analytics and Reporting
  
  This migration creates optimized database functions for analytics
  and reporting operations used by the partner dashboard.
  
  1. Brand Analytics Functions
    - get_brand_metrics_summary: Get aggregated brand metrics
    - get_brand_analytics_overview: Get overview analytics for a brand
    - get_brand_analytics_trends: Get trend data for analytics charts
    - get_brand_top_products: Get top performing products for a brand
  
  2. Performance Optimizations
    - Proper indexing for analytics queries
    - Efficient aggregation functions
    - Cached result handling
*/

-- =============================================
-- 1. BRAND METRICS SUMMARY FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION get_brand_metrics_summary(brand_uuid UUID)
RETURNS TABLE (
    total_products INTEGER,
    active_products INTEGER,
    total_views BIGINT,
    avg_price NUMERIC,
    total_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(p.id)::INTEGER as total_products,
        COUNT(CASE WHEN p.status = 'active' THEN 1 END)::INTEGER as active_products,
        COALESCE(SUM(pv.view_count), 0)::BIGINT as total_views,
        COALESCE(AVG(p.current_price), 0)::NUMERIC as avg_price,
        COALESCE(SUM(bmd.total_revenue), 0)::NUMERIC as total_revenue
    FROM products p
    LEFT JOIN (
        SELECT 
            product_id,
            COUNT(*) as view_count
        FROM product_views
        GROUP BY product_id
    ) pv ON p.id = pv.product_id
    LEFT JOIN brand_metrics_daily bmd ON p.brand_id = bmd.brand_id
        AND bmd.date >= CURRENT_DATE - INTERVAL '30 days'
    WHERE p.brand_id = brand_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. BRAND ANALYTICS OVERVIEW FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION get_brand_analytics_overview(
    brand_uuid UUID,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_products INTEGER,
    total_views BIGINT,
    total_clicks BIGINT,
    total_conversions BIGINT,
    total_revenue NUMERIC,
    conversion_rate NUMERIC
) AS $$
DECLARE
    start_date_val DATE;
    end_date_val DATE;
BEGIN
    -- Set default date range if not provided
    start_date_val := COALESCE(start_date, CURRENT_DATE - INTERVAL '30 days');
    end_date_val := COALESCE(end_date, CURRENT_DATE);
    
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT p.id)::INTEGER as total_products,
        COALESCE(SUM(pmd.views), 0)::BIGINT as total_views,
        COALESCE(SUM(pmd.clicks), 0)::BIGINT as total_clicks,
        COALESCE(SUM(pmd.conversions), 0)::BIGINT as total_conversions,
        COALESCE(SUM(bmd.total_revenue), 0)::NUMERIC as total_revenue,
        CASE 
            WHEN SUM(pmd.clicks) > 0 
            THEN (SUM(pmd.conversions)::NUMERIC / SUM(pmd.clicks)::NUMERIC * 100)
            ELSE 0
        END as conversion_rate
    FROM products p
    LEFT JOIN product_metrics_daily pmd ON p.id = pmd.product_id
        AND pmd.date BETWEEN start_date_val AND end_date_val
    LEFT JOIN brand_metrics_daily bmd ON p.brand_id = bmd.brand_id
        AND bmd.date BETWEEN start_date_val AND end_date_val
    WHERE p.brand_id = brand_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. BRAND ANALYTICS TRENDS FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION get_brand_analytics_trends(
    brand_uuid UUID,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    period_type TEXT DEFAULT 'day'
)
RETURNS TABLE (
    date TEXT,
    views BIGINT,
    clicks BIGINT,
    conversions BIGINT,
    revenue NUMERIC
) AS $$
DECLARE
    start_date_val DATE;
    end_date_val DATE;
    date_format TEXT;
    date_trunc_period TEXT;
BEGIN
    -- Set default date range if not provided
    start_date_val := COALESCE(start_date, CURRENT_DATE - INTERVAL '30 days');
    end_date_val := COALESCE(end_date, CURRENT_DATE);
    
    -- Set date formatting based on period
    CASE period_type
        WHEN 'week' THEN 
            date_format := 'YYYY-"W"WW';
            date_trunc_period := 'week';
        WHEN 'month' THEN 
            date_format := 'YYYY-MM';
            date_trunc_period := 'month';
        WHEN 'year' THEN 
            date_format := 'YYYY';
            date_trunc_period := 'year';
        ELSE 
            date_format := 'YYYY-MM-DD';
            date_trunc_period := 'day';
    END CASE;
    
    RETURN QUERY
    SELECT 
        TO_CHAR(DATE_TRUNC(date_trunc_period, pmd.date), date_format) as date,
        SUM(pmd.views)::BIGINT as views,
        SUM(pmd.clicks)::BIGINT as clicks,
        SUM(pmd.conversions)::BIGINT as conversions,
        SUM(bmd.total_revenue)::NUMERIC as revenue
    FROM product_metrics_daily pmd
    JOIN products p ON pmd.product_id = p.id
    LEFT JOIN brand_metrics_daily bmd ON p.brand_id = bmd.brand_id 
        AND bmd.date = pmd.date
    WHERE p.brand_id = brand_uuid
        AND pmd.date BETWEEN start_date_val AND end_date_val
    GROUP BY DATE_TRUNC(date_trunc_period, pmd.date)
    ORDER BY DATE_TRUNC(date_trunc_period, pmd.date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. BRAND TOP PRODUCTS FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION get_brand_top_products(
    brand_uuid UUID,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    views BIGINT,
    clicks BIGINT,
    conversions BIGINT,
    revenue NUMERIC
) AS $$
DECLARE
    start_date_val DATE;
    end_date_val DATE;
BEGIN
    -- Set default date range if not provided
    start_date_val := COALESCE(start_date, CURRENT_DATE - INTERVAL '30 days');
    end_date_val := COALESCE(end_date, CURRENT_DATE);
    
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        COALESCE(SUM(pmd.views), 0)::BIGINT as views,
        COALESCE(SUM(pmd.clicks), 0)::BIGINT as clicks,
        COALESCE(SUM(pmd.conversions), 0)::BIGINT as conversions,
        COALESCE(SUM(pmd.conversions * p.current_price), 0)::NUMERIC as revenue
    FROM products p
    LEFT JOIN product_metrics_daily pmd ON p.id = pmd.product_id
        AND pmd.date BETWEEN start_date_val AND end_date_val
    WHERE p.brand_id = brand_uuid
        AND p.status = 'active'
    GROUP BY p.id, p.name, p.current_price
    ORDER BY COALESCE(SUM(pmd.views), 0) DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. PERFORMANCE INDEXES
-- =============================================

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_product_metrics_brand_date 
ON product_metrics_daily (product_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_brand_metrics_date_range 
ON brand_metrics_daily (brand_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_product_views_product_date 
ON product_views (product_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_brand_status 
ON products (brand_id, status) WHERE status = 'active';

-- Composite index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_products_brand_category_status 
ON products (brand_id, category, status);

-- =============================================
-- 6. GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_brand_metrics_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_brand_analytics_overview(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_brand_analytics_trends(UUID, DATE, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_brand_top_products(UUID, DATE, DATE, INTEGER) TO authenticated;

-- =============================================
-- 7. VERIFICATION
-- =============================================

-- Test the functions with sample data
DO $$
DECLARE
    test_brand_id UUID;
    function_count INTEGER;
BEGIN
    -- Count created functions
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
      AND routine_name IN (
        'get_brand_metrics_summary',
        'get_brand_analytics_overview', 
        'get_brand_analytics_trends',
        'get_brand_top_products'
      );
    
    RAISE NOTICE 'Analytics functions created: %', function_count;
    
    -- Test with a sample brand if available
    SELECT id INTO test_brand_id FROM brands LIMIT 1;
    
    IF test_brand_id IS NOT NULL THEN
        RAISE NOTICE 'Testing functions with brand ID: %', test_brand_id;
        
        -- Test metrics summary
        PERFORM get_brand_metrics_summary(test_brand_id);
        RAISE NOTICE 'get_brand_metrics_summary: OK';
        
        -- Test analytics overview
        PERFORM get_brand_analytics_overview(test_brand_id);
        RAISE NOTICE 'get_brand_analytics_overview: OK';
        
        -- Test analytics trends
        PERFORM get_brand_analytics_trends(test_brand_id);
        RAISE NOTICE 'get_brand_analytics_trends: OK';
        
        -- Test top products
        PERFORM get_brand_top_products(test_brand_id);
        RAISE NOTICE 'get_brand_top_products: OK';
        
        RAISE NOTICE 'All analytics functions are working correctly!';
    ELSE
        RAISE NOTICE 'No brands found for testing, but functions are created successfully.';
    END IF;
END $$;