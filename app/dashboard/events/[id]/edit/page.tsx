import { ArrowLeft, InfoIcon } from "lucide-react" // Added InfoIcon
import Link from "next/link"
import { notFound } from "next/navigation"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // Import Alert
import { Button } from "@/components/ui/button"
import { getEventById } from "@/db/cached-queries"

import { EventEditForm } from "./EventEditForm" // Import the new client component

// Interface that spécifies params as a Promise
interface EventEditPageProps {
  params: Promise<{ id: string }>;
}

// Define the Page component (Server Component)
export default async function EventEditPage(props: EventEditPageProps) {
  // Await the params Promise to get the id
  const params = await props.params;
  const { id } = params;

  // Fetch event data on the server using the id
  const event = await getEventById(id);

  // Handle case where event is not found
  if (!event) {
    // Use Alert component for better visual feedback
    return (
       <div className="container mx-auto py-8">
         <Alert variant="destructive">
            <InfoIcon className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              The requested event could not be found. It might have been deleted.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
             <Button asChild variant="outline">
               <Link href="/dashboard/events">
                 <ArrowLeft className="mr-2 size-4" /> Back to Events List
               </Link>
            </Button>
          </div>
       </div>
    );
  }

  // Render the Client Component form, passing the fetched data
  return (
    // Use container and consistent spacing like the NewEventPage
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="outline" size="icon">
          <Link href="/dashboard/events">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
           {/* Break title onto two lines if long */}
          <h1 className="text-2xl font-bold break-words">Edit Event</h1>
          <p className="text-muted-foreground truncate max-w-md">{event.title}</p> {/* Show event title subtly */}
        </div>
      </div>
      {/* Render the client form component with initial data */}
      <EventEditForm initialEventData={event} eventId={id} />
    </div>
  );
}
