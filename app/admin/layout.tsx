'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem('admin_token') || localStorage.getItem('access_token');
    if (!token) {
      router.push('/login/admin');
    }
  }, [router]);

  return (
    <div className="min-h-screen" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
      <Sidebar />
      <main className="lg:ml-[280px]">
        {children}
      </main>
    </div>
  );
}

