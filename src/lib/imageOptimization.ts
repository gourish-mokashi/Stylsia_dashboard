/**
 * Image optimization utilities for e-commerce applications
 * Based on best practices from Google Web Vitals and modern web performance
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'crop';
  blur?: number;
}

/**
 * Generate optimized image URL with query parameters
 * Supports various image optimization services (ImageKit, Cloudinary, etc.)
 */
export const getOptimizedImageUrl = (
  originalUrl: string, 
  options: ImageOptimizationOptions = {}
): string => {
  if (!originalUrl || originalUrl.includes('placeholder') || originalUrl.includes('via.placeholder')) {
    return originalUrl;
  }

  const {
    width = 400,
    height,
    quality = 80,
    format = 'webp',
    fit = 'cover'
  } = options;

  // Remove existing query parameters
  const baseUrl = originalUrl.split('?')[0];
  const params = new URLSearchParams();

  // Add optimization parameters
  params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  params.set('fm', format);
  params.set('fit', fit);

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Generate srcset for responsive images
 * Creates multiple image variants for different screen sizes
 */
export const generateSrcSet = (originalUrl: string, options: ImageOptimizationOptions = {}): string => {
  if (!originalUrl || originalUrl.includes('placeholder')) {
    return '';
  }

  const { quality = 80, format = 'webp', fit = 'cover' } = options;
  
  const sizes = [200, 400, 600, 800, 1200];
  
  return sizes.map(width => {
    const optimizedUrl = getOptimizedImageUrl(originalUrl, {
      width,
      quality,
      format,
      fit
    });
    return `${optimizedUrl} ${width}w`;
  }).join(', ');
};

/**
 * Get appropriate sizes attribute for different image contexts
 */
export const getImageSizes = (context: 'product-grid' | 'product-detail' | 'hero' | 'thumbnail' = 'product-grid'): string => {
  const sizeMap = {
    'product-grid': '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
    'product-detail': '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw',
    'hero': '100vw',
    'thumbnail': '80px'
  };
  
  return sizeMap[context];
};

/**
 * Determine if image should be lazy loaded based on position and context
 * Based on Google's research on lazy loading performance
 */
export const shouldLazyLoad = (
  index: number, 
  priority: boolean = false, 
  context: 'above-fold' | 'below-fold' | 'auto' = 'auto'
): boolean => {
  if (priority || context === 'above-fold') return false;
  if (context === 'below-fold') return true;
  
  // Auto mode: Don't lazy load first 6-8 images (typically above the fold)
  return index >= 6;
};

/**
 * Get fetch priority for images
 * High priority for LCP candidates, auto for others
 */
export const getFetchPriority = (
  index: number, 
  priority: boolean = false
): 'high' | 'low' | 'auto' => {
  if (priority || index < 2) return 'high';
  return 'auto';
};

/**
 * Calculate optimal image dimensions for e-commerce cards
 * Maintains 3:4 aspect ratio which is standard for product images
 */
export const getOptimalDimensions = (containerWidth: number): { width: number; height: number } => {
  // Ensure width is at least 200px for quality, but not more than 800px for performance
  const width = Math.min(Math.max(containerWidth, 200), 800);
  const height = Math.round(width * 4 / 3); // 3:4 aspect ratio
  
  return { width, height };
};

/**
 * Preload critical images for better LCP
 * Use this for above-the-fold images
 */
export const preloadImage = (url: string, options: ImageOptimizationOptions = {}): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getOptimizedImageUrl(url, options);
  
  // Add responsive preload if browser supports it
  if ('imagesrcset' in link) {
    link.setAttribute('imagesrcset', generateSrcSet(url, options));
    link.setAttribute('imagesizes', getImageSizes('product-grid'));
  }
  
  document.head.appendChild(link);
};

/**
 * Optimize image loading for mobile devices
 * Reduces quality and size for slower connections
 */
export const getMobileOptimizedUrl = (originalUrl: string): string => {
  // Detect connection speed (if available)
  const connection = (navigator as any).connection;
  const isSlowConnection = connection && (
    connection.effectiveType === '2g' || 
    connection.effectiveType === 'slow-2g' ||
    connection.saveData
  );

  return getOptimizedImageUrl(originalUrl, {
    width: isSlowConnection ? 300 : 400,
    quality: isSlowConnection ? 60 : 80,
    format: 'webp'
  });
};
