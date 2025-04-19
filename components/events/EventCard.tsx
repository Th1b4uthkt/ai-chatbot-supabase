import { CalendarDays, Clock, MapPin, Star, Tag, Users } from 'lucide-react';
import Image from 'next/image';

import { EventType } from '@/types/events';

interface EventCardProps {
  event: EventType;
}

export const EventCard = ({ event }: EventCardProps) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 bg-white flex flex-col h-full">
      <div className="relative h-48 w-full">
        {event.image ? (
          <Image 
            src={event.image} 
            alt={event.title} 
            fill 
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="bg-gray-200 size-full flex items-center justify-center">
            <CalendarDays className="size-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-sm font-medium">
          {event.price || 'Free'}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {event.category}
          </span>
          {event.rating && (
            <div className="flex items-center">
              <Star className="size-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{event.rating}</span>
              {event.reviews && (
                <span className="text-xs text-gray-500 ml-1">({event.reviews})</span>
              )}
            </div>
          )}
        </div>
        
        <h3 className="font-bold text-lg mb-2">{event.title}</h3>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4 flex-1">
          <div className="flex items-center">
            <Clock className="size-4 mr-2" />
            <span>{event.time}</span>
            {event.duration && <span className="ml-1">· {event.duration}</span>}
          </div>
          
          <div className="flex items-center">
            <MapPin className="size-4 mr-2" />
            <span>{event.location}</span>
          </div>
          
          {event.attendeeCount && event.capacity && (
            <div className="flex items-center">
              <Users className="size-4 mr-2" />
              <span>{event.attendeeCount}/{event.capacity} attending</span>
            </div>
          )}
        </div>
        
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {event.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                <Tag className="size-3 mr-1" />
                {tag}
              </span>
            ))}
            {event.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{event.tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 