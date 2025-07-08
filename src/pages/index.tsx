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
    <main className="min-h-screen bg-gray-50 pb-8">
      {/* Hero Section */}
      <section className="w-full bg-white border-b border-gray-100 py-12 md:py-20 mb-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 font-sans tracking-tight">
            Discover Your Next Style
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 font-sans">
            Shop the latest trends, explore top brands, and find products curated just for you.
          </p>
          <a
            href="#featured"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition-colors duration-200"
          >
            Shop Featured
          </a>
        </div>
      </section>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto px-2 sm:px-4 mb-6">
        <SearchBar onSearch={setSearch} />
      </div>

      {/* Featured Products Grid */}
      <section id="featured" className="max-w-6xl mx-auto px-2 sm:px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 font-sans">Featured Products</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {products.slice(0, 8).map(product => (
              <PreviewCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.image}
                price={product.price}
                brand={product.brand}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default HomePage;
