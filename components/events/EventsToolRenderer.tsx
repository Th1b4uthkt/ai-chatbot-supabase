import { Calendar } from 'lucide-react';

import { EventType } from '@/types/events';

import { EventsRenderer } from './EventsRenderer';

interface EventsToolRendererProps {
  result: any; // The raw result from the AI tool
}

export const EventsToolRenderer = ({ result }: EventsToolRendererProps) => {
  // Handle case where result is not properly formatted
  if (!result || !result.events) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-amber-700">No event data available or invalid format.</p>
      </div>
    );
  }
  
  // Format the timeFrame nicely for display
  const timeFrame = result.timeFrame || 'upcoming';
  
  // Check if this is a specific date query (starts with "on")
  const isSpecificDate = timeFrame.startsWith('on ');
  
  // Convert to the expected EventType format if needed
  const events: EventType[] = result.events.map((event: any) => {
    // Ensure the event conforms to our EventType interface
    return {
      ...event,
      // Add any missing required fields with default values
      id: event.id || `temp-${Math.random().toString(36).substring(2, 9)}`,
      day: event.day || new Date().getDay(),
      coordinates: event.coordinates || { latitude: 0, longitude: 0 },
      // Make sure tags is always an array
      tags: Array.isArray(event.tags) ? event.tags : []
    };
  });
  
  return (
    <div className="my-2 shadow-sm rounded-lg overflow-hidden border border-gray-200">
      <div className={`p-3 flex items-center gap-2 ${isSpecificDate ? 'bg-purple-50 border-b border-purple-100' : 'bg-blue-50 border-b border-blue-100'}`}>
        {isSpecificDate && <Calendar className="size-4 text-purple-700" />}
        <h3 className={`font-medium ${isSpecificDate ? 'text-purple-800' : 'text-blue-800'}`}>
          Events {timeFrame}
        </h3>
        <span className="text-sm text-gray-500 ml-auto">
          {events.length} {events.length === 1 ? 'event' : 'events'} found
        </span>
      </div>
      <div className="p-4 bg-white">
        <EventsRenderer 
          events={events} 
          timeFrame={timeFrame} 
          showHeader={false} 
        />
      </div>
    </div>
  );
}; 