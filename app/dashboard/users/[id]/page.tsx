import { formatDistanceToNow, format } from 'date-fns';
import {
  CalendarIcon,
  Eye,
  EyeOff,
  Facebook, // Example social icon
  Instagram, // Example social icon
  LineChart, // Placeholder for events attended
  Link as LinkIcon,
  LocateFixed,
  Mail,
  MapPin,
  MessageSquare, // Placeholder for Bio
  Pencil,
  Phone,
  ShieldCheck,
  ShieldOff,
  Sparkles, // Placeholder for Interests
  ThumbsUp, // Placeholder for favorite places
  Twitter, // Example social icon
  User,
  UserCheck,
  Users,
  Wallet,
  CheckCircle2,
  XCircle,
  Bell,
  BellOff,
  Settings,
  CreditCard,
  Smartphone,
  Bitcoin, // Placeholder for Crypto
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator'; // Import Separator
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Import Tooltip
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils'; // Assuming this takes only one argument
import { EnhancedProfile, SocialLinks } from '@/types/profile'; // Import SocialLinks type if needed

import { getUserProfile } from './actions';

// Helper to get social icon
const getSocialIcon = (platform: keyof SocialLinks) => {
  switch (platform) {
    case 'twitter': return <Twitter className="size-4 text-muted-foreground" />;
    case 'facebook': return <Facebook className="size-4 text-muted-foreground" />;
    case 'instagram': return <Instagram className="size-4 text-muted-foreground" />;
    // Add other platforms as needed
    default: return <LinkIcon className="size-4 text-muted-foreground" />;
  }
};

// Helper to display boolean values with icons/badges
const BooleanIndicator = ({ value, trueText = 'Enabled', falseText = 'Disabled' }: { value: boolean | undefined, trueText?: string, falseText?: string }) => {
  if (value === undefined) return <span className="text-muted-foreground italic">N/A</span>;
  return (
    <Badge variant={value ? 'default' : 'secondary'} className="capitalize">
      {value ? <CheckCircle2 className="size-3 mr-1" /> : <XCircle className="size-3 mr-1" />}
      {value ? trueText : falseText}
    </Badge>
  );
};

interface ProfileDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfileDetailPage(props: ProfileDetailProps) {
  const params = await props.params;
  const { id } = params;
  const profile = await getUserProfile(id) as EnhancedProfile | null; // Handle null case

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>User profile not found.</p>
          </CardContent>
          <CardFooter>
             <Button variant="outline" asChild>
               <Link href="/dashboard/users">
                 &larr; Back to Users
               </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Default values for potentially missing nested objects/arrays
  const safePreferences = profile.preferences || { accessibility: {}, eventCategories: [], guideCategories: [], partnerCategories: [] };
  const safeAccessibility = safePreferences.accessibility || {};
  const safeSocialLinks = profile.social_links || {};
  const safePrivacySettings = profile.privacy_settings || {};
  const safeNotifications = profile.notifications || {};
  const safePaymentMethods = profile.payment_methods || { cards: [], mobilePay: false, cryptocurrencies: false };

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
               <Link href="/dashboard/users">
                 &larr; Back to Users
               </Link>
            </Button>
            {/* Add Edit Button - link to an edit page */}
            <Button asChild>
              <Link href={`/dashboard/users/${id}/edit`}>
                <Pencil className="mr-2 size-4" /> Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Main Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="items-center text-center">
                 <Avatar className="size-24 mb-4">
                  <AvatarImage
                    alt={profile.name || profile.username || 'Profile Picture'}
                  />
                  <AvatarFallback className="text-3xl">
                    {profile.name?.charAt(0) || profile.username?.charAt(0) || <User />}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{profile.name || 'Unnamed User'}</CardTitle>
                <CardDescription>@{profile.username || 'no_username'}</CardDescription>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                   <Badge variant={profile.is_admin ? 'default' : 'secondary'}>
                    {profile.is_admin ? <ShieldCheck className="size-3 mr-1" /> : <User className="size-3 mr-1" />}
                    {profile.is_admin ? 'Admin' : 'User'}
                  </Badge>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Badge variant="outline">
                            <CalendarIcon className="size-3 mr-1" />
                            Joined {profile.created_at ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true }) : 'N/A'}
                          </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Registered on: {profile.created_at ? formatDate(profile.created_at) : 'Unknown date'}</p>
                      </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Separator />
                 <div className="space-y-2">
                   <h4 className="text-sm font-medium flex items-center"><Mail className="size-4 mr-2 text-muted-foreground"/> Email</h4>
                   <p className="text-sm text-muted-foreground">{profile.email || 'No email provided'}</p>
                 </div>
                 <Separator />
                 <div className="space-y-2">
                   <h4 className="text-sm font-medium flex items-center"><MapPin className="size-4 mr-2 text-muted-foreground"/> Location</h4>
                   <p className="text-sm text-muted-foreground">{profile.location || <span className="italic">Not specified</span>}</p>
                 </div>
                 <Separator />
                 <div className="space-y-2">
                   <h4 className="text-sm font-medium flex items-center"><MessageSquare className="size-4 mr-2 text-muted-foreground"/> Bio</h4>
                   <p className="text-sm text-muted-foreground italic">{profile.bio || 'No bio available'}</p>
                 </div>
                 <Separator />
                 <div className="space-y-2">
                   <h4 className="text-sm font-medium flex items-center"><LineChart className="size-4 mr-2 text-muted-foreground"/> Events Attended</h4>
                   <p className="text-sm text-muted-foreground">{profile.events_attended ?? 0}</p> {/* Use ?? for nullish coalescing */}
                 </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><LinkIcon className="size-5 mr-2" /> Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(safeSocialLinks).length > 0 ? Object.entries(safeSocialLinks).map(([platform, link]) => (
                  link ? (
                    <div key={platform} className="flex items-center gap-2">
                      {getSocialIcon(platform as keyof SocialLinks)}
                      <a
                        href={link.startsWith('http') ? link : `https://${link}`} // Ensure link has protocol
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate"
                      >
                        {link}
                      </a>
                    </div>
                  ) : null // Don't render if link is empty
                )) : <p className="text-sm text-muted-foreground italic">No social links provided.</p>}
                 {Object.values(safeSocialLinks).every(link => !link) && Object.entries(safeSocialLinks).length > 0 &&
                     <p className="text-sm text-muted-foreground italic">No social links provided.</p>
                 }
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Preferences, Settings, etc. */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><Sparkles className="size-5 mr-2" /> Interests & Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-md font-medium mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests && profile.interests.length > 0 ? (
                      profile.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">{interest}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No interests specified</p>
                    )}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-md font-medium mb-2">Favorite Places</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.favorite_places && profile.favorite_places.length > 0 ? (
                      profile.favorite_places.map((place, index) => (
                        <Badge key={index} variant="outline">{place}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No favorite places specified</p>
                    )}
                  </div>
                </div>
                <Separator />
                <div>
                   <h4 className="text-md font-medium mb-2">Accessibility</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      <span className="flex items-center gap-2">
                        <LocateFixed className="size-4 text-muted-foreground"/> Wheelchair: <BooleanIndicator value={safeAccessibility.wheelchair} trueText="Yes" falseText="No"/>
                      </span>
                      <span className="flex items-center gap-2">
                        <ThumbsUp className="size-4 text-muted-foreground"/> Pet Friendly: <BooleanIndicator value={safeAccessibility.petFriendly} trueText="Yes" falseText="No"/>
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="size-4 text-muted-foreground"/> Family Friendly: <BooleanIndicator value={safeAccessibility.familyFriendly} trueText="Yes" falseText="No"/>
                      </span>
                   </div>
                </div>
                 <Separator />
                 <div>
                   <h4 className="text-md font-medium mb-2">Category Preferences</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                     <div>
                       <h5 className="font-semibold">Events:</h5>
                       <p className="text-muted-foreground">{safePreferences.eventCategories?.length > 0 ? safePreferences.eventCategories.join(', ') : <span className="italic">None</span>}</p>
                     </div>
                      <div>
                       <h5 className="font-semibold">Guides:</h5>
                       <p className="text-muted-foreground">{safePreferences.guideCategories?.length > 0 ? safePreferences.guideCategories.join(', ') : <span className="italic">None</span>}</p>
                     </div>
                      <div>
                       <h5 className="font-semibold">Partners:</h5>
                       <p className="text-muted-foreground">{safePreferences.partnerCategories?.length > 0 ? safePreferences.partnerCategories.join(', ') : <span className="italic">None</span>}</p>
                     </div>
                   </div>
                 </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><Settings className="size-5 mr-2" /> Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Profile Visibility:</span>
                    <Badge variant="outline" className="capitalize">{safePrivacySettings.profileVisibility || 'N/A'}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Show Location:</span>
                    <BooleanIndicator value={safePrivacySettings.showLocation} />
                  </div>
                   <Separator />
                  <div className="flex justify-between items-center">
                    <span>Show Interests:</span>
                    <BooleanIndicator value={safePrivacySettings.showInterests} />
                  </div>
                   <Separator />
                  <div className="flex justify-between items-center">
                    <span>Show Attended Events:</span>
                    <BooleanIndicator value={safePrivacySettings.showAttendedEvents} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><Bell className="size-5 mr-2" /> Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                   {Object.entries(safeNotifications).length > 0 ? Object.entries(safeNotifications).map(([type, enabled]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <BooleanIndicator value={enabled} />
                    </div>
                  )) : <p className="text-sm text-muted-foreground italic">No notification preferences set.</p>}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><Wallet className="size-5 mr-2" /> Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <h4 className="text-md font-medium mb-2 flex items-center"><CreditCard className="size-4 mr-2 text-muted-foreground"/> Saved Cards</h4>
                   {safePaymentMethods.cards && safePaymentMethods.cards.length > 0 ? (
                     <div className="space-y-2">
                       {safePaymentMethods.cards.map((card, index) => (
                         <div key={index} className="p-3 border rounded-md bg-muted/50">
                           <div className="font-medium text-sm">{card.type}</div>
                           <div className="text-muted-foreground text-sm">•••• •••• •••• {card.lastFour}</div>
                           <div className="text-xs text-muted-foreground">Expires: {card.expiryDate}</div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-muted-foreground italic">No cards saved</p>
                   )}
                 </div>
                 <div>
                   <h4 className="text-md font-medium mb-2 flex items-center"><Sparkles className="size-4 mr-2 text-muted-foreground"/> Other Methods</h4>
                   <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                         <Smartphone className="size-4 text-muted-foreground"/> Mobile Pay: <BooleanIndicator value={safePaymentMethods.mobilePay} trueText="Yes" falseText="No"/>
                      </div>
                      <div className="flex items-center gap-2">
                         <Bitcoin className="size-4 text-muted-foreground"/> Crypto: <BooleanIndicator value={safePaymentMethods.cryptocurrencies} trueText="Yes" falseText="No"/>
                      </div>
                   </div>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
} 