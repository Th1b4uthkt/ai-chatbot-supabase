'use client';

import { BarChart4, Home, LogOut, Settings, Users, Anchor, User, Calendar, Briefcase, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { createClient } from '@/lib/supabase/client';

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { theme } = useTheme();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const mainNavItems = [
    {
      title: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      color: 'text-blue-500',
    },
    {
      title: 'Users',
      icon: Users,
      href: '/dashboard/users',
      color: 'text-emerald-500',
    },
    {
      title: 'Activities',
      icon: MapPin,
      href: '/dashboard/activities',
      color: 'text-rose-500',
    },
    {
      title: 'Services',
      icon: Briefcase,
      href: '/dashboard/services',
      color: 'text-indigo-500',
    },
    {
      title: 'Events',
      icon: Calendar,
      href: '/dashboard/events',
      color: 'text-amber-500',
    },
    {
      title: 'Analytics',
      icon: BarChart4,
      href: '/dashboard/analytics',
      color: 'text-purple-500',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'text-amber-500',
    },
  ];

  const isActive = (path: string) => {
    // Check if the current path is or starts with the provided path
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <Sidebar variant="inset" className="border-r border-border/40 bg-card/50 backdrop-blur">
      <SidebarHeader className="border-b border-border/40">
        <div className="flex h-16 items-center gap-2 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Anchor className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Phangan Pirate</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="h-[calc(100vh-8rem)] overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Dashboard
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      className="group transition-all duration-200 hover:bg-accent/50"
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <span className={`${item.color} transition-all`}>
                          <item.icon className="size-5" />
                        </span>
                        <span className="font-medium">{item.title}</span>
                        {/* Active indicator bar */}
                        {isActive(item.href) && (
                          <span className="absolute inset-y-0 left-0 w-1 rounded-r-md bg-primary" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <User className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleSignOut} 
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="size-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Sign out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="mt-4">
          <SidebarTrigger />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
} 