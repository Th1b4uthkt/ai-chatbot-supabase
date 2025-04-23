import { Building, Globe, Mail, MapPin, Phone, Star, Tag } from 'lucide-react';
import Image from 'next/image';

// import { PartnerType } from '@/types/partners';
import { PartnerType, PartnerSubcategory } from '@/types/partner/partner'; // Use the correct singular file and import Subcategory if needed

interface PartnerCardProps {
  partner: PartnerType;
}

export const PartnerCard = ({ partner }: PartnerCardProps) => {
  // Use a more specific placeholder or logic based on category/subcategory if needed
  const PlaceholderIcon = Building;

  return (
    <div className="rounded-lg overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 bg-white flex flex-col h-full">
      <div className="relative h-40 w-full bg-gray-200">
        {/* Access main image from the images object */}
        {partner.images?.main ? (
          <Image
            src={partner.images.main}
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
        {/* Access sponsored status from the promotion object */}
        {partner.promotion?.isSponsored && (
           <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
            Sponsored
          </div>
        )}
         {/* Display Price Range from the prices object */}
        {partner.prices?.priceRange && (
          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-sm font-medium">
            {partner.prices.priceRange}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          {/* Use subcategory for the badge */}
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium capitalize">
            {partner.subcategory.replace('_', ' ')} {/* Format subcategory */}
          </span>
          {/* Access rating score and review count from the rating object */}
          {partner.rating?.score && partner.rating.score > 0 && (
            <div className="flex items-center">
              <Star className="size-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{partner.rating.score.toFixed(1)}</span>
              {partner.rating.reviewCount && partner.rating.reviewCount > 0 && (
                <span className="text-xs text-gray-500 ml-1">({partner.rating.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        <h3 className="font-bold text-lg mb-2 line-clamp-2">{partner.name}</h3>

        {/* Access short description from the description object */}
        {partner.description?.short && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{partner.description.short}</p>
        )}

        <div className="space-y-1 text-sm text-gray-600 mb-4">
          {/* Access address from the location object */}
          {partner.location?.address && (
            <div className="flex items-center">
              <MapPin className="size-4 mr-2 shrink-0" />
              <span>{partner.location.address}</span>
            </div>
          )}
          {/* Use specific contact fields (phone, email, website) */}
          {partner.contact?.phone && (
            <div className="flex items-center">
                <Phone className="size-4 mr-2 shrink-0" />
                <a href={`tel:${partner.contact.phone.replace(/\s/g, '')}`} className="hover:underline">{partner.contact.phone}</a>
            </div>
          )}
           {partner.contact?.email && (
             <div className="flex items-center">
              <Mail className="size-4 mr-2 shrink-0" />
              <a href={`mailto:${partner.contact.email}`} className="hover:underline truncate">{partner.contact.email}</a>
            </div>
          )}
          {partner.contact?.website && (
             <div className="flex items-center">
              <Globe className="size-4 mr-2 shrink-0" />
              <a href={partner.contact.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{partner.contact.website}</a>
            </div>
          )}
           {/* Consider adding Line ID or Social media links if desired */}
        </div>

        {/* Display Features and/or Tags */}
        {(partner.features || partner.tags) && ((partner.features?.length || 0) > 0 || (partner.tags?.length || 0) > 0) && (
          <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-gray-100">
             {/* Combine features and tags for display, limiting the total shown */}
            {[...(partner.features || []), ...(partner.tags || [])].slice(0, 4).map((item: string) => (
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