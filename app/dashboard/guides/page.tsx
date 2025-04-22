import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getGuides } from "@/db/cached-queries"
import { formatDate } from "@/lib/utils"
import { GuideType } from "@/types/guide"

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
        Aucun guide trouvé
      </TableCell>
    </TableRow>
  ) : (
    guides.map((guide: any) => ( // Replace 'any' with your actual Guide DB type when available
      <TableRow key={guide.id}>
        <TableCell className="font-medium">{guide.title}</TableCell>
        <TableCell>{guide.category}</TableCell>
        <TableCell>{guide.location || 'N/A'}</TableCell>
        <TableCell className="text-xs">
          {Array.isArray(guide.tags) ? guide.tags.join(', ') : 'N/A'}
        </TableCell>
        <TableCell>{formatDate(guide.lastUpdatedAt || guide.created_at)}</TableCell>
        <TableCell className="text-right space-x-2">
          {/* View link (example) */}
          {/* <Link href={`/guides/${guide.slug || guide.id}`} passHref>
            <Button variant="outline" size="sm" asChild>
              <span><Eye className="mr-1 h-3 w-3" />Voir</span>
            </Button>
          </Link> */}
          
          {/* Edit link */}
          <Link href={`/dashboard/guides/${guide.id}/edit`} passHref>
            <Button variant="outline" size="sm" asChild>
               <span><Edit className="mr-1 size-3" />Modifier</span>
            </Button>
          </Link>

          {/* Delete button placeholder */}
          {/* <GuideActions guideId={guide.id} /> */}
        </TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Guides</h2>
        <Link href="/dashboard/guides/new">
          <Button className="hidden md:flex">
            <Plus className="mr-2 size-4" />
            Créer un guide
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
              <CardTitle>Liste des guides</CardTitle>
              <CardDescription>
                Gérez vos guides, modifiez-les ou supprimez-les.
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un guide..."
                  className="pl-8 w-full md:w-[300px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Mis à jour le</TableHead>
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
    </div>
  )
}
