import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { EventsList } from '@/components/dashboard/events-list';

export default async function EventsPage() {
  const supabase = await createClient();
  
  // Check if user is authenticated and is admin
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Fetch user metadata to check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  // Redirect if not admin
  if (!profile?.is_admin) {
    redirect('/');
  }
  
  return (
    <div className="container mx-auto py-10">
      <DashboardHeader 
        heading="Event Management"
        text="View and manage all events in the system."
      />
      <div className="mt-6">
        <EventsList />
      </div>
    </div>
  );
} 