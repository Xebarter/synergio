"use client";

import { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ChevronDown
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

// Define types for our inventory items
interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  inStock: number;
  reserved: number;
  available: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
}

// Inventory summary data
const inventorySummary = {
  totalProducts: 124,
  inStock: 89,
  lowStock: 12,
  outOfStock: 23,
  totalValue: 'UGX 45.2M',
};

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const supabase = createClient();
        
        // Fetch products with their categories from Supabase
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            sku,
            stock_quantity,
            updated_at,
            category:categories(name)
          `)
          .order('updated_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        // Transform data to match our InventoryItem interface
        const transformedInventory = (data || []).map((product: any) => {
          // Determine stock status
          let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
          if (product.stock_quantity === 0) {
            status = 'out_of_stock';
          } else if (product.stock_quantity <= 10) {
            status = 'low_stock';
          }

          return {
            id: product.id,
            productName: product.name,
            sku: product.sku,
            category: product.category?.name || 'Uncategorized',
            inStock: product.stock_quantity,
            reserved: Math.floor(Math.random() * Math.min(5, product.stock_quantity)), // Mock reserved quantity
            available: Math.max(0, product.stock_quantity - Math.floor(Math.random() * Math.min(5, product.stock_quantity))),
            status,
            lastUpdated: new Date(product.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          };
        });

        setInventory(transformedInventory);
        setFilteredInventory(transformedInventory);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        toast({
          title: "Error",
          description: "Failed to load inventory data. Using mock data instead.",
          variant: "destructive",
        });
        
        // Use mock data as fallback
        const mockInventory = [
          {
            id: '1',
            productName: 'Premium Wireless Headphones',
            sku: 'HP-1000',
            category: 'Electronics',
            inStock: 25,
            reserved: 5,
            available: 20,
            status: 'in_stock',
            lastUpdated: '2024-01-15',
          },
          {
            id: '2',
            productName: 'Leather Wallet',
            sku: 'WALLET-BRN',
            category: 'Accessories',
            inStock: 0,
            reserved: 0,
            available: 0,
            status: 'out_of_stock',
            lastUpdated: '2024-01-14',
          },
          {
            id: '3',
            productName: 'Premium T-Shirt',
            sku: 'TSHIRT-BLK',
            category: 'Clothing',
            inStock: 100,
            reserved: 15,
            available: 85,
            status: 'in_stock',
            lastUpdated: '2024-01-16',
          },
          {
            id: '4',
            productName: 'Smart Fitness Watch',
            sku: 'WATCH-SMRT',
            category: 'Electronics',
            inStock: 5,
            reserved: 3,
            available: 2,
            status: 'low_stock',
            lastUpdated: '2024-01-16',
          },
          {
            id: '5',
            productName: 'Desk Lamp',
            sku: 'LAMP-DSK',
            category: 'Home',
            inStock: 30,
            reserved: 2,
            available: 28,
            status: 'in_stock',
            lastUpdated: '2024-01-13',
          },
          {
            id: '6',
            productName: 'Bluetooth Speaker',
            sku: 'SPEAKER-BT',
            category: 'Electronics',
            inStock: 3,
            reserved: 1,
            available: 2,
            status: 'low_stock',
            lastUpdated: '2024-01-15',
          },
        ];
        
        setInventory(mockInventory);
        setFilteredInventory(mockInventory);
        setIsLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = inventory;
    
    if (searchTerm) {
      result = result.filter(item => 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    setFilteredInventory(result);
  }, [searchTerm, categoryFilter, statusFilter, inventory]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> In Stock</Badge>;
      case 'low_stock':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertTriangle className="w-3 h-3 mr-1" /> Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertTriangle className="w-3 h-3 mr-1" /> Out of Stock</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>;
    }
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your inventory report is being generated.",
    });
  };

  const handleImport = () => {
    toast({
      title: "Import Started",
      description: "Your inventory file is being processed.",
    });
  };

  const uniqueCategories = Array.from(new Set(inventory.map(item => item.category)));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground">
              Manage your product inventory and stock levels
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventorySummary.totalProducts}</div>
              <p className="text-xs text-muted-foreground">All products in catalog</p>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Stock</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{inventorySummary.inStock}</div>
              <p className="text-xs text-muted-foreground">Available for sale</p>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inventorySummary.lowStock}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{inventorySummary.outOfStock}</div>
              <p className="text-xs text-muted-foreground">Not available</p>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventorySummary.totalValue}</div>
              <p className="text-xs text-muted-foreground">Estimated retail value</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search - Responsive */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Items
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
                      Filter inventory items by various criteria
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
                          placeholder="Search by product name or SKU..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2">
                        Category
                      </label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {uniqueCategories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          <SelectItem value="in_stock">In Stock</SelectItem>
                          <SelectItem value="low_stock">Low Stock</SelectItem>
                          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
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
                  placeholder="Search by product name or SKU..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Inventory Table - Responsive */}
            <div className="rounded-md border">
              {/* Mobile View - Cards */}
              <div className="md:hidden">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                      Loading inventory...
                    </div>
                  </div>
                ) : filteredInventory.length === 0 ? (
                  <div className="p-4 text-center">
                    No inventory items found
                  </div>
                ) : (
                  <div className="space-y-3 p-4">
                    {filteredInventory.map((item) => (
                      <Collapsible key={item.id} className="border rounded-lg">
                        <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="font-medium">{item.productName}</div>
                            {getStatusBadge(item.status)}
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="border-t px-4 pb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            <div>
                              <div className="text-xs text-muted-foreground">SKU</div>
                              <div className="font-medium">{item.sku}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Category</div>
                              <div>{item.category}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">In Stock</div>
                              <div>{item.inStock}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Reserved</div>
                              <div>{item.reserved}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Available</div>
                              <div className="font-medium">{item.available}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Last Updated</div>
                              <div>{item.lastUpdated}</div>
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
                                <DropdownMenuItem>Edit Product</DropdownMenuItem>
                                <DropdownMenuItem>Adjust Stock</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Delete Product</DropdownMenuItem>
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
              <div className="hidden md:block w-full overflow-x-auto">
                <Table className="min-w-[1000px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>In Stock</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                            Loading inventory...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          No inventory items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.inStock}</TableCell>
                          <TableCell>{item.reserved}</TableCell>
                          <TableCell className="font-medium">{item.available}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>{item.lastUpdated}</TableCell>
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
                                <DropdownMenuItem>Edit Product</DropdownMenuItem>
                                <DropdownMenuItem>Adjust Stock</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Delete Product</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination - Responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredInventory.length} of {inventory.length} items
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