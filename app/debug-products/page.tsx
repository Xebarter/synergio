'use client';

import { useEffect, useState } from 'react';

export default function DebugProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products-list');
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setProducts(data.products || []);
        }
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="p-8">Loading products...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <h2 className="font-bold text-lg mb-2">{product.name}</h2>
            
            <div className="mb-2">
              <p className="text-sm text-gray-600">ID: {product.id}</p>
              <p className="text-sm text-gray-600">Slug: {product.slug}</p>
            </div>
            
            <div className="mb-2">
              <h3 className="font-medium">Images:</h3>
              {product.images && product.images.length > 0 ? (
                <div>
                  <p>Count: {product.images.length}</p>
                  {product.images.map((img: string, index: number) => (
                    <div key={index} className="text-sm mt-1">
                      <p>Image {index + 1}: {img}</p>
                      {img && (
                        <img 
                          src={img} 
                          alt={`Product ${index + 1}`} 
                          className="w-24 h-24 object-cover mt-1 border rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML += '<p class="text-red-500 text-xs">Failed to load</p>';
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No images</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}