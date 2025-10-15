'use client';

import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Truck, RotateCcw, Lock, Zap, Heart, ShoppingCart, ChevronLeft, ChevronRight, Clock, ArrowRight, Package, CreditCard } from 'lucide-react';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 34, seconds: 56 });

  const heroSlides = [
    {
      id: 1,
      title: 'Summer Mega Sale',
      subtitle: 'Up to 50% off on thousands of products',
      cta: 'Shop Now',
      image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1200&h=500&fit=crop',
      tag: 'Limited Time',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 2,
      title: 'New Electronics Arrival',
      subtitle: 'Latest gadgets and tech essentials',
      cta: 'Explore Now',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=500&fit=crop',
      tag: 'Just In',
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 3,
      title: 'Free Shipping',
      subtitle: 'On all orders over UGX 100,000',
      cta: 'Start Shopping',
      image: 'https://images.unsplash.com/photo-1607083206738-07504c3f8a0a?w=1200&h=500&fit=crop',
      tag: 'Nationwide',
      color: 'from-emerald-600 to-teal-600'
    }
  ];

  const categories = [
    { id: 1, name: 'Electronics', icon: '📱', count: '2.4k+', color: 'bg-blue-100 text-blue-700' },
    { id: 2, name: 'Fashion', icon: '👕', count: '8.9k+', color: 'bg-pink-100 text-pink-700' },
    { id: 3, name: 'Home', icon: '🏠', count: '5.6k+', color: 'bg-green-100 text-green-700' },
    { id: 4, name: 'Sports', icon: '⚽', count: '6.7k+', color: 'bg-orange-100 text-orange-700' },
    { id: 5, name: 'Beauty', icon: '💄', count: '3.2k+', color: 'bg-purple-100 text-purple-700' },
    { id: 6, name: 'Books', icon: '📚', count: '4.3k+', color: 'bg-yellow-100 text-yellow-700' },
    { id: 7, name: 'Toys', icon: '🎮', count: '2.1k+', color: 'bg-red-100 text-red-700' },
    { id: 8, name: 'Food', icon: '🍔', count: '1.8k+', color: 'bg-indigo-100 text-indigo-700' }
  ];

  const flashDeals = [
    {
      id: 1,
      title: 'Wireless Earbuds Pro',
      price: 89000,
      originalPrice: 150000,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      rating: 4.8,
      reviews: 2543,
      sold: 234,
      stock: 15
    },
    {
      id: 2,
      title: 'Smart Watch Series 5',
      price: 180000,
      originalPrice: 280000,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      rating: 4.9,
      reviews: 1823,
      sold: 189,
      stock: 8
    },
    {
      id: 3,
      title: 'Portable Speaker',
      price: 65000,
      originalPrice: 110000,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop',
      rating: 4.7,
      reviews: 1203,
      sold: 312,
      stock: 22
    },
    {
      id: 4,
      title: 'Gaming Mouse RGB',
      price: 75000,
      originalPrice: 120000,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
      rating: 4.6,
      reviews: 892,
      sold: 156,
      stock: 18
    }
  ];

  const products = [
    {
      id: 5,
      title: '4K Ultra HD Smart TV 55"',
      price: 1200000,
      originalPrice: 1500000,
      rating: 4.9,
      reviews: 3102,
      image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=400&fit=crop',
      badge: 'Best Seller',
      freeShipping: true
    },
    {
      id: 6,
      title: 'Laptop Backpack Pro',
      price: 85000,
      originalPrice: 100000,
      rating: 4.7,
      reviews: 892,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      badge: 'Top Rated',
      freeShipping: true
    },
    {
      id: 7,
      title: 'Ergonomic Office Chair',
      price: 320000,
      originalPrice: 420000,
      rating: 4.8,
      reviews: 1456,
      image: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=400&h=400&fit=crop',
      badge: 'Trending',
      freeShipping: true
    },
    {
      id: 8,
      title: 'Wireless Keyboard & Mouse',
      price: 95000,
      originalPrice: 130000,
      rating: 4.6,
      reviews: 743,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop',
      badge: 'Popular',
      freeShipping: false
    },
    {
      id: 9,
      title: 'HD Webcam 1080p',
      price: 110000,
      originalPrice: 145000,
      rating: 4.5,
      reviews: 621,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop',
      badge: 'New',
      freeShipping: true
    },
    {
      id: 10,
      title: 'USB-C Hub 7-in-1',
      price: 55000,
      originalPrice: 75000,
      rating: 4.7,
      reviews: 534,
      image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop',
      badge: 'Deal',
      freeShipping: false
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleWishlist = (id) => {
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel */}
      <section className="relative bg-white mb-6">
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full">
                  <div className="max-w-xl">
                    <div className={`inline-block bg-gradient-to-r ${slide.color} text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4`}>
                      {slide.tag}
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-xl text-white/90 mb-6">{slide.subtitle}</p>
                    <button className="bg-white hover:bg-gray-100 text-gray-900 font-bold px-8 py-4 rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2">
                      {slide.cta}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10">
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map(cat => (
            <button key={cat.id} className="bg-white hover:shadow-lg rounded-xl p-4 transition-all group">
              <div className={`w-14 h-14 ${cat.color} rounded-full flex items-center justify-center text-2xl mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <p className="text-sm font-semibold text-gray-900 text-center">{cat.name}</p>
              <p className="text-xs text-gray-500 text-center">{cat.count}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Flash Deals */}
      <section className="max-w-7xl mx-auto px-4 mb-12">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Flash Deals</h2>
                <p className="text-white/90 text-sm">Limited time offers - Grab them fast!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <Clock className="w-5 h-5 text-white" />
              <div className="flex gap-2 text-white font-mono font-bold">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {flashDeals.map(product => {
              const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
              const stockPercent = (product.stock / 30) * 100;
              
              return (
                <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group">
                  <div className="relative">
                    <img src={product.image} alt={product.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute top-3 right-3 bg-red-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
                      -{discount}%
                    </div>
                    <button onClick={() => toggleWishlist(product.id)} className="absolute top-3 left-3 bg-white/90 p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                      <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 h-10">{product.title}</h3>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">({product.reviews})</span>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-xl font-bold text-gray-900">UGX {product.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 line-through">UGX {product.originalPrice.toLocaleString()}</span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Sold: {product.sold}</span>
                        <span className="text-red-600 font-semibold">Only {product.stock} left</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all" style={{ width: `${100 - stockPercent}%` }} />
                      </div>
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Best Sellers</h2>
            <p className="text-gray-600">Top rated products loved by customers</p>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 group">
            View All 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map(product => {
            const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
            
            return (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group border border-gray-100">
                <div className="relative">
                  <img src={product.image} alt={product.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                  {product.badge && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {product.badge}
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      -{discount}%
                    </div>
                  )}
                  <button onClick={() => toggleWishlist(product.id)} className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100">
                    <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                </div>
                
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 h-10">{product.title}</h3>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({product.reviews})</span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-lg font-bold text-gray-900">UGX {product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <div className="text-xs text-gray-400 line-through">UGX {product.originalPrice.toLocaleString()}</div>
                    )}
                  </div>
                  
                  {product.freeShipping && (
                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium mb-2">
                      <Truck className="w-3 h-3" />
                      Free Shipping
                    </div>
                  )}
                  
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm transition-all">
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Truck className="w-8 h-8" />, title: 'Free Delivery', desc: 'Orders over UGX 100K', color: 'bg-blue-100 text-blue-600' },
              { icon: <RotateCcw className="w-8 h-8" />, title: 'Easy Returns', desc: '30-day return policy', color: 'bg-green-100 text-green-600' },
              { icon: <Lock className="w-8 h-8" />, title: 'Secure Payment', desc: '100% protected', color: 'bg-purple-100 text-purple-600' },
              { icon: <Package className="w-8 h-8" />, title: 'Quality Assured', desc: 'Genuine products', color: 'bg-orange-100 text-orange-600' }
            ].map((feature, i) => (
              <div key={i} className="text-center group cursor-default">
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Get Exclusive Offers</h2>
          <p className="text-blue-100 text-lg mb-8">Subscribe to receive special deals, new arrivals, and insider-only discounts!</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <button className="bg-white hover:bg-gray-100 text-blue-600 font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 whitespace-nowrap">
              Subscribe Now
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-4">Join 50,000+ happy subscribers. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
}