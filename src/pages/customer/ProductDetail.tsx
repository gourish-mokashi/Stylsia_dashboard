import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductById } from "../../lib/fetchCustomerProducts";
import { ProductImageGallery } from "../../components/product/ProductImageGallery";

// Define a type for the product to ensure type safety
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

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const getProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        if (data) {
          setProduct(data);
        } else {
          setError("Product not found.");
        }
      } catch (err) {
        setError("Failed to fetch product details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!product) {
    return null; // Or a 'not found' component
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
        {"< Back to all products"}
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Image Gallery */}
        <div className="lg:sticky lg:top-4">
          <ProductImageGallery
            images={
              product.images || [{ image_url: product.image, is_main: true }]
            }
            productName={product.name}
            productBrand={product.brand}
            className="w-full"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-1">
              {product.brand}
            </h2>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {product.name}
            </h1>
            <p className="text-3xl font-light text-primary-600 mb-4">
              ₹{product.price.toLocaleString()}
            </p>
            <div className="text-sm font-medium mb-4">
              {product.stock > 0 ? (
                <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  In Stock
                </span>
              ) : (
                <span className="text-red-500 bg-red-100 px-3 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="prose max-w-none text-gray-700">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="leading-relaxed">{/* {product.description} */}</p>
          </div>

          {/* Specifications */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-3">Specifications</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                {product.specifications}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6">
            <button
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                product.stock > 0
                  ? "bg-primary-600 hover:bg-primary-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={product.stock === 0}
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
