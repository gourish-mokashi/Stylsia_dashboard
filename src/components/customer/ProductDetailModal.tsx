import React from "react";
import { Modal } from "../ui/Modal";
import { ProductImageGallery } from "../product/ProductImageGallery";

interface Product {
  id: string;
  name: string;
  image: string;
  images?: Array<{ image_url: string; is_main?: boolean }>;
  price: number;
  brand: string;
  description: string;
  specifications: string;
  stock: number;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose }) => {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-4xl mx-auto">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-black z-10"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Enhanced Image Gallery */}
          <div>
            <ProductImageGallery
              images={product.images || [{ image_url: product.image, is_main: true }]}
              productName={product.name}
              productBrand={product.brand}
              className="w-full"
            />
          </div>
          
          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.brand}</div>
              <h2 className="font-bold text-xl mb-2">{product.name}</h2>
              <div className="text-primary-600 font-bold text-2xl mb-3">₹{product.price.toLocaleString()}</div>
              <div className="text-sm font-medium mb-4">
                {product.stock > 0 ? (
                  <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">In Stock</span>
                ) : (
                  <span className="text-red-500 bg-red-100 px-2 py-1 rounded-full text-xs">Out of Stock</span>
                )}
              </div>
            </div>
            
            <div className="text-sm leading-relaxed text-gray-700">
              <h3 className="font-semibold mb-2">Description</h3>
              <p>{product.description}</p>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Specifications</h3>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-600 whitespace-pre-wrap">{product.specifications}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="pt-4">
              <button 
                className={`w-full py-2 px-4 rounded font-medium text-sm transition-colors ${
                  product.stock > 0 
                    ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
