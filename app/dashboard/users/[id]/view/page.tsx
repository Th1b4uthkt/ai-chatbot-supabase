import {
  ArrowLeft,
  AtSign,
  Calendar,
  CreditCard,
  Edit,
  Globe,
  Mail,
  MapPin,
  Shield,
  UserCog
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/server';
import { ProfileType, AchievementItem, ReviewItem, ActivityItem, PaymentCard } from '@/types/profile';

// Format dates
function formatDate(dateString?: string): string {
  if (!dateString) return 'Not set';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return dateString;
  }
}

export default async function UserViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  
  // Next.js 15 requires awaiting params
  const { id } = await params;
  
  // Check if user is authenticated and is admin
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Fetch user metadata to check if admin
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
    
  // Redirect if not admin
  if (!adminProfile?.is_admin) {
    redirect('/');
  }
  
  // Fetch the user being viewed
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
    
  if (!userProfile) {
    redirect('/dashboard/users');
  }
  
  // Cast to ProfileType to get proper typing
  const profile = userProfile as unknown as ProfileType;
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/dashboard/users" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to Users</span>
        </Link>
      </div>
      
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{profile.name || 'Unnamed User'}</h1>
          <p className="text-muted-foreground mt-1">User profile and detailed information</p>
        </div>
        
        <Link href={`/dashboard/users/${id}/edit`}>
          <Button>
            <Edit className="mr-2 size-4" />
            Edit Profile
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            <div className="relative">
              {profile.avatar ? (
                <Image 
                  src={profile.avatar} 
                  alt={`${profile.name}'s avatar`} 
                  width={96}
                  height={96}
                  className="rounded-xl object-cover border-4 border-background shadow-md"
                />
              ) : (
                <div className="size-24 rounded-xl bg-muted flex items-center justify-center border-4 border-background shadow-md">
                  <UserCog className="size-12 text-muted-foreground/50" />
                </div>
              )}
              {userProfile.is_admin && (
                <Badge variant="destructive" className="absolute -top-2 -right-2">
                  Admin
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{profile.name || 'Unnamed User'}</h2>
              <p className="text-sm text-muted-foreground">@{profile.username || 'username'}</p>
              <Badge className="capitalize mt-1" variant={
                profile.membershipTier === 'vip' ? 'destructive' : 
                profile.membershipTier === 'premium' ? 'default' : 
                'secondary'
              }>
                {profile.membershipTier || 'Standard'} Plan
              </Badge>
            </div>
          </CardHeader>
          
          <Separator className="my-2" />
          
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span>{profile.email || 'No email set'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <AtSign className="size-4 text-muted-foreground" />
                <span>{profile.username || 'No username set'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground" />
                <span>{profile.location || 'No location set'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span>Joined {formatDate(profile.joinDate)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Globe className="size-4 text-muted-foreground" />
                <span>{profile.language || 'No language set'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Shield className="size-4 text-muted-foreground" />
                <span>{userProfile.is_admin ? 'Administrator' : 'Regular User'}</span>
              </div>
              
              {profile.membershipTier && (
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="size-4 text-muted-foreground" />
                  <span className="capitalize">{profile.membershipTier} membership</span>
                </div>
              )}
            </div>
            
            {profile.bio && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Bio</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="grid grid-cols-3 w-full gap-2 text-center">
              <div className="space-y-0.5">
                <p className="text-lg font-medium">{profile.eventsAttended || 0}</p>
                <p className="text-xs text-muted-foreground">Events</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-lg font-medium">{profile.savedGuides?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Guides</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-lg font-medium">{profile.reviews?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
            </div>
          </CardFooter>
        </Card>
        
        {/* Tabs content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interests & Places</CardTitle>
                  <CardDescription>User&apos;s interests and favorite places</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests && profile.interests.length > 0 
                        ? profile.interests.map((interest, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))
                        : <span className="text-sm text-muted-foreground">No interests specified</span>}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Favorite Places</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.favoritePlaces && profile.favoritePlaces.length > 0 
                        ? profile.favoritePlaces.map((place, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {place}
                            </Badge>
                          ))
                        : <span className="text-sm text-muted-foreground">No favorite places specified</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preferred Categories</CardTitle>
                  <CardDescription>Preferred categories for events, guides, and partners</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Event Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferences?.eventCategories && profile.preferences.eventCategories.length > 0 
                        ? profile.preferences.eventCategories.map((category, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))
                        : <span className="text-sm text-muted-foreground">None specified</span>}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Guide Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferences?.guideCategories && profile.preferences.guideCategories.length > 0 
                        ? profile.preferences.guideCategories.map((category, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))
                        : <span className="text-sm text-muted-foreground">None specified</span>}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Partner Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferences?.partnerCategories && profile.preferences.partnerCategories.length > 0 
                        ? profile.preferences.partnerCategories.map((category, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))
                        : <span className="text-sm text-muted-foreground">None specified</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Accessibility Preferences</CardTitle>
                  <CardDescription>Preferred accessibility options</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`size-4 rounded-full ${profile.preferences?.accessibility.wheelchair ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">Wheelchair Accessible</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`size-4 rounded-full ${profile.preferences?.accessibility.familyFriendly ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">Family Friendly</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`size-4 rounded-full ${profile.preferences?.accessibility.petFriendly ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm">Pet Friendly</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Social Tab */}
            <TabsContent value="social" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Social Media Links</CardTitle>
                  <CardDescription>User&apos;s connected social accounts</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Facebook</h3>
                    <p className="text-sm text-muted-foreground">{profile.socialLinks?.facebook || 'Not linked'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Instagram</h3>
                    <p className="text-sm text-muted-foreground">{profile.socialLinks?.instagram || 'Not linked'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Twitter</h3>
                    <p className="text-sm text-muted-foreground">{profile.socialLinks?.twitter || 'Not linked'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Line ID</h3>
                    <p className="text-sm text-muted-foreground">{profile.socialLinks?.lineId || 'Not linked'}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Privacy Settings</CardTitle>
                  <CardDescription>User&apos;s privacy and visibility preferences</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Profile Visibility</h3>
                    <p className="text-sm capitalize">{profile.privacySettings?.profileVisibility || 'Not set'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Show Location</h3>
                    <p className="text-sm">{profile.privacySettings?.showLocation ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Show Interests</h3>
                    <p className="text-sm">{profile.privacySettings?.showInterests ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Show Attended Events</h3>
                    <p className="text-sm">{profile.privacySettings?.showAttendedEvents ? 'Yes' : 'No'}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notification Preferences</CardTitle>
                  <CardDescription>User&apos;s notification settings</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Event Notifications</h3>
                    <p className="text-sm">{profile.notifications?.events ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Message Notifications</h3>
                    <p className="text-sm">{profile.notifications?.messages ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Update Notifications</h3>
                    <p className="text-sm">{profile.notifications?.updates ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Partner Deals</h3>
                    <p className="text-sm">{profile.notifications?.partnersDeals ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Push Notifications</h3>
                    <p className="text-sm">{profile.notifications?.pushEnabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Email Digest</h3>
                    <p className="text-sm capitalize">{profile.notifications?.emailDigest || 'Not set'}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6 mt-6">
              {profile.activityFeed && profile.activityFeed.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                    <CardDescription>User&apos;s recent actions and interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {profile.activityFeed.slice(0, 10).map((activity: ActivityItem, i) => (
                        <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                          <div className="size-2 mt-2 rounded-full bg-primary"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{activity.type.replace('_', ' ').toUpperCase()}</div>
                            <div className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</div>
                            {activity.details && <div className="text-sm mt-1 text-muted-foreground">{activity.details}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {profile.reviews && profile.reviews.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reviews</CardTitle>
                    <CardDescription>Reviews left by the user</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {profile.reviews.map((review: ReviewItem, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="text-sm font-medium capitalize">
                              {review.entityType} Review
                            </div>
                            <div className="flex items-center bg-amber-50 px-2 py-0.5 rounded-full">
                              <span className="text-amber-500 mr-1">★</span>
                              <span className="text-xs font-medium">{review.rating}/5</span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{formatDate(review.date)}</div>
                          <div className="text-sm mt-2">{review.comment}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {profile.achievements && profile.achievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Achievements</CardTitle>
                    <CardDescription>User&apos;s achievements and badges</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.achievements.map((achievement: AchievementItem, i) => (
                        <div key={i} className="flex gap-3 border p-3 rounded-lg">
                          <div className="shrink-0">
                            {achievement.icon ? (
                              <Image 
                                src={achievement.icon} 
                                alt={achievement.title}
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                🏆
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{achievement.title}</div>
                            <div className="text-xs text-muted-foreground">{achievement.description}</div>
                            {achievement.dateUnlocked && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Unlocked: {formatDate(achievement.dateUnlocked)}
                              </div>
                            )}
                            {achievement.progress !== undefined && achievement.progress < 100 && (
                              <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                                <div 
                                  className="bg-primary h-1.5 rounded-full"
                                  style={{ width: `${achievement.progress}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 