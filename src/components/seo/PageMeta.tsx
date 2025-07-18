import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface PageMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  canonicalUrl?: string;
}

export const PageMeta: React.FC<PageMetaProps> = ({
  title = 'Stylsia',
  description = 'Stylsia - Premium fashion and clothing destination. Discover the latest trends in men\'s and women\'s fashion with high-quality apparel from top brands.',
  keywords = 'stylsia, fashion, clothing, apparel, men fashion, women fashion, shirts, t-shirts, trends, online shopping',
  image = 'https://stylsia.com/og-image.jpg',
  url,
  type = 'website',
  author = 'Stylsia',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noIndex = false,
  canonicalUrl
}) => {
  const fullTitle = title === 'Stylsia' ? title : `${title} | Stylsia`;
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const canonical = canonicalUrl || currentUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="googlebot" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Stylsia" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article specific Open Graph tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@stylsia" />
      <meta name="twitter:creator" content="@stylsia" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="application-name" content="Stylsia" />
      <meta name="apple-mobile-web-app-title" content="Stylsia" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Language and Region */}
      <meta name="language" content="English" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />
      
      {/* Cache Control */}
      <meta httpEquiv="Cache-Control" content="public, max-age=3600" />
    </Helmet>
  );
};
