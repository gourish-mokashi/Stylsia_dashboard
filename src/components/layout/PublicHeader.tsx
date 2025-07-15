import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Search, Heart, ShoppingCart, User, ChevronRight } from 'lucide-react';

interface PublicHeaderProps {
  onSearch?: (query: string) => void;
  showSearchBar?: boolean;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ onSearch, showSearchBar = true }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    } else if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
    setSearchQuery('');
  };

  const navigateToCategory = (category: string) => {
    navigate(`/products?category=${category}`);
    setIsDrawerOpen(false);
  };

  const menuItems = [
    { label: 'Men', category: 'Men', description: 'Shirts, T-Shirts, Jeans & More' },
    { label: 'Women', category: 'Women', description: 'Dresses, Tops, Sarees & More' },
    { label: 'Kids', category: 'Kids', description: 'Clothing, Footwear & Accessories' },
    { label: 'Home & Living', category: 'Home', description: 'Bedsheets, Curtains & Decor' },
    { label: 'Beauty', category: 'Beauty', description: 'Makeup, Skincare & Fragrance' },
  ];

  const specialItems = [
    { label: 'Stylsia Studio', badge: 'NEW', category: 'Studio' },
    { label: 'Stylsia Mall', badge: 'NEW', category: 'Mall' },
    { label: 'Stylsia Insider', category: 'Insider' },
  ];

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Hamburger + Logo (Mobile) / Logo + Nav (Desktop) */}
            <div className="flex items-center space-x-4">
              {/* Hamburger - Mobile Only */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 lg:hidden touch-target"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Logo */}
              <img 
                src="/img/stylsiaLOGO-05.png" 
                alt="Stylsia" 
                className="h-8 w-auto cursor-pointer"
                onClick={() => navigate('/')}
              />

              {/* Desktop Navigation - Hidden on Mobile */}
              <nav className="hidden lg:flex items-center space-x-8 ml-8">
                {menuItems.slice(0, 4).map((item) => (
                  <button
                    key={item.category}
                    onClick={() => navigateToCategory(item.category)}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Center: Search Bar (Desktop) */}
            {showSearchBar && (
              <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                <form onSubmit={handleSearch} className="w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for products, brands and more"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </form>
              </div>
            )}

            {/* Right: Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Icon - Mobile Only */}
              {showSearchBar && (
                <button 
                  className="p-2 text-gray-600 hover:text-gray-900 md:hidden touch-target"
                  aria-label="Search"
                >
                  <Search className="h-6 w-6" />
                </button>
              )}
              
              {/* Heart - Hidden on small mobile */}
              <button className="hidden sm:block p-2 text-gray-600 hover:text-gray-900 touch-target">
                <Heart className="h-6 w-6" />
              </button>
              
              {/* Shopping Cart */}
              <button className="p-2 text-gray-600 hover:text-gray-900 touch-target">
                <ShoppingCart className="h-6 w-6" />
              </button>
              
              {/* Profile - Hidden on small mobile */}
              <button 
                onClick={() => navigate('/login')}
                className="hidden sm:block p-2 text-gray-600 hover:text-gray-900 touch-target"
              >
                <User className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar - Below header on mobile when search is active */}
      {showSearchBar && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
              />
            </div>
          </form>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          
          {/* Drawer Content */}
          <div 
            className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <img 
                  src="/img/stylsiaLOGO-05.png" 
                  alt="Stylsia" 
                  className="h-8 w-auto"
                />
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 touch-target"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Promo Banner */}
            <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 mx-4 mt-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-white text-pink-500 rounded-full p-2 font-bold text-lg">
                  ₹300
                </div>
                <div>
                  <div className="font-semibold">Flat ₹300 OFF +</div>
                  <div className="text-sm">Free Shipping</div>
                  <div className="text-xs mt-1">On First Order</div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="mt-3 bg-white text-pink-500 px-4 py-2 rounded-md font-semibold text-sm"
              >
                SIGN UP, LOGIN
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.category}
                  onClick={() => navigateToCategory(item.category)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors touch-target"
                >
                  <div>
                    <div className="font-medium text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>

            {/* Special Items */}
            <div className="border-t border-gray-200 p-4 space-y-1">
              {specialItems.map((item) => (
                <button
                  key={item.category}
                  onClick={() => navigateToCategory(item.category)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors touch-target"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">{item.label}</span>
                    {item.badge && (
                      <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>

            {/* Footer Items */}
            <div className="border-t border-gray-200 p-4 space-y-1">
              <button
                onClick={() => {
                  navigate('/');
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors touch-target"
              >
                <span className="font-medium text-gray-900">Gift Cards</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              
              <button
                onClick={() => {
                  navigate('/');
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors touch-target"
              >
                <span className="font-medium text-gray-900">Contact Us</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  navigate('/');
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors touch-target"
              >
                <span className="font-medium text-gray-900">FAQs</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  navigate('/');
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors touch-target"
              >
                <span className="font-medium text-gray-900">Legal</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* App Promotion */}
            <div className="border-t border-gray-200 p-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-500 p-2 rounded-lg">
                    <img 
                      src="/img/stylsiaLOGO-05.png" 
                      alt="App" 
                      className="h-6 w-6"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Enjoy The Best</div>
                    <div className="text-sm text-gray-600">Shopping Experience!</div>
                  </div>
                </div>
                <button className="mt-3 bg-primary-500 text-white px-4 py-2 rounded-md font-semibold text-sm w-full">
                  GET STYLSIA APP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicHeader;
