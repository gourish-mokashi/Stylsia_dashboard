import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Grid, List, ChevronDown, Star, RefreshCw } from 'lucide-react';
import { usePublicProducts } from '../hooks/usePublicProducts';
import TargetStyleHeader from '../components/layout/TargetStyleHeader';
import type { ProductWithDetails } from '../types/database';

const PublicProducts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [refreshing, setRefreshing] = useState(false);

  const {
    products,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    refreshData,
  } = usePublicProducts({
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
  });

  // Update search from URL params
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    const categoryFromUrl = searchParams.get('category') || '';
    setSearch(searchFromUrl);
    
    setFilters({
      ...filters,
      search: searchFromUrl || undefined,
      category: categoryFromUrl || undefined,
    });
  }, [searchParams]);

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleCategoryFilter = (category: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (category && category !== 'all') {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleSort = (sortOption: string) => {
    setSortBy(sortOption);
    
    // Map the UI sort values to database sort values
    let dbSortBy: string;
    switch (sortOption) {
      case 'name-asc':
        dbSortBy = 'name_asc';
        break;
      case 'name-desc':
        dbSortBy = 'name_desc';
        break;
      case 'price-low':
        dbSortBy = 'price_asc';
        break;
      case 'price-high':
        dbSortBy = 'price_desc';
        break;
      case 'oldest':
        dbSortBy = 'oldest';
        break;
      case 'newest':
      default:
        dbSortBy = 'newest';
        break;
    }
    
    // Reset pagination and apply new sorting
    setFilters({
      ...filters,
      sort_by: dbSortBy as any,
      offset: 0,
    });
  };

  const handleRefreshProducts = async () => {
    setRefreshing(true);
    try {
      // Randomize products by applying random sort and resetting pagination
      setFilters({
        ...filters,
        sort_by: 'random',
        offset: 0,
      });
      // Call the refresh function from the hook
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const categories = ['All', 'Women', 'Men', 'Kids', 'Sale', 'Tops', 'Dresses', 'Bottoms', 'Accessories'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'oldest', label: 'Oldest First' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* New Target-style Header */}
      <TargetStyleHeader onSearch={handleSearch} showSearchBar={true} />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-sm text-gray-500">
          <span 
            className="cursor-pointer hover:text-gray-900"
            onClick={() => navigate('/')}
          >
            Home
          </span>
          {searchParams.get('category') && (
            <>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{searchParams.get('category')}</span>
            </>
          )}
          {search && (
            <>
              <span className="mx-2">/</span>
              <span className="text-gray-900">Search: "{search}"</span>
            </>
          )}
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.toLowerCase()}
                        checked={
                          (searchParams.get('category') || 'all').toLowerCase() === 
                          (category === 'All' ? 'all' : category.toLowerCase())
                        }
                        onChange={() => handleCategoryFilter(category === 'All' ? 'all' : category)}
                        className="mr-2"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
                <p className="text-sm text-gray-600">
                  {pagination.total} products found
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Refresh Button */}
                <button
                  onClick={handleRefreshProducts}
                  disabled={refreshing}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Refresh and randomize products"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm appearance-none bg-white pr-8"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 absolute right-2 top-3 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-500">Loading products...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-600">Error: {error}</p>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6' 
                  : 'space-y-4'
              }>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onClick={() => handleProductClick(product.id)}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products found</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
              </div>
            )}

            {/* Load More / Pagination */}
            {!loading && products.length > 0 && pagination.hasNext && (
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    const newOffset = (filters.offset || 0) + (filters.limit || 20);
                    setFilters({
                      ...filters,
                      offset: newOffset,
                    });
                  }}
                  disabled={loading}
                  className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More Products'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard: React.FC<{
  product: ProductWithDetails;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}> = ({ product, viewMode, onClick }) => {
  const mainImage = product.images?.find(img => img.is_main) || product.images?.[0];
  const imageUrl = mainImage?.image_url || product.main_image_url || 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=No+Image';
  
  // Optimize image URL for performance
  const optimizedImageUrl = imageUrl.includes('placeholder') 
    ? imageUrl 
    : `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}w=400&h=400&fit=crop&q=80`;

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 cursor-pointer flex space-x-4"
        onClick={onClick}
      >
        <img
          src={optimizedImageUrl}
          alt={product.name}
          className="w-24 h-24 object-cover rounded-md flex-shrink-0"
          loading="lazy"
          decoding="async"
        />
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{product.brand?.name}</p>
          <div className="space-y-1 mb-2">
            <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
              <span className="text-lg font-bold text-gray-900">₹{product.current_price}</span>
              {product.original_price && product.original_price > product.current_price && (
                <>
                  <span className="text-sm text-gray-500 line-through">₹{product.original_price}</span>
                  <span className="text-sm text-green-600 font-medium whitespace-nowrap">
                    {Math.round(((product.original_price - product.current_price) / product.original_price) * 100)}% off
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">4.2 (234)</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={optimizedImageUrl}
          alt={product.name}
          className="w-full h-48 md:h-64 object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.brand?.name}</p>
        <div className="space-y-1 mb-2">
          <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
            <span className="text-lg font-bold text-gray-900">₹{product.current_price}</span>
            {product.original_price && product.original_price > product.current_price && (
              <>
                <span className="text-sm text-gray-500 line-through">₹{product.original_price}</span>
                <span className="text-sm text-green-600 font-medium whitespace-nowrap">
                  {Math.round(((product.original_price - product.current_price) / product.original_price) * 100)}% off
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">4.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProducts;
