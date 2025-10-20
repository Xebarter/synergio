import { prisma } from "@/lib/prisma";
import { OrderData, PaginationOptions } from "@/types/api";
import type { Prisma } from "@prisma/client";

export async function getOrders({
  userId,
  customerId,
  pagination,
}: {
  userId: string;
  customerId?: string;
  pagination: PaginationOptions;
}) {
  const { page = 1, limit = 10, search, sortBy = 'orderDate', sortOrder = 'desc' } = pagination;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(customerId && { customerId }),
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: 'insensitive' as const } },
        { customer: { name: { contains: search, mode: 'insensitive' as const } } },
        { customer: { email: { contains: search, mode: 'insensitive' as const } } },
        { customer: { phone: { contains: search } } },
        { notes: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  // Calculate total for each order
  const ordersWithTotals = orders.map((order: any) => ({
    ...order,
    total: order.orderItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    ),
  }));

  return {
    data: ordersWithTotals,
    meta: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
  };
}

export async function getOrderById(id: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          country: true,
          postalCode: true,
        },
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              description: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!order) return null;

  // Calculate order total
  const total = order.orderItems.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  return {
    ...order,
    total,
  };
}

export async function createOrder(data: OrderData, userId: string) {
  return prisma.$transaction(async (prisma) => {
    // 1. Verify customer exists and belongs to user
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, userId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // 2. Verify all products exist and get their current data
    const productIds = data.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, userId },
    });

    if (products.length !== new Set(productIds).size) {
      throw new Error('One or more products not found');
    }

    // 3. Check stock availability
    const stockIssues = [];
    for (const item of data.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;
      
      if (product.stock < item.quantity) {
        stockIssues.push({
          productId: product.id,
          name: product.name,
          available: product.stock,
          requested: item.quantity,
        });
      }
    }

    if (stockIssues.length > 0) {
      throw new Error(
        `Insufficient stock for ${stockIssues.length} product(s)`,
        { cause: stockIssues }
      );
    }

    // 4. Generate order number (format: ORD-YYYYMMDD-XXXX)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const orderCount = await prisma.order.count({
      where: {
        orderNumber: {
          startsWith: `ORD-${dateStr}`,
        },
      },
    });
    
    const orderNumber = `ORD-${dateStr}-${String(orderCount + 1).padStart(4, '0')}`;

    // 5. Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        userId,
        status: data.status,
        notes: data.notes,
        orderDate: new Date(),
        orderItems: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // 6. Update product stock
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // 7. Calculate and update order total
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { product: true },
    });

    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 8. Update order with total
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { total },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return updatedOrder;
  });
}

export async function updateOrderStatus(id: string, status: string, userId: string) {
  // Verify the order exists and belongs to the user
  const order = await prisma.order.findFirst({
    where: { id, userId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Add any business logic for status transitions here
  // For example, you might want to prevent certain status changes

  return prisma.order.update({
    where: { id },
    data: { status },
  });
}

export async function cancelOrder(id: string, userId: string) {
  return prisma.$transaction(async (prisma) => {
    // 1. Verify the order exists and belongs to the user
    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'CANCELLED') {
      throw new Error('Order is already cancelled');
    }

    // 2. Update order status to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // 3. Restore product stock if order was in a state where items were reserved
    if (['PENDING', 'PROCESSING'].includes(order.status)) {
      for (const item of order.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    return updatedOrder;
  });
}

export async function getOrderStats(userId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case 'day':
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  const [totalOrders, totalRevenue, orderCountByStatus, recentOrders] = await Promise.all([
    // Total orders count
    prisma.order.count({
      where: {
        userId,
        orderDate: { gte: startDate },
      },
    }),

    // Total revenue
    prisma.order.aggregate({
      where: {
        userId,
        orderDate: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      _sum: { total: true },
    }),

    // Order count by status
    prisma.order.groupBy({
      by: ['status'],
      where: {
        userId,
        orderDate: { gte: startDate },
      },
      _count: { _all: true },
    }),

    // Recent orders
    prisma.order.findMany({
      where: {
        userId,
        orderDate: { gte: startDate },
      },
      orderBy: { orderDate: 'desc' },
      take: 5,
      include: {
        customer: {
          select: { name: true },
        },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        orderDate: true,
        customer: true,
      },
    }),
  ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    orderCountByStatus: orderCountByStatus.reduce((acc, { status, _count }) => ({
      ...acc,
      [status]: _count._all,
    }), {}),
    recentOrders,
  };
}
