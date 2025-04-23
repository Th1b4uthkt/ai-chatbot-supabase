import { Plus, Search, CheckSquare, CalendarClock } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPartners } from "@/db/cached-queries"
import { mapDbToPartner } from "@/lib/supabase/mappers"
import { Tables } from "@/lib/supabase/types"
import { formatDate } from "@/lib/utils"
import { EstablishmentCategory, PartnerSection, PartnerSubcategory, ServiceCategory, Partner } from "@/types/partner/partner"

import { SponsorControl } from "../components/SponsorControl"

type PartnerRow = Tables<'partners'>;

const getCategoryLabel = (mainCategoryValue?: string | null, subcategoryValue?: string | null): string => {
  if (!mainCategoryValue && !subcategoryValue) return "Unknown";

  const findLabel = (enumObj: any, value: string | null | undefined): string | undefined => {
      if (!value) return undefined;
      const entry = Object.entries(enumObj).find(([_, val]) => val === value);
      return entry ? entry[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : undefined;
  };

  const subLabel = findLabel(PartnerSubcategory, subcategoryValue);
  if (subLabel && subLabel.toLowerCase() !== 'other') return subLabel;

  const mainLabelEst = findLabel(EstablishmentCategory, mainCategoryValue);
  if (mainLabelEst) return mainLabelEst;

  const mainLabelSvc = findLabel(ServiceCategory, mainCategoryValue);
  if (mainLabelSvc) return mainLabelSvc;

  return mainLabelEst || mainLabelSvc || subLabel || subcategoryValue || mainCategoryValue || "Unknown";
};

export default async function PartnersPage() {
  const partnersData: PartnerRow[] = await getPartners()

  const partners: Partner[] = partnersData.map(mapDbToPartner);

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
                  <TableHead className="font-medium">Location Address</TableHead>
                  <TableHead className="font-medium">Rating</TableHead>
                  <TableHead><CheckSquare className="inline-block mr-1 size-4" />Sponsored</TableHead>
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
                          {getCategoryLabel(partner.mainCategory, partner.subcategory)}
                        </Badge>
                      </TableCell>
                      <TableCell>{partner.location.address ?? 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {partner.rating?.score !== undefined ? (
                            <>
                              <div className="text-yellow-500 mr-1">★</div>
                              <span>{partner.rating.score.toFixed(1)}/5</span>
                              {(partner.rating.reviewCount ?? 0) > 0 && (
                                <span className="text-muted-foreground ml-1 text-xs">({partner.rating.reviewCount})</span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <SponsorControl
                          itemId={partner.id}
                          itemType="partner"
                          initialIsSponsored={partner.promotion?.isSponsored ?? false}
                          initialSponsorEndDate={partner.promotion?.promotionEndsAt ?? null}
                        />
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
