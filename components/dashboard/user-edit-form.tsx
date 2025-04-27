'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { X, Save, Loader2 } from 'lucide-react';

import { ProfileType } from '@/types/profile';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Custom component for tag inputs (interests, places, etc.)
interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
}

function TagInput({ tags, setTags, placeholder = "Add tag..." }: TagInputProps) {
  const [input, setInput] = useState("");
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()]);
      }
      setInput("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button 
              type="button" 
              onClick={() => removeTag(tag)}
              className="text-xs hover:bg-gray-200 rounded-full w-4 h-4 inline-flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
}

// Extended profile type to include admin status
interface ExtendedProfileType extends ProfileType {
  is_admin?: boolean;
}

interface UserEditFormProps {
  user: ExtendedProfileType;
  onSuccess?: () => void;
  redirectUrl?: string;
}

export function UserEditForm({ user, onSuccess, redirectUrl }: UserEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Simplified form to avoid TypeScript errors
  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(2).max(100),
        username: z.string().min(2).max(50),
        email: z.string().email(),
        bio: z.string().max(500).optional(),
        location: z.string().max(100).optional(),
        avatar: z.string().optional(),
        is_admin: z.boolean().default(false),
        interests: z.array(z.string()).optional(),
        favoritePlaces: z.array(z.string()).optional(),
        language: z.string().optional(),
        membershipTier: z.enum(['standard', 'premium', 'vip']).optional(),
        socialLinks: z.object({
          facebook: z.string().optional(),
          instagram: z.string().optional(),
          twitter: z.string().optional(),
          lineId: z.string().optional(),
        }).optional(),
        preferences: z.object({
          eventCategories: z.array(z.string()).optional(),
          guideCategories: z.array(z.string()).optional(),
          partnerCategories: z.array(z.string()).optional(),
          priceRanges: z.array(z.string()).optional(),
          accessibility: z.object({
            wheelchair: z.boolean().default(false),
            familyFriendly: z.boolean().default(false),
            petFriendly: z.boolean().default(false),
          }).optional(),
        }).optional(),
        privacySettings: z.object({
          showLocation: z.boolean().default(true),
          showInterests: z.boolean().default(true),
          showAttendedEvents: z.boolean().default(true),
          profileVisibility: z.enum(['public', 'friends', 'private']).default('public'),
        }).optional(),
        notifications: z.object({
          events: z.boolean().default(true),
          messages: z.boolean().default(true),
          updates: z.boolean().default(true),
          partnersDeals: z.boolean().default(true),
          pushEnabled: z.boolean().optional(),
          emailDigest: z.enum(['daily', 'weekly', 'monthly', 'never']).optional(),
        }).optional(),
      })
    ),
    defaultValues: {
      // Core identity
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      location: user.location || '',
      avatar: user.avatar || '',
      is_admin: user.is_admin || false,
      
      // Preferences
      interests: user.interests || [],
      favoritePlaces: user.favoritePlaces || [],
      language: user.language || '',
      membershipTier: user.membershipTier || 'standard',
      
      // Preferences object
      preferences: {
        eventCategories: user.preferences?.eventCategories || [],
        guideCategories: user.preferences?.guideCategories || [],
        partnerCategories: user.preferences?.partnerCategories || [],
        priceRanges: user.preferences?.priceRanges || [],
        accessibility: {
          wheelchair: user.preferences?.accessibility?.wheelchair || false,
          familyFriendly: user.preferences?.accessibility?.familyFriendly || false,
          petFriendly: user.preferences?.accessibility?.petFriendly || false,
        },
      },
      
      // Social links
      socialLinks: {
        facebook: user.socialLinks?.facebook || '',
        instagram: user.socialLinks?.instagram || '',
        twitter: user.socialLinks?.twitter || '',
        lineId: user.socialLinks?.lineId || '',
      },
      
      // Privacy settings
      privacySettings: {
        showLocation: user.privacySettings?.showLocation || true,
        showInterests: user.privacySettings?.showInterests || true,
        showAttendedEvents: user.privacySettings?.showAttendedEvents || true,
        profileVisibility: user.privacySettings?.profileVisibility || 'public',
      },
      
      // Notifications
      notifications: {
        events: user.notifications?.events || true,
        messages: user.notifications?.messages || true,
        updates: user.notifications?.updates || true,
        partnersDeals: user.notifications?.partnersDeals || true,
        pushEnabled: user.notifications?.pushEnabled || false,
        emailDigest: user.notifications?.emailDigest || 'weekly',
      },
    },
  });

  async function onSubmit(values: any) {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/dashboard/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user');
      }
      
      toast({
        title: 'Profile updated',
        description: 'The user profile has been updated successfully',
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full max-w-md mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || 'en'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="th">Thai</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="User bio" className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Brief description about the user. Limit 500 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="my-4" />
            
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-medium">Administrative Options</h3>
              
              <FormField
                control={form.control}
                name="is_admin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Administrator</FormLabel>
                      <FormDescription>
                        Grant administrator privileges to this user
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="membershipTier"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Membership Tier</FormLabel>
                    <FormDescription>
                      Select the user's membership level
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <RadioGroupItem value="standard" />
                          </FormControl>
                          <div className="space-y-0.5">
                            <FormLabel className="font-medium">
                              Standard
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Basic access to platform features
                            </FormDescription>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <RadioGroupItem value="premium" />
                          </FormControl>
                          <div className="space-y-0.5">
                            <FormLabel className="font-medium">
                              Premium
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Enhanced access with additional benefits
                            </FormDescription>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <RadioGroupItem value="vip" />
                          </FormControl>
                          <div className="space-y-0.5">
                            <FormLabel className="font-medium">
                              VIP
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Full access to all platform features
                            </FormDescription>
                          </div>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interests</FormLabel>
                    <FormControl>
                      <TagInput 
                        tags={field.value || []} 
                        setTags={(newTags) => field.onChange(newTags)}
                        placeholder="Add an interest and press Enter"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      User's interests and hobbies
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="favoritePlaces"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favorite Places</FormLabel>
                    <FormControl>
                      <TagInput 
                        tags={field.value || []} 
                        setTags={(newTags) => field.onChange(newTags)}
                        placeholder="Add a place and press Enter"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      User's favorite locations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Category Preferences</h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="preferences.eventCategories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Categories</FormLabel>
                      <FormControl>
                        <TagInput 
                          tags={field.value || []} 
                          setTags={(newTags) => field.onChange(newTags)}
                          placeholder="Add a category and press Enter"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferences.guideCategories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guide Categories</FormLabel>
                      <FormControl>
                        <TagInput 
                          tags={field.value || []} 
                          setTags={(newTags) => field.onChange(newTags)}
                          placeholder="Add a category and press Enter"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferences.partnerCategories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Categories</FormLabel>
                      <FormControl>
                        <TagInput 
                          tags={field.value || []} 
                          setTags={(newTags) => field.onChange(newTags)}
                          placeholder="Add a category and press Enter"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferences.priceRanges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Ranges</FormLabel>
                      <FormControl>
                        <TagInput 
                          tags={field.value || []} 
                          setTags={(newTags) => field.onChange(newTags)}
                          placeholder="Add a price range and press Enter"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Preferred price ranges (e.g., $, $$, $$$)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Accessibility Preferences</h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="preferences.accessibility.wheelchair"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Wheelchair Accessible</FormLabel>
                        <FormDescription>
                          Prefer wheelchair accessible places
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferences.accessibility.familyFriendly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Family Friendly</FormLabel>
                        <FormDescription>
                          Prefer family friendly places
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferences.accessibility.petFriendly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Pet Friendly</FormLabel>
                        <FormDescription>
                          Prefer pet friendly places
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="socialLinks.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input placeholder="Facebook username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="socialLinks.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="Instagram username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="socialLinks.twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input placeholder="Twitter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="socialLinks.lineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Line ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Line ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="privacySettings.profileVisibility"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Profile Visibility</FormLabel>
                    <FormDescription>
                      Control who can see the user's profile
                    </FormDescription>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="privacySettings.showLocation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Show Location</FormLabel>
                        <FormDescription>
                          Allow others to see your location
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="privacySettings.showInterests"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Show Interests</FormLabel>
                        <FormDescription>
                          Allow others to see your interests
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="privacySettings.showAttendedEvents"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Show Attended Events</FormLabel>
                        <FormDescription>
                          Allow others to see events you've attended
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Preferences</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="notifications.events"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Event Notifications</FormLabel>
                        <FormDescription>
                          Receive notifications about events
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notifications.messages"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Message Notifications</FormLabel>
                        <FormDescription>
                          Receive notifications about messages
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notifications.updates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Update Notifications</FormLabel>
                        <FormDescription>
                          Receive notifications about platform updates
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notifications.partnersDeals"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Partner Deals Notifications</FormLabel>
                        <FormDescription>
                          Receive notifications about partner deals
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notifications.emailDigest"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Email Digest</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select email digest frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="sticky bottom-0 py-4 bg-background/95 backdrop-blur border-t mt-8">
          <div className="container max-w-5xl mx-auto flex justify-end">
            <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
} 