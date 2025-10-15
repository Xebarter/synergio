import { prisma } from "@/lib/prisma";
import { CustomerData, PaginationOptions } from "@/types/api";

export async function getCustomers({
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
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search } },
      ],
    }),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    data: customers,
    meta: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
  };
}

export async function getCustomerById(id: string, userId: string) {
  return prisma.customer.findFirst({
    where: { id, userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      country: true,
      postalCode: true,
      orders: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          orderDate: true,
          total: true,
        },
        orderBy: { orderDate: 'desc' },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createCustomer(data: CustomerData, userId: string) {
  return prisma.customer.create({
    data: {
      ...data,
      userId,
    },
  });
}

export async function updateCustomer(id: string, data: CustomerData, userId: string) {
  // Verify the customer exists and belongs to the user
  const customer = await prisma.customer.findFirst({
    where: { id, userId },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  return prisma.customer.update({
    where: { id },
    data,
  });
}

export async function deleteCustomer(id: string, userId: string) {
  // Verify the customer exists and belongs to the user
  const customer = await prisma.customer.findFirst({
    where: { id, userId },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  // Check if customer has orders
  const orderCount = await prisma.order.count({
    where: { customerId: id },
  });

  if (orderCount > 0) {
    throw new Error('Cannot delete customer with existing orders');
  }

  return prisma.customer.delete({
    where: { id },
  });
}

export async function searchCustomers(query: string, userId: string) {
  return prisma.customer.findMany({
    where: {
      userId,
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { phone: { contains: query } },
      ],
    },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });
}
