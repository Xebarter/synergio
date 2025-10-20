'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Order, OrderStatus, PaymentStatus, OrderItem } from '@/lib/types/order';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, this would come from an API
const mockOrder: Order = {
  id: '1',
  orderNumber: 'ORD-001',
  customerId: 'cust-123',
  customerName: 'John Doe',
  customerEmail: 'john.doe@example.com',
  status: 'processing',
  paymentStatus: 'paid',
  currency: 'USD',
  subtotal: 115.98,
  shipping: 10.00,
  tax: 12.60,
  discount: 0,
  total: 138.58,
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

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('order');

  // Form state
  const [formData, setFormData] = useState<{
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    customerName: string;
    customerEmail: string;
    notes: string;
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    items: OrderItem[];
    shippingAddress: Order['shippingAddress'];
    billingAddress: Order['billingAddress'];
    useSameAddress: boolean;
  }>({
    status: 'pending',
    paymentStatus: 'pending',
    customerName: '',
    customerEmail: '',
    notes: '',
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0,
    items: [],
    shippingAddress: {
      firstName: '',
      lastName: '',
      address1: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      email: '',
      phone: '',
    },
    billingAddress: {
      firstName: '',
      lastName: '',
      address1: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      email: '',
    },
    useSameAddress: true,
  });

  // Simulate data fetching
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // In a real app, you would fetch the order by ID from your API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setOrder(mockOrder);
        setFormData({
          status: mockOrder.status,
          paymentStatus: mockOrder.paymentStatus,
          customerName: mockOrder.customerName,
          customerEmail: mockOrder.customerEmail,
          notes: mockOrder.notes || '',
          subtotal: mockOrder.subtotal,
          shipping: mockOrder.shipping,
          tax: mockOrder.tax,
          discount: mockOrder.discount,
          total: mockOrder.total,
          items: [...mockOrder.items],
          shippingAddress: { ...mockOrder.shippingAddress },
          billingAddress: { ...mockOrder.billingAddress },
          useSameAddress: JSON.stringify(mockOrder.shippingAddress) === JSON.stringify(mockOrder.billingAddress),
        });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (type: 'shipping' | 'billing', field: string, value: string) => {
    if (type === 'shipping') {
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: value,
        },
        ...(formData.useSameAddress && {
          billingAddress: {
            ...prev.billingAddress,
            [field]: value,
          },
        }),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value,
        },
      }));
    }
  };

  const handleUseSameAddress = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      useSameAddress: checked,
      billingAddress: checked ? { ...prev.shippingAddress } : prev.billingAddress,
    }));
  };

  const handleItemChange = (id: string, field: keyof OrderItem, value: any) => {
    setFormData(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      });

      // Recalculate totals
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const total = subtotal + prev.shipping + prev.tax - prev.discount;

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        total,
      };
    });
  };

  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      productId: '',
      name: '',
      price: 0,
      quantity: 1,
      sku: '',
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (id: string) => {
    setFormData(prev => {
      const updatedItems = prev.items.filter(item => item.id !== id);
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const total = subtotal + prev.shipping + prev.tax - prev.discount;

      return {
        ...prev,
        items: updatedItems,
        subtotal,
        total,
      };
    });
  };

  const handleCalculateTax = () => {
    // In a real app, you would calculate tax based on the shipping address and items
    const taxRate = 0.1; // 10% tax rate for example
    const tax = formData.subtotal * taxRate;
    
    setFormData(prev => ({
      ...prev,
      tax,
      total: prev.subtotal + prev.shipping + tax - prev.discount,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // In a real app, you would make an API call to update the order
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Order updated successfully.',
      });
      
      // Redirect back to the order details page
      router.push(`/admin/orders/${params?.id || ''}`);
    } catch (error) {
      console.error('Failed to update order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="pl-0 mb-2"
            onClick={() => router.push(`/admin/orders/${order.id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Order
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Order #{order.orderNumber}
          </h1>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/orders/${order.id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-order-form"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <form id="edit-order-form" onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Order Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: OrderStatus) =>
                          setFormData(prev => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentStatus">Payment Status</Label>
                      <Select
                        value={formData.paymentStatus}
                        onValueChange={(value: PaymentStatus) =>
                          setFormData(prev => ({ ...prev, paymentStatus: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                          <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Name</Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email</Label>
                      <Input
                        id="customerEmail"
                        name="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={item.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">Item #{index + 1}</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`item-${item.id}-name`}>Product Name</Label>
                            <Input
                              id={`item-${item.id}-name`}
                              value={item.name}
                              onChange={(e) =>
                                handleItemChange(item.id, 'name', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item-${item.id}-sku`}>SKU</Label>
                            <Input
                              id={`item-${item.id}-sku`}
                              value={item.sku}
                              onChange={(e) =>
                                handleItemChange(item.id, 'sku', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item-${item.id}-price`}>Price</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                              <Input
                                id={`item-${item.id}-price`}
                                type="number"
                                min="0"
                                step="0.01"
                                className="pl-8"
                                value={item.price}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.id,
                                    'price',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`item-${item.id}-quantity`}>Quantity</Label>
                            <Input
                              id={`item-${item.id}-quantity`}
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  'quantity',
                                  parseInt(e.target.value) || 1
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="mt-3 text-right">
                          <span className="font-medium">
                            Total: ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddItem}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add a note about this order..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${formData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Label htmlFor="shipping" className="text-muted-foreground">
                          Shipping
                        </Label>
                      </div>
                      <div className="w-24">
                        <Input
                          id="shipping"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.shipping}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              shipping: parseFloat(e.target.value) || 0,
                              total: prev.subtotal + (parseFloat(e.target.value) || 0) + prev.tax - prev.discount,
                            }))
                          }
                          className="text-right"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Label htmlFor="tax" className="text-muted-foreground">
                          Tax
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <Input
                            id="tax"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.tax}
                            onChange={(e) =>
                              setFormData(prev => ({
                                ...prev,
                                tax: parseFloat(e.target.value) || 0,
                                total: prev.subtotal + prev.shipping + (parseFloat(e.target.value) || 0) - prev.discount,
                              }))
                            }
                            className="text-right"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCalculateTax}
                        >
                          Calculate
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Label htmlFor="discount" className="text-muted-foreground">
                          Discount
                        </Label>
                      </div>
                      <div className="w-24">
                        <Input
                          id="discount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.discount}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              discount: parseFloat(e.target.value) || 0,
                              total: prev.subtotal + prev.shipping + prev.tax - (parseFloat(e.target.value) || 0),
                            }))
                          }
                          className="text-right"
                        />
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${formData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="useSameAddress"
                        checked={formData.useSameAddress}
                        onChange={(e) => handleUseSameAddress(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="useSameAddress">Same as billing address</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingFirstName">First Name</Label>
                        <Input
                          id="shippingFirstName"
                          value={formData.shippingAddress.firstName}
                          onChange={(e) =>
                            handleAddressChange('shipping', 'firstName', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingLastName">Last Name</Label>
                        <Input
                          id="shippingLastName"
                          value={formData.shippingAddress.lastName}
                          onChange={(e) =>
                            handleAddressChange('shipping', 'lastName', e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress1">Address Line 1</Label>
                      <Input
                        id="shippingAddress1"
                        value={formData.shippingAddress.address1}
                        onChange={(e) =>
                          handleAddressChange('shipping', 'address1', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress2">Address Line 2 (Optional)</Label>
                      <Input
                        id="shippingAddress2"
                        value={formData.shippingAddress.address2 || ''}
                        onChange={(e) =>
                          handleAddressChange('shipping', 'address2', e.target.value)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingCity">City</Label>
                        <Input
                          id="shippingCity"
                          value={formData.shippingAddress.city}
                          onChange={(e) =>
                            handleAddressChange('shipping', 'city', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingState">State/Province</Label>
                        <Input
                          id="shippingState"
                          value={formData.shippingAddress.state}
                          onChange={(e) =>
                            handleAddressChange('shipping', 'state', e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingPostalCode">Postal Code</Label>
                        <Input
                          id="shippingPostalCode"
                          value={formData.shippingAddress.postalCode}
                          onChange={(e) =>
                            handleAddressChange('shipping', 'postalCode', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingCountry">Country</Label>
                        <Input
                          id="shippingCountry"
                          value={formData.shippingAddress.country}
                          onChange={(e) =>
                            handleAddressChange('shipping', 'country', e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingPhone">Phone</Label>
                      <Input
                        id="shippingPhone"
                        value={formData.shippingAddress.phone || ''}
                        onChange={(e) =>
                          handleAddressChange('shipping', 'phone', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Information */}
              {!formData.useSameAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingFirstName">First Name</Label>
                          <Input
                            id="billingFirstName"
                            value={formData.billingAddress.firstName}
                            onChange={(e) =>
                              handleAddressChange('billing', 'firstName', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingLastName">Last Name</Label>
                          <Input
                            id="billingLastName"
                            value={formData.billingAddress.lastName}
                            onChange={(e) =>
                              handleAddressChange('billing', 'lastName', e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingAddress1">Address Line 1</Label>
                        <Input
                          id="billingAddress1"
                          value={formData.billingAddress.address1}
                          onChange={(e) =>
                            handleAddressChange('billing', 'address1', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingAddress2">Address Line 2 (Optional)</Label>
                        <Input
                          id="billingAddress2"
                          value={formData.billingAddress.address2 || ''}
                          onChange={(e) =>
                            handleAddressChange('billing', 'address2', e.target.value)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingCity">City</Label>
                          <Input
                            id="billingCity"
                            value={formData.billingAddress.city}
                            onChange={(e) =>
                              handleAddressChange('billing', 'city', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingState">State/Province</Label>
                          <Input
                            id="billingState"
                            value={formData.billingAddress.state}
                            onChange={(e) =>
                              handleAddressChange('billing', 'state', e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingPostalCode">Postal Code</Label>
                          <Input
                            id="billingPostalCode"
                            value={formData.billingAddress.postalCode}
                            onChange={(e) =>
                              handleAddressChange('billing', 'postalCode', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingCountry">Country</Label>
                          <Input
                            id="billingCountry"
                            value={formData.billingAddress.country}
                            onChange={(e) =>
                              handleAddressChange('billing', 'country', e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingEmail">Email</Label>
                        <Input
                          id="billingEmail"
                          type="email"
                          value={formData.billingAddress.email}
                          onChange={(e) =>
                            handleAddressChange('billing', 'email', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
