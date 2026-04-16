'use client'

import { useMemo, useState } from 'react'
import {
  useAdminRagAgents,
  useAdminRagEmbeddingJobs,
  useAdminRagEmbeddingOverview,
  useAdminRagFailures,
  useAdminRagOverview,
  useAdminRagQueries,
  useAdminRagTimeseries,
  useAdminRagTopSources,
} from '@/hooks/useAdmin'
import { useTheme } from '@/contexts/ThemeContext'
import PageTransition from '@/components/common/PageTransition'

type WindowType = '7d' | '30d' | '90d'

function fmtMs(v?: number | null): string {
  if (v == null) return 'n/a'
  if (v < 1000) return `${Math.round(v)} ms`
  return `${(v / 1000).toFixed(2)} s`
}

export default function AdminRagAnalyticsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [window, setWindow] = useState<WindowType>('30d')
  const { data: agents } = useAdminRagAgents()
  const [agentId, setAgentId] = useState<string>('')

  const selectedAgentId = useMemo(() => {
    if (agentId) return agentId
    return (agents?.[0]?.id as string) || ''
  }, [agentId, agents])

  const { data: overview } = useAdminRagOverview(selectedAgentId, window)
  const { data: timeseries } = useAdminRagTimeseries(
    selectedAgentId,
    window,
    window === '90d' ? 'week' : 'day'
  )
  const { data: failures } = useAdminRagFailures(selectedAgentId, window, 12)
  const { data: topSources } = useAdminRagTopSources(selectedAgentId, window, 8)
  const { data: queries } = useAdminRagQueries(selectedAgentId, { window, page: 1, page_size: 12 })
  const { data: embedOverview } = useAdminRagEmbeddingOverview(selectedAgentId)
  const { data: embedJobs } = useAdminRagEmbeddingJobs(selectedAgentId, 8)

  const panel = isDark
    ? 'rounded-xl border border-gray-800 bg-gray-900/60 p-5'
    : 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'
  const heading = isDark ? 'text-white' : 'text-gray-900'
  const bars = (timeseries || []).map((x: any) => Number(x.total_queries || 0))
  const maxBars = Math.max(...bars, 1)

  return (
    <PageTransition>
    <div
      className="min-h-screen p-6 md:p-8"
      style={
        isDark
          ? { background: 'rgba(10, 15, 25, 0.95)' }
          : { background: 'rgba(248, 250, 252, 0.98)' }
      }
    >
      <div className="max-w-full space-y-8">
      <div
        className={`rounded-2xl p-6 md:p-8 backdrop-blur-sm border ${
          isDark
            ? 'bg-gradient-to-br from-gray-900/80 to-gray-950/80 border-gray-800/50'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-300 shadow-sm'
        }`}
      >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className={`text-3xl font-bold ${heading}`}>Admin RAG Analytics</h1>
          <p className={muted}>Select any real-estate-agent and inspect their RAG quality/latency/indexing.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className={`rounded-lg border px-3 py-2 text-sm ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            value={selectedAgentId}
            onChange={(e) => setAgentId(e.target.value)}
          >
            {(agents || []).map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.full_name} ({a.rag_queries} queries)
              </option>
            ))}
          </select>
          {(['7d', '30d', '90d'] as WindowType[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWindow(w)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                window === w
                  ? isDark
                    ? 'bg-gray-700 text-white'
                    : 'bg-blue-100 text-blue-800'
                  : isDark
                    ? 'bg-gray-900 border border-gray-700 text-gray-300'
                    : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
      </div>

      {!selectedAgentId ? (
        <div className={panel}>No agents found.</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[
              ['Total', overview?.total_queries ?? 0],
              ['Success %', `${overview?.success_rate_pct ?? 0}%`],
              ['P95', fmtMs(overview?.p95_total_latency_ms)],
              ['Faithfulness', overview?.avg_faithfulness ?? 'n/a'],
              ['Relevance', overview?.avg_answer_relevance ?? 'n/a'],
              ['Hallucination %', `${overview?.hallucination_rate_pct ?? 0}%`],
            ].map(([k, v]) => (
              <div key={String(k)} className={panel}>
                <p className={`text-sm ${muted}`}>{k}</p>
                <p className={`mt-2 text-xl font-semibold ${heading}`}>{v as any}</p>
              </div>
            ))}
          </div>

          <div className={panel}>
            <p className={`mb-2 text-sm ${muted}`}>Query volume trend</p>
            <div className="flex items-end gap-1 h-24">
              {bars.map((b: number, i: number) => (
                <div
                  key={`${i}-${b}`}
                  className={isDark ? 'bg-blue-400/70' : 'bg-blue-600/70'}
                  style={{ width: 12, height: `${Math.max(4, (b / maxBars) * 100)}%`, borderRadius: 4 }}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className={panel}>
              <h2 className={`mb-3 text-lg font-semibold ${heading}`}>Top Sources</h2>
              {(topSources || []).map((s: any) => (
                <div key={s.source} className="flex justify-between text-sm py-1">
                  <span className={heading}>{s.source}</span>
                  <span className={muted}>{s.count}</span>
                </div>
              ))}
              {!topSources?.length && <p className={muted}>No data.</p>}
            </div>

            <div className={panel}>
              <h2 className={`mb-3 text-lg font-semibold ${heading}`}>Embedding KPIs</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className={muted}>Jobs:</span> <span className={heading}>{embedOverview?.total_jobs ?? 0}</span></div>
                <div><span className={muted}>Completed:</span> <span className={heading}>{embedOverview?.completed_jobs ?? 0}</span></div>
                <div><span className={muted}>Stored-only:</span> <span className={heading}>{embedOverview?.stored_only_jobs ?? 0}</span></div>
                <div><span className={muted}>Avg Time:</span> <span className={heading}>{fmtMs(embedOverview?.avg_processing_time_ms)}</span></div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className={panel}>
              <h2 className={`mb-2 text-lg font-semibold ${heading}`}>Recent Failures</h2>
              {(failures || []).map((f: any) => (
                <div key={f.id} className={`mb-2 rounded-lg border p-2 ${isDark ? 'border-red-900/40' : 'border-red-200'}`}>
                  <p className={`text-sm ${heading}`}>{f.question}</p>
                  <p className={`text-xs ${muted}`}>{f.error_message || f.status}</p>
                </div>
              ))}
              {!failures?.length && <p className={muted}>No failures.</p>}
            </div>
            <div className={panel}>
              <h2 className={`mb-2 text-lg font-semibold ${heading}`}>Recent Embedding Jobs</h2>
              {(embedJobs || []).map((j: any) => (
                <div key={j.id} className={`mb-2 rounded-lg border p-2 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                  <p className={`text-sm ${heading}`}>Doc {j.document_id?.slice(0, 8)}... · {j.status}</p>
                  <p className={`text-xs ${muted}`}>{j.notes || '-'} · {fmtMs(j.processing_time_ms)}</p>
                </div>
              ))}
              {!embedJobs?.length && <p className={muted}>No embedding jobs.</p>}
            </div>
          </div>

          <div className={panel}>
            <h2 className={`mb-3 text-lg font-semibold ${heading}`}>Recent Query Logs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={muted}>
                    <th className="text-left py-2 pr-4">Question</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2 pr-4">Latency</th>
                    <th className="text-left py-2 pr-4">Faithful</th>
                    <th className="text-left py-2 pr-4">Rel.</th>
                  </tr>
                </thead>
                <tbody>
                  {(queries?.items || []).map((q: any) => (
                    <tr key={q.id} className={isDark ? 'border-t border-gray-800' : 'border-t border-gray-200'}>
                      <td className={`py-2 pr-4 max-w-[420px] truncate ${heading}`}>{q.question}</td>
                      <td className="py-2 pr-4">{q.status}</td>
                      <td className="py-2 pr-4">{fmtMs(q.total_latency_ms)}</td>
                      <td className="py-2 pr-4">{q.faithfulness_score ?? 'n/a'}</td>
                      <td className="py-2 pr-4">{q.answer_relevance_score ?? 'n/a'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
    </PageTransition>
  )
}
