import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getPartnerById } from "@/db/cached-queries";

import { PartnerEditForm } from "./PartnerEditForm";

// Define the interface for the props
interface PartnerEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PartnerEditPage(props: PartnerEditPageProps) {
  // Await the params Promise to get the id
  const params = await props.params;
  const { id } = params;

  // Fetch partner data on the server using the id
  const partner = await getPartnerById(id);

  // Handle case where partner is not found
  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-xl text-muted-foreground">Partner not found.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/partners">Back to list</Link>
        </Button>
      </div>
    );
  }

  // Render the Client Component form, passing the fetched data
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/partners`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Partner: {partner.name}</h1>
      </div>
      <PartnerEditForm initialPartnerData={partner} partnerId={id} />
    </div>
  );
} 