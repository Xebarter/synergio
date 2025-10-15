'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function ProductImage({ 
  src, 
  alt, 
  fill = false, 
  sizes,
  className = '',
  width,
  height
}: ProductImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Memoize image validation to avoid repeated computations
  const imageUrl = useMemo(() => {
    // Handle invalid or empty URLs
    if (!src || src.trim() === '' || typeof src !== 'string') {
      return null;
    }

    // If it's already a full URL, return it
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }

    // If it's a relative path, prepend with a forward slash
    if (src.startsWith('/')) {
      return src;
    }
    
    // If it looks like it should be a relative path, make it so
    if (!src.startsWith('http') && src.length > 0) {
      return '/' + src;
    }
    
    return src;
  }, [src]);

  if (error || !imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={width && height ? { width, height } : {}}>
        <div className="text-center">
          <div className="text-2xl mb-1">📦</div>
          <span className="text-gray-500 text-xs">No image</span>
        </div>
      </div>
    );
  }

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={imageUrl}
          alt={alt}
          fill={fill}
          sizes={sizes}
          className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoadingComplete={() => setLoading(false)}
          onError={() => setError(true)}
          priority={false}
          loading="lazy"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoadingComplete={() => setLoading(false)}
        onError={() => setError(true)}
        priority={false}
        loading="lazy"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300"></div>
        </div>
      )}
    </div>
  );
}