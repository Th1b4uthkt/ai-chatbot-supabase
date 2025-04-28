import { redirect } from 'next/navigation';

import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Check if user is authenticated and is admin
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Fetch user metadata to check if admin
  // In a real app, you would have a proper role management system
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  // Redirect if not admin - assuming isAdmin is stored in profile
  // This is a simplistic approach - in production you might use a more robust roles system
  if (!profile?.is_admin) {
    redirect('/');
  }
  
  return (
    <div className="container mx-auto py-10">
      <DashboardContent />
    </div>
  );
} 