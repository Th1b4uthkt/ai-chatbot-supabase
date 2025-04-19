import { EventType } from '@/types/events';

import { EventCard } from './EventCard';

interface EventsRendererProps {
  events: EventType[];
  timeFrame?: string;
  showHeader?: boolean;
}

export const EventsRenderer = ({ 
  events, 
  timeFrame,
  showHeader = true 
}: EventsRendererProps) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-4 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-600">No events found for this time period.</p>
      </div>
    );
  }

  // Only show up to 3 events by default
  const displayEvents = events.slice(0, 3);

  return (
    <div className="space-y-4 w-full">
      {showHeader && timeFrame && (
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">
            {`${events.length} events ${timeFrame}`}
          </h3>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      
      {events.length > 3 && (
        <div className="text-center mt-3">
          <p className="text-sm text-gray-600">
            And {events.length - 3} more events available.
          </p>
        </div>
      )}
    </div>
  );
}; 