'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import PageTransition from '@/components/common/PageTransition'
import UserPageHeader from '@/components/user/UserPageHeader'
import { listDirectoryAgents, getEndUserMe } from '@/lib/end_user/api'
import { Building2, CheckCircle, ChevronRight, User } from 'lucide-react'

export default function UserAgentsDirectoryPage() {
  const { theme } = useTheme()
  const { data: me } = useQuery({ queryKey: ['endUser', 'me'], queryFn: getEndUserMe })
  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['endUser', 'agents'],
    queryFn: listDirectoryAgents,
  })

  const isDark = theme === 'dark'

  const cardClass = isDark
    ? 'group border border-gray-800/90 bg-gray-900/50 hover:border-blue-500/35 hover:bg-gray-900/80 hover:shadow-lg hover:shadow-blue-500/5'
    : 'group border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/5'

  return (
    <PageTransition>
      <div className="max-w-full">
        <UserPageHeader
          title="Find your agent"
          subtitle="Browse verified agents and open your personal history — calls, showings, and Q&A — scoped to your phone number."
          action={
            me ? (
              <div
                className={`flex max-w-xs items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                  isDark
                    ? 'border-gray-700 bg-gray-950/80 text-gray-300'
                    : 'border-gray-200 bg-white text-gray-700 shadow-sm'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-blue-50'
                  }`}
                >
                  <User size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{me.full_name}</p>
                  <p className={`truncate text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {me.phone_number ? (
                      <span className="text-emerald-500/90">Phone saved — history enabled</span>
                    ) : (
                      <span className="text-amber-500">Add phone via sidebar</span>
                    )}
                  </p>
                </div>
              </div>
            ) : null
          }
        />

        {isLoading && (
          <div
            className={`rounded-xl border p-8 text-center text-sm ${
              isDark ? 'border-gray-800 bg-gray-900/40 text-gray-400' : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            Loading agents…
          </div>
        )}
        {error && (
          <div
            className={`rounded-xl border p-4 text-sm ${
              isDark ? 'border-red-900/50 bg-red-950/30 text-red-300' : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {error instanceof Error ? error.message : 'Failed to load agents'}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(agents || []).map((a) => (
            <Link
              key={a.id}
              href={`/user/agents/${a.id}`}
              className={`block rounded-2xl p-5 transition-all duration-300 ${cardClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                      isDark ? 'border-gray-700 bg-gray-800/80' : 'border-gray-100 bg-blue-50/90'
                    }`}
                  >
                    <Building2 className={isDark ? 'text-blue-400' : 'text-blue-600'} size={24} />
                  </div>
                  <div className="min-w-0">
                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{a.full_name}</h2>
                    {a.company_name && (
                      <p className={`truncate text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {a.company_name}
                      </p>
                    )}
                  </div>
                </div>
                {a.is_verified && (
                  <CheckCircle className="shrink-0 text-emerald-500" size={20} aria-label="Verified" />
                )}
              </div>
              <div
                className={`mt-4 flex items-center justify-end text-xs font-medium ${
                  isDark ? 'text-blue-400 opacity-0 group-hover:opacity-100' : 'text-blue-600 opacity-0 group-hover:opacity-100'
                }`}
              >
                View history <ChevronRight size={14} className="ml-0.5" />
              </div>
            </Link>
          ))}
        </div>

        {!isLoading && agents?.length === 0 && (
          <p className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            No verified agents are listed yet.
          </p>
        )}
      </div>
    </PageTransition>
  )
}
