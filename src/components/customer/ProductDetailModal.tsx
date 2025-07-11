import React from "react";
import { Modal } from "../ui/Modal";

interface Product {
  id: string;
  name: string;
  image: string;
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
      <div className="p-6">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-black"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded" />
        <h2 className="mt-4 font-bold text-lg">{product.name}</h2>
        <div className="text-primary font-bold text-xl mt-2">₹{product.price}</div>
        <div className="text-xs text-gray-500 mb-2">{product.brand}</div>
        <div className="text-sm mt-2">{product.description}</div>
        <div className="text-xs text-gray-600 mt-2">{product.specifications}</div>
        <div className="mt-2">
          <span className={product.stock ? "text-green-600" : "text-red-600"}>
            {product.stock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>
    </Modal>
  );
};
