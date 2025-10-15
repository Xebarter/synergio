'use client';

import React, { useState, useEffect } from 'react';

// Define the product type based on what FakeStoreAPI returns
interface FakeStoreProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export default function FakeStoreProductsPage() {
  const [products, setProducts] = useState<FakeStoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products from FakeStoreAPI');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">FakeStoreAPI Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
            <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
            <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500 capitalize">{product.category}</p>
            <div className="mt-2 flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              <span>{product.rating.rate} ({product.rating.count} reviews)</span>
            </div>
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.title} 
                className="mt-2 w-full h-48 object-contain rounded"
                onError={handleImageError}
              />
            ) : (
              <div className="mt-2 w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}