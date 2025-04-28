'use client';

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
  ArrowUpDown,
  Calendar,
  CircleEllipsis,
  Clock,
  Edit, 
  Eye,
  MapPin,
  Plus,
  Search,
  Star,
  Tag,
  Trash,
  Users,
  Settings
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { EventType } from '@/types/events';

export function EventsList() {
  const [events, setEvents] = useState<EventType[]>([]);
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

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select('*');

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          setEvents([]);
          setCategories([]);
          setLoading(false);
          return;
        }

        // Format events data to match the EventType interface
        const formattedEvents = data.map(event => {
          // Create coordinates object from latitude and longitude
          const coordinates = {
            latitude: Number(event.latitude) || 0,
            longitude: Number(event.longitude) || 0
          };

          // Create organizer object from separate fields
          const organizer = {
            name: event.organizer_name || '',
            image: event.organizer_image || '',
            contactEmail: event.organizer_contact_email || '',
            contactPhone: event.organizer_contact_phone || '',
            website: event.organizer_website || ''
          };

          // Parse facilities and tickets from JSON
          const facilities = typeof event.facilities === 'object' ? event.facilities : 
                            typeof event.facilities === 'string' ? JSON.parse(event.facilities) : {};
          
          const tickets = typeof event.tickets === 'object' ? event.tickets : 
                          typeof event.tickets === 'string' ? JSON.parse(event.tickets) : {};

          // Construct recurrence object
          const recurrence = event.recurrence_pattern ? {
            pattern: event.recurrence_pattern,
            customPattern: event.recurrence_custom_pattern,
            endDate: event.recurrence_end_date
          } : null;

          return {
            ...event,
            coordinates,
            organizer,
            facilities,
            tickets,
            recurrence,
            // Convert rating to number if it's a string
            rating: typeof event.rating === 'string' ? parseFloat(event.rating) : event.rating,
            // Map attendee_count to attendeeCount
            attendeeCount: event.attendee_count
          };
        });

        // Extract unique categories for filter
        const uniqueCategories = [...new Set(data.map(event => event.category))].filter(Boolean);
        
        // Update state once with all data
        setEvents(formattedEvents as EventType[]);
        setCategories(uniqueCategories as string[]);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch events. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [toast, supabase]);

  // Format date nicely
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Get category badge variant
  const getCategoryVariant = (category?: string) => {
    if (!category) return 'secondary';
    
    const lowercasedCategory = category.toLowerCase();
    
    if (lowercasedCategory === 'music') return 'default';
    if (lowercasedCategory === 'art') return 'secondary';
    if (lowercasedCategory === 'food' || lowercasedCategory === 'nightlife') return 'destructive';
    if (lowercasedCategory === 'markets') return 'outline';
    if (lowercasedCategory === 'sports') return 'default';
    if (lowercasedCategory === 'wellness') return 'secondary';
    
    return 'secondary';
  };

  // Table columns definition
  const columns: ColumnDef<EventType>[] = [
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
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-medium"
        >
          Event
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div 
            className="flex items-center gap-3 cursor-pointer py-1.5 max-w-md"
            onClick={() => router.push(`/dashboard/events/${event.id}/view`)}
          >
            <div className="relative size-12 shrink-0">
              {event.image ? (
                <Image
                  src={event.image}
                  alt={`${event.title} thumbnail`}
                  width={48}
                  height={48}
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="size-12 bg-muted rounded-md flex items-center justify-center">
                  <Calendar className="size-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="space-y-0.5 text-left">
              <div className="font-medium truncate">{event.title}</div>
              <div className="flex items-center">
                <Badge variant={getCategoryVariant(event.category)} className="text-xs">
                  {event.category}
                </Badge>
                {event.recurrence?.pattern && event.recurrence.pattern !== 'once' && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Recurring
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
        const category = row.getValue('category') as string;
        return (
          <Badge variant={getCategoryVariant(category)} className="text-xs">
            {category || 'Uncategorized'}
          </Badge>
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: 'time',
      header: () => (
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 text-muted-foreground/70" />
          <span>Date & Time</span>
        </div>
      ),
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="flex flex-col text-sm">
            <span>{formatDate(event.time)}</span>
            <span className="text-xs text-muted-foreground">
              {event.time ? new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
            </span>
            {event.duration && (
              <span className="text-xs text-muted-foreground mt-1">
                Duration: {event.duration}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'location',
      header: () => (
        <div className="flex items-center gap-2">
          <MapPin className="size-3.5 text-muted-foreground/70" />
          <span>Location</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-sm max-w-[180px]">
          <div className="truncate">{row.getValue('location') || 'Not set'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'rating',
      header: () => (
        <div className="flex items-center gap-2">
          <Star className="size-3.5 text-muted-foreground/70" />
          <span>Rating</span>
        </div>
      ),
      cell: ({ row }) => {
        const rating = row.getValue('rating') as number;
        const reviews = row.original.reviews;
        return (
          <div className="flex items-center gap-1">
            <span className="text-amber-500 text-sm font-medium">{rating?.toFixed(1) || '-'}</span>
            {reviews > 0 && (
              <span className="text-xs text-muted-foreground">({reviews})</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const price = row.getValue('price') as string;
        return (
          <div className="text-sm font-medium">
            {price || 'Free'}
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const event = row.original;

        const handleDelete = async () => {
          if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
            try {
              const response = await fetch(`/api/dashboard/events/${event.id}`, {
                method: 'DELETE',
              });
              
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete event');
              }

              // Update local state to remove the deleted event
              setEvents(events.filter((e) => e.id !== event.id));

              toast({
                title: 'Event deleted',
                description: `"${event.title}" has been deleted successfully`,
              });
            } catch (error) {
              console.error('Error deleting event:', error);
              toast({
                title: 'Error',
                description: 'Failed to delete event. Please try again.',
                variant: 'destructive',
              });
            }
          }
        };

        return (
          <TooltipProvider>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <span className="sr-only">Open menu</span>
                  <CircleEllipsis className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/events/${event.id}/view`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="size-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit className="size-4" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/events/${event.id}/manage`)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="size-4" /> 
                  Manage Event
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(event.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Copy Event ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Trash className="size-4" />
                      Delete Event
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
    data: events,
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
              <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
            <p className="text-muted-foreground">Loading events...</p>
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
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('title')?.setFilterValue(event.target.value)
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
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <Link href="/dashboard/events/create">
          <Button>
            <Plus className="mr-2 size-4" />
            New Event
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
                    No events found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} event(s) total
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