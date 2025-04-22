"use client";

import { Loader2, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { toggleUserAdminStatus } from './actions';

export function ToggleAdminButton({ 
  userId, 
  isAdmin 
}: { 
  userId: string; 
  isAdmin: boolean;
}) {
  const [currentStatus, setCurrentStatus] = useState(isAdmin);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const result = await toggleUserAdminStatus(userId, !currentStatus);
      if (result.success) {
        setCurrentStatus(!currentStatus);
      } else {
        // Consider using a toast notification library here instead of alert
        console.error('Error updating status:', result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update user status');
    } finally {
      setIsLoading(false);
    }
  };
  
  const Icon = currentStatus ? UserX : UserCheck;

  return (
    <Button
      variant={currentStatus ? 'destructive' : 'outline'}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <Icon className="mr-2 size-4" />
      )}
      {isLoading ? 'Updating...' : currentStatus ? 'Remove Admin' : 'Make Admin'}
    </Button>
  );
} 