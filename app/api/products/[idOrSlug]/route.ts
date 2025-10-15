import { NextResponse } from 'next/server';
import { getProductById, getProductBySlug, updateProduct, deleteProduct } from '@/lib/services/product-service';

type Params = {
  params: {
    idOrSlug: string;
  };
};

// Function to validate image URLs
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    // If it's already a full URL, it's valid
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return true;
    }
    
    // If it's a relative path, it's valid
    if (url.startsWith('/')) {
      return true;
    }
    
    return false;
  } catch (e) {
    return false;
  }
}

export async function GET(request: Request, { params }: Params) {
  try {
    let product = null;
    
    // First try to get by ID
    try {
      product = await getProductById(params.idOrSlug);
    } catch (error) {
      // If there's an error other than not found, log it
      console.error(`Error fetching product by ID ${params.idOrSlug}:`, error);
    }
    
    // If not found by ID, try by slug
    if (!product) {
      try {
        product = await getProductBySlug(params.idOrSlug);
      } catch (error) {
        // If there's an error other than not found, log it
        console.error(`Error fetching product by slug ${params.idOrSlug}:`, error);
      }
    }
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }
    
    // Ensure the product has proper image data
    const processedProduct = {
      ...product,
      // Ensure price is a number
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      // Ensure images is an array
      images: Array.isArray(product.images) ? product.images : [],
      // Ensure image is a string or null
      image: product.image || null,
    };
    
    // Filter out invalid image URLs and ensure we have valid ones
    const validImages = processedProduct.images.filter(isValidImageUrl);
    if (processedProduct.image && isValidImageUrl(processedProduct.image)) {
      // Add the single image to the images array if it's not already there
      if (!validImages.includes(processedProduct.image)) {
        validImages.unshift(processedProduct.image);
      }
    }
    
    const response = NextResponse.json({
      ...processedProduct,
      images: validImages
    });
    
    // Add caching headers for successful responses
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error(`Error in GET /api/products/${params.idOrSlug}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    // In a real app, you would check for authentication here
    // Check if the request has FormData or JSON
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData
      // For now, we'll return a more descriptive error since this route 
      // is not designed to handle form data from the admin form
      return NextResponse.json(
        { error: 'This endpoint does not support FormData. Use the server actions instead.' },
        { status: 400 }
      );
    } else {
      // Handle JSON data
      const updates = await request.json();
      const updatedProduct = await updateProduct(params.idOrSlug, updates);
      
      if (!updatedProduct) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(updatedProduct);
    }
  } catch (error: any) {
    console.error(`Error in PATCH /api/products/${params.idOrSlug}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    // In a real app, you would check for authentication here
    const result = await deleteProduct(params.idOrSlug);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error(`Error in DELETE /api/products/${params.idOrSlug}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 400 }
    );
  }
}