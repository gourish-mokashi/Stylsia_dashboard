#!/usr/bin/env node

/**
 * Sitemap validation script
 * Validates the generated sitemap for common issues
 * Usage: node scripts/validate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validateSitemap = async () => {
  try {
    console.log('🔍 Validating sitemap...');
    
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    
    if (!fs.existsSync(sitemapPath)) {
      console.error('❌ Sitemap file not found at:', sitemapPath);
      process.exit(1);
    }
    
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    const lines = sitemapContent.split('\n');
    
    // Basic validation
    let urlCount = 0;
    let errors = [];
    let warnings = [];
    
    // Check XML structure
    if (!sitemapContent.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
      errors.push('Missing or invalid XML declaration');
    }
    
    if (!sitemapContent.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
      errors.push('Missing or invalid sitemap namespace');
    }
    
    // Count URLs and check for common issues
    const urlRegex = /<loc>(.*?)<\/loc>/g;
    const urls = [...sitemapContent.matchAll(urlRegex)];
    urlCount = urls.length;
    
    // Check for duplicate URLs
    const urlSet = new Set();
    const duplicates = [];
    
    urls.forEach(match => {
      const url = match[1];
      if (urlSet.has(url)) {
        duplicates.push(url);
      } else {
        urlSet.add(url);
      }
    });
    
    if (duplicates.length > 0) {
      errors.push(`Found ${duplicates.length} duplicate URLs`);
      duplicates.forEach(url => console.warn(`   Duplicate: ${url}`));
    }
    
    // Check URL format
    urls.forEach(match => {
      const url = match[1];
      try {
        new URL(url);
        
        // Check for common issues
        if (url.includes('localhost')) {
          warnings.push(`Development URL found: ${url}`);
        }
        
        if (url.includes('yourdomain.com')) {
          warnings.push(`Placeholder domain found: ${url}`);
        }
        
        if (url.length > 2048) {
          warnings.push(`URL too long (${url.length} chars): ${url.substring(0, 50)}...`);
        }
        
      } catch (e) {
        errors.push(`Invalid URL format: ${url}`);
      }
    });
    
    // Check sitemap size
    const sitemapSize = Buffer.byteLength(sitemapContent, 'utf8');
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (sitemapSize > maxSize) {
      errors.push(`Sitemap too large: ${(sitemapSize / 1024 / 1024).toFixed(2)}MB (max: 50MB)`);
    }
    
    if (urlCount > 50000) {
      errors.push(`Too many URLs: ${urlCount} (max: 50,000)`);
    }
    
    // Check for required elements
    const requiredElements = ['<lastmod>', '<changefreq>', '<priority>'];
    const missingElements = requiredElements.filter(element => 
      !sitemapContent.includes(element)
    );
    
    if (missingElements.length > 0) {
      warnings.push(`Missing recommended elements: ${missingElements.join(', ')}`);
    }
    
    // Results
    console.log('\n📊 Sitemap Validation Results:');
    console.log(`   📄 Total URLs: ${urlCount}`);
    console.log(`   📦 File size: ${(sitemapSize / 1024).toFixed(2)} KB`);
    console.log(`   📁 File path: ${sitemapPath}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors found:');
      errors.forEach(error => console.log(`   • ${error}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('\n✅ Sitemap validation passed! No issues found.');
    } else if (errors.length === 0) {
      console.log('\n✅ Sitemap validation passed with warnings.');
    } else {
      console.log('\n❌ Sitemap validation failed.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error validating sitemap:', error);
    process.exit(1);
  }
};

// Run validation
validateSitemap();
