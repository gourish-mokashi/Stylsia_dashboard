import React, { useState } from "react";
import { Heart, Star } from "lucide-react";

interface PreviewCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  brand: string;
  onClick: () => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ name, image, price, originalPrice, brand, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Optimize image URL for performance - reduce quality for thumbnails
  const optimizedImageUrl = image.includes('placeholder') 
    ? image 
    : `${image}${image.includes('?') ? '&' : '?'}w=400&h=400&fit=crop&q=80`;

  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer overflow-hidden"
      onClick={onClick} 
      tabIndex={0} 
      role="button" 
      aria-label={`View details for ${name}`}
      onKeyDown={e => { if (e.key === 'Enter') onClick(); }}
    >
      {/* Image Container */}
      <div className="relative">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        {imageError ? (
          <div className="w-full h-48 md:h-64 flex items-center justify-center bg-gray-100 text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <img 
            src={optimizedImageUrl} 
            alt={name} 
            loading="lazy"
            decoding="async"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`w-full h-48 md:h-64 object-cover transition-all duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
        
        {/* Heart Button (Wishlist) */}
        <button 
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow duration-200"
          onClick={(e) => {
            e.stopPropagation();
            // Add wishlist functionality here
          }}
        >
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors duration-200" />
        </button>
        
        {/* Discount Badge */}
        {originalPrice && originalPrice > price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
            {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 truncate">{name}</h3>
        <p className="text-sm text-gray-600 mb-2">{brand}</p>
        
        {/* Price Section */}
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-500 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
        
        {/* Rating and Quick View */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">4.2</span>
          </div>
          <button 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              // Add quick view functionality here
              onClick();
            }}
          >
            Quick View
          </button>
        </div>
      </div>
    </div>
  );
};
