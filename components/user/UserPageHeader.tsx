'use client'

import type { ReactNode } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Building2 } from 'lucide-react'

type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function UserPageHeader({ eyebrow = 'Client portal', title, subtitle, action }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className={`mb-8 rounded-2xl border p-6 md:p-8 backdrop-blur-sm shadow-xl transition-all duration-500 ${
        isDark
          ? 'border-gray-800/80 bg-gradient-to-br from-gray-900/90 to-gray-950/90'
          : 'border-gray-200/90 bg-gradient-to-br from-white to-slate-50/90 shadow-blue-950/5'
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${
              isDark ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-200 bg-blue-50 shadow-sm'
            }`}
            style={{
              boxShadow: isDark ? '0 4px 24px rgba(59, 158, 255, 0.15)' : undefined,
            }}
          >
            <Building2
              size={28}
              className={isDark ? 'text-blue-400' : 'text-blue-600'}
            />
          </div>
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-blue-400/90' : 'text-blue-600'
              }`}
            >
              {eyebrow}
            </p>
            <h1
              className={`mt-1 text-2xl font-bold md:text-3xl ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {title}
            </h1>
            {subtitle && (
              <p className={`mt-2 max-w-2xl text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
      </div>
    </div>
  )
}
