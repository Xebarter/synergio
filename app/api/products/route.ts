import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/services/product-service';
import { withAuth } from '@/middleware/withAuth';

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const products = await getProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc'
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // In a real app, you would use withAuth middleware here
    // For now, we'll proceed without authentication in this route
    const productData = await request.json();
    const newProduct = await createProduct(productData);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 400 }
    );
  }
}