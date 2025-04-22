import { formatDistanceToNow, format } from 'date-fns';
import { CalendarIcon, Mail, MapPin, Pencil, Phone, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { EnhancedProfile } from '@/types/profile';

import { getUserProfile } from './actions';

interface ProfileDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfileDetailPage(props: ProfileDetailProps) {
  const params = await props.params;
  const { id } = params;
  const profile = await getUserProfile(id) as EnhancedProfile;
  
  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <p className="text-red-700">User profile not found</p>
        </div>
        <div className="mt-4">
          <Link 
            href="/dashboard/users" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            &larr; Back to users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Profile Details</h1>
        <Link 
          href="/dashboard/users" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          &larr; Back to users
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile summary and basic info card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center">
              <Avatar className="size-20 mb-4">
                <AvatarImage
                  alt={profile.name || profile.username || 'Profile Picture'}
                  src={profile.avatar || '/placeholder-avatar.png'}
                />
                <AvatarFallback>
                  {profile.name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <h2 className="text-xl font-bold">{profile.name || 'No name set'}</h2>
                <p className="text-blue-100">@{profile.username || 'No username'}</p>
                <p className="text-blue-100">{profile.email || 'No email'}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`px-2 py-1 rounded-full ${profile.is_admin ? 'bg-green-500' : 'bg-blue-700'}`}>
                {profile.is_admin ? 'Admin' : 'User'}
              </span>
              <span className="ml-2 text-blue-100">
                Joined: {profile.join_date ? formatDistanceToNow(new Date(profile.join_date), { addSuffix: true }) : 'Unknown'}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <span className="text-gray-600 text-sm">Location:</span>
                  <p>{profile.location || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Bio:</span>
                  <p className="italic">{profile.bio || 'No bio available'}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Events Attended:</span>
                  <p>{profile.events_attended || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interests and Preferences */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Interests & Preferences</h3>
            
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests && profile.interests.length > 0 ? (
                  profile.interests.map((interest, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No interests specified</p>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">Favorite Places</h4>
              <div className="flex flex-wrap gap-2">
                {profile.favorite_places && profile.favorite_places.length > 0 ? (
                  profile.favorite_places.map((place, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {place}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No favorite places specified</p>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">Accessibility Preferences</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <div className={`size-4 rounded-full mr-2 ${profile.preferences.accessibility.wheelchair ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Wheelchair Access</span>
                </div>
                <div className="flex items-center">
                  <div className={`size-4 rounded-full mr-2 ${profile.preferences.accessibility.petFriendly ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Pet Friendly</span>
                </div>
                <div className="flex items-center">
                  <div className={`size-4 rounded-full mr-2 ${profile.preferences.accessibility.familyFriendly ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Family Friendly</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Category Preferences</h4>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <span className="text-gray-600 text-sm">Event Categories:</span>
                  <p>
                    {profile.preferences.eventCategories.length > 0 
                      ? profile.preferences.eventCategories.join(', ') 
                      : 'No preferences set'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Guide Categories:</span>
                  <p>
                    {profile.preferences.guideCategories.length > 0 
                      ? profile.preferences.guideCategories.join(', ') 
                      : 'No preferences set'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Partner Categories:</span>
                  <p>
                    {profile.preferences.partnerCategories.length > 0 
                      ? profile.preferences.partnerCategories.join(', ') 
                      : 'No preferences set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social & Privacy */}
        <div className="space-y-6">
          {/* Social Links Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Social Links</h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(profile.social_links).map(([platform, link]) => (
                  <div key={platform} className="flex items-center">
                    <span className="w-24 text-gray-600 text-sm capitalize">{platform}:</span>
                    <p className="text-blue-600 truncate">
                      {link ? link : <span className="text-gray-400 italic">Not linked</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Profile Visibility</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                    {profile.privacy_settings.profileVisibility}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Show Location</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    profile.privacy_settings.showLocation 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.privacy_settings.showLocation ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Show Interests</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    profile.privacy_settings.showInterests 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.privacy_settings.showInterests ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Show Attended Events</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    profile.privacy_settings.showAttendedEvents 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.privacy_settings.showAttendedEvents ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                {Object.entries(profile.notifications).map(([type, enabled]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Saved Cards</h4>
              {profile.payment_methods.cards.length > 0 ? (
                <div className="space-y-2">
                  {profile.payment_methods.cards.map((card, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="font-medium">{card.type}</div>
                      <div className="text-gray-600">•••• •••• •••• {card.lastFour}</div>
                      <div className="text-sm text-gray-500">Expires: {card.expiryDate}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No cards saved</p>
              )}
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Alternative Payment Methods</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className={`size-4 rounded-full mr-2 ${profile.payment_methods.mobilePay ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Mobile Pay</span>
                </div>
                <div className="flex items-center">
                  <div className={`size-4 rounded-full mr-2 ${profile.payment_methods.cryptocurrencies ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Cryptocurrencies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Activity */}
      <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account Activity</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Registration Information</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span>{new Date(profile.created_at || '').toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Profile Update:</span>
                  <span>{new Date(profile.updated_at || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 