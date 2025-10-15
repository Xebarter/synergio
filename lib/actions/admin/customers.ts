'use server';

import { createServiceClient } from '@/lib/supabase/service';
import { Customer } from '@/app/admin/customers/columns';

export type CustomerDetails = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  totalOrders: number;
  totalSpent: number;
  lastOrder: Date | null;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    createdAt: Date;
    status: string;
  }>;
};

export async function getCustomerById(id: string): Promise<CustomerDetails | null> {
  try {
    const supabase = createServiceClient();
    
    // Get customer profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'user')
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Get customer orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, total_cents, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return null;
    }

    const totalSpent = orders?.reduce((sum, order) => 
      sum + (order.total_cents ? order.total_cents / 100 : 0), 0) || 0;
    const lastOrder = orders && orders.length > 0 ? orders[0].created_at : null;

    return {
      id: profile.id,
      name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      isActive: true, // Assuming all fetched users are active
      createdAt: new Date(profile.created_at),
      totalOrders: orders?.length || 0,
      totalSpent,
      lastOrder: lastOrder ? new Date(lastOrder) : null,
      recentOrders: orders?.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        total: order.total_cents ? order.total_cents / 100 : 0,
        createdAt: new Date(order.created_at),
        status: order.status,
      })) || [],
    };
  } catch (error) {
    console.error('Error fetching customer:', error);
    // Return mock data for development when database is not available
    if (process.env.NODE_ENV === 'development') {
      return {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1 (555) 123-4567",
        isActive: true,
        createdAt: new Date("2023-01-15"),
        totalOrders: 5,
        totalSpent: 250.00,
        lastOrder: new Date("2023-06-20"),
        recentOrders: [
          {
            id: "101",
            orderNumber: "ORD-001",
            status: "COMPLETED",
            total: 75.50,
            createdAt: new Date("2023-06-20"),
          },
          {
            id: "102",
            orderNumber: "ORD-002",
            status: "COMPLETED",
            total: 45.00,
            createdAt: new Date("2023-05-15"),
          },
          {
            id: "103",
            orderNumber: "ORD-003",
            status: "PENDING",
            total: 130.00,
            createdAt: new Date("2023-04-10"),
          }
        ]
      };
    }
    return null;
  }
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const supabase = createServiceClient();
    
    // Fetch customers (users with role 'user') from profiles table
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        created_at
      `)
      .eq('role', 'user')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // Fetch order data for each customer
    const customersWithOrders = await Promise.all(
      profiles.map(async (profile) => {
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('total_cents')
          .eq('user_id', profile.id);

        if (ordersError) {
          console.error('Error fetching orders for customer:', ordersError);
          return {
            ...profile,
            orders: [],
          };
        }

        return {
          ...profile,
          orders: orders || [],
        };
      })
    );

    // Transform data to match Customer interface
    return customersWithOrders.map((customer) => ({
      id: customer.id,
      name: customer.full_name || 'Unknown',
      email: customer.email,
      phone: customer.phone,
      createdAt: new Date(customer.created_at),
      totalOrders: customer.orders.length,
      totalSpent: customer.orders.reduce((sum, order) => sum + (order.total_cents ? order.total_cents / 100 : 0), 0),
    }));
  } catch (error) {
    console.error('Error fetching customers:', error);
    // Return mock data for development when database is not available
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          phone: "+1 (555) 123-4567",
          createdAt: new Date("2023-01-15"),
          totalOrders: 5,
          totalSpent: 250.00,
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+1 (555) 987-6543",
          createdAt: new Date("2023-02-20"),
          totalOrders: 3,
          totalSpent: 180.50,
        },
        {
          id: "3",
          name: "Robert Johnson",
          email: "robert@example.com",
          phone: "+1 (555) 456-7890",
          createdAt: new Date("2023-03-10"),
          totalOrders: 7,
          totalSpent: 540.75,
        },
        {
          id: "4",
          name: "Emily Williams",
          email: "emily@example.com",
          phone: "+1 (555) 234-5678",
          createdAt: new Date("2023-04-05"),
          totalOrders: 2,
          totalSpent: 95.25,
        },
        {
          id: "5",
          name: "Michael Brown",
          email: "michael@example.com",
          phone: "+1 (555) 876-5432",
          createdAt: new Date("2023-05-12"),
          totalOrders: 4,
          totalSpent: 320.00,
        },
      ];
    }
    throw error;
  }
}

export async function deleteCustomer(id: string) {
  try {
    // Check if customer has any orders
    const supabase = createServiceClient();
    const { count: orderCount, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    if (countError) {
      throw new Error(countError.message);
    }

    if (orderCount && orderCount > 0) {
      throw new Error('Cannot delete customer with existing orders');
    }

    // Delete the customer profile
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw new Error('Failed to delete customer');
  }
}