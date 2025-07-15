import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Star, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProductWithDetails } from '../types/database';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

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

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAddToCart = () => {
    // Implement add to cart logic
    console.log('Adding to cart:', {
      productId: id,
      size: selectedSize,
      color: product?.attributes?.color,
      quantity
    });
    // Show success message or redirect to cart
  };

  const handleBuyNow = () => {
    // Implement buy now logic
    console.log('Buy now:', {
      productId: id,
      size: selectedSize,
      color: product?.attributes?.color,
      quantity
    });
    // Redirect to checkout
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Implement wishlist logic
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
  const discountPercentage = hasDiscount 
    ? Math.round(((product.original_price - product.current_price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <img 
                src="/img/stylsiaLOGO-05.png" 
                alt="Stylsia" 
                className="h-8 w-auto cursor-pointer"
                onClick={() => navigate('/')}
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={toggleWishlist}
                className={`p-2 rounded-md ${
                  isWishlisted 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

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

              {/* Discount Badge */}
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                  {discountPercentage}% OFF
                </div>
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
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mt-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.2)</span>
                <span className="text-sm text-gray-500">234 reviews</span>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">₹{product.current_price}</span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-gray-500 line-through">₹{product.original_price}</span>
                    <span className="text-lg text-green-600 font-medium">
                      {discountPercentage}% off
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

            {/* Colors */}
            {product.attributes?.color && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="px-4 py-2 border border-primary-500 bg-primary-50 text-primary-700 rounded-md text-sm font-medium"
                  >
                    {product.attributes.color}
                  </button>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-lg font-medium min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

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
                onClick={handleAddToCart}
                className="w-full bg-white text-primary-600 border border-primary-600 py-3 px-6 rounded-md font-medium hover:bg-primary-50 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Free Delivery</p>
                    <p className="text-xs text-gray-500">On orders above ₹499</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <RotateCcw className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                    <p className="text-xs text-gray-500">30-day return policy</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-500">100% secure transactions</p>
                  </div>
                </div>
              </div>
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
                { id: 'reviews', label: 'Reviews' },
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
                <p className="text-gray-700 leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </p>
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

            {activeTab === 'reviews' && (
              <div>
                <p className="text-gray-600">Customer reviews will be displayed here.</p>
                {/* Add reviews component here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
