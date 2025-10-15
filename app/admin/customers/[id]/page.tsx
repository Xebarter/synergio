import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  ShoppingCart, 
  DollarSign,
  MapPin,
  CreditCard,
  Package,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { getCustomerById } from "@/lib/actions/admin/customers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data for when database is not available
const mockCustomer = {
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
      total: 75.50,
      createdAt: new Date("2023-06-20"),
      status: "COMPLETED"
    },
    {
      id: "102",
      orderNumber: "ORD-002",
      total: 45.00,
      createdAt: new Date("2023-05-15"),
      status: "COMPLETED"
    },
    {
      id: "103",
      orderNumber: "ORD-003",
      total: 130.00,
      createdAt: new Date("2023-04-10"),
      status: "PENDING"
    }
  ]
};

export default async function CustomerPage({ params }: { params: { id: string } }) {
  let customer = null;
  let error = null;
  
  try {
    customer = await getCustomerById(params.id);
  } catch (err) {
    console.error("Failed to fetch customer:", err);
    error = "Failed to load customer data. Displaying mock data for demonstration purposes.";
    // For demo purposes, we'll use mock data when there's an error
    customer = mockCustomer;
  }

  if (!customer) {
    notFound();
  }

  // Calculate customer lifetime value
  const clv = customer.totalSpent;
  
  // Calculate order frequency (days between orders)
  const orderFrequency = customer.totalOrders > 1 && customer.lastOrder 
    ? Math.round((new Date().getTime() - new Date(customer.createdAt).getTime()) / (1000 * 3600 * 24 * customer.totalOrders))
    : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/customers">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Customer Details</h1>
            <p className="text-muted-foreground">Detailed information about {customer.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Customer</Button>
          <Button>Send Message</Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Customer Overview */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{customer.name}</h2>
                  <p className="text-muted-foreground">{customer.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">
                  {customer.totalOrders} Orders
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Total Spent
                </p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(customer.totalSpent || 0)}
                </p>
              </div>
              <div className="space-y-1 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Customer Since</p>
                <p className="text-lg font-medium">
                  {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="space-y-1 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Last Order</p>
                <p className="text-lg font-medium">
                  {customer.lastOrder ? (
                    format(new Date(customer.lastOrder), 'MMM d, yyyy')
                  ) : (
                    'No orders yet'
                  )}
                </p>
              </div>
              <div className="space-y-1 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Lifetime Value</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(clv || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${customer.email}`} className="hover:underline">
                    {customer.email}
                  </a>
                </div>
              </div>
              {customer.phone && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${customer.phone}`} className="hover:underline">
                      {customer.phone}
                    </a>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-muted-foreground">
                    No address information available
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Statistics */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Order Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{customer.totalOrders}</p>
                </div>
                <div className="space-y-1 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
                  <p className="text-xl font-bold">
                    {customer.totalOrders > 0
                      ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format((customer.totalSpent || 0) / customer.totalOrders)
                      : '$0.00'}
                  </p>
                </div>
                <div className="space-y-1 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Order Frequency</p>
                  <p className="text-xl font-bold">
                    {orderFrequency > 0 ? `${orderFrequency} days` : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Preferred Payment</p>
                  <p className="text-lg font-medium">Credit Card</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Recent Orders</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/orders?customerId=${customer.id}`}>
                  View all orders
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customer.recentOrders && customer.recentOrders.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
                    <div>Order</div>
                    <div>Date</div>
                    <div className="text-right">Amount</div>
                    <div className="text-right">Status</div>
                  </div>
                  {customer.recentOrders.map((order) => (
                    <div key={order.id} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/30">
                      <div className="font-medium">#{order.orderNumber}</div>
                      <div>{format(new Date(order.createdAt), 'MMM d, yyyy')}</div>
                      <div className="text-right font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(order.total || 0)}
                      </div>
                      <div className="text-right">
                        <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
                <p>No recent orders</p>
                <p className="text-sm mt-1">This customer hasn't placed any orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}