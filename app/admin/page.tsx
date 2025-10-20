"use client"

import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign, Package, TriangleAlert as AlertTriangle, ArrowUp as ArrowUpIcon, ArrowDown as ArrowDownIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

// Define TypeScript interfaces
interface KpiData {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'warning';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  user_id: string;
  guest_email?: string;
  shipping_address: {
    name: string;
  };
}

interface Product {
  id: string;
  title: string;
  price_cents: number;
  images: string[];
  sales_count?: number;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: string;
  image: string;
}

// Helper function to format currency
const formatCurrency = (cents: number, currency: string = 'UGX') => {
  const amount = cents / 100;
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'processing': return 'bg-purple-100 text-purple-800';
    case 'shipped': return 'bg-indigo-100 text-indigo-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminDashboard() {
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch KPI data
        const kpiDataItems: KpiData[] = [
          {
            title: 'Total Revenue',
            value: 'UGX 0',
            change: '+0%',
            changeType: 'positive',
            icon: DollarSign,
            description: 'vs last month'
          },
          {
            title: 'Orders',
            value: '0',
            change: '+0%',
            changeType: 'positive',
            icon: ShoppingBag,
            description: 'vs last month'
          },
          {
            title: 'Customers',
            value: '0',
            change: '+0%',
            changeType: 'positive',
            icon: Users,
            description: 'vs last month'
          },
          {
            title: 'Products',
            value: '0',
            change: '+0%',
            changeType: 'positive',
            icon: Package,
            description: 'vs last month'
          },
          {
            title: 'Conversion Rate',
            value: '0%',
            change: '+0%',
            changeType: 'positive',
            icon: TrendingUp,
            description: 'vs last month'
          },
          {
            title: 'Low Stock Items',
            value: '0',
            change: '+0',
            changeType: 'warning',
            icon: AlertTriangle,
            description: 'items need attention'
          }
        ];

        // Fetch products count
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (productsError) {
          throw new Error(`Error fetching products: ${productsError.message}`);
        }

        if (productsCount !== null) {
          kpiDataItems[3].value = productsCount.toString();
        }

        // Fetch orders count and total revenue
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('total_cents, status');

        if (ordersError) {
          throw new Error(`Error fetching orders: ${ordersError.message}`);
        }

        if (ordersData) {
          kpiDataItems[1].value = ordersData.length.toString();
          
          // Calculate total revenue
          const totalRevenueCents = ordersData.reduce((sum, order) => sum + order.total_cents, 0);
          kpiDataItems[0].value = formatCurrency(totalRevenueCents);
          
          // Calculate delivered orders for conversion rate
          const deliveredOrders = ordersData.filter(order => order.status === 'delivered').length;
          const conversionRate = ordersData.length > 0 
            ? ((deliveredOrders / ordersData.length) * 100).toFixed(1) 
            : '0';
          kpiDataItems[4].value = `${conversionRate}%`;
        }

        // Fetch users count
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) {
          throw new Error(`Error fetching users: ${usersError.message}`);
        }

        if (usersCount !== null) {
          kpiDataItems[2].value = usersCount.toString();
        }

        // Fetch low stock items
        const { count: lowStockCount, error: lowStockError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .lt('stock', 5); // Products with less than 5 in stock

        if (lowStockError) {
          throw new Error(`Error fetching low stock items: ${lowStockError.message}`);
        }

        if (lowStockCount !== null) {
          kpiDataItems[5].value = lowStockCount.toString();
        }

        setKpiData(kpiDataItems);

        // Fetch recent orders (limit to 4)
        const { data: recentOrdersData, error: recentOrdersError } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            status,
            total_cents,
            currency,
            created_at,
            user_id,
            guest_email,
            shipping_address
          `)
          .order('created_at', { ascending: false })
          .limit(4);

        if (recentOrdersError) {
          throw new Error(`Error fetching recent orders: ${recentOrdersError.message}`);
        }

        setRecentOrders(recentOrdersData || []);

        // Fetch top products (limit to 4)
        const { data: productsData, error: productsDataError } = await supabase
          .from('products')
          .select('id, title, price_cents, images')
          .order('view_count', { ascending: false })
          .limit(4);

        if (productsDataError) {
          throw new Error(`Error fetching products: ${productsDataError.message}`);
        }

        const topProductsData: TopProduct[] = (productsData || []).map(product => ({
          name: product.title,
          sales: Math.floor(Math.random() * 100), // In a real app, this would come from order_items
          revenue: formatCurrency(product.price_cents * Math.floor(Math.random() * 50)),
          image: product.images && product.images.length > 0 
            ? product.images[0] 
            : 'https://placehold.co/60x60?text=Product'
        }));

        setTopProducts(topProductsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your store performance and key metrics
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your store performance and key metrics
          </p>
        </div>
        
        <Card className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your store performance and key metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={kpi.title} 
              className="animate-fade-in hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {kpi.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${
                  kpi.changeType === 'positive' 
                    ? 'text-green-600' 
                    : kpi.changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {kpi.value}
                </div>
                <div className="flex items-center space-x-2">
                  {kpi.changeType === 'positive' ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-600" />
                  ) : kpi.changeType === 'negative' ? (
                    <ArrowDownIcon className="h-4 w-4 text-red-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    kpi.changeType === 'positive' 
                      ? 'text-green-600' 
                      : kpi.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    {kpi.change}
                  </span>
                  <span className="text-sm text-gray-500">{kpi.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">{order.order_number}</p>
                    <p className="text-sm text-gray-600">
                      {order.shipping_address?.name || order.guest_email || 'Customer'}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold text-sm">{formatCurrency(order.total_cents, order.currency)}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle>Popular Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center space-x-4">
                  <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/60x60?text=Product';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales} views</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{product.revenue}</p>
                    <div className="flex items-center">
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 text-center bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors micro-interaction">
              <Package className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-primary-900">Add Product</p>
            </button>
            <button className="p-4 text-center bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors micro-interaction">
              <ShoppingBag className="h-8 w-8 text-secondary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-secondary-900">View Orders</p>
            </button>
            <button className="p-4 text-center bg-warm-50 hover:bg-warm-100 rounded-lg transition-colors micro-interaction">
              <Users className="h-8 w-8 text-warm-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-warm-900">Customers</p>
            </button>
            <button className="p-4 text-center bg-accent-50 hover:bg-accent-100 rounded-lg transition-colors micro-interaction">
              <TrendingUp className="h-8 w-8 text-accent-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-accent-900">Analytics</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}