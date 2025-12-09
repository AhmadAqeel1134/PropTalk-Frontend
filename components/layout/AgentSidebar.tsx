'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Building,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Phone,
  Radio,
} from 'lucide-react'

const AgentSidebar: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    {
      name: 'Dashboard',
      href: '/agent/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Contacts',
      href: '/agent/contacts',
      icon: Users,
    },
    {
      name: 'Properties',
      href: '/agent/properties',
      icon: Building,
    },
    {
      name: 'Documents',
      href: '/agent/documents',
      icon: FileText,
    },
    {
      name: 'Call History',
      href: '/agent/calls',
      icon: Phone,
    },
    {
      name: 'Voice Agent',
      href: '/agent/voice-agent',
      icon: Radio,
    },
    {
      name: 'Profile',
      href: '/agent/profile',
      icon: User,
    },
  ]

  const handleLogout = () => {
    localStorage.removeItem('agent_token')
    localStorage.removeItem('access_token')
    router.push('/login/agent')
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{
          background: 'rgba(10, 15, 25, 0.95)',
          borderRight: '1px solid rgba(77, 184, 255, 0.2)',
        }}
      >
        <div className="h-full flex flex-col p-6">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">PropTalk</h1>
            <p className="text-sm text-gray-400">Agent Portal</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gray-800 border border-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default AgentSidebar

