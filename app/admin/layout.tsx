'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem('admin_token') || localStorage.getItem('access_token');
    if (!token) {
      router.push('/login/admin');
    }
  }, [router]);

  return (
    <div
      className="min-h-screen"
      style={
        theme === 'dark'
          ? { background: 'rgba(10, 15, 25, 0.95)' }
          : { background: 'rgba(248, 250, 252, 0.98)' }
      }
    >
      <Sidebar />
      <main className="lg:ml-[280px]">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ThemeProvider>
  );
}

