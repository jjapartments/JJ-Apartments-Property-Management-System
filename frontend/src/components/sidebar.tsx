'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Building2, 
  Users, 
  DollarSign,
  LogOut,
  BanknoteArrowUpIcon,
  Ticket
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', href: '/admin-portal/dashboard', icon: Home },
    { name: 'Apartments', href: '/admin-portal/apartment-overview', icon: Building2 },
    { name: 'Tenants', href: '/admin-portal/tenants-management', icon: Users },
    { name: 'Financial', href: '/admin-portal/financial-tracking', icon: DollarSign },
    { name: 'Monthly Reports', href: '/admin-portal/monthly-reports', icon: BanknoteArrowUpIcon },
    { name: 'Request Tickets', href: '/admin-portal/request-tickets', icon: Ticket },
  ];

  const handleLogout = () => logout();

  return (
    <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-56 bg-white shadow-md border-r z-40">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-3 border-b">
          <div className="flex justify-center">
            <Image 
              src="/logo-no-bg.png" 
              alt="JJ Apartments Logo" 
              width={70}
              height={70}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-base text-center font-semibold text-gray-900">JJ Apartments</h1>
          <p className="text-[11px] text-center text-gray-500">Property Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-yellow-300 text-yellow-800 font-semibold'
                        : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-700'
                    }`}
                  >
                    <item.icon className="h-4.5 w-4.5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}

            {/* Logout */}
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md transition-colors duration-200 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t">
          <div className="text-[12px] text-gray-500 text-center">
            © 2025 JJ Apartments
          </div>
        </div>
      </div>
    </div>
  );
}
