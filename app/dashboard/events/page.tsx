import { CalendarDays, MapPin, Plus, Search, Tag, Ticket, Trash2, Pencil } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getEvents } from "@/db/cached-queries"
import { formatDate } from "@/lib/utils"

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <TooltipProvider>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Events Management</h2>
            <p className="text-muted-foreground">View, create, and manage your events.</p>
          </div>
          <Link href="/dashboard/events/new">
            <Button>
              <Plus className="mr-2 size-4" />
              Create New Event
            </Button>
          </Link>
        </div>
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="p-4 md:p-6">
             <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 md:grow-0 w-full md:w-auto">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search events..."
                    className="pl-8 w-full md:w-[300px] lg:w-[400px] bg-background"
                  />
                </div>
             </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-t border-border/40 bg-muted/50 hover:bg-muted/50">
                  <TableHead>Title</TableHead>
                  <TableHead><Tag className="inline-block mr-1 size-4" />Category</TableHead>
                  <TableHead><MapPin className="inline-block mr-1 size-4" />Location</TableHead>
                  <TableHead><CalendarDays className="inline-block mr-1 size-4" />Date</TableHead>
                  <TableHead><Ticket className="inline-block mr-1 size-4" />Price</TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No events found. Start by creating one!
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => {
                    const priceValue = event.price ? parseFloat(event.price) : 0;
                    const isFree = !event.price || priceValue === 0;

                    return (
                      <TableRow key={event.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{event.category || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{event.location}</TableCell>
                        <TableCell className="text-muted-foreground">
                           <Tooltip>
                              <TooltipTrigger asChild>
                                 <span>{formatDate(event.time)}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{new Date(event.time).toLocaleString()}</p>
                              </TooltipContent>
                            </Tooltip>
                        </TableCell>
                         <TableCell className="text-muted-foreground">
                          {isFree ? (
                            <Badge variant="secondary">Free</Badge>
                          ) : !isNaN(priceValue) ? (
                            `฿${priceValue.toFixed(2)}`
                          ) : (
                            <span className="text-muted-foreground italic">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
                                    <Link href={`/dashboard/events/${event.id}/edit`}>
                                      <Pencil className="size-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit Event</p>
                                </TooltipContent>
                             </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete Event</p>
                                </TooltipContent>
                             </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
