

"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const MainContent = () => {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="bg-white shadow-sm border-b p-2 ">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Move-Out Notifications</h1>
        </div>
      </header>

      
      <div className="flex flex-1">
        <div className="p-6">
          <p className="text-gray-600">Move-out notifications functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default function MoveOutPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/admin-portal/login');
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-100">
      <MainContent />
    </div>
  );
}