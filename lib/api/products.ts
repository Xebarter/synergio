import { prisma } from "@/lib/prisma";
import { ProductData, PaginationOptions } from "@/types/api";

export async function getProducts({
  userId,
  pagination,
}: {
  userId: string;
  pagination: PaginationOptions;
}) {
  const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
  const skip = (page - 1) * limit;

  const where: any = {
    userId,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' as const } },
      { description: { contains: search, mode: 'insensitive' as const } },
      { sku: { contains: search, mode: 'insensitive' as const } },
      { category: { name: { contains: search, mode: 'insensitive' as const } } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        title: true,
        description: true,
        priceCents: true,
        sku: true,
        stock: true,
        images: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products,
    meta: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
  };
}

export async function getProductById(id: string, userId: string) {
  return prisma.product.findFirst({
    where: { id, userId },
    include: {
      orderItems: {
        select: {
          id: true,
          order: {
            select: {
              id: true,
              orderNumber: true,
              orderDate: true,
              status: true,
              customer: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          quantity: true,
          price: true,
        },
        orderBy: {
          order: {
            orderDate: 'desc',
          },
        },
        take: 10,
      },
    },
  });
}

export async function createProduct(data: ProductData, userId: string) {
  // Generate slug from title
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Prepare the create data with explicit types
  const createData = {
    data: {
      // Required fields from Prisma schema
      title: data.title,
      sku: data.sku || `SKU-${Date.now()}`,
      slug,
      priceCents: data.priceCents,
      stock: data.stock || 0,
      currency: data.currency || 'USD',
      images: data.images || [],
      tags: data.tags || [],
      trackQuantity: data.trackQuantity ?? true,
      allowBackorder: data.allowBackorder ?? false,
      requiresShipping: data.requiresShipping ?? true,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      ratingCount: 0,
      viewCount: 0,
      sortOrder: 0,
      // Optional fields
      ...(data.description && { description: data.description }),
      ...(data.shortDescription && { shortDescription: data.shortDescription }),
      ...(data.compareAtPriceCents && { compareAtPriceCents: data.compareAtPriceCents }),
      ...(data.costCents && { costCents: data.costCents }),
      ...(data.weightGrams && { weightGrams: data.weightGrams }),
      ...(data.seoTitle && { seoTitle: data.seoTitle }),
      ...(data.seoDescription && { seoDescription: data.seoDescription }),
      // JSON fields with defaults
      attributes: data.attributes || {},
      metadata: data.metadata || {},
      // Relations
      user: {
        connect: { id: userId }
      },
      ...(data.categoryId && {
        category: {
          connect: { id: data.categoryId }
        }
      }),
      ...(data.brandId && {
        brand: {
          connect: { id: data.brandId }
        }
      })
    }
  } as const;

  return prisma.product.create(createData);
}

export async function updateProduct(id: string, data: ProductData, userId: string) {
  // Verify the product exists and belongs to the user
  const product = await prisma.product.findFirst({
    where: { id, userId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // If SKU is being updated, check for uniqueness
  if (data.sku && data.sku !== product.sku) {
    const skuExists = await prisma.product.findFirst({
      where: {
        sku: data.sku,
        userId,
        NOT: { id },
      },
    });

    if (skuExists) {
      throw new Error('A product with this SKU already exists');
    }
  }

  return prisma.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: string, userId: string) {
  // Verify the product exists and belongs to the user
  const product = await prisma.product.findFirst({
    where: { id, userId },
    include: {
      orderItems: {
        take: 1,
      },
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Check if product is in any orders
  if (product.orderItems.length > 0) {
    throw new Error('Cannot delete product that is part of existing orders');
  }

  return prisma.product.delete({
    where: { id },
  });
}

export async function updateProductStock(
  id: string,
  quantity: number,
  action: 'increment' | 'decrement',
  userId: string
) {
  // Verify the product exists and belongs to the user
  const product = await prisma.product.findFirst({
    where: { id, userId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Check if we have enough stock for decrement
  if (action === 'decrement' && product.stock < quantity) {
    throw new Error('Insufficient stock');
  }

  return prisma.product.update({
    where: { id },
    data: {
      stock: {
        [action === 'increment' ? 'increment' : 'decrement']: quantity,
      },
    },
  });
}

export async function getProductCategories(userId: string) {
  // First get all unique category IDs
  const products = await prisma.product.findMany({
    where: { 
      userId, 
      category: { 
        isNot: null 
      } 
    },
    select: {
      categoryId: true,
    },
    distinct: ['categoryId'],
  });

  // Then fetch the full category data
  const categoryIds = products.map(p => p.categoryId).filter(Boolean) as string[];
  
  return prisma.category.findMany({
    where: {
      id: { in: categoryIds },
    },
    orderBy: {
      name: 'asc',
    },
  });
}
