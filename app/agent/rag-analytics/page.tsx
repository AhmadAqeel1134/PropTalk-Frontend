'use client'

import { useMemo, useState } from 'react'
import {
  useAgentRagFailures,
  useAgentRagOverview,
  useAgentRagQueries,
  useAgentRagTimeseries,
  useAgentRagTopSources,
  useAgentRagEmbeddingOverview,
  useAgentRagEmbeddingJobs,
} from '@/hooks/useAgent'
import { useTheme } from '@/contexts/ThemeContext'
import PageTransition from '@/components/common/PageTransition'

type WindowType = '7d' | '30d' | '90d'

function formatMs(v?: number | null): string {
  if (v == null) return 'n/a'
  if (v < 1000) return `${Math.round(v)} ms`
  return `${(v / 1000).toFixed(2)} s`
}

function MiniBars({
  values,
  label,
  dark,
}: {
  values: number[]
  label: string
  dark: boolean
}) {
  const max = Math.max(...values, 1)
  return (
    <div>
      <p className={`mb-2 text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</p>
      <div className="flex items-end gap-1 h-28">
        {values.map((v, idx) => (
          <div
            key={`${idx}-${v}`}
            title={`${v}`}
            className={dark ? 'bg-blue-400/70' : 'bg-blue-600/70'}
            style={{ width: 12, height: `${Math.max(4, (v / max) * 100)}%`, borderRadius: 4 }}
          />
        ))}
      </div>
    </div>
  )
}

export default function AgentRagAnalyticsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [window, setWindow] = useState<WindowType>('30d')

  const { data: overview } = useAgentRagOverview(window)
  const { data: timeseries } = useAgentRagTimeseries(window, window === '90d' ? 'week' : 'day')
  const { data: failures } = useAgentRagFailures(window, 12)
  const { data: topSources } = useAgentRagTopSources(window, 8)
  const { data: queries } = useAgentRagQueries({ window, page: 1, page_size: 15 })
  const { data: embedOverview } = useAgentRagEmbeddingOverview()
  const { data: embedJobs } = useAgentRagEmbeddingJobs(12)

  const totalSeries = useMemo(
    () => (timeseries || []).map((x: any) => Number(x.total_queries || 0)),
    [timeseries]
  )
  const latencySeries = useMemo(
    () => (timeseries || []).map((x: any) => Number(x.avg_total_latency_ms || 0)),
    [timeseries]
  )

  const panel = isDark
    ? 'rounded-xl border border-gray-800 bg-gray-900/60 p-5'
    : 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm'
  const muted = isDark ? 'text-gray-400' : 'text-gray-600'
  const heading = isDark ? 'text-white' : 'text-gray-900'

  const kpi = [
    { label: 'Total Queries', value: overview?.total_queries ?? 0 },
    { label: 'Success Rate', value: `${overview?.success_rate_pct ?? 0}%` },
    { label: 'P95 Latency', value: formatMs(overview?.p95_total_latency_ms) },
    { label: 'Avg Faithfulness', value: overview?.avg_faithfulness ?? 'n/a' },
    { label: 'Avg Relevance', value: overview?.avg_answer_relevance ?? 'n/a' },
    { label: 'Hallucination Rate', value: `${overview?.hallucination_rate_pct ?? 0}%` },
  ]

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className={`text-3xl font-bold ${heading}`}>RAG Validator & Analytics</h1>
          <p className={muted}>
            Accuracy, retrieval quality, latency, failures, and evidence for your knowledge-base Q&A.
          </p>
        </div>
        <div className="flex gap-2">
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpi.map((item) => (
          <div key={item.label} className={panel}>
            <p className={`text-sm ${muted}`}>{item.label}</p>
            <p className={`mt-2 text-2xl font-semibold ${heading}`}>{item.value as any}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className={panel}>
          <MiniBars values={totalSeries} label="Query Volume Trend" dark={isDark} />
        </div>
        <div className={panel}>
          <MiniBars values={latencySeries} label="Average Latency Trend (ms)" dark={isDark} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className={panel}>
          <h2 className={`mb-3 text-lg font-semibold ${heading}`}>Embedding / Indexing KPIs</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className={muted}>Total Jobs:</span> <span className={heading}>{embedOverview?.total_jobs ?? 0}</span></div>
            <div><span className={muted}>Completed:</span> <span className={heading}>{embedOverview?.completed_jobs ?? 0}</span></div>
            <div><span className={muted}>Stored-only:</span> <span className={heading}>{embedOverview?.stored_only_jobs ?? 0}</span></div>
            <div><span className={muted}>Failed:</span> <span className={heading}>{embedOverview?.failed_jobs ?? 0}</span></div>
            <div><span className={muted}>Avg Time:</span> <span className={heading}>{formatMs(embedOverview?.avg_processing_time_ms)}</span></div>
            <div><span className={muted}>Avg Chunks:</span> <span className={heading}>{embedOverview?.avg_chunk_count ?? 0}</span></div>
          </div>
        </div>
        <div className={panel}>
          <h2 className={`mb-3 text-lg font-semibold ${heading}`}>Top Sources</h2>
          {!topSources?.length && <p className={muted}>No source data yet.</p>}
          <div className="space-y-2">
            {(topSources || []).map((s: any) => (
              <div key={s.source} className="flex items-center justify-between text-sm">
                <span className={`truncate pr-3 ${heading}`}>{s.source}</span>
                <span className={muted}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={panel}>
          <h2 className={`mb-3 text-lg font-semibold ${heading}`}>Recent Failures</h2>
          {!failures?.length && <p className={muted}>No recent failures.</p>}
          <div className="space-y-3">
            {(failures || []).map((f: any) => (
              <div key={f.id} className={`rounded-lg border p-3 ${isDark ? 'border-red-900/40' : 'border-red-200'}`}>
                <p className={`text-sm font-medium ${heading}`}>{f.question}</p>
                <p className={`mt-1 text-xs ${muted}`}>{f.error_message || f.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={panel}>
        <h2 className={`mb-3 text-lg font-semibold ${heading}`}>Recent Embedding/Indexing Jobs</h2>
        {!embedJobs?.length && <p className={muted}>No embedding job logs yet.</p>}
        {!!embedJobs?.length && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2 pr-4">Document</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2 pr-4">Model</th>
                  <th className="text-left py-2 pr-4">Chunks</th>
                  <th className="text-left py-2 pr-4">Time</th>
                  <th className="text-left py-2 pr-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {embedJobs.map((j: any) => (
                  <tr key={j.id} className={isDark ? 'border-t border-gray-800' : 'border-t border-gray-200'}>
                    <td className={`py-2 pr-4 ${heading}`}>{j.document_id.slice(0, 8)}...</td>
                    <td className="py-2 pr-4">{j.status}</td>
                    <td className="py-2 pr-4">{j.embedding_model || '-'}</td>
                    <td className="py-2 pr-4">{j.chunk_count ?? '-'}</td>
                    <td className="py-2 pr-4">{formatMs(j.processing_time_ms)}</td>
                    <td className="py-2 pr-4 max-w-[420px] truncate">{j.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={panel}>
        <h2 className={`mb-3 text-lg font-semibold ${heading}`}>Recent Query Evaluations</h2>
        {!queries?.items?.length && <p className={muted}>No logged RAG queries yet.</p>}
        {!!queries?.items?.length && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <th className="text-left py-2 pr-4">Question</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2 pr-4">Latency</th>
                  <th className="text-left py-2 pr-4">Faithful</th>
                  <th className="text-left py-2 pr-4">Relevance</th>
                  <th className="text-left py-2 pr-4">Sources</th>
                </tr>
              </thead>
              <tbody>
                {queries.items.map((q: any) => (
                  <tr key={q.id} className={isDark ? 'border-t border-gray-800' : 'border-t border-gray-200'}>
                    <td className={`py-2 pr-4 max-w-[380px] truncate ${heading}`}>{q.question}</td>
                    <td className="py-2 pr-4">{q.status}</td>
                    <td className="py-2 pr-4">{formatMs(q.total_latency_ms)}</td>
                    <td className="py-2 pr-4">{q.faithfulness_score ?? 'n/a'}</td>
                    <td className="py-2 pr-4">{q.answer_relevance_score ?? 'n/a'}</td>
                    <td className="py-2 pr-4 truncate max-w-[240px]">
                      {(q.top_sources || []).slice(0, 2).join(', ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </div>
    </PageTransition>
  )
}
