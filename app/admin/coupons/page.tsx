"use client";

import { useState, useEffect } from 'react';
import { 
  Ticket, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
  Calendar,
  Tag,
  Percent,
  Users,
  Globe,
  Edit,
  Copy,
  BarChart3,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';

// Define types for our coupons data
interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'fixed_amount' | 'percentage' | 'free_shipping';
  discountValue: number;
  minimumAmount: number | null;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  status: 'active' | 'scheduled' | 'expired';
  startDate: string;
  endDate: string | null;
  applicableTo: string;
}

// Define types for coupons summary data
interface CouponsSummary {
  totalCoupons: number;
  active: number;
  scheduled: number;
  expired: number;
  totalUsage: number;
  totalDiscountValue: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [couponsSummary, setCouponsSummary] = useState<CouponsSummary>({
    totalCoupons: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
    totalUsage: 0,
    totalDiscountValue: 'UGX 0',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchCouponsData = async () => {
      try {
        const supabase = createClient();
        
        // Fetch coupons from Supabase
        const { data, error } = await supabase
          .from('coupons')
          .select(`
            id,
            code,
            metadata,
            type,
            value_cents,
            percentage,
            minimum_amount_cents,
            maximum_uses,
            uses_count,
            uses_per_customer,
            starts_at,
            ends_at,
            applicable_products,
            applicable_categories,
            applicable_collections,
            is_active,
            created_at
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        // Transform data to match our Coupon interface
        const transformedCoupons = (data || []).map((coupon: any) => {
          // Determine status based on dates and active flag
          let status: 'active' | 'scheduled' | 'expired' = 'active';
          const now = new Date();
          const startDate = new Date(coupon.starts_at);
          const endDate = coupon.ends_at ? new Date(coupon.ends_at) : null;
          
          if (!coupon.is_active) {
            status = 'expired';
          } else if (startDate > now) {
            status = 'scheduled';
          } else if (endDate && endDate < now) {
            status = 'expired';
          }

          // Determine applicableTo based on which arrays have values
          let applicableTo = 'all_products';
          if (coupon.applicable_products && coupon.applicable_products.length > 0) {
            applicableTo = 'selected_products';
          } else if (coupon.applicable_categories && coupon.applicable_categories.length > 0) {
            applicableTo = 'selected_categories';
          } else if (coupon.applicable_collections && coupon.applicable_collections.length > 0) {
            applicableTo = 'selected_collections';
          }

          // Get name and description from metadata if available
          const name = coupon.metadata?.name || coupon.code;
          const description = coupon.metadata?.description || '';

          return {
            id: coupon.id,
            code: coupon.code,
            name,
            description,
            discountType: coupon.type,
            discountValue: coupon.type === 'percentage' ? coupon.percentage : coupon.value_cents,
            minimumAmount: coupon.minimum_amount_cents,
            maximumDiscount: null, // Not directly available in the schema
            usageLimit: coupon.maximum_uses,
            usedCount: coupon.uses_count,
            status,
            startDate: new Date(coupon.starts_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            endDate: coupon.ends_at ? new Date(coupon.ends_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : 'No expiry',
            applicableTo,
          };
        });

        setCoupons(transformedCoupons);
        setFilteredCoupons(transformedCoupons);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching coupons data:', error);
        toast({
          title: "Error",
          description: "Failed to load coupons data. Using mock data instead.",
          variant: "destructive",
        });
        
        // Use mock data as fallback
        const mockCoupons: Coupon[] = [
          {
            id: '1',
            code: 'WELCOME10',
            name: 'Welcome Discount',
            description: '10% off for new customers',
            discountType: 'percentage',
            discountValue: 10,
            minimumAmount: 50000,
            maximumDiscount: null,
            usageLimit: 100,
            usedCount: 25,
            status: 'active',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            applicableTo: 'all_products',
          },
          {
            id: '2',
            code: 'SAVE20',
            name: 'Big Savings',
            description: '20% off on selected items',
            discountType: 'percentage',
            discountValue: 20,
            minimumAmount: 100000,
            maximumDiscount: 50000,
            usageLimit: 50,
            usedCount: 45,
            status: 'active',
            startDate: '2024-01-10',
            endDate: '2024-03-31',
            applicableTo: 'selected_products',
          },
          {
            id: '3',
            code: 'FREESHIP',
            name: 'Free Shipping',
            description: 'Free shipping on orders over UGX 150,000',
            discountType: 'free_shipping',
            discountValue: 0,
            minimumAmount: 150000,
            maximumDiscount: null,
            usageLimit: 200,
            usedCount: 75,
            status: 'active',
            startDate: '2024-01-01',
            endDate: '2024-06-30',
            applicableTo: 'all_products',
          },
          {
            id: '4',
            code: 'HOLIDAY25',
            name: 'Holiday Sale',
            description: 'UGX 25,000 off on orders over UGX 300,000',
            discountType: 'fixed_amount',
            discountValue: 25000,
            minimumAmount: 300000,
            maximumDiscount: null,
            usageLimit: 75,
            usedCount: 75,
            status: 'expired',
            startDate: '2023-12-01',
            endDate: '2023-12-31',
            applicableTo: 'all_products',
          },
          {
            id: '5',
            code: 'LOYALTY5',
            name: 'Loyalty Discount',
            description: '5% off for loyalty members',
            discountType: 'percentage',
            discountValue: 5,
            minimumAmount: null,
            maximumDiscount: null,
            usageLimit: null,
            usedCount: 210,
            status: 'active',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            applicableTo: 'all_products',
          },
          {
            id: '6',
            code: 'NEWYEAR30',
            name: 'New Year Special',
            description: '30% off on electronics',
            discountType: 'percentage',
            discountValue: 30,
            minimumAmount: 75000,
            maximumDiscount: 100000,
            usageLimit: 30,
            usedCount: 0,
            status: 'scheduled',
            startDate: '2024-01-20',
            endDate: '2024-01-31',
            applicableTo: 'selected_categories',
          },
        ];
        
        setCoupons(mockCoupons);
        setFilteredCoupons(mockCoupons);
        setIsLoading(false);
      }
    };

    const fetchCouponsSummary = async () => {
      try {
        const supabase = createClient();
        
        // Fetch summary data from Supabase
        const { data, error } = await supabase
          .from('coupons')
          .select(`
            is_active,
            starts_at,
            ends_at,
            uses_count
          `);

        if (error) {
          throw new Error(error.message);
        }

        // Calculate summary statistics
        const totalCoupons = data.length;
        let active = 0;
        let scheduled = 0;
        let expired = 0;
        let totalUsage = 0;

        const now = new Date();
        data.forEach((coupon: any) => {
          totalUsage += coupon.uses_count || 0;
          
          if (!coupon.is_active) {
            expired++;
          } else {
            const startDate = new Date(coupon.starts_at);
            const endDate = coupon.ends_at ? new Date(coupon.ends_at) : null;
            
            if (startDate > now) {
              scheduled++;
            } else if (endDate && endDate < now) {
              expired++;
            } else {
              active++;
            }
          }
        });

        setCouponsSummary({
          totalCoupons,
          active,
          scheduled,
          expired,
          totalUsage,
          totalDiscountValue: 'UGX 0', // Would need additional logic to calculate this
        });
      } catch (error) {
        console.error('Error fetching coupons summary:', error);
        // Keep default values in case of error
      }
    };

    fetchCouponsData();
    fetchCouponsSummary();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = coupons;
    
    if (searchTerm) {
      result = result.filter(coupon => 
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(coupon => coupon.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      result = result.filter(coupon => coupon.discountType === typeFilter);
    }
    
    setFilteredCoupons(result);
  }, [searchTerm, statusFilter, typeFilter, coupons]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" /> Scheduled</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" /> Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Badge variant="outline"><Percent className="w-3 h-3 mr-1" /> Percentage</Badge>;
      case 'fixed_amount':
        return <Badge variant="outline"><Tag className="w-3 h-3 mr-1" /> Fixed Amount</Badge>;
      case 'free_shipping':
        return <Badge variant="outline"><Truck className="w-3 h-3 mr-1" /> Free Shipping</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your coupons report is being generated.",
    });
  };

  const handleImport = () => {
    toast({
      title: "Import Started",
      description: "Your coupons data is being imported.",
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: `Coupon code "${code}" has been copied.`,
    });
  };

  const handleCreateCoupon = () => {
    setIsCreateDialogOpen(true);
  };

  const discountTypes = [
    { value: 'percentage', label: 'Percentage' },
    { value: 'fixed_amount', label: 'Fixed Amount' },
    { value: 'free_shipping', label: 'Free Shipping' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'expired', label: 'Expired' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Coupon Management</h1>
            <p className="text-muted-foreground">
              Create and manage discount coupons
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
            <Button onClick={handleCreateCoupon} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">New Coupon</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{couponsSummary.totalCoupons}</div>
              <p className="text-xs text-muted-foreground">All coupons</p>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{couponsSummary.active}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{couponsSummary.scheduled}</div>
              <p className="text-xs text-muted-foreground">Upcoming coupons</p>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{couponsSummary.expired}</div>
              <p className="text-xs text-muted-foreground">Past coupons</p>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{couponsSummary.totalUsage}</div>
              <p className="text-xs text-muted-foreground">Times used</p>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{couponsSummary.totalDiscountValue}</div>
              <p className="text-xs text-muted-foreground">Discount given</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search - Responsive */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Coupons
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
                      Filter coupons by various criteria
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
                          placeholder="Search by code, name, description..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                        Status
                      </label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {statusOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                        Discount Type
                      </label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Discount Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {discountTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
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
                  placeholder="Search by code, name, description..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Discount Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {discountTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Coupons Table - Responsive */}
            <div className="rounded-md border">
              {/* Mobile View - Cards */}
              <div className="md:hidden">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                      Loading coupons...
                    </div>
                  </div>
                ) : filteredCoupons.length === 0 ? (
                  <div className="p-4 text-center">
                    No coupons found
                  </div>
                ) : (
                  <div className="space-y-3 p-4">
                    {filteredCoupons.map((coupon) => (
                      <Collapsible key={coupon.id} className="border rounded-lg">
                        <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium flex items-center">
                                {coupon.code}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 ml-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyCode(coupon.code);
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-sm text-muted-foreground">{coupon.name}</div>
                            </div>
                            <div className="flex flex-col items-end">
                              {getStatusBadge(coupon.status)}
                              <div className="text-sm font-medium mt-1">
                                {coupon.discountType === 'percentage' && `${coupon.discountValue}%`}
                                {coupon.discountType === 'fixed_amount' && `UGX ${coupon.discountValue.toLocaleString()}`}
                                {coupon.discountType === 'free_shipping' && 'Free Shipping'}
                              </div>
                            </div>
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="border-t px-4 pb-4">
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                              <div className="text-xs text-muted-foreground">Description</div>
                              <div>{coupon.description}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Discount Type</div>
                              <div>{getTypeBadge(coupon.discountType)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Min. Amount</div>
                              <div>{coupon.minimumAmount ? `UGX ${coupon.minimumAmount.toLocaleString()}` : 'None'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Usage</div>
                              <div>{coupon.usedCount} / {coupon.usageLimit || '∞'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Start Date</div>
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {coupon.startDate}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">End Date</div>
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {coupon.endDate}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end mt-3 space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Deactivate</DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
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
                    <TableHead>Coupon</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Min. Amount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                          Loading coupons...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCoupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        No coupons found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div className="font-medium flex items-center">
                            {coupon.code}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 ml-2"
                              onClick={() => handleCopyCode(coupon.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{coupon.name}</TableCell>
                        <TableCell>{coupon.description}</TableCell>
                        <TableCell className="font-medium">
                          {coupon.discountType === 'percentage' && `${coupon.discountValue}%`}
                          {coupon.discountType === 'fixed_amount' && `UGX ${coupon.discountValue.toLocaleString()}`}
                          {coupon.discountType === 'free_shipping' && 'Free Shipping'}
                        </TableCell>
                        <TableCell>{getTypeBadge(coupon.discountType)}</TableCell>
                        <TableCell>
                          {coupon.minimumAmount ? `UGX ${coupon.minimumAmount.toLocaleString()}` : 'None'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                            {coupon.usedCount} / {coupon.usageLimit || '∞'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3 w-3 mr-1" />
                              {coupon.startDate}
                            </div>
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3 w-3 mr-1" />
                              {coupon.endDate}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(coupon.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Deactivate</DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
                Showing {filteredCoupons.length} of {coupons.length} coupons
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

      {/* Create Coupon Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
            <DialogDescription>
              Create a new discount coupon for your customers
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                    Coupon Code
                  </label>
                  <Input placeholder="e.g. WELCOME10" />
                </div>
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                    Coupon Name
                  </label>
                  <Input placeholder="e.g. Welcome Discount" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                  Description
                </label>
                <Input placeholder="e.g. 10% off for new customers" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                    Discount Type
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {discountTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                    Discount Value
                  </label>
                  <Input type="number" placeholder="e.g. 10" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                    Minimum Order Amount
                  </label>
                  <Input type="number" placeholder="e.g. 50000" />
                </div>
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                    Maximum Discount
                  </label>
                  <Input type="number" placeholder="e.g. 50000" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                    Usage Limit
                  </label>
                  <Input type="number" placeholder="e.g. 100" />
                </div>
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                    Applicable To
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_products">All Products</SelectItem>
                      <SelectItem value="selected_products">Selected Products</SelectItem>
                      <SelectItem value="selected_categories">Selected Categories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                    Start Date
                  </label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                    End Date
                  </label>
                  <Input type="date" />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Coupon Created",
                    description: "Your new coupon has been created successfully.",
                  });
                  setIsCreateDialogOpen(false);
                }}>
                  Create Coupon
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}