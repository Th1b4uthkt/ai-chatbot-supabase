'use client';

import { LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';

export function DashboardContent() {
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader 
        heading="Dashboard Overview"
        text="Monitor platform performance with real-time data metrics."
      />
      
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 w-full border-b py-3">
        <div className="w-full max-w-4xl mx-auto flex items-center gap-2 pl-4">
          <LayoutDashboard className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Platform Analytics</h2>
        </div>
      </div>

      <div className="space-y-6 pt-2">
        <DashboardOverview />
      </div>
    </div>
  );
} 