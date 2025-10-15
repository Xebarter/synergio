"use client"

import React, { useState, Suspense } from 'react';
import { notFound } from 'next/navigation';
import { 
  Heart, 
  Share2, 
  Star, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Plus, 
  Minus, 
  ShoppingCart,
  Package,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import ProductImage from '@/components/product/ProductImage';

// Define TypeScript interfaces
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  sku: string | null;
  stock_quantity: number;
  is_featured: boolean;
  category_id: string;
  images: string[];
  image: string | null; // Single image column from Fake Store API
  specifications: Record<string, string>;
  slug: string;
  created_at: string;
  updated_at: string;
  brand: string | null;
  is_active: boolean;
  tags: string[];
}

// Loading skeleton components
const ProductImageSkeleton = () => (
  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 animate-pulse">
    <div className="absolute inset-0 flex items-center justify-center">
      <Package className="w-16 h-16 text-gray-300" />
    </div>
  </div>
);

const ProductInfoSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      <div className="h-12 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>
    </div>
    <div className="flex space-x-4">
      <div className="h-12 bg-gray-200 rounded flex-1 animate-pulse"></div>
      <div className="h-12 bg-gray-200 rounded flex-1 animate-pulse"></div>
      <div className="h-12 bg-gray-200 rounded w-12 animate-pulse"></div>
    </div>
  </div>
);

const ProductPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex items-center text-sm text-gray-500 mb-6">
      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
      <span className="mx-2">/</span>
      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
      <span className="mx-2">/</span>
      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ProductImageSkeleton />
      <ProductInfoSkeleton />
    </div>
  </div>
);

// Error component
const ProductError = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
      <div className="text-red-500 text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Product Not Found</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <Button onClick={onRetry}>
        Go Back
      </Button>
    </div>
  </div>
);

export default function ProductPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductPageContent params={params} />
    </Suspense>
  );
}

function ProductPageContent({ params }: { params: { slug: string } }) {
  const { addItem } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Default features if not in specifications
  const defaultFeatures = [
    "High-quality materials",
    "Durable construction",
    "Designed for comfort",
    "Easy to use",
    "Comes with warranty"
  ];

  // Default specifications if not provided
  const defaultSpecifications = {
    "Material": "Premium quality",
    "Color": "As shown",
    "Dimensions": "Standard size",
    "Weight": "Varies by model",
    "Warranty": "Manufacturer warranty"
  };

  // Fetch product data
  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        const response = await fetch(`/api/products/${params.slug}`, {
          next: { revalidate: 300 } // Cache for 5 minutes
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found');
            return;
          }
          throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
        }
        
        const productData = await response.json();
        
        // Ensure images is always an array
        const processedProduct = {
          ...productData,
          images: Array.isArray(productData.images) ? productData.images : [],
          image: productData.image || null,
        };
        
        // Combine images from both sources if needed
        let allImages = [...processedProduct.images];
        if (processedProduct.image && !allImages.includes(processedProduct.image)) {
          allImages = [processedProduct.image, ...allImages];
        }
        
        setProduct({
          ...processedProduct,
          images: allImages
        });
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  // Combine images from both sources
  const allImages = React.useMemo(() => {
    if (!product) return [];
    
    const imagesArray = Array.isArray(product.images) ? product.images : [];
    const singleImage = product.image;
    
    // Start with the single image if it exists and isn't already in the array
    let combinedImages = [...imagesArray];
    if (singleImage && !combinedImages.includes(singleImage)) {
      combinedImages = [singleImage, ...combinedImages];
    }
    
    return combinedImages;
  }, [product]);

  const features = defaultFeatures;
  const specifications = product && product.specifications && Object.keys(product.specifications).length > 0 
    ? product.specifications 
    : defaultSpecifications;

  if (loading) {
    return <ProductPageSkeleton />;
  }

  if (error) {
    return (
      <ProductError 
        error={error} 
        onRetry={() => window.history.back()} 
      />
    );
  }

  if (!product) {
    notFound();
    return null;
  }

  const price = product.price;
  const comparePrice = product.sale_price;
  const discount = comparePrice && comparePrice < price 
    ? Math.round(((price - comparePrice) / price) * 100) 
    : 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      title: product.name,
      price: comparePrice && comparePrice < price ? comparePrice : price,
      image: allImages && allImages.length > 0 ? allImages[selectedImage] || allImages[0] : '',
      quantity: quantity
    });
  };

  const incrementQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleImageError = () => {
    setImageLoadError(true);
  };

  // Function to validate image URLs
  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Function to get a fallback image if needed
  const getImageSrc = (image: string, index: number) => {
    if (isValidImageUrl(image)) {
      return image;
    }
    // Return a placeholder or default image URL
    return `https://placehold.co/600x600?text=Product+Image+${index + 1}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <span>Home</span>
        <span className="mx-2">/</span>
        <span>Products</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            {allImages && allImages.length > 0 && allImages[selectedImage] ? (
              <ProductImage 
                src={getImageSrc(allImages[selectedImage], selectedImage)} 
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain"
              />
            ) : allImages && allImages.length > 0 && allImages[0] ? (
              <ProductImage 
                src={getImageSrc(allImages[0], 0)} 
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-300" />
              </div>
            )}
            {product.is_featured && (
              <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
                Featured
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="absolute top-4 right-4 bg-green-500 hover:bg-green-600">
                Save {discount}%
              </Badge>
            )}
          </div>
          
          {/* Thumbnails */}
          {allImages && allImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {allImages.map((image, index) => (
                <div 
                  key={index}
                  className={cn(
                    "relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer",
                    selectedImage === index 
                      ? "border-primary" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => setSelectedImage(index)}
                >
                  <ProductImage 
                    src={getImageSrc(image, index)} 
                    alt={`${product.name} ${index + 1}`}
                    fill
                    sizes="5rem"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-5 h-5",
                      i < 4 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-300"
                    )} 
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                4.5 (24 reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              ${(comparePrice && comparePrice < price ? comparePrice : price).toFixed(2)}
            </span>
            {comparePrice && comparePrice < price && (
              <>
                <span className="ml-2 text-xl text-gray-500 line-through">
                  ${price.toFixed(2)}
                </span>
                <Badge className="ml-3 bg-green-100 text-green-800 hover:bg-green-100">
                  Save ${(price - comparePrice).toFixed(2)}
                </Badge>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center">
            <ShieldCheck className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700 font-medium">
              In Stock ({product.stock_quantity} available)
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-700">
            {product.description || 'No description available for this product.'}
          </p>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <span className="font-medium">Quantity:</span>
            <div className="flex items-center border rounded-lg">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 rounded-l-lg"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-4 py-2">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 rounded-r-lg"
                onClick={incrementQuantity}
                disabled={quantity >= product.stock_quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1 h-12 text-base"
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-12 text-base"
              disabled={product.stock_quantity === 0}
            >
              <Heart className="mr-2 h-5 w-5" />
              Wishlist
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Shipping Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center">
              <Truck className="h-5 w-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center">
              <RotateCcw className="h-5 w-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm font-medium">30-Day Returns</p>
                <p className="text-xs text-gray-500">No questions asked</p>
              </div>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="h-5 w-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm font-medium">2-Year Warranty</p>
                <p className="text-xs text-gray-500">Guaranteed quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm",
                selectedTab === 'description'
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
              onClick={() => setSelectedTab('description')}
            >
              Description
            </button>
            <button
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm",
                selectedTab === 'features'
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
              onClick={() => setSelectedTab('features')}
            >
              Features
            </button>
            <button
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm",
                selectedTab === 'specifications'
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
              onClick={() => setSelectedTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm",
                selectedTab === 'reviews'
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
              onClick={() => setSelectedTab('reviews')}
            >
              Reviews (24)
            </button>
          </nav>
        </div>

        <div className="py-8">
          {selectedTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-700">
                {product.description || 'No description available for this product.'}
              </p>
              <p className="text-gray-700 mt-4">
                This product offers exceptional quality and performance. 
                Designed with attention to detail, it provides a premium experience 
                that meets your everyday needs.
              </p>
              <p className="text-gray-700 mt-4">
                With its durable construction and thoughtful design, 
                this product is built to last and deliver consistent results 
                for years to come.
              </p>
            </div>
          )}

          {selectedTab === 'features' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-2">Why you'll love it:</h3>
                <p className="text-gray-700 text-sm">
                  This product combines quality materials with thoughtful design to deliver 
                  an exceptional user experience. Whether for daily use or special occasions, 
                  you'll appreciate its performance and durability.
                </p>
              </div>
            </div>
          )}

          {selectedTab === 'specifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Specifications</h3>
                <dl className="space-y-3">
                  {Object.entries(specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-600">{key}</dt>
                      <dd className="text-gray-900 font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-2">What's in the box:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• {product.name}</li>
                  <li>• User Manual</li>
                  <li>• Warranty Card</li>
                </ul>
              </div>
            </div>
          )}

          {selectedTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
                  <p className="text-gray-600">Based on 24 reviews</p>
                </div>
                <Button>Write a Review</Button>
              </div>
              
              <div className="flex items-center">
                <div className="text-3xl font-bold mr-4">4.5</div>
                <div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "w-5 h-5",
                          i < 4 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300"
                        )} 
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Overall Rating</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[1, 2].map((review) => (
                  <Card key={review}>
                    <CardContent className="p-6">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Customer {review}</h4>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={cn(
                                  "w-4 h-4",
                                  i < (review === 1 ? 5 : 4) 
                                    ? "text-yellow-400 fill-yellow-400" 
                                    : "text-gray-300"
                                )} 
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-500">{review === 1 ? '1 week ago' : '2 weeks ago'}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">Verified Purchase</Badge>
                      </div>
                      <p className="mt-3 text-gray-700">
                        {review === 1 
                          ? "This product exceeded my expectations! Great quality and fast shipping. Highly recommend to anyone looking for a reliable option."
                          : "Very satisfied with my purchase. The product is exactly as described and arrived quickly. Good value for money."}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Mock related products */}
          {[1, 2, 3, 4].map((item) => {
            const productPrice = (29.99 + item * 5).toFixed(2);
            const comparePrice = (39.99 + item * 5).toFixed(2);
            const discount = Math.round(((parseFloat(comparePrice) - parseFloat(productPrice)) / parseFloat(comparePrice)) * 100);
            
            return (
              <Card key={item} className="group hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                    <ProductImage 
                      src={`https://picsum.photos/seed/${item}/300/300`} 
                      alt={`Related product ${item}`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // 如果图片加载失败，显示占位符文本
                        const target = e.target as HTMLImageElement;
                        target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='system-ui' font-size='16' fill='%239ca3af' text-anchor='middle'%3ERelated Product ${item}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                    {discount > 0 && (
                      <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 px-2 py-1 text-xs">
                        Save {discount}%
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors duration-200 line-clamp-2 min-h-12">
                    Related Product {item}
                  </h3>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">(1{item})</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="font-medium text-gray-900">${productPrice}</span>
                    <span className="line-through text-xs text-gray-500 ml-2">${comparePrice}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3 text-xs h-8 border-primary/20 hover:border-primary hover:text-primary"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}