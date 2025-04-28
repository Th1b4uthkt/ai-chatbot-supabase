import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';


import { ActivityEditForm } from '@/components/dashboard/activity-edit-form';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';

export default async function CreateActivityPage() {
  const supabase = await createClient();
  
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
  
  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link 
          href="/dashboard/activities"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Activities</span>
        </Link>
      </div>
      
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Activity
        </h1>
        <p className="text-muted-foreground">
          Add a new activity to the system
        </p>
      </div>
      
      <div className="bg-card/50 backdrop-blur border rounded-lg p-6 shadow-sm">
        <ActivityEditForm redirectUrl="/dashboard/activities" />
      </div>
    </div>
  );
} 