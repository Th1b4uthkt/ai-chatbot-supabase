'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  badge?: {
    value: number;
    label: string;
    variant?: 'default' | 'sponsored' | 'featured';
  };
}

export function StatsCard({
  title,
  value,
  trend,
  icon,
  className,
  iconClassName,
  badge,
}: StatsCardProps) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-6 shadow-sm",
      className
    )}>
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && (
          <div className={cn(
            "h-8 w-8 flex items-center justify-center rounded-full bg-muted/20",
            iconClassName
          )}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex justify-between items-end">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          {trend !== undefined && (
            <p className={cn(
              "text-xs flex items-center mt-1",
              trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"
            )}>
              <span className="mr-1">
                {trend > 0 ? '↑' : trend < 0 ? '↓' : ''}
              </span>
              {trend !== 0 ? `${Math.abs(trend)}% from last month` : 'No change from last month'}
            </p>
          )}
        </div>
        {badge && (
          <div className={cn(
            "rounded-lg px-2 py-1 text-xs font-medium",
            badge.variant === 'sponsored' 
              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300" 
              : badge.variant === 'featured'
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
          )}>
            {badge.value} {badge.label}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatsGrid({ 
  children,
  className
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(
      "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
} 