import { Star, Car, Bike, Clock, MapPin } from 'lucide-react';
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
  hours?: string | null;
}

interface ActivityService extends BaseItem {
  category: string;
  subcategory: string | null;
  service_data?: any;
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

  // Function to get icon based on subcategory
  const getSubcategoryIcon = (subcategory: string | null) => {
    if (subcategory === 'car_rental') return <Car className="size-4" />;
    if (subcategory === 'scooter_rental' || subcategory === 'bike_rental') return <Bike className="size-4" />;
    return null;
  };

  // Function to render vehicle prices for car rentals
  const renderVehicleInfo = (item: ActivityService) => {
    if (item.subcategory !== 'car_rental' || !item.service_data?.vehicles) return null;
    
    return (
      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
        <p className="font-medium mb-1">Available vehicles:</p>
        {item.service_data.vehicles.slice(0, 2).map((vehicle: any, i: number) => (
          <div key={i} className="flex justify-between">
            <span>{vehicle.type}</span>
            <span className="font-semibold">{vehicle.pricePerDay} THB/day</span>
          </div>
        ))}
        {item.service_data.vehicles.length > 2 && (
          <p className="text-muted-foreground text-xs mt-1">+ more options</p>
        )}
      </div>
    );
  };

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
            
            {item.subcategory === 'car_rental' && (
              <div className="absolute top-2 left-2 bg-blue-500/90 px-2 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1">
                <Car className="size-3" />
                <span>Car Rental</span>
              </div>
            )}
          </div>
          
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
              <Badge variant="outline" className="capitalize">
                {getSubcategoryIcon(item.subcategory)}
                <span className="ml-1">{item.subcategory?.replace('_', ' ') || item.type}</span>
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground flex items-center">
                <MapPin className="size-3 mr-1" />
                {item.area || 'Location not specified'}
              </span>
              •
              <span className="flex items-center">
                <Star className="size-4 fill-yellow-400 text-yellow-400 mr-1" />
                {item.rating !== null ? item.rating.toFixed(1) : 'No ratings'}
              </span>
              {item.hours && (
                <>
                  •
                  <span className="flex items-center">
                    <Clock className="size-3 mr-1" />
                    {item.hours}
                  </span>
                </>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="py-2">
            <CardDescription className="line-clamp-2">
              {item.short_description || 'No description available'}
            </CardDescription>
            
            {renderVehicleInfo(item)}
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