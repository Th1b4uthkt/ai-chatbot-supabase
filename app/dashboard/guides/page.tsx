import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getGuides } from "@/db/cached-queries"
import { formatDate } from "@/lib/utils"
import { Guide, getCategoryDisplayName } from "@/types/newGuide"

// Component to handle client-side actions like delete confirmation
// You might need a separate client component for this if using delete
// const GuideActions = ({ guideId }: { guideId: string }) => {
//   const handleDelete = async () => {
//     if (confirm('Are you sure you want to delete this guide?')) {
//       // Call deleteGuideAction - requires making this a client component
//       // and potentially passing the action function or using a different pattern
//       console.log("Delete guide", guideId);
//     }
//   };
//   return (
//     <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-700">
//       <Trash2 className="mr-1 h-3 w-3" />
//       Supprimer
//     </Button>
//   );
// };

export default async function GuidesPage() {
  // Fetch guides from Supabase via cached query
  const guides = await getGuides()

  // Create the content for the table body
  const tableBodyContent = guides.length === 0 ? (
    <TableRow>
      <TableCell colSpan={6} className="text-center">
        No guides found
      </TableCell>
    </TableRow>
  ) : (
    guides.map((guide: Guide) => (
      <TableRow key={guide.id}>
        <TableCell className="font-medium">{guide.name}</TableCell>
        <TableCell>{getCategoryDisplayName(guide.category)}</TableCell>
        <TableCell>{guide.location?.address || 'N/A'}</TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {Array.isArray(guide.tags) && guide.tags.length > 0 ? (
              guide.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">N/A</span>
            )}
          </div>
        </TableCell>
        <TableCell>{formatDate(guide.lastUpdatedAt || guide.createdAt)}</TableCell>
        <TableCell className="text-right space-x-2">
          {/* View link (example) */}
          {/* <Link href={`/guides/${guide.slug || guide.id}`} passHref>
            <Button variant="outline" size="sm" asChild>
              <span><Eye className="mr-1 h-3 w-3" />View</span>
            </Button>
          </Link> */}
          
          {/* Edit link */}
          <Link href={`/dashboard/guides/${guide.id}/edit`} passHref>
            <Button variant="outline" size="sm" asChild>
               <span><Edit className="mr-1 size-3" />Edit</span>
            </Button>
          </Link>

          {/* Delete button placeholder */}
          {/* Requires client component, example: */}
          {/* <Button variant="outline" size="sm" onClick={() => console.log("Delete", guide.id)} className="text-red-500 hover:text-red-700">
             <Trash2 className="mr-1 h-3 w-3" />
             Delete
           </Button> */}
        </TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Guides</h1>
        <Link href="/dashboard/guides/new">
          <Button className="hidden md:flex items-center">
            <Plus className="mr-2 size-4" />
            Create Guide
          </Button>
          <Button size="icon" className="md:hidden">
            <Plus className="size-4" />
          </Button>
        </Link>
      </div>
      <Card className="shadow-sm border-border/40">
        <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
          <div className="grid gap-1">
            <CardTitle>Guides List</CardTitle>
            <CardDescription>
              Manage your guides, edit or delete them.
            </CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for a guide..."
                className="pl-8 w-full md:w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableBodyContent}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
