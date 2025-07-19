import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, ShoppingCart, User, Heart, ArrowLeft } from 'lucide-react';

interface TargetStyleHeaderProps {
  onSearch?: (query: string) => void;
  showSearchBar?: boolean;
  showBackButton?: boolean;
  backButtonText?: string;
}

const TargetStyleHeader: React.FC<TargetStyleHeaderProps> = ({ 
  onSearch, 
  showSearchBar = true,
  showBackButton = false,
  backButtonText = "Back"
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

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
    { label: 'Men', category: 'Men' },
    { label: 'Women', category: 'Women' },
    { label: 'Kid', category: 'Kids' },
    { label: 'All Products', category: '' },
  ];

  return (
    <>
      {/* Main Header */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
          isScrolled ? 'shadow-md' : 'shadow-sm'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between px-6 py-3 border-b border-gray-100">
            {/* Left Side: Back Button or Logo */}
            <div className="flex items-center space-x-4">
              {showBackButton ? (
                <>
                  <motion.button
                    onClick={handleBack}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-red-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="font-helvetica font-medium">{backButtonText}</span>
                  </motion.button>
                  <motion.button 
                    onClick={() => navigate('/')} 
                    className="focus:outline-none"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src="/img/logo.png"
                      alt="Stylsia"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </motion.button>
                </>
              ) : (
                <motion.button 
                  onClick={() => navigate('/')} 
                  className="focus:outline-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center">
                    <img
                      src="/img/logo.png"
                      alt="Stylsia"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  </div>
                </motion.button>
              )}
            </div>

            {/* Navigation Menu - Only show when not in back button mode */}
            {!showBackButton && (
              <nav className="flex items-center space-x-8 font-helvetica">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.category}
                    onClick={() => navigateToCategory(item.category)}
                    className="text-gray-800 hover:text-red-600 font-medium text-base transition-colors duration-200 relative group"
                    whileHover={{ y: -1 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {item.label}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 origin-left"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                ))}
              </nav>
            )}

            {/* Search Bar */}
            {showSearchBar && (
              <motion.div 
                className="flex-1 max-w-lg mx-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <form onSubmit={handleSearch} className="w-full">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="What can we help you find?"
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base font-helvetica placeholder-gray-500"
                    />
                    <motion.button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-red-600"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Search className="h-6 w-6" />
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <motion.button
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <User className="h-6 w-6" />
              </motion.button>
              <motion.button
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className="h-6 w-6" />
              </motion.button>
              <motion.button
                className="p-2 text-gray-600 hover:text-red-600 transition-colors relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingCart className="h-6 w-6" />
                {/* Cart count badge */}
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </motion.button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3">
            {/* Left Side: Back Button or Mobile Menu */}
            {showBackButton ? (
              <motion.button
                onClick={handleBack}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-red-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-helvetica font-medium sm:inline hidden">{backButtonText}</span>
              </motion.button>
            ) : (
              <motion.button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Menu className="h-6 w-6" />
              </motion.button>
            )}

            {/* Logo */}
            <motion.button 
              onClick={() => navigate('/')} 
              className="focus:outline-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src="/img/logo.png"
                alt="Stylsia"
                className="h-10 w-10 rounded-full object-cover"
              />
            </motion.button>

            {/* Right Icons */}
            <div className="flex items-center space-x-2">
              <motion.button
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <User className="h-6 w-6" />
              </motion.button>
              <motion.button
                className="p-2 text-gray-600 hover:text-red-600 transition-colors relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </motion.button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showSearchBar && (
            <motion.div 
              className="lg:hidden px-4 pb-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What can we help you find?"
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base font-helvetica placeholder-gray-500"
                  />
                  <motion.button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-red-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Search className="h-6 w-6" />
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Mobile Drawer - Only show when not in back button mode */}
      <AnimatePresence>
        {isDrawerOpen && !showBackButton && (
          <motion.div 
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            
            {/* Drawer Content */}
            <motion.div 
              className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/img/logo.png" 
                    alt="Stylsia" 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="font-helvetica font-semibold text-gray-900">Stylsia</span>
                </div>
                <motion.button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.category}
                    onClick={() => navigateToCategory(item.category)}
                    className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors font-helvetica"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    <span className="font-medium text-gray-900 text-lg">{item.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Footer Items */}
              <div className="border-t border-gray-200 p-4 space-y-2">
                <motion.button
                  onClick={() => {
                    navigate('/');
                    setIsDrawerOpen(false);
                  }}
                  className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors font-helvetica"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ x: 4 }}
                >
                  <span className="font-medium text-gray-900">Contact Us</span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    window.open('/documentation', '_blank');
                    setIsDrawerOpen(false);
                  }}
                  className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors font-helvetica"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ x: 4 }}
                >
                  <span className="font-medium text-gray-900">FAQ</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16 lg:h-20"></div>
    </>
  );
};

export default TargetStyleHeader;
