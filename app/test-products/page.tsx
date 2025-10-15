'use client';

import { useEffect, useState } from 'react';

export default function TestProductsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products-list');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Products API Response</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
        {JSON.stringify(data, null, 2)}
      </pre>
      
      <h2 className="text-xl font-bold mt-8 mb-4">Product Images Analysis</h2>
      {data?.products?.map((product: any, index: number) => (
        <div key={index} className="mb-6 p-4 border rounded">
          <h3 className="font-bold">{product.name}</h3>
          <p>Product ID: {product.id}</p>
          <p>Images property exists: {product.images ? 'Yes' : 'No'}</p>
          <p>Images type: {product.images ? typeof product.images : 'N/A'}</p>
          {product.images && Array.isArray(product.images) && (
            <div>
              <p>Number of images: {product.images.length}</p>
              {product.images.map((img: string, imgIndex: number) => (
                <div key={imgIndex} className="mt-2">
                  <p>Image {imgIndex + 1}: {img}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}