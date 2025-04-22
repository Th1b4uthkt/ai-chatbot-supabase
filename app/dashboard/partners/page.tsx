import { Plus, Search } from "lucide-react"
import Link from "next/link"

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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Partners</h2>
        <Link href="/dashboard/partners/new">
          <Button className="hidden md:flex">
            <Plus className="mr-2 size-4" />
            Add Partner
          </Button>
          <Button size="icon" className="md:hidden">
            <Plus className="size-4" />
          </Button>
        </Link>
      </div>
      <div>
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
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
                  className="pl-8 w-full md:w-[300px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Sponsored</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No partners found
                    </TableCell>
                  </TableRow>
                ) : (
                  partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>{getCategoryLabel(partner.category)}</TableCell>
                      <TableCell>{partner.location}</TableCell>
                      <TableCell>{partner.rating}/5 ({partner.reviews})</TableCell>
                      <TableCell>{partner.is_sponsored ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/partners/${partner.id}/edit`}>
                          <Button variant="outline" size="sm">
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
