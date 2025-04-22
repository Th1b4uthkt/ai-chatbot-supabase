import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getGuideById } from "@/db/cached-queries"; // Can be imported in Server Component

import { EditGuideForm } from "../edit-guide-form"; // Import the new Client Component

// Define props for the page, including params as Promise
interface EditGuidePageProps {
  params: Promise<{
    id: string;
  }>;
}

// This is now an async Server Component
export default async function EditGuidePage(props: EditGuidePageProps) {
  // Await the params Promise to get the id
  const params = await props.params;
  const guideId = params.id;
  
  // Fetch data directly on the server
  const guideData = await getGuideById(guideId);

  // Handle guide not found server-side
  if (!guideData) {
    notFound(); // Use Next.js notFound function
  }

  // Render the layout and pass initialData to the Client Component form
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/guides">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        {/* Use fetched data directly for the title */}
        <h1 className="text-3xl font-bold">Modifier le guide: {guideData.title}</h1>
      </div>

      {/* Render the Client Component form, passing the fetched data */}
      <EditGuideForm initialData={guideData} />
    </div>
  );
} 