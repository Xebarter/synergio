'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Search, Filter } from 'lucide-react';
import ProductImage from '@/components/product/ProductImage';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  image: string | null;
  category: string;
  stock: number;
  sku: string;
  slug: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products-list');
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          // Process products to ensure images is always an array
          const processedProducts = (data.products || []).map((product: any) => ({
            ...product,
            images: Array.isArray(product.images) ? product.images : [],
            image: product.image || null,
          }));
          
          // Combine images from both sources if needed
          const finalProducts = processedProducts.map((product: any) => {
            let allImages = [...product.images];
            if (product.image && !allImages.includes(product.image)) {
              allImages = [product.image, ...allImages];
            }
            
            return {
              ...product,
              images: allImages
            };
          });
          
          setProducts(finalProducts);
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

  const handleImageError = (productId: string) => {
    setImageLoadErrors(prev => ({ ...prev, [productId]: true }));
  };

  const groupProductsByCategory = (products: Product[]) => {
    return products.reduce((groups: Record<string, Product[]>, product) => {
      const category = product.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
      return groups;
    }, {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const productsByCategory = groupProductsByCategory(products);
  const categories = Object.keys(productsByCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-2">Discover our curated collection</p>
            </div>
            
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              
              {/* Category Filter */}
              {categories.length > 0 && (
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories.length > 0 ? (
          <div className="space-y-16">
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => {
              // Filter by search and selected category
              let filtered = categoryProducts;
              if (searchTerm) {
                filtered = filtered.filter(p => 
                  p.name.toLowerCase().includes(searchTerm) ||
                  p.description.toLowerCase().includes(searchTerm)
                );
              }
              if (selectedCategory && category !== selectedCategory) {
                return null;
              }

              const displayedProducts = filtered.slice(0, 3);

              return (
                <div key={category}>
                  {/* Category Header */}
                  <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gradient-to-r from-blue-500 to-transparent">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 capitalize">{category}</h2>
                      <p className="text-gray-600 text-sm mt-1">{categoryProducts.length} products available</p>
                    </div>
                    <Link 
                      href={`/category/${category}`} 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      View all
                      <ChevronRight size={18} />
                    </Link>
                  </div>

                  {/* Products Grid */}
                  {displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {displayedProducts.map((product) => (
                        <Link 
                          key={product.id} 
                          href={`/products/${product.slug}`}
                          className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
                        >
                          {/* Image Container */}
                          <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                            {product.images && product.images.length > 0 && product.images[0] ? (
                              <ProductImage
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : product.image ? (
                              <ProductImage
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-4xl mb-2">📦</div>
                                  <span className="text-gray-500 text-sm">No image available</span>
                                </div>
                              </div>
                            )}
                            {product.stock > 0 && (
                              <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                In Stock
                              </div>
                            )}
                            {product.stock === 0 && (
                              <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                Out of Stock
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">{product.name}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                            
                            {/* Footer */}
                            <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Price</p>
                                <p className="text-2xl font-bold text-blue-600">${product.price?.toFixed(2)}</p>
                              </div>
                              <ChevronRight className="text-blue-600" size={20} />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No products found in this category</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No products yet</h2>
            <p className="text-gray-600">Check back soon for our product collection</p>
          </div>
        )}
      </div>
    </div>
  );
}