import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { UserEditForm } from '@/components/dashboard/user-edit-form';
import { Button } from '@/components/ui/button';
import { ProfileType } from '@/types/profile';

export default async function UserEditPage({
  params,
}: {
  params: { id: string };
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
  
  // Fetch the user being edited with all profile data
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
    
  if (!userProfile) {
    redirect('/dashboard/users');
  }
  
  // Cast to ProfileType and include admin status
  const profile = {
    ...userProfile,
    ...userProfile as unknown as ProfileType,
    is_admin: userProfile.is_admin || false
  };
  
  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link 
          href={`/dashboard/users/${id}/view`}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to User Details</span>
        </Link>
      </div>
      
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Profile: {profile.name || 'Unnamed User'}
        </h1>
        <p className="text-muted-foreground">
          Update user profile information and preferences
        </p>
      </div>
      
      <div className="bg-card/50 backdrop-blur border rounded-lg p-6 shadow-sm">
        <UserEditForm 
          user={profile} 
          redirectUrl={`/dashboard/users/${id}/view`}
        />
      </div>
    </div>
  );
} 