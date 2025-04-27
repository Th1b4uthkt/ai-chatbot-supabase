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
  Coffee,
  ShoppingBag
} from 'lucide-react';

import { Activity, getCategoryDisplayName, getSubcategoryDisplayName } from '@/types/activity';
import { ActivityCategory, Subcategory } from '@/types/common';
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

export function ActivitiesList() {
  const [activities, setActivities] = useState<Activity[]>([]);
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

  // Fetch activities on component mount
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        // First, fetch base_items and activities separately to avoid typing issues
        const { data: baseItemsData, error: baseItemsError } = await supabase
          .from('base_items')
          .select(`
            id, name, type, short_description, long_description, main_image,
            gallery_images, address, coordinates, area, contact_info, hours,
            open_24h, rating, tags, price_range, currency, features, languages,
            updated_at, is_sponsored, is_featured, payment_methods, accessibility
          `)
          .eq('type', 'activity');

        if (baseItemsError) {
          throw baseItemsError;
        }

        if (!baseItemsData || baseItemsData.length === 0) {
          setActivities([]);
          setCategories([]);
          setLoading(false);
          return;
        }

        // Fetch activity details for each base item
        const activityIds = baseItemsData.map(item => item.id);
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities')
          .select('id, category, subcategory, activity_data')
          .in('id', activityIds);

        if (activitiesError) {
          throw activitiesError;
        }

        // Create a map of activity details by id for easier lookup
        const activityDetailsMap = new Map();
        activitiesData?.forEach(activity => {
          activityDetailsMap.set(activity.id, activity);
        });

        // Format activities data to match the Activity interface
        const formattedActivities = baseItemsData.map(item => {
          const activityDetails = activityDetailsMap.get(item.id);
          
          if (!activityDetails) {
            console.error(`Activity ${item.id} (${item.name}) has missing activity details`);
            return null;
          }
          
          const activity: Activity = {
            id: item.id,
            name: item.name,
            type: item.type,
            category: activityDetails.category,
            subcategory: activityDetails.subcategory,
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
            activityData: activityDetails.activity_data
          };
          
          return activity;
        });

        // Filter out any null entries and then extract unique categories
        const validActivities = formattedActivities.filter(activity => activity !== null);
        const uniqueCategories = [...new Set(validActivities.map(activity => activity!.category))];
        
        setActivities(validActivities as Activity[]);
        setCategories(uniqueCategories as string[]);
      } catch (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch activities. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [toast]);

  // Get category badge variant
  const getCategoryVariant = (category?: ActivityCategory) => {
    if (!category) return 'secondary';
    
    try {
      switch (category) {
        case ActivityCategory.FOOD_DRINK: return 'default';
        case ActivityCategory.LEISURE: return 'outline';
        case ActivityCategory.CULTURE: return 'destructive';
        case ActivityCategory.SHOPPING: return 'secondary';
        default: return 'secondary';
      }
    } catch (error) {
      console.error(`Error getting category variant for ${category}:`, error);
      return 'secondary';
    }
  };

  // Get category icon
  const getCategoryIcon = (category?: ActivityCategory) => {
    if (!category) return <Coffee className="h-4 w-4" />;
    
    try {
      switch (category) {
        case ActivityCategory.FOOD_DRINK:
          return <Coffee className="h-4 w-4" />;
        case ActivityCategory.LEISURE:
          return <ShoppingBag className="h-4 w-4" />;
        case ActivityCategory.CULTURE:
          return <Tag className="h-4 w-4" />;
        case ActivityCategory.SHOPPING:
          return <ShoppingBag className="h-4 w-4" />;
        default:
          return <Coffee className="h-4 w-4" />;
      }
    } catch (error) {
      console.error(`Error getting category icon for ${category}:`, error);
      return <Coffee className="h-4 w-4" />;
    }
  };

  // Table columns definition
  const columns: ColumnDef<Activity>[] = [
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
          Activity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const activity = row.original;
        return (
          <div 
            className="flex items-center gap-3 cursor-pointer py-1.5 max-w-md"
            onClick={() => router.push(`/dashboard/activities/${activity.id}/view`)}
          >
            <div className="relative flex-shrink-0 h-12 w-12">
              {activity.mainImage ? (
                <img
                  src={activity.mainImage}
                  alt={`${activity.name} thumbnail`}
                  className="w-12 h-12 rounded-md object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                  {getCategoryIcon(activity.category as ActivityCategory)}
                </div>
              )}
            </div>
            <div className="space-y-0.5 text-left">
              <div className="font-medium truncate">{activity.name}</div>
              <div className="flex items-center gap-1">
                {activity.category ? (
                  <Badge variant={getCategoryVariant(activity.category as ActivityCategory)} className="text-xs">
                    {getCategoryDisplayName(activity.category as ActivityCategory)}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Uncategorized</Badge>
                )}
                {activity.isFeatured && (
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
        const category = row.getValue('category') as ActivityCategory;
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
        const activity = row.original;

        const handleDelete = async () => {
          if (confirm(`Are you sure you want to delete "${activity.name}"?`)) {
            try {
              const response = await fetch(`/api/dashboard/activities/${activity.id}`, {
                method: 'DELETE',
              });
              
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete activity');
              }

              // Update local state to remove the deleted activity
              setActivities(activities.filter((a) => a.id !== activity.id));

              toast({
                title: 'Activity deleted',
                description: `"${activity.name}" has been deleted successfully`,
              });
            } catch (error) {
              console.error('Error deleting activity:', error);
              toast({
                title: 'Error',
                description: 'Failed to delete activity. Please try again.',
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
                  onClick={() => router.push(`/dashboard/activities/${activity.id}/view`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/activities/${activity.id}/edit`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit className="h-4 w-4" />
                  Edit Activity
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(activity.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Copy Activity ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                      Delete Activity
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
    data: activities,
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
            <p className="text-muted-foreground">Loading activities...</p>
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
              placeholder="Search activities..."
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
                    {getCategoryDisplayName(category as ActivityCategory)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <Link href="/dashboard/activities/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Activity
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
                    No activities found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} activity(ies) total
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