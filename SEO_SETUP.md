# SEO Setup Guide for Stylsia Partner Dashboard

This guide explains how the robots.txt and sitemap.xml files are set up for the Stylsia Partner Dashboard.

## Files Created

### 1. `public/robots.txt`
- **Purpose**: Controls how search engines crawl and index your website
- **Location**: `public/robots.txt` (served at `/robots.txt`)
- **Key Features**:
  - Allows crawling of public pages (`/`, `/products`, `/product/*`, `/documentation`)
  - Blocks private areas (`/dashboard`, `/admin`, `/login`)
  - Blocks sensitive files and directories
  - Includes crawl-delay and specific bot rules

### 2. `public/sitemap.xml`
- **Purpose**: Helps search engines discover and understand your site structure
- **Location**: `public/sitemap.xml` (served at `/sitemap.xml`)
- **Features**:
  - Lists all public pages with priority and update frequency
  - Automatically generated with product pages
  - Referenced in robots.txt

### 3. `src/lib/sitemapGenerator.ts`
- **Purpose**: TypeScript utilities for generating sitemaps
- **Features**:
  - Generate dynamic product sitemaps
  - Validate robots.txt rules
  - Helper functions for SEO management

### 4. `scripts/generate-sitemap.js`
- **Purpose**: Build-time script to generate updated sitemaps
- **Usage**: `npm run generate-sitemap`
- **Features**:
  - Fetches product data from database
  - Generates complete sitemap with all URLs
  - Automatically runs before build

## Usage

### Manual Sitemap Generation
```bash
npm run generate-sitemap
```

### Automatic Generation (during build)
The sitemap is automatically generated before each build thanks to the `prebuild` script.

```bash
npm run build  # This will automatically generate the sitemap first
```

## Customization

### Update Domain
Replace `https://yourdomain.com` in the following files:
- `public/robots.txt`
- `scripts/generate-sitemap.js`
- `src/lib/sitemapGenerator.ts`

### Add New Public Routes
To add new public routes to the sitemap:

1. **Update robots.txt**: Add new `Allow:` rules
2. **Update sitemap generator**: Add new static URLs to the `staticUrls` array
3. **Regenerate**: Run `npm run generate-sitemap`

### Connect to Real Database
Update the `fetchProducts` function in `scripts/generate-sitemap.js` to connect to your actual database:

```javascript
const fetchProducts = async () => {
  // Example with Supabase
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .eq('is_active', true);
  
  return products || [];
};
```

## SEO Best Practices Implemented

### 1. Robots.txt Rules
- ✅ Allow public customer-facing pages
- ✅ Block private dashboard and admin areas
- ✅ Block sensitive configuration files
- ✅ Block duplicate content from search parameters
- ✅ Include crawl-delay to prevent server overload
- ✅ Block aggressive crawlers

### 2. Sitemap.xml Features
- ✅ Proper XML structure with required namespaces
- ✅ Priority scores for different page types
- ✅ Change frequency hints for search engines
- ✅ Last modification dates
- ✅ Dynamic product page inclusion

### 3. Technical SEO
- ✅ Files served from root domain (`/robots.txt`, `/sitemap.xml`)
- ✅ Proper HTTP headers (handled by Vite)
- ✅ Mobile-friendly robots.txt rules
- ✅ Search engine friendly URL structure

## Testing

### 1. Verify robots.txt is accessible
Visit: `http://localhost:5173/robots.txt`

### 2. Verify sitemap.xml is accessible
Visit: `http://localhost:5173/sitemap.xml`

### 3. Test robots.txt rules
Use the utility function in `src/lib/sitemapGenerator.ts`:

```typescript
import { isAllowedByRobots } from './lib/sitemapGenerator';

console.log(isAllowedByRobots('*', '/')); // true
console.log(isAllowedByRobots('*', '/products')); // true
console.log(isAllowedByRobots('*', '/dashboard')); // false
```

## Deployment Notes

### Static Hosting (Vercel, Netlify, etc.)
- Files in `public/` are automatically served at root
- No additional configuration needed
- Both files will be available at `/robots.txt` and `/sitemap.xml`

### Server Hosting
- Ensure your server serves static files from the `public/` directory
- Verify both files are accessible via HTTP GET requests
- Consider setting up proper MIME types:
  - `robots.txt`: `text/plain`
  - `sitemap.xml`: `application/xml`

## Monitoring

### 1. Google Search Console
- Submit your sitemap: `https://yourdomain.com/sitemap.xml`
- Monitor indexing status
- Check for crawl errors

### 2. Bing Webmaster Tools
- Submit sitemap
- Monitor crawl statistics

### 3. Regular Updates
- Run `npm run generate-sitemap` when products are added/updated
- Consider automating this in your CI/CD pipeline

## Advanced Features

### 1. Multiple Sitemaps
For large sites, consider creating multiple sitemaps:
- `sitemap-products.xml`
- `sitemap-pages.xml`
- `sitemap-index.xml` (links to all sitemaps)

### 2. Gzip Compression
Enable gzip compression for sitemap files in production for better performance.

### 3. Cache Headers
Set appropriate cache headers for robots.txt and sitemap.xml files.

## Troubleshooting

### Sitemap Not Updating
1. Check if `prebuild` script is running
2. Verify database connection in `fetchProducts`
3. Check file permissions in `public/` directory

### Robots.txt Not Working
1. Verify file is accessible at `/robots.txt`
2. Check for syntax errors
3. Ensure proper line endings (LF, not CRLF)

### Search Engines Not Crawling
1. Submit sitemap to search consoles
2. Check robots.txt for typos
3. Verify URLs are publicly accessible
4. Monitor server logs for bot traffic
