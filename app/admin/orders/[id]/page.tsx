'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Printer, Truck, CreditCard, Package, CheckCircle2, XCircle, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Order, OrderStatus, PaymentStatus } from '@/lib/types/order';
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with actual API call
const mockOrder: Order = {
  id: '1',
  orderNumber: 'ORD-001',
  customerId: 'cust-123',
  customerName: 'John Doe',
  customerEmail: 'john.doe@example.com',
  status: 'processing',
  paymentStatus: 'paid',
  currency: 'USD',
  subtotal: 115.99,
  shipping: 10.00,
  tax: 12.60,
  discount: 0,
  total: 138.59,
  items: [
    {
      id: 'item-1',
      productId: 'prod-123',
      name: 'Premium T-Shirt',
      price: 29.99,
      quantity: 2,
      sku: 'TSHIRT-BLK-L',
    },
    {
      id: 'item-2',
      productId: 'prod-124',
      name: 'Denim Jeans',
      price: 59.99,
      quantity: 1,
      sku: 'JEANS-BLUE-32',
    },
  ],
  shippingAddress: {
    firstName: 'John',
    lastName: 'Doe',
    address1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
  },
  billingAddress: {
    firstName: 'John',
    lastName: 'Doe',
    address1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
    email: 'john.doe@example.com',
  },
  notes: 'Please deliver after 5 PM',
  createdAt: '2025-09-20T10:30:00Z',
  updatedAt: '2025-09-20T10:30:00Z',
  paidAt: '2025-09-20T10:30:00Z',
};

type OrderStatusStep = {
  id: OrderStatus;
  label: string;
  icon: React.ReactNode;
  description: string;
};

const orderStatusSteps: OrderStatusStep[] = [
  {
    id: 'pending',
    label: 'Order Placed',
    icon: <Clock className="h-5 w-5 text-muted-foreground" />,
    description: 'Your order has been received',
  },
  {
    id: 'processing',
    label: 'Processing',
    icon: <Package className="h-5 w-5 text-muted-foreground" />,
    description: 'We are preparing your order',
  },
  {
    id: 'shipped',
    label: 'Shipped',
    icon: <Truck className="h-5 w-5 text-muted-foreground" />,
    description: 'Your order is on the way',
  },
  {
    id: 'delivered',
    label: 'Delivered',
    icon: <CheckCircle2 className="h-5 w-5 text-muted-foreground" />,
    description: 'Your order has been delivered',
  },
  {
    id: 'cancelled',
    label: 'Cancelled',
    icon: <XCircle className="h-5 w-5 text-muted-foreground" />,
    description: 'Order has been cancelled',
  },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Simulate data fetching
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // In a real app, you would fetch the order by ID from your API
        await new Promise(resolve => setTimeout(resolve, 500));
        setOrder(mockOrder);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params?.id, toast]);

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!order) return;
    
    setIsUpdating(true);
    try {
      // In a real app, you would make an API call to update the order status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedOrder = {
        ...order,
        status,
        updatedAt: new Date().toISOString(),
        ...(status === 'shipped' && !order.shippedAt && { shippedAt: new Date().toISOString() }),
        ...(status === 'delivered' && !order.deliveredAt && { deliveredAt: new Date().toISOString() }),
        ...(status === 'cancelled' && !order.cancelledAt && { cancelledAt: new Date().toISOString() }),
      };
      
      setOrder(updatedOrder);
      
      toast({
        title: 'Success',
        description: `Order status updated to ${status}.`,
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <p className="text-muted-foreground mb-6">
          The order you are looking for does not exist or has been removed.
        </p>
        <Button onClick={() => router.push('/admin/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const currentStatusIndex = orderStatusSteps.findIndex(step => step.id === order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="pl-0 mb-2"
            onClick={() => router.push('/admin/orders')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <Badge variant={order.status === 'cancelled' ? 'destructive' : 'default'}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy \'at\' h:mm a')}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/orders/${order.id}/edit`)}
          >
            Edit Order
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Order Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Track the progress of this order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted -translate-x-1/2"></div>
              <div className="space-y-8">
                {orderStatusSteps.map((step, index) => {
                  const isCompleted = index < currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const isFuture = index > currentStatusIndex;
                  
                  return (
                    <div key={step.id} className="relative pl-12">
                      <div
                        className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full ${
                          isCompleted
                            ? 'bg-primary text-primary-foreground'
                            : isCurrent
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          React.cloneElement(step.icon as React.ReactElement, {
                            className: `h-5 w-5 ${
                              isCurrent ? 'text-primary' : 'text-muted-foreground'
                            }`,
                          })
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className={`text-sm font-medium ${
                          isCurrent ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.label}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {isCurrent
                            ? `Order is ${order.status}`
                            : isCompleted
                            ? `Order was ${step.id} on ${format(
                                new Date(order.updatedAt),
                                'MMMM d, yyyy'
                              )}`
                            : step.description}
                        </p>
                      </div>
                      {isCurrent && (
                        <div className="mt-4 space-x-2">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate('processing')}
                              disabled={isUpdating}
                            >
                              {isUpdating ? 'Processing...' : 'Process Order'}
                            </Button>
                          )}
                          {order.status === 'processing' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate('shipped')}
                              disabled={isUpdating}
                            >
                              {isUpdating ? 'Updating...' : 'Mark as Shipped'}
                            </Button>
                          )}
                          {order.status === 'shipped' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate('delivered')}
                              disabled={isUpdating}
                            >
                              {isUpdating ? 'Updating...' : 'Mark as Delivered'}
                            </Button>
                          )}
                          {['pending', 'processing'].includes(order.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate('cancelled')}
                              disabled={isUpdating}
                              className="text-destructive hover:text-destructive"
                            >
                              {isUpdating ? 'Cancelling...' : 'Cancel Order'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        {item.sku && (
                          <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${order.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-destructive">-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <p>Visa ending in 4242</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p>{order.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Date</p>
                      <p>{order.paidAt ? format(new Date(order.paidAt), 'MMM d, yyyy h:mm a') : 'Not paid'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Transaction ID</p>
                      <p>ch_1A2b3C4d5e6f7g8h9i0j</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  View Customer
                </Button>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p className="text-sm">{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && (
                    <p className="text-sm">{order.shippingAddress.address2}</p>
                  )}
                  <p className="text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-sm">{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Phone: {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  View Shipping Details
                </Button>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">
                    {order.billingAddress.firstName} {order.billingAddress.lastName}
                  </p>
                  <p className="text-sm">{order.billingAddress.address1}</p>
                  {order.billingAddress.address2 && (
                    <p className="text-sm">{order.billingAddress.address2}</p>
                  )}
                  <p className="text-sm">
                    {order.billingAddress.city}, {order.billingAddress.state}{' '}
                    {order.billingAddress.postalCode}
                  </p>
                  <p className="text-sm">{order.billingAddress.country}</p>
                  {order.billingAddress.phone && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Phone: {order.billingAddress.phone}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  View Billing Details
                </Button>
              </CardContent>
            </Card>

            {/* Order Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
