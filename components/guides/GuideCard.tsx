import { format, formatDistanceToNow } from "date-fns";
import { BookOpen, Calendar, MapPin, Star, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Guide, getCategoryDisplayName } from "@/types/newGuide";

interface GuideCardProps {
  guide: Guide;
}

export const GuideCard = ({ guide }: GuideCardProps) => {
  const PlaceholderIcon = BookOpen; // Default placeholder

  // Format the last updated date
  let lastUpdatedText = 'Updated recently';
  try {
    if (guide.lastUpdatedAt) {
      lastUpdatedText = `Updated ${formatDistanceToNow(new Date(guide.lastUpdatedAt), { addSuffix: true })}`;
    }
  } catch (error) {
    console.error("Error formatting date:", guide.lastUpdatedAt, error);
    // Keep default text if date is invalid
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 bg-white flex flex-col h-full">
      <div className="relative h-48 w-full bg-gray-200">
        {guide.images?.main ? (
          <Image
            src={guide.images.main}
            alt={guide.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="size-full flex items-center justify-center">
            <PlaceholderIcon className="size-16 text-gray-400" />
          </div>
        )}
        {guide.isFeatured && (
           <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded font-medium">
            {getCategoryDisplayName(guide.category)}
          </span>
          {guide.rating?.score && guide.rating.score > 0 && (
            <div className="flex items-center">
              <Star className="size-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{guide.rating.score.toFixed(1)}</span>
              {guide.rating.reviewCount && guide.rating.reviewCount > 0 && (
                <span className="text-xs text-gray-500 ml-1">({guide.rating.reviewCount})</span>
              )}
            </div>
          )}
        </div>
        
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{guide.name}</h3>
        
        {guide.description?.short && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-1">{guide.description.short}</p>
        )}

        <div className="space-y-1 text-sm text-gray-600 mb-4 mt-auto"> {/* mt-auto pushes this section down */}
          {guide.location?.address && (
            <div className="flex items-center">
              <MapPin className="size-4 mr-2 shrink-0" />
              <span>{guide.location.address}</span>
            </div>
          )}
           <div className="flex items-center text-xs text-gray-500">
              <Calendar className="size-3 mr-1.5 shrink-0" />
              <span>{lastUpdatedText}</span>
            </div>
        </div>
        
        {guide.tags && guide.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100"> 
            {guide.tags.slice(0, 4).map((tag: string) => (
              <span key={tag} className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                <Tag className="size-3 mr-1" />
                {tag}
              </span>
            ))}
            {guide.tags.length > 4 && (
              <span className="text-xs text-gray-500">+{guide.tags.length - 4} more</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for Icons with Text
function IconText({ icon: Icon, text }: { icon: React.ElementType; text: string | number }) {
  return (
    <div className="flex items-center text-xs text-gray-600">
      <Icon className="mr-1.5 size-3 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

// Helper component for Tags
function TagBadge({ tag }: { tag: string }) {
  return <Badge variant="secondary" className="text-xs font-normal shrink-0">{tag}</Badge>;
} 