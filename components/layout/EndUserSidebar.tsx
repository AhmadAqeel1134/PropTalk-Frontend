'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Building2, LogOut, Menu, Phone, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/admin/ThemeToggle'
import EndUserPhoneModal from '@/components/user/EndUserPhoneModal'
import { getEndUserMe } from '@/lib/end_user/api'

export default function EndUserSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [phoneModalOpen, setPhoneModalOpen] = useState(false)

  const { data: me } = useQuery({
    queryKey: ['endUser', 'me'],
    queryFn: getEndUserMe,
  })

  const navigation = [{ name: 'Agents', href: '/user', icon: Building2 }]

  const handleLogout = () => {
    localStorage.removeItem('user_token')
    router.push('/login/user')
  }

  const isDark = theme === 'dark'

  return (
    <>
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-lg border p-2.5 transition-all duration-200 ${
            isDark
              ? 'border-gray-700 bg-gray-900/95 text-gray-300 hover:text-white'
              : 'border-gray-200 bg-white text-gray-700 shadow-sm hover:text-gray-900'
          }`}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-[280px] transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{
          background: isDark ? 'rgba(10, 15, 25, 0.97)' : 'rgba(255, 255, 255, 0.98)',
          borderRight: isDark ? '1px solid rgba(77, 184, 255, 0.2)' : '1px solid rgba(229, 231, 235, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex h-full flex-col">
          <div
            className={`border-b p-6 ${isDark ? 'border-gray-800/80' : 'border-gray-200'}`}
          >
            <Link
              href="/user"
              className="group flex items-center gap-3"
              onClick={() => setIsOpen(false)}
            >
              <div
                className="rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #3b9eff 0%, #1e5fb8 100%)',
                  boxShadow: '0 4px 18px rgba(59, 158, 255, 0.45)',
                }}
              >
                <Building2 size={26} className="text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>PropTalk</h1>
                <p className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                  Client portal
                </p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || (item.href === '/user' && !!pathname?.startsWith('/user/'))
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200 ${
                    isActive
                      ? isDark
                        ? 'border border-gray-700 bg-gray-800 text-white shadow-lg shadow-black/20'
                        : 'border border-blue-200 bg-blue-50 text-blue-800 shadow-sm'
                      : isDark
                        ? 'text-gray-400 hover:bg-gray-900 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            <button
              type="button"
              onClick={() => {
                setPhoneModalOpen(true)
                setIsOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition-all duration-200 ${
                isDark
                  ? 'text-gray-400 hover:bg-gray-900 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Phone size={20} className={isDark ? 'text-blue-400/90' : 'text-blue-600'} />
              <span className="flex-1">My phone</span>
              {me?.phone_number && me.phone_number.length >= 10 ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  OK
                </span>
              ) : (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Add
                </span>
              )}
            </button>
          </nav>

          <div
            className={`border-t p-4 ${isDark ? 'border-gray-800/80' : 'border-gray-200'}`}
          >
            {me && (
              <p
                className={`mb-3 truncate text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
                title={me.email}
              >
                {me.full_name}
                <br />
                <span className="opacity-80">{me.email}</span>
              </p>
            )}
            <div className="mb-3">
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200 ${
                isDark
                  ? 'text-gray-400 hover:bg-gray-900 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className={`fixed inset-0 z-30 lg:hidden ${isDark ? 'bg-black/55' : 'bg-black/35'}`}
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      <EndUserPhoneModal
        open={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        currentPhone={me?.phone_number}
      />
    </>
  )
}
