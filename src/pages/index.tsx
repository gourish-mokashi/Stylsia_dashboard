import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import PublicHeader from '../components/layout/PublicHeader';
import { usePublicProducts } from '../hooks/usePublicProducts';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    products,
    loading,
  } = usePublicProducts({ 
    is_featured: true,
    limit: 20,
  });

  const handleSearch = (searchTerm: string) => {
    // Redirect to products page with search query
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/products');
    }
  };

  return (

    <main className="min-h-screen bg-gray-50">
      {/* New Myntra-style Header */}
      <PublicHeader onSearch={handleSearch} showSearchBar={true} />

      {/* Category Navigation Section */}
      {/* Mobile-first grid layout inspired by ASOS category sections */}
      <section className="bg-white py-12 xl:py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center sm:text-3xl">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { name: 'Tops', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', category: 'Tops' },
              { name: 'Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', category: 'Dresses' },
              { name: 'Bottoms', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', category: 'Bottoms' },
            ].map((category) => (
              <div
                key={category.name}
                className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white hover:bg-primary-50 cursor-pointer"
                onClick={() => navigate(`/products?category=${encodeURIComponent(category.category)}`)}
                tabIndex={0}
                role="button"
                aria-label={`View ${category.name}`}
                onKeyDown={e => { if (e.key === 'Enter') navigate(`/products?category=${encodeURIComponent(category.category)}`); }}
              >
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-32 sm:h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-lg font-semibold drop-shadow-lg">{category.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured" className="bg-gray-50 py-12 xl:py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-3">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our hand-picked selection of trending styles from top brands
            </p>
          </div>
          
          <>
            <ProductGrid
              products={products}
              loading={loading}
              onProductClick={(productId) => navigate(`/product/${productId}`)}
              loadingMessage="Loading featured products..."
              emptyMessage="No featured products available at the moment."
            />
            
            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <span>View All Products</span>
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      {/* Inspired by Uniqlo's clean subscription forms */}
      <section className="bg-primary-50 py-16 xl:py-24 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 rounded-2xl bg-white/80 shadow-lg">
          <div className="text-center py-8">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Stay in the know
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get the latest fashion trends and exclusive offers delivered to your inbox.
            </p>
            <form className="mt-8 sm:flex sm:max-w-md sm:mx-auto">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-full placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:max-w-xs"
                placeholder="Enter your email"
              />
              <div className="mt-3 rounded-full shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button
                  type="submit"
                  className="w-full bg-primary-600 px-6 py-3 border border-transparent text-base font-semibold rounded-full text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-300 hover:scale-105"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <img 
                src="/img/logo.png" 
                alt="Stylsia" 
                className="h-10 w-10 rounded-full object-cover mb-4"
              />
              <p className="text-gray-400 text-sm">
                Your destination for the latest fashion trends and timeless classics.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition duration-300">Women</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Men</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Kids</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Sale</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition duration-300">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">FAQ</a></li>
                <li><button onClick={() => navigate('/documentation')} className="hover:text-white transition duration-300 text-left">Become a Partner</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/stylsia/?hl=en" className="font-semibold text-gray-400 hover:text-white transition duration-300 flex items-center space-x-1" target="_blank" rel="noopener noreferrer">
                  <span>Instagram</span>
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-400">
              © 2025 Stylsia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default HomePage;
