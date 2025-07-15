import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 8 }) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
          {/* Image skeleton */}
          <div className="aspect-[3/4] bg-gray-200"></div>
          
          {/* Content skeleton */}
          <div className="p-3 space-y-2">
            {/* Brand name skeleton */}
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            
            {/* Product name skeleton */}
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            
            {/* Price skeleton */}
            <div className="flex items-center space-x-2 pt-1">
              <div className="h-5 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-4 bg-gray-200 rounded w-10"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductSkeleton;
