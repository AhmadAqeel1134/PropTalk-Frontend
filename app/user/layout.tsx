'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EndUserSidebar from '@/components/layout/EndUserSidebar'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'

function UserLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    const token = localStorage.getItem('user_token')
    if (!token) {
      router.push('/login/user')
    }
  }, [router])

  return (
    <div
      className="min-h-screen"
      style={
        theme === 'dark'
          ? { background: 'rgba(10, 15, 25, 0.95)' }
          : { background: 'rgba(248, 250, 252, 0.98)' }
      }
    >
      <EndUserSidebar />
      <main className="min-h-screen lg:ml-[280px] p-6 md:p-8 lg:p-10">{children}</main>
    </div>
  )
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UserLayoutContent>{children}</UserLayoutContent>
    </ThemeProvider>
  )
}
