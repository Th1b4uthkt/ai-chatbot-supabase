"use client";

import { useState } from 'react';

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
        // Consider using a more robust notification system than alert
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
  
  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`px-3 py-1 rounded text-white ${
        currentStatus 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-blue-500 hover:bg-blue-600'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? 'Updating...' : currentStatus ? 'Remove Admin' : 'Make Admin'}
    </button>
  );
} 