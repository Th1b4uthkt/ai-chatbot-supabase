'use client';

import { useEffect, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { UsersList } from '@/components/dashboard/users-list';

export function DashboardContent() {
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader 
        heading="Dashboard"
        text="Manage your users and site content."
      />
      
      <Tabs 
        defaultValue="overview" 
        className="space-y-4"
        value={selectedTab}
        onValueChange={setSelectedTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              </div>
              <div className="text-2xl font-bold">+254</div>
              <p className="text-xs text-muted-foreground">+19% from last month</p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">Events Created</p>
              </div>
              <div className="text-2xl font-bold">+42</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">Active Partners</p>
              </div>
              <div className="text-2xl font-bold">+24</div>
              <p className="text-xs text-muted-foreground">+3% from last month</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <UsersList />
        </TabsContent>
        <TabsContent value="content" className="space-y-4">
          <div className="rounded-lg border p-8 text-center">
            Content management coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 