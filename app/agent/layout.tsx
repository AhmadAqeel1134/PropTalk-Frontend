'use client'

import React from 'react'
import AgentSidebar from '@/components/layout/AgentSidebar'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'

function AgentLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    const token = localStorage.getItem('agent_token') || localStorage.getItem('access_token')
    if (!token) {
      router.push('/login/agent')
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
      <AgentSidebar />
      <main className="lg:ml-[280px]">
        {children}
      </main>
    </div>
  )
}

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <AgentLayoutContent>{children}</AgentLayoutContent>
    </ThemeProvider>
  )
}

