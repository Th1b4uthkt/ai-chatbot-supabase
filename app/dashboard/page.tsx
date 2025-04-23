import { Activity, CreditCard, DollarSign, Users, Calendar, Map as MapIcon, Book, Star, Newspaper, TrendingUp, BarChart2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getEvents, getPartners, getGuides, getUsersCount, getSession } from "@/db/cached-queries"

type CategoryCount = {
  category: string;
  count: number;
};

// Fetch real data from the database
async function getData() {
  const events = await getEvents();
  const partners = await getPartners();
  const guides = await getGuides();
  const { totalUsers, activeUsers } = await getUsersCount();
  
  // For debugging purposes
  console.log("Events fetched:", events.length);
  if (events.length > 0) {
    console.log("First event sample:", {
      title: events[0].title,
      is_sponsored: events[0].is_sponsored,
      type_of_is_sponsored: typeof events[0].is_sponsored
    });
  }
  
  console.log("Users count:", { totalUsers, activeUsers });
  
  // Count sponsored items - handle nulls properly
  const sponsoredEvents = events.filter(event => event.is_sponsored === true).length;
  const sponsoredPartners = partners.filter(partner => partner.is_sponsored === true).length;
  const featuredGuides = guides.filter(guide => guide.isFeatured === true).length;
  
  // Process event categories using regular objects instead of Map to avoid TypeScript issues
  const eventCategories: Record<string, number> = {};
  events.forEach(event => {
    if (!event.category) return;
    const category = event.category;
    eventCategories[category] = (eventCategories[category] || 0) + 1;
  });
  
  // Process partner categories
  const partnerCategories: Record<string, number> = {};
  partners.forEach(partner => {
    // Use main_category from the fetched database row
    if (!partner.main_category) return; 
    const category = partner.main_category; // Use main_category (snake_case from DB)
    partnerCategories[category] = (partnerCategories[category] || 0) + 1;
  });
  
  // Process guide categories
  const guideCategories: Record<string, number> = {};
  guides.forEach(guide => {
    if (!guide.category) return;
    const category = guide.category;
    guideCategories[category] = (guideCategories[category] || 0) + 1;
  });
  
  // Convert to arrays for display
  const topEventCategories: CategoryCount[] = Object.entries(eventCategories)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  const topPartnerCategories: CategoryCount[] = Object.entries(partnerCategories)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  const topGuideCategories: CategoryCount[] = Object.entries(guideCategories)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Estimate revenue - this would come from a real calculation in a production app
  const revenue = 0;
  
  return {
    totalUsers,
    activeUsers,
    totalEvents: events.length,
    totalPartners: partners.length,
    totalGuides: guides.length,
    sponsoredEvents,
    sponsoredPartners,
    featuredGuides,
    revenue,
    topEventCategories,
    topPartnerCategories,
    guideCategories: topGuideCategories
  }
}

export default async function DashboardPage() {
  const data = await getData()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Badge variant="outline" className="text-sm py-1">
          Phangan Pirate
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sponsored">Sponsored</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {data.activeUsers} currently active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Events
                </CardTitle>
                <Calendar className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  {data.sponsoredEvents} sponsored
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Partners
                </CardTitle>
                <Star className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalPartners}</div>
                <p className="text-xs text-muted-foreground">
                  {data.sponsoredPartners} sponsored
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Guides
                </CardTitle>
                <Book className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalGuides}</div>
                <p className="text-xs text-muted-foreground">
                  {data.featuredGuides} featured
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Event Categories</CardTitle>
                <CardDescription>
                  Distribution of events by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topEventCategories.length > 0 ? (
                    data.topEventCategories.map((item) => (
                      <div className="flex items-center" key={item.category}>
                        <div className="w-1/3 font-medium truncate">{item.category}</div>
                        <div className="w-full">
                          <div className="flex h-2 items-center space-x-2">
                            <div 
                              className="h-2 bg-primary" 
                              style={{ width: `${(item.count / data.totalEvents) * 100}%` }}
                            />
                            <span className="text-sm text-muted-foreground">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground py-4">
                      No event categories data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Partner Categories</CardTitle>
                <CardDescription>
                  Top partner categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topPartnerCategories.length > 0 ? (
                    data.topPartnerCategories.map((item) => (
                      <div className="flex items-center" key={item.category}>
                        <div className="w-1/2 font-medium truncate">{item.category}</div>
                        <div className="w-full">
                          <div className="flex h-2 items-center space-x-2">
                            <div 
                              className="h-2 bg-primary" 
                              style={{ width: `${(item.count / data.totalPartners) * 100}%` }}
                            />
                            <span className="text-sm text-muted-foreground">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground py-4">
                      No partner categories data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Guide Categories</CardTitle>
                <CardDescription>
                  Top guide categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.guideCategories.length > 0 ? (
                    data.guideCategories.map((item) => (
                      <div className="flex items-center" key={item.category}>
                        <div className="w-1/2 font-medium truncate">{item.category}</div>
                        <div className="w-full">
                          <div className="flex h-2 items-center space-x-2">
                            <div 
                              className="h-2 bg-primary" 
                              style={{ width: `${(item.count / data.totalGuides) * 100}%` }}
                            />
                            <span className="text-sm text-muted-foreground">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground py-4">
                      No guide categories data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
                <CardDescription>
                  User activity over the past month
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <BarChart2 className="size-16 text-muted-foreground opacity-50" />
                <div className="ml-4 text-sm text-muted-foreground">
                  Analytics data will appear here
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Popular Content</CardTitle>
                <CardDescription>
                  Most viewed pages and content
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <TrendingUp className="size-16 text-muted-foreground opacity-50" />
                <div className="ml-4 text-sm text-muted-foreground">
                  Analytics data will appear here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sponsored" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sponsored Content</CardTitle>
              <CardDescription>
                Overview of all sponsored content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Sponsored Events</h3>
                  {data.sponsoredEvents > 0 ? (
                    <div>List of sponsored events would appear here</div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-4">
                      No sponsored events at the moment
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Sponsored Partners</h3>
                  {data.sponsoredPartners > 0 ? (
                    <div>List of sponsored partners would appear here</div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-4">
                      No sponsored partners at the moment
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Featured Guides</h3>
                  {data.featuredGuides > 0 ? (
                    <div>List of featured guides would appear here</div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-4">
                      No featured guides at the moment
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

