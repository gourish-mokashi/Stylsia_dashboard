/**
 * Sitemap Generator Utility
 * This utility helps generate sitemap entries for dynamic content like products
 */

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
}

/**
 * Generate sitemap XML for dynamic product pages
 * @param products Array of product objects with id and updated_at
 * @param baseUrl Base URL of your website
 * @returns XML string for sitemap
 */
export const generateProductSitemap = (
  products: Array<{ id: string; updated_at?: string }>,
  baseUrl: string = "https://stylsia.com"
): string => {
  const urls: SitemapUrl[] = products.map((product) => ({
    loc: `${baseUrl}/product/${product.id}`,
    lastmod: product.updated_at
      ? new Date(product.updated_at).toISOString().split("T")[0]
      : undefined,
    changefreq: "weekly",
    priority: 0.7,
  }));

  return generateSitemapXML(urls);
};

/**
 * Generate complete sitemap XML
 * @param urls Array of URL objects
 * @returns Complete sitemap XML string
 */
export const generateSitemapXML = (urls: SitemapUrl[]): string => {
  const staticUrls: SitemapUrl[] = [
    {
      loc: "https://stylsia.com/",
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "daily",
      priority: 1.0,
    },
    {
      loc: "https://stylsia.com/products",
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "daily",
      priority: 0.8,
    },
    {
      loc: "https://stylsia.com/documentation",
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: 0.6,
    },
  ];

  const allUrls = [...staticUrls, ...urls];

  const xmlContent = allUrls
    .map((url) => {
      let entry = `  <url>\n    <loc>${url.loc}</loc>`;

      if (url.lastmod) {
        entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
      }

      if (url.changefreq) {
        entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
      }

      if (url.priority) {
        entry += `\n    <priority>${url.priority}</priority>`;
      }

      entry += `\n  </url>`;
      return entry;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlContent}
</urlset>`;
};

/**
 * Example usage function - call this to generate sitemap for your products
 */
export const generateSitemapForProducts = async () => {
  try {
    // You would fetch your products from your database here
    // Example with Supabase:
    // const { data: products } = await supabase
    //   .from('products')
    //   .select('id, updated_at')
    //   .eq('is_active', true);

    const products = [
      // Mock data - replace with actual database call
      { id: "1", updated_at: "2025-07-18T10:00:00Z" },
      { id: "2", updated_at: "2025-07-17T15:30:00Z" },
      // ... more products
    ];

    const sitemapXML = generateProductSitemap(products);

    // Write to public folder
    // In a real implementation, you might want to do this server-side
    console.log("Generated sitemap:", sitemapXML);

    return sitemapXML;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    throw error;
  }
};

/**
 * Validate robots.txt rules
 * @param userAgent User agent to check
 * @param path Path to check
 * @returns boolean indicating if the path is allowed
 */
export const isAllowedByRobots = (userAgent: string, path: string): boolean => {
  // Define the robots.txt rules
  const rules = {
    disallow: [
      "/dashboard",
      "/dashboard/",
      "/admin",
      "/admin/",
      "/login",
      "/api/",
      "/auth/",
      "/_next/",
      "/static/",
      "/src/",
      "/node_modules/",
      "/dist/",
      "/.git/",
      "/.env",
      "/.env.local",
      "/package.json",
      "/vite.config.ts",
      "/tsconfig.json",
      "/supabase/",
      "/migrations/",
      "/maintenance",
      "/error",
      "/404",
      "/500",
      "/wp-admin/",
      "/wp-login.php",
      "/wp-content/",
      "/administrator/",
      "/admin.php",
      "/phpmyadmin/",
    ],
    allow: ["/", "/products", "/product/", "/documentation"],
  };

  // Check if explicitly disallowed
  for (const disallowedPath of rules.disallow) {
    if (path.startsWith(disallowedPath)) {
      return false;
    }
  }

  // Check if explicitly allowed
  for (const allowedPath of rules.allow) {
    if (path.startsWith(allowedPath)) {
      return true;
    }
  }

  // Default to disallow if not explicitly allowed
  return false;
};
