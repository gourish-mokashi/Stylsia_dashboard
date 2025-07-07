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
      <div className="max-w-2xl mx-auto px-2 sm:px-4">
        <SearchBar onSearch={setSearch} />
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map(product => (
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
      </div>
    </main>
  );
};

export default HomePage;
