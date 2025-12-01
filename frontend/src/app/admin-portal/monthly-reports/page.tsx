"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

import ReportsList from '@/components/reports-list';


const MainContent = () => (
  <div className="flex-1 flex flex-col min-h-screen">
    <header className="bg-white shadow-sm border-b p-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Monthly Reports</h1>
      </div>
    </header>
    {<ReportsList />}
  </div>
);

export default function FinancialOverview() {
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