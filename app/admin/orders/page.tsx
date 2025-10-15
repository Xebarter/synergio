'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { OrdersTable } from '@/components/admin/orders/orders-table';
import { OrderSummary, OrderStatus, PaymentStatus } from '@/lib/types/order';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  // Fetch orders from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch orders with user information
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            status,
            financial_status,
            total_cents,
            currency,
            created_at,
            updated_at,
            user_id,
            guest_email,
            shipping_address
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        // Transform data to match the OrderSummary interface
        const transformedOrders: OrderSummary[] = (data || []).map(order => {
          // Extract customer name from shipping address or use guest email
          let customerName = 'Unknown Customer';
          if (order.shipping_address?.name) {
            customerName = order.shipping_address.name;
          } else if (order.guest_email) {
            customerName = order.guest_email;
          } else if (order.user_id) {
            customerName = `User ${order.user_id.substring(0, 8)}`;
          }

          return {
            id: order.id,
            orderNumber: order.order_number,
            customerName,
            status: order.status as OrderStatus,
            paymentStatus: order.financial_status as PaymentStatus,
            total: order.total_cents / 100, // Convert cents to dollars
            itemCount: 1, // We'll need to calculate this properly
            createdAt: order.created_at,
            updatedAt: order.updated_at
          };
        });

        setOrders(transformedOrders);
      } catch (err: any) {
        console.error('Failed to fetch orders:', err);
        setError(err.message || 'Failed to load orders. Please try again.');
        toast({
          title: 'Error',
          description: 'Failed to load orders. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        throw new Error(error.message);
      }
      
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
        )
      );
      
      toast({
        title: 'Success',
        description: `Order status updated to ${status}.`,
      });
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update order status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        throw new Error(error.message);
      }
      
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      toast({
        title: 'Success',
        description: 'Order deleted successfully.',
      });
    } catch (err: any) {
      console.error('Failed to delete order:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async (orderIds: string[]) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .in('id', orderIds);

      if (error) {
        throw new Error(error.message);
      }
      
      setOrders(prevOrders => prevOrders.filter(order => !orderIds.includes(order.id)));
      
      toast({
        title: 'Success',
        description: `${orderIds.length} order(s) deleted successfully.`,
      });
    } catch (err: any) {
      console.error('Failed to delete orders:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete orders. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage your store's orders
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => router.push('/admin/orders/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Orders</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage your store's orders
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => router.push('/admin/orders/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <OrdersTable
          orders={orders}
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
        />
      </div>
    </div>
  );
}