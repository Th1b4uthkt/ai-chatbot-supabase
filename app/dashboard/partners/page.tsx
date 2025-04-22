import { Plus, Search } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPartners } from "@/db/cached-queries"
import { formatDate } from "@/lib/utils"

export default async function PartnersPage() {
  // Fetch partners from Supabase
  const partners = await getPartners()

  // Map categories to more user-friendly names
  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      'location-scooter': 'Scooter Rental',
      'location-voiture': 'Car Rental',
      'location-bateau': 'Boat Rental',
      'location-velo': 'Bike Rental',
      'hebergement-appartement': 'Apartment',
      'hebergement-bungalow': 'Bungalow',
      'hebergement-villa': 'Villa',
      'hebergement-guesthouse': 'Guesthouse',
      'restaurant': 'Restaurant',
      'cafe': 'Café',
      'bar': 'Bar',
      'street-food': 'Street Food',
      // Add more mappings as needed
    }
    return categoryMap[category] || category
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Partners</h2>
        <Link href="/dashboard/partners/new">
          <Button className="hidden md:flex bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-sm">
            <Plus className="mr-2 size-4" />
            Add Partner
          </Button>
          <Button size="icon" className="md:hidden bg-primary shadow-sm">
            <Plus className="size-4" />
          </Button>
        </Link>
      </div>
      <div>
        <Card className="border-border/40 shadow-md rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center bg-muted/20 border-b pb-4">
            <div className="grid gap-1">
              <CardTitle>Partner List</CardTitle>
              <CardDescription>
                Manage your partners, edit or delete them.
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 w-full md:w-[300px] border-input/50 focus:border-primary/50 shadow-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-medium">Name</TableHead>
                  <TableHead className="font-medium">Category</TableHead>
                  <TableHead className="font-medium">Location</TableHead>
                  <TableHead className="font-medium">Rating</TableHead>
                  <TableHead className="font-medium">Sponsored</TableHead>
                  <TableHead className="text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No partners found
                    </TableCell>
                  </TableRow>
                ) : (
                  partners.map((partner) => (
                    <TableRow key={partner.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted/40 hover:bg-muted/60 text-foreground">
                          {getCategoryLabel(partner.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>{partner.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="text-yellow-500 mr-1">★</div>
                          <span>{partner.rating}/5</span>
                          <span className="text-muted-foreground ml-1 text-xs">({partner.reviews})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {partner.is_sponsored ? 
                          <Badge className="bg-accent text-accent-foreground">Yes</Badge> : 
                          <Badge variant="outline" className="text-muted-foreground">No</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/partners/${partner.id}/edit`}>
                          <Button variant="outline" size="sm" className="hover:bg-muted/40 border-primary/20 hover:border-primary/50 shadow-sm">
                            Edit
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
