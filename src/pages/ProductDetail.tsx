import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Share2, 
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import PublicHeader from '../components/layout/PublicHeader';
import type { ProductWithDetails } from '../types/database';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(*),
          images:product_images(*),
          sizes:product_sizes(*),
          attributes:product_attributes(*)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
      
      // Set default selections
      if (data.sizes?.length > 0) {
        setSelectedSize(data.sizes[0].size);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!product?.images) return;
    
    if (direction === 'prev') {
      setSelectedImageIndex(prev => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    } else {
      setSelectedImageIndex(prev => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleBuyNow = () => {
    // Implement buy now logic - could redirect to checkout or external store
    console.log('Buy now clicked for:', product?.name);
    // For now, open the source URL if available
    if (product?.source_url) {
      window.open(product.source_url, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.name} from ${product.brand?.name}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const mainImage = images[selectedImageIndex] || { image_url: product.main_image_url };
  const hasDiscount = product.original_price && product.original_price > product.current_price;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <PublicHeader showSearchBar={false} showBackButton={true} backButtonText="Products" />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-sm text-gray-500">
          <span 
            className="cursor-pointer hover:text-gray-900"
            onClick={() => navigate('/')}
          >
            Home
          </span>
          <span className="mx-2">/</span>
          <span 
            className="cursor-pointer hover:text-gray-900"
            onClick={() => navigate('/products')}
          >
            Products
          </span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={mainImage?.image_url || 'https://via.placeholder.com/600x800'}
                alt={product.name}
                className="w-full h-96 md:h-[600px] object-cover"
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNavigation('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleImageNavigation('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                      selectedImageIndex === index 
                        ? 'border-primary-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-lg text-primary-600 font-medium">{product.brand?.name}</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">₹{product.current_price}</span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-gray-500 line-through">₹{product.original_price}</span>
                    <span className="text-lg text-green-600 font-medium">
                      {Math.round(((product.original_price - product.current_price) / product.original_price) * 100)}% off
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">Inclusive of all taxes</p>
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.size}
                      onClick={() => setSelectedSize(size.size)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium ${
                        selectedSize === size.size
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-6">
              <button
                onClick={handleBuyNow}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-md font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Zap className="h-5 w-5" />
                <span>Buy Now</span>
              </button>
              <button
                onClick={handleShare}
                className="w-full bg-white text-primary-600 border border-primary-600 py-3 px-6 rounded-md font-medium hover:bg-primary-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Share2 className="h-5 w-5" />
                <span>Share Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description || 'No description available for this product.'}
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed">
                  {product.attributes?.material && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Material</h4>
                      <p>{product.attributes.material}</p>
                    </div>
                  )}
                  {product.attributes?.fabric && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Fabric</h4>
                      <p>{product.attributes.fabric}</p>
                    </div>
                  )}
                  {product.attributes?.fit && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Fit</h4>
                      <p>{product.attributes.fit}</p>
                    </div>
                  )}
                  {product.attributes?.collar && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Collar</h4>
                      <p>{product.attributes.collar}</p>
                    </div>
                  )}
                  {product.attributes?.sleeve && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Sleeve</h4>
                      <p>{product.attributes.sleeve}</p>
                    </div>
                  )}
                  {product.attributes?.pattern && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Pattern</h4>
                      <p>{product.attributes.pattern}</p>
                    </div>
                  )}
                  {product.attributes?.care_instructions && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Care Instructions</h4>
                      <p>{product.attributes.care_instructions}</p>
                    </div>
                  )}
                  {product.attributes?.occasion && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Occasion</h4>
                      <p>{product.attributes.occasion}</p>
                    </div>
                  )}
                  {(!product.attributes || Object.keys(product.attributes).length === 0) && (
                    <p className="text-gray-600">No specifications available for this product.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
