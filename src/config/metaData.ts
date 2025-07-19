import type { PageMetaProps } from "../components/seo/PageMeta";

// Default meta data for different page types
export const defaultMeta: PageMetaProps = {
  title: "Stylsia",
  description:
    "Stylsia - Premium fashion and clothing destination. Discover the latest trends in men's and women's fashion with high-quality apparel from top brands.",
  keywords:
    "stylsia, fashion, clothing, apparel, men fashion, women fashion, shirts, t-shirts, trends, online shopping, brands",
  type: "website",
};

// Home page meta data
export const homeMeta: PageMetaProps = {
  title: "Stylsia - Premium Fashion & Clothing Store",
  description:
    "Discover premium fashion at Stylsia. Shop the latest trends in men's and women's clothing with high-quality apparel from top brands. Free shipping on orders over ₹999.",
  keywords:
    "stylsia home, fashion store, online clothing, premium apparel, men fashion, women fashion, fashion trends, clothing brands, indian fashion",
  type: "website",
};

// Products page meta data (Public)
export const publicProductsMeta: PageMetaProps = {
  title: "Fashion Products",
  description:
    "Browse our extensive collection of premium fashion products. Find shirts, t-shirts, bottoms, and more from top brands with great prices and quality.",
  keywords:
    "products, fashion products, clothing catalog, shirts, t-shirts, bottoms, apparel, fashion collection, brand clothing",
  type: "website",
};

// Partner Products page meta data
export const productsMeta: PageMetaProps = {
  title: "My Products",
  description:
    "Manage your product catalog, track performance, and optimize your brand listings on Stylsia partner dashboard.",
  keywords:
    "partner products, product management, brand catalog, inventory management, product analytics",
  type: "website",
  noIndex: true, // Private dashboard should not be indexed
};

// Dashboard meta data (Partner Dashboard)
export const dashboardMeta: PageMetaProps = {
  title: "Partner Dashboard",
  description:
    "Stylsia Partner Dashboard - Manage your brand, products, analytics and grow your business with our comprehensive partner tools.",
  keywords:
    "partner dashboard, brand management, product management, analytics, stylsia partners, business tools",
  type: "website",
  noIndex: true, // Private dashboard should not be indexed
};

// Analytics page meta data
export const analyticsMeta: PageMetaProps = {
  title: "Analytics",
  description:
    "View detailed analytics and insights for your brand performance on Stylsia. Track sales, customer engagement and optimize your business strategy.",
  keywords:
    "analytics, business insights, sales data, performance metrics, brand analytics, stylsia analytics",
  type: "website",
  noIndex: true,
};

// Profile page meta data
export const profileMeta: PageMetaProps = {
  title: "Profile",
  description:
    "Manage your Stylsia partner profile. Update brand information, contact details, and customize your brand presence on the platform.",
  keywords:
    "profile, brand profile, account settings, partner profile, brand management",
  type: "website",
  noIndex: true,
};

// Settings page meta data
export const settingsMeta: PageMetaProps = {
  title: "Settings",
  description:
    "Configure your Stylsia partner account settings. Manage notifications, security, billing, and platform preferences.",
  keywords:
    "settings, account settings, preferences, notifications, security, billing",
  type: "website",
  noIndex: true,
};

// Messages page meta data
export const messagesMeta: PageMetaProps = {
  title: "Messages",
  description:
    "View and manage your Stylsia partner messages. Communicate with the Stylsia team and get support for your brand.",
  keywords:
    "messages, communication, support, partner support, stylsia messages",
  type: "website",
  noIndex: true,
};

// Notifications page meta data
export const notificationsMeta: PageMetaProps = {
  title: "Notifications",
  description:
    "Stay updated with Stylsia partner notifications. Get alerts about orders, product updates, and important platform announcements.",
  keywords:
    "notifications, alerts, updates, partner notifications, stylsia updates",
  type: "website",
  noIndex: true,
};

// Admin pages meta data
export const adminMeta = {
  dashboard: {
    title: "Admin Dashboard",
    description:
      "Stylsia Admin Dashboard - Comprehensive platform administration, user management, and business oversight tools.",
    keywords:
      "admin dashboard, platform administration, user management, business management, stylsia admin",
    type: "website" as const,
    noIndex: true,
  },
  analytics: {
    title: "Admin Analytics",
    description:
      "Advanced analytics and reporting for Stylsia platform. Monitor platform performance, user engagement, and business metrics.",
    keywords:
      "admin analytics, platform analytics, business intelligence, reporting, metrics, data analysis",
    type: "website" as const,
    noIndex: true,
  },
  brandManagement: {
    title: "Brand Management",
    description:
      "Manage all brands on the Stylsia platform. Review applications, approve brands, and oversee brand partnerships.",
    keywords:
      "brand management, brand approval, partner management, brand oversight, platform brands",
    type: "website" as const,
    noIndex: true,
  },
  productManagement: {
    title: "Product Management",
    description:
      "Oversee all products on the Stylsia platform. Review, approve, and manage product listings from all brands.",
    keywords:
      "product management, product approval, catalog management, product oversight, platform products",
    type: "website" as const,
    noIndex: true,
  },
  settings: {
    title: "Admin Settings",
    description:
      "Configure Stylsia platform settings. Manage system preferences, user permissions, and platform configurations.",
    keywords:
      "admin settings, platform configuration, system settings, user permissions, platform management",
    type: "website" as const,
    noIndex: true,
  },
  support: {
    title: "Admin Support",
    description:
      "Manage customer and partner support requests. Handle inquiries, resolve issues, and maintain support quality.",
    keywords:
      "admin support, customer support, partner support, support management, help desk",
    type: "website" as const,
    noIndex: true,
  },
};

// Function to generate product-specific meta data
export const generateProductMeta = (product: {
  name: string;
  description?: string;
  brand?: { name: string };
  category?: string;
  attributes?: any;
  main_image_url?: string;
  id: string;
}): PageMetaProps => {
  const brandName = product.brand?.name || "";
  const title = `${product.name} ${brandName ? `- ${brandName}` : ""}`;
  const description = product.description
    ? `${product.description.substring(0, 160)}...`
    : `Shop ${
        product.name
      } from ${brandName} at Stylsia. Premium quality fashion with great prices. ${
        product.attributes?.fabric
          ? `Made with ${product.attributes.fabric}.`
          : ""
      } Order now!`;

  const keywords = [
    product.name.toLowerCase(),
    brandName.toLowerCase(),
    product.category?.toLowerCase(),
    product.attributes?.fabric?.toLowerCase(),
    product.attributes?.pattern?.toLowerCase(),
    product.attributes?.style?.toLowerCase(),
    "fashion",
    "clothing",
    "online shopping",
    "stylsia",
  ]
    .filter(Boolean)
    .join(", ");

  const image =
    product.main_image_url || "https://stylsia.com/default-product.jpg";

  return {
    title,
    description,
    keywords,
    image,
    type: "product",
    url: `${window.location.origin}/product/${product.id}`,
  };
};

// Function to generate category-specific meta data
export const generateCategoryMeta = (category: string): PageMetaProps => {
  return {
    title: `${category} - Fashion Collection`,
    description: `Explore our ${category.toLowerCase()} collection at Stylsia. Premium quality ${category.toLowerCase()} from top brands with great prices and latest fashion trends.`,
    keywords: `${category.toLowerCase()}, ${category.toLowerCase()} collection, fashion ${category.toLowerCase()}, premium ${category.toLowerCase()}, brand ${category.toLowerCase()}, stylsia ${category.toLowerCase()}`,
    type: "website",
  };
};
