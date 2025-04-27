import { Metadata } from 'next';

import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Phangan Pirate',
  description: 'Admin dashboard for managing users and content',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <div className="relative grid min-h-screen w-full lg:grid-cols-[auto_1fr]">
        <DashboardSidebar />
        <div className="flex min-h-screen flex-col">
          <main className="flex-1 overflow-x-hidden bg-background pt-4 pb-12">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 