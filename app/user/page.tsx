'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { listDirectoryAgents, getEndUserMe } from '@/lib/end_user/api'
import { Building2, CheckCircle, User } from 'lucide-react'

export default function UserAgentsDirectoryPage() {
  const { theme } = useTheme()
  const { data: me } = useQuery({ queryKey: ['endUser', 'me'], queryFn: getEndUserMe })
  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['endUser', 'agents'],
    queryFn: listDirectoryAgents,
  })

  const cardClass =
    theme === 'dark'
      ? 'bg-gray-900/80 border border-gray-800 hover:border-blue-500/40'
      : 'bg-white border border-gray-200 hover:border-blue-300 shadow-sm'

  return (
    <div>
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Real estate agents
          </h1>
          <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Choose an agent to see your calls and showings with them only.
          </p>
        </div>
        {me && (
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <User size={16} />
            <span>{me.full_name}</span>
            {me.phone_number ? (
              <span className="opacity-70">· phone on file</span>
            ) : (
              <span className="text-amber-500">· add phone on agent page</span>
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Loading agents…</p>
      )}
      {error && (
        <p className="text-red-500">{error instanceof Error ? error.message : 'Failed to load agents'}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(agents || []).map((a) => (
          <Link
            key={a.id}
            href={`/user/agents/${a.id}`}
            className={`block rounded-xl p-5 transition-colors ${cardClass}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'
                  }`}
                >
                  <Building2 className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={22} />
                </div>
                <div>
                  <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {a.full_name}
                  </h2>
                  {a.company_name && (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {a.company_name}
                    </p>
                  )}
                </div>
              </div>
              {a.is_verified && (
                <CheckCircle className="shrink-0 text-emerald-500" size={20} title="Verified" />
              )}
            </div>
          </Link>
        ))}
      </div>

      {!isLoading && agents?.length === 0 && (
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          No verified agents are listed yet.
        </p>
      )}
    </div>
  )
}
