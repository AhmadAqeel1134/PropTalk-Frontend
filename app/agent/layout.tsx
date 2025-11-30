'use client'

import React from 'react'
import AgentSidebar from '@/components/layout/AgentSidebar'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('agent_token') || localStorage.getItem('access_token')
    if (!token) {
      router.push('/login/agent')
    }
  }, [router])

  return (
    <div className="min-h-screen" style={{ background: 'rgba(10, 15, 25, 0.95)' }}>
      <AgentSidebar />
      <main className="lg:ml-[280px]">
        {children}
      </main>
    </div>
  )
}

