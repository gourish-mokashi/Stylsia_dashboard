import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCustomerProducts } from '../lib/fetchCustomerProducts';
import { PreviewCard } from '../components/product/PreviewCard';
import { SearchBar } from '../components/customer/SearchBar';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  brand: string;
  description: string;
  specifications: string;
  stock: number;
  [key: string]: any;
}

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchCustomerProducts(search)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [search]);

  return (

    <main className="min-h-screen bg-gray-50">
      {/* Top Bar: Brand left, SearchBar center, Navigation right, sticky */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 gap-3">
          <div className="flex-1 flex items-center justify-start mb-2 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Stylsia</h1>
          </div>
          <div className="w-full sm:w-1/2 max-w-2xl flex justify-center order-2 sm:order-none">
            <SearchBar onSearch={setSearch} />
          </div>
          <nav className="flex-1 flex justify-end space-x-4 mt-2 sm:mt-0">
            <a href="#" className="text-gray-700 hover:text-primary-600 font-medium">Women</a>
            <a href="#" className="text-gray-700 hover:text-primary-600 font-medium">Men</a>
            <a href="#" className="text-gray-700 hover:text-primary-600 font-medium">Kids</a>
            <a href="#" className="text-gray-700 hover:text-primary-600 font-medium">Sale</a>
          </nav>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="relative bg-white overflow-hidden border-b border-gray-100 xl:py-20 py-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:w-1/2 lg:pb-28 xl:pb-32 flex flex-col justify-center">
            <div className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16">
              <div className="sm:text-center lg:text-left animate-fade-in-up">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">New Season</span>
                  <span className="block text-primary-600">Essentials</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover the latest trends in fashion. From everyday basics to statement pieces.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <a
                    href="#featured"
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-full text-white bg-primary-600 hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 transition-all duration-200 md:py-4 md:text-lg md:px-10 shadow-lg"
                    style={{ minWidth: '10rem', maxWidth: '100%' }}
                  >
                    Shop Now
                  </a>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a
                      href="#sale"
                      className="w-full flex items-center justify-center px-8 py-3 border border-primary-600 text-base font-semibold rounded-full text-primary-700 bg-primary-100 hover:bg-primary-200 focus-visible:ring-2 focus-visible:ring-primary-500 transition-all duration-200 md:py-4 md:text-lg md:px-10"
                    >
                      View Sale
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-t from-primary-600/30 to-transparent z-10 rounded-2xl pointer-events-none" />
            <img
              className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full rounded-2xl transition-transform duration-500 hover:scale-105"
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              alt="Fashion collection"
              loading="lazy"
            />
          </div>
        </div>
      </section>


      {/* Featured Advertisement Section */}
      {/* Inspired by H&M's promotional banners with strong CTAs */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Summer Sale</span>
              <span className="block text-primary-100">Up to 70% Off</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-primary-100">
              Limited time offer on selected styles. Shop now and save big!
            </p>
            <div className="mt-8">
              <a
                href="#sale"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 transition duration-300"
              >
                Shop Sale Items
                <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Section */}
      {/* Mobile-first grid layout inspired by ASOS category sections */}
      <section className="bg-white py-12 xl:py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center sm:text-3xl">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { name: 'Tops', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', href: '#tops' },
              { name: 'Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', href: '#dresses' },
              { name: 'Bottoms', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', href: '#bottoms' },
              { name: 'Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', href: '#accessories' },
            ].map((category) => (
              <a
                key={category.name}
                href={category.href}
                className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white hover:bg-primary-50"
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
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {/* Using existing PreviewCard component with responsive grid */}
      <section id="featured" className="bg-gray-50 py-12 xl:py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Featured Products</h2>
            <p className="mt-2 text-gray-600">Discover our hand-picked selection of trending styles</p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.slice(0, 10).map(product => (
                <div className="transition-transform duration-200 hover:scale-105 hover:shadow-lg rounded-xl">
                  <PreviewCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    image={product.image}
                    price={product.price}
                    brand={product.brand}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <a
              href="#all-products"
              className="inline-flex items-center px-6 py-3 border border-primary-600 text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition duration-300"
            >
              View All Products
            </a>
          </div>
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
              <h3 className="text-lg font-semibold mb-4">Stylsia</h3>
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
                <li><a href="#" className="hover:text-white transition duration-300">Size Guide</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Returns</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">FAQ</a></li>
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
