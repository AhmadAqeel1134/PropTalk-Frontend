'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, LogOut, Menu, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/admin/ThemeToggle'

export default function EndUserSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [{ name: 'Agents', href: '/user', icon: Building2 }]

  const handleLogout = () => {
    localStorage.removeItem('user_token')
    router.push('/login/user')
  }

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 border rounded-lg transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
              : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm'
          }`}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside
        className={`fixed top-0 left-0 h-full w-[280px] z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{
          background: theme === 'dark' ? 'rgba(10, 15, 25, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          borderRight: theme === 'dark' ? '1px solid rgba(77, 184, 255, 0.2)' : '1px solid rgba(229, 231, 235, 0.8)',
        }}
      >
        <div className="h-full flex flex-col p-6">
          <div className="mb-8">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>PropTalk</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Home seeker</p>
          </div>

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
                      ? theme === 'dark'
                        ? 'bg-gray-800 border border-gray-700 text-white'
                        : 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-white hover:bg-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mb-4">
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className={`lg:hidden fixed inset-0 z-30 ${theme === 'dark' ? 'bg-black/50' : 'bg-black/30'}`}
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}
    </>
  )
}
