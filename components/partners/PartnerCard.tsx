import { Building, Globe, Mail, MapPin, Phone, Star, Tag } from 'lucide-react';
import Image from 'next/image';

// import { PartnerType } from '@/types/partners';
import { PartnerType } from '@/types/partner'; // Use the correct singular file

interface PartnerCardProps {
  partner: PartnerType;
}

export const PartnerCard = ({ partner }: PartnerCardProps) => {
  // Use a more specific placeholder or logic based on category if needed
  const PlaceholderIcon = Building; 

  return (
    <div className="rounded-lg overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 bg-white flex flex-col h-full">
      <div className="relative h-40 w-full bg-gray-200"> 
        {partner.image ? (
          <Image 
            src={partner.image} 
            alt={partner.name} 
            fill 
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="size-full flex items-center justify-center">
            <PlaceholderIcon className="size-12 text-gray-400" />
          </div>
        )}
        {partner.is_sponsored && ( // Changed from is_featured to is_sponsored based on partner.ts
           <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
            Sponsored
          </div>
        )}
         {/* Display Price Range if available */}
        {partner.priceRange && (
          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-sm font-medium">
            {partner.priceRange}
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium capitalize">
            {/* Format category for display if needed */} 
            {partner.category.replace('-', ' ')}
          </span>
          {partner.rating > 0 && ( // Show only if rating exists and is > 0
            <div className="flex items-center">
              <Star className="size-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{partner.rating.toFixed(1)}</span>
              {partner.reviews > 0 && (
                <span className="text-xs text-gray-500 ml-1">({partner.reviews})</span>
              )}
            </div>
          )}
        </div>
        
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{partner.name}</h3>
        
        {partner.shortDescription && ( // Use shortDescription
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{partner.shortDescription}</p>
        )}

        <div className="space-y-1 text-sm text-gray-600 mb-4">
          {partner.location && (
            <div className="flex items-center">
              <MapPin className="size-4 mr-2 shrink-0" />
              <span>{partner.location}</span>
            </div>
          )}
          {/* Use contact field as the primary source for contact info */} 
          {partner.contact && (
            <div className="flex items-center">
              {/* Heuristically show Phone icon if contact looks like a number */}
              {/^[\d\s\+\-\/()]+$/.test(partner.contact) ? 
                <Phone className="size-4 mr-2 shrink-0" /> : 
                <Mail className="size-4 mr-2 shrink-0" /> 
              }
              {/* Attempt to make it clickable if it looks like phone/email */}
              {/^[\d\s\+\-\/()]+$/.test(partner.contact) ? 
                <a href={`tel:${partner.contact.replace(/\s/g, '')}`} className="hover:underline">{partner.contact}</a> : 
                (partner.contact.includes('@') ? 
                  <a href={`mailto:${partner.contact}`} className="hover:underline truncate">{partner.contact}</a> : 
                  <span>{partner.contact}</span>
                )
              }
            </div>
          )}
           {/* Also display specific email/website if available */}
           {partner.email && partner.email !== partner.contact && (
             <div className="flex items-center">
              <Mail className="size-4 mr-2 shrink-0" />
              <a href={`mailto:${partner.email}`} className="hover:underline truncate">{partner.email}</a>
            </div>
          )}
          {partner.website && (
             <div className="flex items-center">
              <Globe className="size-4 mr-2 shrink-0" />
              <a href={partner.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{partner.website}</a>
            </div>
          )}
        </div>
        
        {/* Display Features or Tags, prioritizing features if available */}
        {(partner.features || partner.tags) && ((partner.features?.length || 0) > 0 || (partner.tags?.length || 0) > 0) && (
          <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-gray-100">
            {(partner.features || partner.tags || []).slice(0, 4).map((item: string) => (
              <span key={item} className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                <Tag className="size-3 mr-1" />
                {item}
              </span>
            ))}
            {((partner.features?.length || 0) + (partner.tags?.length || 0)) > 4 && (
              <span className="text-xs text-gray-500">+{((partner.features?.length || 0) + (partner.tags?.length || 0)) - 4} more</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 