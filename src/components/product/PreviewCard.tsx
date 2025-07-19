import React, { useState, useEffect, useRef } from "react";
import { 
  getOptimizedImageUrl, 
  generateSrcSet, 
  getImageSizes, 
  shouldLazyLoad,
  getFetchPriority 
} from '../../lib/imageOptimization';
import { 
  getOptimalObjectFit,
  getProductFocalPoint
} from "../../lib/intelligentImageFitting";

interface PreviewCardProps {
  id: string;
  name: string;
  image: string;
  images?: Array<{ image_url: string; is_main?: boolean }>;
  price: number;
  originalPrice?: number;
  brand: string;
  onClick: () => void;
  priority?: boolean; // For above-the-fold images
  index?: number; // Card position for lazy loading decision
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ 
  name, 
  image, 
  images = [], 
  price, 
  originalPrice, 
  brand, 
  onClick,
  priority = false,
  index = 0
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Prepare image array - use images prop if available, otherwise fallback to main image
  const imageArray = images.length > 0 
    ? images.map(img => img.image_url)
    : [image];
  
  const hasMultipleImages = imageArray.length > 1;
  
  // Create extended array for infinite scroll (add first image at the end)
  const extendedImageArray = hasMultipleImages ? [...imageArray, imageArray[0]] : imageArray;

  // Determine if this image should be lazy loaded
  // Don't lazy load first 6-8 images (above the fold on most devices)
  const shouldLazyLoadImage = shouldLazyLoad(index, priority);

  // Get intelligent image fitting strategy
  const focalPoint = getProductFocalPoint(name, brand);
  const imageFitting = getOptimalObjectFit(imageArray[0] || image, {
    imageType: 'product', // Default to product for e-commerce
    focalPoint: focalPoint,
    allowCropping: false // Prefer showing full product
  });

  // Auto-scroll carousel on hover with infinite scroll
  useEffect(() => {
    if (isHovered && hasMultipleImages) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => {
          const nextIndex = prev + 1;
          // If we reach the last image (which is duplicate of first), 
          // we'll reset to 0 after the transition
          if (nextIndex >= extendedImageArray.length) {
            return 0;
          }
          return nextIndex;
        });
      }, 1500); // Change image every 1.5 seconds (slower)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset to first image when not hovering with a slight delay
      if (!isHovered) {
        setTimeout(() => {
          setCurrentImageIndex(0);
          setIsTransitioning(true);
        }, 200);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, hasMultipleImages, extendedImageArray.length]);

  // Handle infinite scroll reset
  useEffect(() => {
    if (currentImageIndex === imageArray.length && hasMultipleImages) {
      // We're at the duplicate first image, reset to actual first image without animation
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentImageIndex(0);
        // Re-enable transition after DOM update
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      }, 700); // Wait for transition to complete (700ms)
      
      return () => clearTimeout(timeout);
    }
  }, [currentImageIndex, imageArray.length, hasMultipleImages]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer overflow-hidden border border-gray-100"
      onClick={onClick} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0} 
      role="button" 
      aria-label={`View details for ${name}`}
      onKeyDown={e => { if (e.key === 'Enter') onClick(); }}
    >
      {/* Image Container with proper aspect ratio */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            <div 
              className={`flex h-full ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {extendedImageArray.map((imageUrl, imgIndex) => (
                <div
                  key={imgIndex}
                  className={`w-full h-full flex-shrink-0 relative ${imageFitting.containerClass}`}
                >
                  <img
                    src={getOptimizedImageUrl(imageUrl, { width: 400, quality: 80 })}
                    srcSet={generateSrcSet(imageUrl, { quality: 80 })}
                    sizes={getImageSizes('product-grid')}
                    alt={`${name} - ${imgIndex < imageArray.length ? imgIndex + 1 : 1}`}
                    loading={shouldLazyLoadImage ? "lazy" : "eager"}
                    decoding="async"
                    fetchPriority={getFetchPriority(imgIndex, priority)}
                    onLoad={imgIndex === 0 ? handleImageLoad : undefined}
                    onError={imgIndex === 0 ? handleImageError : undefined}
                    className={`w-full h-full ${imageFitting.imageClass} transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      objectPosition: imageFitting.objectPosition || 'center center',
                      ...imageFitting.style
                    }}
                    width="400"
                    height="533"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image indicators for multiple images */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {imageArray.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === (currentImageIndex % imageArray.length)
                    ? 'bg-white shadow-sm' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
        

      </div>

      {/* Product Information - Made longer with better spacing */}
      <div className="p-4 space-y-3">
        {/* Brand */}
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{brand}</p>
        
        {/* Product Name */}
        <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">{name}</h3>
        
        {/* Price Section */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
          {originalPrice && originalPrice > price && (
            <>
              <span className="text-sm text-gray-500 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
              <span className="text-xs text-green-600 font-medium">
                {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
              </span>
            </>
          )}
        </div>
        
        {/* Rating and Additional Info */}
        <div className="flex items-center justify-end pt-1">
          {/* View button removed */}
        </div>
      </div>
    </div>
  );
};
