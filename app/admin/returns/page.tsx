"use client";

import { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
  Calendar,
  User,
  Mail,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { createClient } from '@/lib/supabase/client';

// Define types for our returns data
interface ReturnItem {
  id: string;
  orderId: string;
  customer: string;
  email: string;
  productName: string;
  sku: string;
  returnReason: string;
  returnStatus: 'pending' | 'approved' | 'completed' | 'rejected';
  returnDate: string;
  refundAmount: string;
  refundStatus: string;
}

// Define types for returns summary data
interface ReturnsSummary {
  totalReturns: number;
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  totalRefundValue: string;
}

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<ReturnItem[]>([]);
  const [returnsSummary, setReturnsSummary] = useState<ReturnsSummary>({
    totalReturns: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
    totalRefundValue: 'UGX 0',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refundFilter, setRefundFilter] = useState('all');
  const { toast } = useToast();

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchReturnsData = async () => {
      try {
        const supabase = createClient();
        
        // Fetch returns from Supabase with related data
        const { data, error } = await supabase
          .from('return_details')
          .select(`
            id,
            return_number,
            order_number,
            customer_name,
            user_email,
            product_name,
            product_sku,
            reason,
            status,
            refund_status,
            refund_amount_cents,
            requested_at
          `)
          .order('requested_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        // Transform data to match our ReturnItem interface
        const transformedReturns = (data || []).map((returnItem: any) => {
          return {
            id: returnItem.return_number,
            orderId: returnItem.order_number,
            customer: returnItem.customer_name || 'Unknown Customer',
            email: returnItem.user_email || 'N/A',
            productName: returnItem.product_name || 'Unknown Product',
            sku: returnItem.product_sku || 'N/A',
            returnReason: returnItem.reason || 'Not specified',
            returnStatus: returnItem.status || 'pending',
            returnDate: new Date(returnItem.requested_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            refundAmount: `UGX ${returnItem.refund_amount_cents ? (returnItem.refund_amount_cents / 100).toFixed(2) : '0.00'}`,
            refundStatus: returnItem.refund_status || 'pending',
          };
        });

        setReturns(transformedReturns);
        setFilteredReturns(transformedReturns);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching returns data:', error);
        toast({
          title: "Error",
          description: "Failed to load returns data. Using mock data instead.",
          variant: "destructive",
        });
        
        // Use mock data as fallback
        const mockReturns = [
          {
            id: 'RET-20240101-001',
            orderId: 'SYN-20241201-001',
            customer: 'John Doe',
            email: 'john.doe@example.com',
            productName: 'Premium Wireless Headphones',
            sku: 'HP-1000',
            returnReason: 'Defective product',
            returnStatus: 'pending',
            returnDate: '2024-01-15',
            refundAmount: 'UGX 125,000',
            refundStatus: 'pending',
          },
          {
            id: 'RET-20240102-002',
            orderId: 'SYN-20241201-002',
            customer: 'Jane Smith',
            email: 'jane.smith@example.com',
            productName: 'Smart Fitness Watch',
            sku: 'WATCH-SMRT',
            returnReason: 'Wrong item received',
            returnStatus: 'approved',
            returnDate: '2024-01-14',
            refundAmount: 'UGX 89,500',
            refundStatus: 'processed',
          },
          {
            id: 'RET-20240103-003',
            orderId: 'SYN-20241130-098',
            customer: 'Mike Johnson',
            email: 'mike.johnson@example.com',
            productName: 'Leather Wallet',
            sku: 'WALLET-BRN',
            returnReason: 'Changed mind',
            returnStatus: 'completed',
            returnDate: '2024-01-13',
            refundAmount: 'UGX 49,999',
            refundStatus: 'completed',
          },
          {
            id: 'RET-20240104-004',
            orderId: 'SYN-20241130-097',
            customer: 'Sarah Wilson',
            email: 'sarah.wilson@example.com',
            productName: 'Desk Lamp',
            sku: 'LAMP-DSK',
            returnReason: 'Damaged during shipping',
            returnStatus: 'rejected',
            returnDate: '2024-01-12',
            refundAmount: 'UGX 30,000',
            refundStatus: 'n/a',
          },
          {
            id: 'RET-20240105-005',
            orderId: 'SYN-20241129-085',
            customer: 'Robert Brown',
            email: 'robert.brown@example.com',
            productName: 'Bluetooth Speaker',
            sku: 'SPEAKER-BT',
            returnReason: 'Product not as described',
            returnStatus: 'pending',
            returnDate: '2024-01-11',
            refundAmount: 'UGX 67,800',
            refundStatus: 'pending',
          },
        ];
        
        setReturns(mockReturns);
        setFilteredReturns(mockReturns);
        setIsLoading(false);
      }
    };

    const fetchReturnsSummary = async () => {
      try {
        const supabase = createClient();
        
        // Fetch summary data from Supabase
        const { data, error } = await supabase
          .from('returns')
          .select(`
            status,
            refund_amount_cents
          `);

        if (error) {
          throw new Error(error.message);
        }

        // Calculate summary statistics
        const totalReturns = data.length;
        let pending = 0;
        let approved = 0;
        let completed = 0;
        let rejected = 0;
        let totalRefundValue = 0;

        data.forEach((item: any) => {
          switch (item.status) {
            case 'pending':
              pending++;
              break;
            case 'approved':
              approved++;
              break;
            case 'completed':
              completed++;
              break;
            case 'rejected':
              rejected++;
              break;
          }
          totalRefundValue += item.refund_amount_cents || 0;
        });

        setReturnsSummary({
          totalReturns,
          pending,
          approved,
          completed,
          rejected,
          totalRefundValue: `UGX ${(totalRefundValue / 100).toFixed(2)}`,
        });
      } catch (error) {
        console.error('Error fetching returns summary:', error);
        // Keep default values in case of error
      }
    };

    fetchReturnsData();
    fetchReturnsSummary();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = returns;
    
    if (searchTerm) {
      result = result.filter(item => 
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(item => item.returnStatus === statusFilter);
    }
    
    if (refundFilter !== 'all') {
      result = result.filter(item => item.refundStatus === refundFilter);
    }
    
    setFilteredReturns(result);
  }, [searchTerm, statusFilter, refundFilter, returns]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>;
    }
  };

  const getRefundBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'processed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Processed</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'n/a':
        return <Badge variant="outline">N/A</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your returns report is being generated.",
    });
  };

  const handleImport = () => {
    toast({
      title: "Import Started",
      description: "Your returns data is being imported.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Return Management</h1>
            <p className="text-muted-foreground">
              Manage product returns and refund requests
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleImport} className="w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Import</span>
            </Button>
            <Button onClick={handleExport} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{returnsSummary.totalReturns}</div>
              <p className="text-xs text-muted-foreground">All return requests</p>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{returnsSummary.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{returnsSummary.approved}</div>
              <p className="text-xs text-muted-foreground">Ready for processing</p>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{returnsSummary.completed}</div>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{returnsSummary.rejected}</div>
              <p className="text-xs text-muted-foreground">Declined returns</p>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{returnsSummary.totalRefundValue}</div>
              <p className="text-xs text-muted-foreground">Value of refunds</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search - Responsive */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Return Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile Filters */}
            <div className="mb-4 md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Filter return requests by various criteria
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                        Search
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search by return ID, order ID, customer..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                        Return Status
                      </label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Return Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                        Refund Status
                      </label>
                      <Select value={refundFilter} onValueChange={setRefundFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Refund Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processed">Processed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="n/a">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden md:flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by return ID, order ID, customer..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Return Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={refundFilter} onValueChange={setRefundFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Refund Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="n/a">N/A</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Returns Table - Responsive */}
            <div className="rounded-md border">
              {/* Mobile View - Cards */}
              <div className="md:hidden">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                      Loading returns...
                    </div>
                  </div>
                ) : filteredReturns.length === 0 ? (
                  <div className="p-4 text-center">
                    No return requests found
                  </div>
                ) : (
                  <div className="space-y-3 p-4">
                    {filteredReturns.map((item) => (
                      <Collapsible key={item.id} className="border rounded-lg">
                        <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium">{item.id}</div>
                              <div className="text-sm text-muted-foreground">{item.orderId}</div>
                            </div>
                            <div className="flex flex-col items-end">
                              {getStatusBadge(item.returnStatus)}
                              <div className="text-sm font-medium mt-1">{item.refundAmount}</div>
                            </div>
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="border-t px-4 pb-4">
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                              <div className="text-xs text-muted-foreground">Customer</div>
                              <div className="font-medium flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {item.customer}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Email</div>
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {item.email}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Product</div>
                              <div className="font-medium">{item.productName}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">SKU</div>
                              <div>{item.sku}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Reason</div>
                              <div>{item.returnReason}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Date</div>
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {item.returnDate}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Refund Status</div>
                              <div>{getRefundBadge(item.refundStatus)}</div>
                            </div>
                          </div>
                          <div className="flex justify-end mt-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Process Return</DropdownMenuItem>
                                <DropdownMenuItem>Approve Return</DropdownMenuItem>
                                <DropdownMenuItem>Reject Return</DropdownMenuItem>
                                <DropdownMenuItem>Contact Customer</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Desktop View - Table */}
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Return ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Return Status</TableHead>
                    <TableHead>Refund Amount</TableHead>
                    <TableHead>Refund Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                          Loading returns...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredReturns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        No return requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReturns.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.orderId}</TableCell>
                        <TableCell>
                          <div className="font-medium">{item.customer}</div>
                          <div className="text-sm text-muted-foreground">{item.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-muted-foreground">{item.sku}</div>
                        </TableCell>
                        <TableCell>{item.returnReason}</TableCell>
                        <TableCell>{item.returnDate}</TableCell>
                        <TableCell>{getStatusBadge(item.returnStatus)}</TableCell>
                        <TableCell className="font-medium">{item.refundAmount}</TableCell>
                        <TableCell>{getRefundBadge(item.refundStatus)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Process Return</DropdownMenuItem>
                              <DropdownMenuItem>Approve Return</DropdownMenuItem>
                              <DropdownMenuItem>Reject Return</DropdownMenuItem>
                              <DropdownMenuItem>Contact Customer</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination - Responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredReturns.length} of {returns.length} return requests
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-full sm:w-auto" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}