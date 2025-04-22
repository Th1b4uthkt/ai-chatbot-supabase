import { ArrowLeft } from "lucide-react" // Loader might not be needed here anymore
import Link from "next/link"
import { notFound } from "next/navigation"

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
    // Option 1: Use Next.js notFound() 
    // notFound(); 

    // Option 2: Render a message and link back
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-xl text-muted-foreground">Event not found.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/events">Back to List</Link>
        </Button>
      </div>
    );
  }

  // Render the Client Component form, passing the fetched data
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          {/* Link back to the specific event view page if it exists, otherwise list */}
          <Link href={`/dashboard/events`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Event: {event.title}</h1>
      </div>
      {/* Render the client form component with initial data */}
      <EventEditForm initialEventData={event} eventId={id} />
    </div>
  );
}
