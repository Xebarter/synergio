import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create a Supabase client for API routes that doesn't rely on cookies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(20);

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Process products to handle potential issues with data
    const processedProducts = products?.map(product => ({
      ...product,
      // Ensure price is a number
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      // Ensure images is always an array
      images: Array.isArray(product.images) ? product.images : [],
      // Ensure image is always a string or null
      image: product.image || null,
    })) || [];

    // Combine images from both sources if needed
    const finalProducts = processedProducts.map(product => {
      let allImages = [...product.images];
      if (product.image && !allImages.includes(product.image)) {
        allImages = [product.image, ...allImages];
      }
      
      return {
        ...product,
        images: allImages
      };
    });

    return NextResponse.json({ products: finalProducts });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}