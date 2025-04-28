import { Star } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface BaseItem {
  id: string;
  name: string;
  type: string;
  short_description: string | null;
  main_image: string | null;
  area: string | null;
  rating: number | null;
  tags: string[] | null;
  price_range: string | null;
}

interface ActivityService extends BaseItem {
  category: string;
  subcategory: string | null;
}

interface ActivitiesServicesResults {
  items: ActivityService[];
  totalCount: number;
}

interface ActivitiesServicesToolRendererProps {
  data: ActivitiesServicesResults;
}

const ActivitiesServicesToolRenderer: React.FC<ActivitiesServicesToolRendererProps> = ({ data }) => {
  if (!data || !data.items || data.items.length === 0) {
    return <div>No activities or services found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {data.items.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div className="relative h-48 w-full">
            {item.main_image ? (
              <Image
                src={item.main_image}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="size-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>
          
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
              <Badge variant="outline" className="capitalize">
                {item.type}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">{item.area || 'Location not specified'}</span>
              •
              <span className="flex items-center">
                <Star className="size-4 fill-yellow-400 text-yellow-400 mr-1" />
                {item.rating !== null ? item.rating.toFixed(1) : 'No ratings'}
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="py-2">
            <CardDescription className="line-clamp-2">
              {item.short_description || 'No description available'}
            </CardDescription>
          </CardContent>
          
          <CardFooter className="pt-0 flex flex-wrap gap-1">
            {item.category && (
              <Badge variant="secondary" className="mr-1">
                {item.category}
              </Badge>
            )}
            {item.tags && item.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.price_range && (
              <Badge variant="outline" className="ml-auto">
                {item.price_range}
              </Badge>
            )}
          </CardFooter>
        </Card>
      ))}
      <div className="col-span-full text-center text-sm text-muted-foreground mt-2">
        Showing {data.items.length} of {data.totalCount} results
      </div>
    </div>
  );
};

export default ActivitiesServicesToolRenderer; 