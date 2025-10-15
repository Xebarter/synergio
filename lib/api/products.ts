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

  const where = {
    userId,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { sku: { contains: search, mode: 'insensitive' as const } },
        { category: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        sku: true,
        stock: true,
        image: true,
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
  return prisma.product.create({
    data: {
      ...data,
      userId,
    },
  });
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
  return prisma.product.findMany({
    where: { userId },
    distinct: ['category'],
    select: {
      category: true,
    },
    orderBy: {
      category: 'asc',
    },
  });
}
