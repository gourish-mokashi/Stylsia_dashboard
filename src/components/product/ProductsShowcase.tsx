import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Star
} from 'lucide-react';
import { usePublicProducts } from '../../hooks/usePublicProducts';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { ProductGrid } from './ProductGrid';

interface SortOption {
  value: string;
  label: string;
  icon?: React.ComponentType<any>;
}

interface FilterOption {
  category: string;
  options: string[];
}

const ProductsShowcase: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Search and UI states
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter states
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    category: [],
    fabric: [],
    fit: [],
    collar: [],
    sleeve: [],
    closure: [],
    pattern: [],
    color: [],
    style: [],
    size: [],
    occasion: []
  });

  const {
    products,
    loading,
    pagination,
    filters,
    setFilters,
  } = usePublicProducts({
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
  });

  // Sort options matching Myntra
  const sortOptions: SortOption[] = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'newest', label: 'Latest' },
    { value: 'discount', label: 'Discount' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'rating', label: 'Customer Rating' },
  ];

  // Filter options based on backend data
  const filterOptions: FilterOption[] = [
    { category: 'Category', options: ['Women', 'Men', 'Kids'] },
    { category: 'Fabric', options: ['Cotton', 'Polyester', 'Linen', 'Wool', 'Denim'] },
    { category: 'Fit', options: ['Regular', 'Slim', 'Oversize', 'Loose', 'Tight', 'Baggy'] },
    { category: 'Collar', options: ['Collar', 'Mandarin', 'Hooded', 'Polo', 'Crew'] },
    { category: 'Sleeve', options: ['Long Sleeve', 'Short Sleeve', 'Half Sleeve', 'Full Sleeve'] },
    { category: 'Closure', options: ['Zipper', 'Buttons', 'Pullover', 'Drawstring', 'Elastic'] },
    { category: 'Pattern', options: ['Solid', 'Striped', 'Printed', 'Graphic', 'Plain', 'Cargo'] },
    { category: 'Color', options: ['Red', 'Black', 'White', 'Blue', 'Green', 'Yellow', 'Grey', 'Rust'] },
    { category: 'Style', options: ['Casual', 'Formal', 'Streetwear', 'Sports', 'Party'] },
    { category: 'Size', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { category: 'Occasion', options: ['Daily', 'Party', 'Work', 'Wedding', 'Casual', 'Formal'] }
  ];

  // Get search term and category for display
  const searchTerm = searchParams.get('search') || '';
  const categoryTerm = searchParams.get('category') || '';
  const displayTitle = searchTerm ? `${searchTerm}` : categoryTerm || 'All Products';
  const itemCount = pagination?.total || 0;

  // Update filters when URL changes
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    const categoryFromUrl = searchParams.get('category') || '';
    
    setFilters({
      ...filters,
      search: searchFromUrl || undefined,
      category: categoryFromUrl || undefined,
    });
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newParams = new URLSearchParams();
      newParams.set('search', searchQuery.trim());
      setSearchParams(newParams);
    }
    setIsSearchActive(false);
  };

  const handleSortSelect = (sortValue: string) => {
    // Map to valid sort values
    const sortMapping: Record<string, string> = {
      'popularity': 'newest',
      'newest': 'newest',
      'discount': 'price_desc',
      'price-high': 'price_desc',
      'price-low': 'price_asc',
      'rating': 'newest'
    };
    
    const mappedSort = sortMapping[sortValue] || 'newest';
    
    setFilters({
      ...filters,
      sort_by: mappedSort as any,
    });
    setShowSortModal(false);
  };

  const handleFilterChange = (category: string, option: string) => {
    const categoryKey = category.toLowerCase();
    const currentOptions = selectedFilters[categoryKey] || [];
    
    const updatedOptions = currentOptions.includes(option)
      ? currentOptions.filter(item => item !== option)
      : [...currentOptions, option];
    
    setSelectedFilters({
      ...selectedFilters,
      [categoryKey]: updatedOptions
    });
  };

  const applyFilters = () => {
    // For now, we'll just apply category filter since the backend supports it
    const categoryFilters = selectedFilters.category;
    
    if (categoryFilters.length > 0) {
      setFilters({
        ...filters,
        category: categoryFilters[0], // Take first category for now
      });
    }
    
    setShowFilterModal(false);
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      category: [],
      fabric: [],
      fit: [],
      collar: [],
      sleeve: [],
      closure: [],
      pattern: [],
      color: [],
      style: [],
      size: [],
      occasion: []
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(selectedFilters).reduce((count, filters) => count + filters.length, 0);
  };

  // Infinite scroll functionality
  const loadMore = useCallback(() => {
    if (pagination?.hasNext && !loading) {
      const currentOffset = filters.offset || 0;
      const nextOffset = currentOffset + (filters.limit || 10);
      
      setFilters({
        ...filters,
        offset: nextOffset,
      });
    }
  }, [pagination?.hasNext, loading, filters, setFilters]);

  const { targetRef } = useInfiniteScroll({
    hasNextPage: pagination?.hasNext || false,
    loading: loading,
    loadMore,
    threshold: 200, // Load when 200px from bottom
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        {!isSearchActive ? (
          // Normal Header
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 touch-target"
                aria-label="Go back"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <img 
                  src="/img/stylsiaLOGO-05.png" 
                  alt="Stylsia" 
                  className="h-8 w-auto"
                />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[150px]">
                    {displayTitle}
                  </h1>
                  <p className="text-sm text-gray-600">{itemCount} Items</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSearchActive(true)}
                className="p-2 text-gray-600 hover:text-gray-900 touch-target"
                aria-label="Search"
              >
                <Search className="h-6 w-6" />
              </button>
            </div>
          </div>
        ) : (
          // Search Mode Header
          <div className="flex items-center h-16 px-4">
            <button
              onClick={() => setIsSearchActive(false)}
              className="p-2 text-gray-600 hover:text-gray-900 touch-target mr-2"
              aria-label="Cancel search"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for brands & products"
                  className="w-full h-12 pl-4 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-primary-600"
                >
                  <Search className="h-6 w-6" />
                </button>
              </div>
            </form>
          </div>
        )}
      </header>

      {/* Promo Banner */}
      {(searchTerm || categoryTerm) && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-3">
          <p className="text-sm font-medium">UPTO 300 OFF</p>
          <p className="text-xs">STYLSIA300</p>
        </div>
      )}

      {/* Sort & Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="flex items-center justify-center h-12">
          <button
            onClick={() => setShowSortModal(true)}
            className="flex-1 flex items-center justify-center h-full border-r border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <span className="font-medium">SORT</span>
          </button>
          
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex-1 flex items-center justify-center h-full text-gray-700 hover:bg-gray-50 transition-colors relative"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <span className="font-medium">FILTER</span>
            {getActiveFilterCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {products.length > 0 ? (
          <ProductGrid 
            products={products} 
            onProductClick={(productId) => navigate(`/product/${productId}`)}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="h-12 w-12 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Load More Spinner */}
        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Sentinel div for infinite scroll */}
        <div ref={targetRef} className="h-1"></div>
      </div>

      {/* Sort Modal */}
      {showSortModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowSortModal(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg animate-slide-up">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">SORT BY</h3>
                <button
                  onClick={() => setShowSortModal(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortSelect(option.value)}
                    className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {option.value === 'popularity' && <Star className="h-5 w-5 text-gray-400" />}
                      {option.value === 'newest' && <span className="text-gray-400">⭐</span>}
                      {option.value === 'discount' && <span className="text-gray-400">%</span>}
                      {option.value.includes('price') && <span className="text-gray-400">₹</span>}
                      {option.value === 'rating' && <Star className="h-5 w-5 text-gray-400" />}
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowFilterModal(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg animate-slide-up max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Filter Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">FILTER</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={clearAllFilters}
                  className="text-primary-600 font-medium"
                >
                  CLEAR ALL
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {filterOptions.map((filterGroup) => (
                <div key={filterGroup.category} className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">{filterGroup.category}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {filterGroup.options.map((option) => {
                      const categoryKey = filterGroup.category.toLowerCase();
                      const isSelected = selectedFilters[categoryKey]?.includes(option) || false;
                      
                      return (
                        <button
                          key={option}
                          onClick={() => handleFilterChange(filterGroup.category, option)}
                          className={`p-3 text-left rounded-lg border transition-colors ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-sm font-medium">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Filter Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={applyFilters}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                APPLY FILTERS ({getActiveFilterCount()})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsShowcase;
