"use client";

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Printer,
  Eye,
  Mail,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';

// Define types for our reports data
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  lastGenerated: string;
  frequency: string;
}

interface GeneratedReport {
  id: string;
  name: string;
  generatedDate: string;
  generatedBy: string;
  format: string;
  size: string;
}

export default function AdminReportsPage() {
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('last_7_days');
  const { toast } = useToast();

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        const supabase = createClient();
        
        // Fetch report templates from Supabase
        const { data: templatesData, error: templatesError } = await supabase
          .from('reports')
          .select(`
            id,
            name,
            description,
            category,
            frequency,
            generated_at
          `)
          .eq('type', 'automated')
          .order('name');

        if (templatesError) {
          throw new Error(templatesError.message);
        }

        // Transform templates data to match our ReportTemplate interface
        const transformedTemplates = (templatesData || []).map((template: any) => ({
          id: template.id,
          name: template.name,
          description: template.description || '',
          category: template.category || 'General',
          lastGenerated: template.generated_at 
            ? new Date(template.generated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : 'Never',
          frequency: template.frequency || 'manual'
        }));

        // Fetch generated reports from Supabase
        const { data: reportsData, error: reportsError } = await supabase
          .from('report_details')
          .select(`
            id,
            name,
            generated_at,
            generated_by_name,
            format,
            file_size_bytes
          `)
          .order('generated_at', { ascending: false })
          .limit(10);

        if (reportsError) {
          throw new Error(reportsError.message);
        }

        // Transform reports data to match our GeneratedReport interface
        const transformedReports = (reportsData || []).map((report: any) => ({
          id: report.id,
          name: report.name,
          generatedDate: report.generated_at 
            ? new Date(report.generated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : 'Unknown',
          generatedBy: report.generated_by_name || 'System',
          format: report.format?.toUpperCase() || 'PDF',
          size: report.file_size_bytes 
            ? `${(report.file_size_bytes / (1024 * 1024)).toFixed(1)} MB`
            : 'Unknown'
        }));

        setReportTemplates(transformedTemplates);
        setGeneratedReports(transformedReports);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching reports data:', error);
        toast({
          title: "Error",
          description: "Failed to load reports data. Using mock data instead.",
          variant: "destructive",
        });
        
        // Use mock data as fallback
        const mockReportTemplates = [
          {
            id: '1',
            name: "Sales Report",
            description: "Detailed sales performance report",
            category: "Sales",
            lastGenerated: "2024-01-15",
            frequency: "Daily"
          },
          {
            id: '2',
            name: "Inventory Report",
            description: "Current inventory levels and stock status",
            category: "Inventory",
            lastGenerated: "2024-01-15",
            frequency: "Weekly"
          },
          {
            id: '3',
            name: "Customer Report",
            description: "Customer demographics and behavior analysis",
            category: "Customers",
            lastGenerated: "2024-01-10",
            frequency: "Monthly"
          },
          {
            id: '4',
            name: "Financial Report",
            description: "Revenue, expenses, and profit analysis",
            category: "Finance",
            lastGenerated: "2023-12-31",
            frequency: "Monthly"
          },
          {
            id: '5',
            name: "Product Performance",
            description: "Top selling products and categories",
            category: "Sales",
            lastGenerated: "2024-01-15",
            frequency: "Daily"
          },
          {
            id: '6',
            name: "Order Status Report",
            description: "Order fulfillment and shipping status",
            category: "Operations",
            lastGenerated: "2024-01-15",
            frequency: "Daily"
          }
        ];

        const mockGeneratedReports = [
          {
            id: '101',
            name: "Daily Sales Report - Jan 15, 2024",
            generatedDate: "2024-01-15",
            generatedBy: "System",
            format: "PDF",
            size: "2.4 MB"
          },
          {
            id: '102',
            name: "Weekly Inventory Report - Week 3",
            generatedDate: "2024-01-14",
            generatedBy: "Admin User",
            format: "Excel",
            size: "1.8 MB"
          },
          {
            id: '103',
            name: "Monthly Financial Report - Dec 2023",
            generatedDate: "2023-12-31",
            generatedBy: "System",
            format: "PDF",
            size: "5.2 MB"
          },
          {
            id: '104',
            name: "Customer Analysis - Q4 2023",
            generatedDate: "2023-12-30",
            generatedBy: "Admin User",
            format: "Excel",
            size: "3.7 MB"
          }
        ];

        setReportTemplates(mockReportTemplates);
        setGeneratedReports(mockGeneratedReports);
        setIsLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  const handleGenerateReport = (reportName: string) => {
    toast({
      title: "Report Generation Started",
      description: `Generating ${reportName}. This may take a few moments.`,
    });
  };

  const handleDownloadReport = (reportName: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${reportName}.`,
    });
  };

  const handlePrintReport = (reportName: string) => {
    toast({
      title: "Print Started",
      description: `Preparing ${reportName} for printing.`,
    });
  };

  const handleEmailReport = (reportName: string) => {
    toast({
      title: "Email Started",
      description: `Sending ${reportName} via email.`,
    });
  };

  const reportCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Inventory', label: 'Inventory' },
    { value: 'Customers', label: 'Customers' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Operations', label: 'Operations' }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Generate, view, and manage business reports
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">New Report</span>
            </Button>
          </div>
        </div>

        {/* Filters - Responsive */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
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
                      Customize which reports to display
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    <div>
                      <Label htmlFor="report-type">Report Type</Label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger id="report-type">
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportCategories.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="date-range">Date Range</Label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger id="date-range">
                          <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                          <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                          <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                          <SelectItem value="last_year">Last Year</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden md:flex flex-wrap gap-4">
              <div className="w-48">
                <Label htmlFor="report-type-desktop" className="text-xs">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type-desktop">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-48">
                <Label htmlFor="date-range-desktop" className="text-xs">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger id="date-range-desktop">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Report Templates</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{report.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleGenerateReport(report.name)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {report.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded">
                      {report.category}
                    </span>
                    <span className="text-muted-foreground">
                      {report.frequency}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Last generated: {report.lastGenerated}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Generated Reports */}
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Generated Reports</h2>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Generated Date</TableHead>
                    <TableHead>Generated By</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.generatedDate}</TableCell>
                      <TableCell>{report.generatedBy}</TableCell>
                      <TableCell>
                        <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                          {report.format}
                        </span>
                      </TableCell>
                      <TableCell>{report.size}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownloadReport(report.name)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrintReport(report.name)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEmailReport(report.name)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGenerateReport(report.name)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Regenerate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}