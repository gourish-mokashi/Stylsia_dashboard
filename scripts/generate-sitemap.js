#!/usr/bin/env node

/**
 * Build-time sitemap generator script
 * Run this script during your build process to generate an updated sitemap
 * Usage: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '../.env') });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch categories from the database
const fetchCategories = async () => {
  try {
    console.log('🔄 Fetching categories from database...');
    
    const { data: categories, error } = await supabase
      .from('products')
      .select('category')
      .eq('status', 'active')
      .not('category', 'is', null);

    if (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }

    // Get unique categories
    const uniqueCategories = [...new Set(categories?.map(item => item.category).filter(Boolean))];
    console.log(`✅ Found ${uniqueCategories.length} unique categories`);
    
    return uniqueCategories;
  } catch (error) {
    console.error('❌ Failed to fetch categories:', error);
    return [];
  }
};

// Fetch products from the real database
const fetchProducts = async () => {
  try {
    console.log('🔄 Fetching products from database...');
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, updated_at, is_featured, category')
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }

    console.log(`✅ Found ${products?.length || 0} active products`);
    
    // Log category distribution
    const categoryStats = products.reduce((acc, product) => {
      const category = product.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Product distribution by category:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
    return products || [];
  } catch (error) {
    console.error('❌ Failed to fetch products:', error);
    // Return empty array if database connection fails
    console.warn('⚠️  Using empty product list due to database error');
    return [];
  }
};

const generateSitemap = async () => {
  try {
    console.log('Generating sitemap...');
    
    const [products, categories] = await Promise.all([
      fetchProducts(),
      fetchCategories()
    ]);
    
    const baseUrl = 'https://stylsia.com'; // Replace with your actual domain
    
    const staticUrls = [
      {
        loc: `${baseUrl}/`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        loc: `${baseUrl}/products`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.8'
      },
      {
        loc: `${baseUrl}/documentation`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.6'
      }
    ];

    // Add category pages
    const categoryUrls = categories.map(category => ({
      loc: `${baseUrl}/products?category=${encodeURIComponent(category)}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '0.7'
    }));

    const productUrls = products.map(product => ({
      loc: `${baseUrl}/product/${product.id}`,
      lastmod: product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: product.is_featured ? '0.8' : '0.7' // Higher priority for featured products
    }));

    const allUrls = [...staticUrls, ...categoryUrls, ...productUrls];

    const xmlContent = allUrls
      .map(url => {
        return `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
      })
      .join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlContent}
</urlset>`;

    // Write to public folder
    const publicDir = path.join(__dirname, '../public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    
    fs.writeFileSync(sitemapPath, sitemap);
    
    console.log(`✅ Sitemap generated successfully with ${allUrls.length} URLs`);
    console.log(`   📄 Static pages: ${staticUrls.length}`);
    console.log(`   📂 Category pages: ${categoryUrls.length}`);
    console.log(`   🛍️  Product pages: ${productUrls.length}`);
    console.log(`📄 Sitemap saved to: ${sitemapPath}`);
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
};

// Run the script
generateSitemap();
