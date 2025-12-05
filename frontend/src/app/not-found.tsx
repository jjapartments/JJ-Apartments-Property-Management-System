'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function NotFound() {
  // Hide sidebar and topbar immediately
  useEffect(() => {
    document.body.style.marginLeft = '0';
    const sidebar = document.querySelector('aside');
    const topbar = document.querySelector('header');
    const mainContent = document.querySelector('main');
    
    if (sidebar) sidebar.style.display = 'none';
    if (topbar) topbar.style.display = 'none';
    if (mainContent) mainContent.style.paddingTop = '0';
    
    return () => {
      document.body.style.marginLeft = '';
      if (sidebar) sidebar.style.display = '';
      if (topbar) topbar.style.display = '';
      if (mainContent) mainContent.style.paddingTop = '';
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 fixed inset-0 z-50">
      <div className="text-center max-w-md px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <h2 className="text-3xl font-semibold text-gray-900 mt-4 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>

        <Button 
          onClick={() => window.history.back()} 
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
}