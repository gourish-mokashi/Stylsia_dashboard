/**
 * Intelligent image fitting utilities for e-commerce product cards
 * Based on research from major platforms and UX best practices
 */

import React from 'react';

export interface ImageFittingOptions {
  imageType?: 'product' | 'lifestyle' | 'model' | 'auto';
  aspectRatio?: number;
  backgroundColor?: string;
  allowCropping?: boolean;
  focalPoint?: { x: number; y: number }; // percentage values 0-100
}

/**
 * Determine the best object-fit strategy based on image analysis
 */
export const getOptimalObjectFit = (
  imageUrl: string,
  options: ImageFittingOptions = {}
): {
  objectFit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition: string;
  backgroundColor: string;
  strategy: string;
  imageClass: string;
  containerClass: string;
  style: React.CSSProperties;
} => {
  const {
    imageType = 'auto',
    backgroundColor = '#f9fafb',
    allowCropping = false,
    focalPoint
  } = options;

  // Auto-detect image type from filename or URL patterns
  const detectedType = imageType === 'auto' ? detectImageType(imageUrl) : imageType;
  
  switch (detectedType) {
    case 'product':
      // Products should show entirely - users need to see the full item
      return {
        objectFit: 'contain',
        objectPosition: focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : 'center center',
        backgroundColor: backgroundColor,
        strategy: 'full-product-visibility',
        imageClass: 'object-contain',
        containerClass: 'bg-gradient-to-br from-gray-50 to-gray-100',
        style: {
          backgroundColor: backgroundColor,
          objectFit: 'contain',
          objectPosition: focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : 'center center'
        }
      };
      
    case 'lifestyle':
      // Lifestyle images can be cropped for visual appeal
      return {
        objectFit: allowCropping ? 'cover' : 'contain',
        objectPosition: focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : 'center 20%', // Focus slightly higher for people
        backgroundColor: backgroundColor,
        strategy: 'lifestyle-optimized',
        imageClass: allowCropping ? 'object-cover' : 'object-contain',
        containerClass: 'bg-gradient-to-br from-gray-50 to-gray-100',
        style: {
          backgroundColor: backgroundColor,
          objectFit: allowCropping ? 'cover' : 'contain',
          objectPosition: focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : 'center 20%'
        }
      };
      
    case 'model':
      // Model photos - focus on face/upper body
      return {
        objectFit: allowCropping ? 'cover' : 'contain',
        objectPosition: focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : 'center 25%', // Focus on face/upper body
        backgroundColor: backgroundColor,
        strategy: 'model-portrait',
        imageClass: allowCropping ? 'object-cover' : 'object-contain',
        containerClass: 'bg-gradient-to-br from-gray-50 to-gray-100',
        style: {
          backgroundColor: backgroundColor,
          objectFit: allowCropping ? 'cover' : 'contain',
          objectPosition: focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : 'center 25%'
        }
      };
      
    default:
      // Safe default - show full image
      return {
        objectFit: 'contain',
        objectPosition: 'center center',
        backgroundColor: backgroundColor,
        strategy: 'safe-default',
        imageClass: 'object-contain',
        containerClass: 'bg-gradient-to-br from-gray-50 to-gray-100',
        style: {
          backgroundColor: backgroundColor,
          objectFit: 'contain',
          objectPosition: 'center center'
        }
      };
  }
};

/**
 * Detect image type from URL patterns, filename, or metadata
 */
const detectImageType = (imageUrl: string): 'product' | 'lifestyle' | 'model' => {
  const url = imageUrl.toLowerCase();
  
  // Common patterns in e-commerce image URLs
  if (url.includes('model') || url.includes('worn') || url.includes('person')) {
    return 'model';
  }
  
  if (url.includes('lifestyle') || url.includes('styled') || url.includes('scene')) {
    return 'lifestyle';
  }
  
  // Default to product for most cases
  return 'product';
};

/**
 * Smart background generation based on image colors
 */
export const generateSmartBackground = (
  imageUrl: string,
  fallback: string = '#f9fafb'
): Promise<string> => {
  return new Promise((resolve) => {
    // Create a small canvas to analyze image colors
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(fallback);
          return;
        }
        
        canvas.width = 1;
        canvas.height = 1;
        ctx.drawImage(img, 0, 0, 1, 1);
        
        const imageData = ctx.getImageData(0, 0, 1, 1).data;
        const [r, g, b] = imageData;
        
        // Generate a light version of the dominant color
        const lightR = Math.min(255, r + 40);
        const lightG = Math.min(255, g + 40);
        const lightB = Math.min(255, b + 40);
        
        resolve(`rgb(${lightR}, ${lightG}, ${lightB})`);
      } catch (error) {
        resolve(fallback);
      }
    };
    
    img.onerror = () => resolve(fallback);
    img.src = imageUrl;
  });
};

/**
 * Get CSS classes for responsive image containers
 */
export const getImageContainerClasses = (
  strategy: 'full-product' | 'lifestyle-crop' | 'model-portrait' | 'hybrid'
): string => {
  const baseClasses = 'relative w-full h-full';
  
  switch (strategy) {
    case 'full-product':
      return `${baseClasses} bg-gradient-to-br from-gray-50 to-gray-100`;
    
    case 'lifestyle-crop':
      return `${baseClasses} bg-gradient-to-br from-gray-100 to-gray-200`;
    
    case 'model-portrait':
      return `${baseClasses} bg-gradient-to-br from-gray-50 via-white to-gray-100`;
    
    case 'hybrid':
    default:
      return `${baseClasses} bg-gradient-to-br from-gray-50 to-gray-100`;
  }
};

/**
 * Intelligent focal point detection for common product types
 */
export const getProductFocalPoint = (
  productName: string,
  productCategory?: string
): { x: number; y: number } => {
  const name = productName.toLowerCase();
  const category = productCategory?.toLowerCase() || '';
  
  // Clothing items - focus on center/upper area
  if (name.includes('shirt') || name.includes('dress') || name.includes('jacket') || 
      name.includes('top') || category.includes('clothing')) {
    return { x: 50, y: 30 }; // Center horizontally, upper third vertically
  }
  
  // Shoes - focus on center
  if (name.includes('shoe') || name.includes('boot') || name.includes('sneaker') || 
      category.includes('footwear')) {
    return { x: 50, y: 50 }; // Perfect center
  }
  
  // Accessories - focus slightly higher
  if (name.includes('bag') || name.includes('watch') || name.includes('jewelry') || 
      category.includes('accessories')) {
    return { x: 50, y: 40 }; // Center horizontally, slightly above center
  }
  
  // Electronics - focus on screen/main feature
  if (category.includes('electronics') || name.includes('phone') || name.includes('laptop')) {
    return { x: 50, y: 45 }; // Slightly above center
  }
  
  // Default center position
  return { x: 50, y: 50 };
};

/**
 * Generate responsive image styles for different viewport sizes
 */
export const getResponsiveImageStyles = (
  baseStrategy: 'contain' | 'cover',
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): {
  objectFit: string;
  objectPosition: string;
  aspectRatio: string;
} => {
  switch (breakpoint) {
    case 'mobile':
      return {
        objectFit: 'contain', // Always show full product on mobile
        objectPosition: 'center center',
        aspectRatio: '1 / 1.2' // Slightly taller for mobile
      };
    
    case 'tablet':
      return {
        objectFit: baseStrategy,
        objectPosition: 'center center',
        aspectRatio: '3 / 4' // Standard product ratio
      };
    
    case 'desktop':
    default:
      return {
        objectFit: baseStrategy,
        objectPosition: 'center center',
        aspectRatio: '3 / 4' // Standard product ratio
      };
  }
};

/**
 * Fallback strategy for images that fail to load
 */
export const getImageFallbackStrategy = (
  productName: string,
  brand?: string
): {
  backgroundColor: string;
  content: string;
  textColor: string;
} => {
  // Generate a color based on product name for consistency
  const hash = productName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const hue = Math.abs(hash) % 360;
  
  return {
    backgroundColor: `hsl(${hue}, 20%, 95%)`,
    content: brand ? brand.charAt(0).toUpperCase() : productName.charAt(0).toUpperCase(),
    textColor: `hsl(${hue}, 30%, 60%)`
  };
};

/**
 * Performance-optimized image loading strategy
 */
export const getImageLoadingStrategy = (
  index: number,
  isVisible: boolean,
  priority: boolean
): {
  loading: 'lazy' | 'eager';
  decoding: 'async' | 'sync' | 'auto';
  fetchPriority: 'high' | 'low' | 'auto';
  preload: boolean;
} => {
  // High priority for above-the-fold images
  if (priority || index < 4) {
    return {
      loading: 'eager',
      decoding: 'async',
      fetchPriority: 'high',
      preload: true
    };
  }
  
  // Visible but lower priority
  if (isVisible) {
    return {
      loading: 'lazy',
      decoding: 'async',
      fetchPriority: 'auto',
      preload: false
    };
  }
  
  // Not visible - lazy load
  return {
    loading: 'lazy',
    decoding: 'async',
    fetchPriority: 'low',
    preload: false
  };
};
