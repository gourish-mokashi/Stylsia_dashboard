import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react';
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
} from '../../lib/intelligentImageFitting';

interface ProductImage {
  image_url: string;
  is_main?: boolean;
  alt_text?: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  productBrand: string;
  className?: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  productBrand,
  className = ''
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const mainImageRef = useRef<HTMLImageElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Sort images to put main image first
  const sortedImages = React.useMemo(() => {
    if (!images || images.length === 0) return [];
    
    const mainImage = images.find(img => img.is_main);
    const otherImages = images.filter(img => !img.is_main);
    
    return mainImage ? [mainImage, ...otherImages] : images;
  }, [images]);

  const currentImage = sortedImages[currentImageIndex];

  // Get intelligent image fitting strategy
  const focalPoint = getProductFocalPoint(productName, productBrand);
  const imageFitting = getOptimalObjectFit(currentImage?.image_url || '', {
    imageType: 'product',
    focalPoint: focalPoint,
    allowCropping: false // Always show full product in detail view
  });

  // Touch/swipe handling
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentImageIndex < sortedImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            if (currentImageIndex > 0) {
              setCurrentImageIndex(prev => prev - 1);
            }
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (currentImageIndex < sortedImages.length - 1) {
              setCurrentImageIndex(prev => prev + 1);
            }
            break;
          case 'Escape':
            e.preventDefault();
            setIsFullscreen(false);
            setIsZoomed(false);
            break;
        }
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, currentImageIndex, sortedImages.length]);

  // Reset states when image changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setIsZoomed(false);
  }, [currentImageIndex]);

  // Auto-scroll thumbnails to keep current one visible
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.children[currentImageIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentImageIndex]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentImageIndex < sortedImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setIsZoomed(false);
  };

  if (!sortedImages || sortedImages.length === 0) {
    return (
      <div className={`aspect-square bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-center">
          <div className="w-16 h-16 mx-auto mb-2 opacity-50">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${className}`}>
        {/* Main Image Display */}
        <div className="relative mb-4">
          <div 
            className={`relative aspect-square overflow-hidden rounded-lg ${imageFitting.containerClass} cursor-zoom-in`}
            onClick={openFullscreen}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
              </div>
            )}
            
            {imageError ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            ) : (
              <img
                ref={mainImageRef}
                src={getOptimizedImageUrl(currentImage.image_url, { width: 800, quality: 90 })}
                srcSet={generateSrcSet(currentImage.image_url, { quality: 90 })}
                sizes={getImageSizes('product-detail')}
                alt={currentImage.alt_text || `${productName} - Image ${currentImageIndex + 1}`}
                loading={shouldLazyLoad(currentImageIndex, false) ? "lazy" : "eager"}
                decoding="async"
                fetchPriority={getFetchPriority(currentImageIndex, false)}
                onLoad={handleImageLoad}
                onError={handleImageError}
                className={`w-full h-full ${imageFitting.imageClass} transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  objectPosition: imageFitting.objectPosition,
                  ...imageFitting.style
                }}
              />
            )}

            {/* Navigation Arrows */}
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  disabled={currentImageIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  disabled={currentImageIndex === sortedImages.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}

            {/* Zoom Icon */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <ZoomIn className="w-3 h-3" />
              Click to zoom
            </div>

            {/* Image Counter */}
            {sortedImages.length > 1 && (
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {currentImageIndex + 1} / {sortedImages.length}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {sortedImages.length > 1 && (
          <div 
            ref={thumbnailsRef}
            className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2"
          >
            {sortedImages.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentImageIndex 
                    ? 'border-primary-500 ring-2 ring-primary-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={getOptimizedImageUrl(image.image_url, { width: 80, quality: 70 })}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-contain bg-gray-50"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Close fullscreen"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <button
                onClick={toggleZoom}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
              >
                {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
            </div>

            {/* Navigation in Fullscreen */}
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  disabled={currentImageIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={currentImageIndex === sortedImages.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Fullscreen Image */}
            <div className={`max-w-full max-h-full transition-transform duration-200 ${isZoomed ? 'scale-150' : 'scale-100'} cursor-${isZoomed ? 'zoom-out' : 'zoom-in'}`}>
              <img
                src={getOptimizedImageUrl(currentImage.image_url, { width: 1200, quality: 95 })}
                srcSet={generateSrcSet(currentImage.image_url, { quality: 95 })}
                alt={currentImage.alt_text || `${productName} - Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={toggleZoom}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </div>

            {/* Image Counter in Fullscreen */}
            {sortedImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
                {currentImageIndex + 1} of {sortedImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
