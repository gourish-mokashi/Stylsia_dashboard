import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 8 }) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          {/* Image skeleton with proper aspect ratio */}
          <div className="aspect-[3/4] bg-gray-200"></div>
          
          {/* Content skeleton - made longer with better spacing */}
          <div className="p-4 space-y-3">
            {/* Brand name skeleton */}
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            
            {/* Product name skeleton - 2 lines */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            
            {/* Price skeleton */}
            <div className="flex items-center space-x-2">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
            
            {/* Rating and button skeleton */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-1">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
                <div className="h-3 bg-gray-200 rounded w-10"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductSkeleton;
