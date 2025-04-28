import { Search, MapPin, Tag, Star, Car, Bike, Phone, Clock, CreditCard, Euro } from 'lucide-react';
import Image from 'next/image';

interface ActivityServiceItem {
  id: string;
  name: string;
  type: 'activity' | 'service';
  category: string;
  subcategory?: string;
  mainImage?: string;
  shortDescription?: string;
  longDescription?: string;
  address?: string;
  area?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  rating?: number | { score: number; reviewCount: number };
  tags?: string[];
  priceRange?: string;
  isFeatured?: boolean;
  isSponsored?: boolean;
  hours?: string;
  activityData?: any;
  serviceData?: any;
}

interface ActivityServiceItemProps {
  item: ActivityServiceItem;
}

const ActivityServiceItem = ({ item }: ActivityServiceItemProps) => {
  // Extract rating information
  const ratingScore = typeof item.rating === 'object' ? item.rating.score : item.rating;
  const reviewCount = typeof item.rating === 'object' ? item.rating.reviewCount : undefined;
  
  // Get appropriate icon for subcategory
  const getSubcategoryIcon = () => {
    if (item.subcategory === 'car_rental') return <Car className="size-4 mr-1" />;
    if (item.subcategory === 'scooter_rental' || item.subcategory === 'bike_rental') return <Bike className="size-4 mr-1" />;
    return <Tag className="size-4 mr-1" />;
  };
  
  // Format service data if available
  const renderServiceData = () => {
    if (!item.serviceData) return null;
    
    // For car rentals, show available vehicles
    if (item.subcategory === 'car_rental' && item.serviceData.vehicles) {
      return (
        <div className="mt-2 p-2 bg-blue-50 rounded-md">
          <p className="text-sm font-medium text-blue-700 mb-1">Available Vehicles:</p>
          <div className="space-y-1">
            {item.serviceData.vehicles.slice(0, 3).map((vehicle: any, i: number) => (
              <div key={i} className="flex justify-between text-xs">
                <span>{vehicle.type}</span>
                <span className="font-semibold">{vehicle.pricePerDay} THB/day</span>
              </div>
            ))}
            {item.serviceData.vehicles.length > 3 && (
              <p className="text-xs text-right text-gray-500">+{item.serviceData.vehicles.length - 3} more</p>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="rounded-lg overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 bg-white flex flex-col h-full">
      <div className="relative h-48 w-full">
        {item.mainImage ? (
          <Image 
            src={item.mainImage} 
            alt={item.name} 
            fill 
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="bg-gray-200 size-full flex items-center justify-center">
            <Search className="size-12 text-gray-400" />
          </div>
        )}
        {item.isSponsored && (
          <div className="absolute top-2 left-2 bg-amber-400/90 px-2 py-1 rounded-full text-xs font-medium text-amber-900">
            Sponsored
          </div>
        )}
        {item.isFeatured && (
          <div className="absolute top-2 right-2 bg-purple-500/90 px-2 py-1 rounded-full text-xs font-medium text-white">
            Featured
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className={`inline-flex items-center text-xs px-2 py-1 rounded ${
            item.type === 'activity' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {getSubcategoryIcon()}
            {item.subcategory?.replace('_', ' ') || item.category}
          </span>
          {ratingScore && (
            <div className="flex items-center">
              <Star className="size-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{ratingScore}</span>
              {reviewCount && (
                <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
              )}
            </div>
          )}
        </div>
        
        <h3 className="font-bold text-lg mb-2">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.shortDescription}</p>
        
        {renderServiceData()}
        
        <div className="mt-auto space-y-2 text-sm text-gray-600">
          {item.area && (
            <div className="flex items-center">
              <MapPin className="size-4 mr-2" />
              <span>{item.area}</span>
            </div>
          )}
          
          {item.hours && (
            <div className="flex items-center">
              <Clock className="size-4 mr-2" />
              <span>{item.hours}</span>
            </div>
          )}
          
          {item.priceRange && (
            <div className="flex items-center">
              <Euro className="size-4 mr-2" />
              <span>{item.priceRange}</span>
            </div>
          )}
          
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag: string) => (
                <span key={tag} className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                  <Tag className="size-3 mr-1" />
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{item.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ToolSearchParams {
  type: 'activity' | 'service' | 'both';
  category: string;
  subcategory: string;
  area: string;
  search: string;
  tags: string[];
  priceRange: string;
}

interface ActivitiesServicesToolResult {
  activities?: ActivityServiceItem[];
  services?: ActivityServiceItem[];
  count: number;
  searchParams: ToolSearchParams;
  error?: string;
}

interface ActivitiesServicesToolRendererProps {
  result: ActivitiesServicesToolResult;
}

export const ActivitiesServicesToolRenderer = ({ result }: ActivitiesServicesToolRendererProps) => {
  // Handle case where result is not properly formatted
  if (!result || ((!result.activities && !result.services) || result.error)) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-amber-700">
          {result?.error || "No data available or invalid format."}
        </p>
      </div>
    );
  }
  
  const { activities = [], services = [], searchParams, count } = result;
  const hasActivities = activities.length > 0;
  const hasServices = services.length > 0;
  
  // Get search parameters for display
  const typeLabel = searchParams.type === 'both' 
    ? 'Activities & Services' 
    : searchParams.type === 'activity' 
      ? 'Activities' 
      : 'Services';
      
  const categoryLabel = searchParams.category !== 'all' 
    ? `in category "${searchParams.category}"` 
    : '';
    
  const subcategoryLabel = searchParams.subcategory !== 'all'
    ? `(${searchParams.subcategory.replace('_', ' ')})`
    : '';
    
  const areaLabel = searchParams.area !== 'all island' 
    ? `in ${searchParams.area}` 
    : '';
    
  const searchLabel = searchParams.search 
    ? `matching "${searchParams.search}"` 
    : '';
  
  return (
    <div className="my-2 shadow-sm rounded-lg overflow-hidden border border-gray-200">
      <div className="p-3 flex items-center gap-2 bg-indigo-50 border-b border-indigo-100">
        <Search className="size-4 text-indigo-700" />
        <h3 className="font-medium text-indigo-800">
          {typeLabel} {categoryLabel} {subcategoryLabel} {areaLabel} {searchLabel}
        </h3>
        <span className="text-sm text-gray-500 ml-auto">
          {count} {count === 1 ? 'result' : 'results'} found
        </span>
      </div>
      
      <div className="p-4 bg-white">
        {hasActivities && (
          <div className="space-y-4 mb-6">
            <h4 className="text-md font-medium text-gray-800">Activities ({activities.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activities.slice(0, 3).map((activity: ActivityServiceItem) => (
                <ActivityServiceItem key={activity.id} item={activity} />
              ))}
            </div>
            {activities.length > 3 && (
              <div className="text-center mt-2">
                <p className="text-sm text-gray-600">
                  And {activities.length - 3} more activities available.
                </p>
              </div>
            )}
          </div>
        )}
        
        {hasServices && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800">Services ({services.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.slice(0, 3).map((service: ActivityServiceItem) => (
                <ActivityServiceItem key={service.id} item={service} />
              ))}
            </div>
            {services.length > 3 && (
              <div className="text-center mt-2">
                <p className="text-sm text-gray-600">
                  And {services.length - 3} more services available.
                </p>
              </div>
            )}
          </div>
        )}
        
        {!hasActivities && !hasServices && (
          <div className="p-4 text-center bg-gray-50 rounded-lg">
            <p className="text-gray-600">No results found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}; 