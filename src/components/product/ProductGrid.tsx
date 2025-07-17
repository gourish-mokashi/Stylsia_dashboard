import React from 'react';
import { PreviewCard } from './PreviewCard';
import type { ProductWithDetails } from '../../types/database';

interface ProductGridProps {
  products: ProductWithDetails[];
  loading?: boolean;
  onProductClick: (productId: string) => void;
  className?: string;
  emptyMessage?: string;
  loadingMessage?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  onProductClick,
  className = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6",
  emptyMessage = "No products found",
  loadingMessage = "Loading products..."
}) => {
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-500 text-lg">{loadingMessage}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {products.map(product => {
        const mainImage = product.images?.find(img => img.is_main) || product.images?.[0];
        return (
          <PreviewCard
            key={product.id}
            id={product.id}
            name={product.name}
            image={mainImage?.image_url || product.main_image_url || 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=No+Image'}
            images={product.images}
            price={product.current_price}
            originalPrice={product.original_price}
            brand={product.brand?.name || ''}
            onClick={() => onProductClick(product.id)}
          />
        );
      })}
    </div>
  );
};
