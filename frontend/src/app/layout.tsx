'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import Sidebar from "@/components/sidebar";
import { usePathname } from 'next/navigation';
import { DataProvider } from "@/contexts/DataContext";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const pathname = usePathname();
  const authPages = ['/admin-portal/login', '/admin-portal/signup', '/admin-portal/forgot-password', '/admin-portal', '/requests'];
  const isAuthPage = authPages.includes(pathname);

  if (isAuthPage) {
    return (
      <html lang="en">
        <body>
          <DataProvider>
            {children}
          </DataProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <Script
        src="https://www.google.com/recaptcha/api.js"
        strategy="afterInteractive"
      />

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DataProvider>
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-56">
              <TopBar />
              <main className="flex-1 overflow-auto pt-16">
                {children}
              </main>
            </div>
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
