import React, { useState, useEffect } from "react";
import { SearchBar } from "../../components/customer/SearchBar";
import { PreviewCard } from "../../components/product/PreviewCard";
import { ProductDetailModal } from "../../components/customer/ProductDetailModal";
import { fetchCustomerProducts } from "../../lib/fetchCustomerProducts";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  brand: string;
  description: string;
  specifications: string;
  stock: number;
  // ...existing fields from db
  [key: string]: any;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

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
                onClick={() => setSelected(product)}
              />
            ))}
          </div>
        )}
      </div>
      <ProductDetailModal 
        product={selected}
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
      />
    </main>
  );
};

export default Home;
