'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { 
  Edit, 
  Trash,
  Search,
  MapPin,
  Tag,
  CircleEllipsis,
  Plus,
  Star,
  Clock,
  ArrowUpDown,
  Eye,
  Briefcase,
  Building
} from 'lucide-react';

import { ServiceType, getCategoryDisplayName, getSubcategoryDisplayName } from '@/types/services';
import { ServiceCategory, Subcategory } from '@/types/common';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export function ServicesList() {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    category: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  // Fetch services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        // First, fetch base_items and services separately to avoid typing issues
        const { data: baseItemsData, error: baseItemsError } = await supabase
          .from('base_items')
          .select(`
            id, name, type, short_description, long_description, main_image,
            gallery_images, address, coordinates, area, contact_info, hours,
            open_24h, rating, tags, price_range, currency, features, languages,
            updated_at, is_sponsored, is_featured, payment_methods, accessibility
          `)
          .eq('type', 'service');

        if (baseItemsError) {
          throw baseItemsError;
        }

        if (!baseItemsData || baseItemsData.length === 0) {
          setServices([]);
          setCategories([]);
          setLoading(false);
          return;
        }

        // Fetch service details for each base item
        const serviceIds = baseItemsData.map(item => item.id);
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, category, subcategory, service_data')
          .in('id', serviceIds);

        if (servicesError) {
          throw servicesError;
        }

        // Create a map of service details by id for easier lookup
        const serviceDetailsMap = new Map();
        servicesData?.forEach(service => {
          serviceDetailsMap.set(service.id, service);
        });

        // Format services data to match the ServiceType interface
        const formattedServices = baseItemsData.map(item => {
          const serviceDetails = serviceDetailsMap.get(item.id);
          
          if (!serviceDetails) {
            console.error(`Service ${item.id} (${item.name}) has missing service details`);
            return null;
          }
          
          return {
            id: item.id,
            name: item.name,
            type: item.type,
            category: serviceDetails.category,
            subcategory: serviceDetails.subcategory,
            mainImage: item.main_image,
            galleryImages: item.gallery_images,
            shortDescription: item.short_description,
            longDescription: item.long_description,
            address: item.address,
            coordinates: item.coordinates,
            area: item.area,
            contactInfo: item.contact_info,
            hours: item.hours,
            open24h: item.open_24h,
            rating: item.rating,
            tags: item.tags || [],
            priceRange: item.price_range,
            currency: item.currency,
            features: item.features || [],
            languages: item.languages,
            updatedAt: item.updated_at,
            isSponsored: item.is_sponsored,
            isFeatured: item.is_featured,
            paymentMethods: item.payment_methods,
            accessibility: item.accessibility,
            serviceData: serviceDetails.service_data
          } as ServiceType;
        });

        // Filter out any null entries and then extract unique categories
        const validServices = formattedServices.filter(service => service !== null);
        const uniqueCategories = [...new Set(validServices.map(service => service!.category))];
        
        setServices(validServices as ServiceType[]);
        setCategories(uniqueCategories as string[]);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch services. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [toast]);

  // Get category badge variant
  const getCategoryVariant = (category?: ServiceCategory) => {
    if (!category) return 'secondary';
    
    try {
      switch (category) {
        case ServiceCategory.ACCOMMODATION: return 'default';
        case ServiceCategory.MOBILITY: return 'outline';
        case ServiceCategory.HEALTH: return 'destructive';
        case ServiceCategory.WELLNESS: return 'secondary';
        case ServiceCategory.REAL_ESTATE: return 'default';
        default: return 'secondary';
      }
    } catch (error) {
      console.error(`Error getting category variant for ${category}:`, error);
      return 'secondary';
    }
  };

  // Table columns definition
  const columns: ColumnDef<ServiceType>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-medium"
        >
          Service
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const service = row.original;
        return (
          <div 
            className="flex items-center gap-3 cursor-pointer py-1.5 max-w-md"
            onClick={() => router.push(`/dashboard/services/${service.id}/view`)}
          >
            <div className="relative flex-shrink-0 h-12 w-12">
              {service.mainImage ? (
                <img
                  src={service.mainImage}
                  alt={`${service.name} thumbnail`}
                  className="w-12 h-12 rounded-md object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                  <Building className="h-6 w-6 text-muted-foreground/60" />
                </div>
              )}
            </div>
            <div className="space-y-0.5 text-left">
              <div className="font-medium truncate">{service.name}</div>
              <div className="flex items-center gap-1">
                {service.category ? (
                  <Badge variant={getCategoryVariant(service.category as ServiceCategory)} className="text-xs">
                    {getCategoryDisplayName(service.category as ServiceCategory)}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Uncategorized</Badge>
                )}
                {service.isFeatured && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as ServiceCategory;
        return <div>{category ? getCategoryDisplayName(category) : 'Uncategorized'}</div>;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'subcategory',
      header: 'Type',
      cell: ({ row }) => {
        const subcategory = row.getValue('subcategory') as Subcategory;
        return (
          <div className="font-medium text-sm">
            {subcategory ? getSubcategoryDisplayName(subcategory) : 'Not specified'}
          </div>
        );
      },
    },
    {
      accessorKey: 'address',
      header: () => (
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
          <span>Location</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-sm max-w-[180px]">
          <div className="truncate">{row.getValue('address') || 'Not set'}</div>
          {row.original.area && (
            <div className="text-xs text-muted-foreground">
              Area: {row.original.area}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'rating',
      header: () => (
        <div className="flex items-center gap-2">
          <Star className="h-3.5 w-3.5 text-muted-foreground/70" />
          <span>Rating</span>
        </div>
      ),
      cell: ({ row }) => {
        const rating = row.original.rating;
        return (
          <div className="flex items-center gap-1">
            <span className="text-amber-500 text-sm font-medium">
              {rating ? rating.score.toFixed(1) : '-'}
            </span>
            {rating && rating.reviewCount > 0 && (
              <span className="text-xs text-muted-foreground">({rating.reviewCount})</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'priceRange',
      header: 'Price',
      cell: ({ row }) => {
        const priceRange = row.getValue('priceRange') as string;
        return (
          <div className="text-sm font-medium">
            {priceRange}
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const service = row.original;

        const handleDelete = async () => {
          if (confirm(`Are you sure you want to delete "${service.name}"?`)) {
            try {
              const response = await fetch(`/api/dashboard/services/${service.id}`, {
                method: 'DELETE',
              });
              
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete service');
              }

              // Update local state to remove the deleted service
              setServices(services.filter((s) => s.id !== service.id));

              toast({
                title: 'Service deleted',
                description: `"${service.name}" has been deleted successfully`,
              });
            } catch (error) {
              console.error('Error deleting service:', error);
              toast({
                title: 'Error',
                description: 'Failed to delete service. Please try again.',
                variant: 'destructive',
              });
            }
          }
        };

        return (
          <TooltipProvider>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">Open menu</span>
                  <CircleEllipsis className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/services/${service.id}/view`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/services/${service.id}/edit`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit className="h-4 w-4" />
                  Edit Service
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(service.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Copy Service ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                      Delete Service
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">This action cannot be undone</p>
                  </TooltipContent>
                </Tooltip>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        );
      },
    },
  ];

  const table = useReactTable({
    data: services,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-10">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('name')?.setFilterValue(event.target.value)
              }
              className="pl-9 w-[280px] md:w-[320px]"
            />
          </div>
          
          {categories.length > 0 && (
            <Select
              value={(table.getColumn('category')?.getFilterValue() as string) ?? ''}
              onValueChange={(value) => {
                if (table.getColumn('category')) {
                  table.getColumn('category')?.setFilterValue(value === 'all' ? '' : value);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(Boolean).map((category) => (
                  <SelectItem key={category} value={category}>
                    {getCategoryDisplayName(category as ServiceCategory)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <Link href="/dashboard/services/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Service
          </Button>
        </Link>
      </div>
      
      <Card className="overflow-hidden border-border/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="font-medium">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="transition-colors hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No services found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} service(s) total
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
} 