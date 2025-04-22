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
        <Button asChild variant="outline" className="shadow-sm hover:shadow">
          <Link href="/dashboard/partners">Back to list</Link>
        </Button>
      </div>
    );
  }

  // Render the Client Component form, passing the fetched data
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="icon" asChild className="size-9 rounded-full shadow-sm">
          <Link href={`/dashboard/partners`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Edit Partner</h1>
          <p className="text-muted-foreground">{partner.name}</p>
        </div>
      </div>
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-0.5 shadow-xl">
        <PartnerEditForm initialPartnerData={partner} partnerId={id} />
      </div>
    </div>
  );
} 