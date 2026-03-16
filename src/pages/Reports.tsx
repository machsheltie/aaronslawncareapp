import { useState } from 'react'
import { useReportStats } from '@/hooks/useReports'
import { SERVICE_TYPES } from '@/hooks/useJobs'

function exportCsv(stats: { totalRevenue: number; outstandingAmount: number; jobsCompleted: number; jobsScheduled: number; activeCustomers: number; revenueByMonth: { month: string; total: number }[]; jobsByService: { service: string; count: number }[] }, from: string, to: string) {
  const lines: string[] = []
  lines.push(`Aaron's Lawn Care - Report (${from} to ${to})`)
  lines.push('')
  lines.push('Summary')
  lines.push(`Revenue,$${stats.totalRevenue.toFixed(2)}`)
  lines.push(`Outstanding,$${stats.outstandingAmount.toFixed(2)}`)
  lines.push(`Jobs Completed,${stats.jobsCompleted}`)
  lines.push(`Jobs Scheduled,${stats.jobsScheduled}`)
  lines.push(`Active Customers,${stats.activeCustomers}`)
  lines.push('')
  lines.push('Revenue by Month')
  lines.push('Month,Revenue')
  stats.revenueByMonth.forEach(r => {
    const label = new Date(r.month + '-01T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    lines.push(`${label},$${r.total.toFixed(2)}`)
  })
  lines.push('')
  lines.push('Jobs by Service')
  lines.push('Service,Count')
  stats.jobsByService.forEach(s => {
    const label = SERVICE_TYPES.find(t => t.value === s.service)?.label ?? s.service
    lines.push(`${label},${s.count}`)
  })

  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `aarons-lawn-care-report-${from}-to-${to}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const [from, setFrom] = useState(sixMonthsAgo.toISOString().split('T')[0])
  const [to, setTo] = useState(now.toISOString().split('T')[0])

  const { data: stats, isLoading } = useReportStats({ from, to })

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Reports</h2>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-gray-500">Business performance overview</p>
        {stats && (
          <button
            onClick={() => exportCsv(stats, from, to)}
            className="bg-brand-green text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-accent transition-colors"
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
        <span className="text-gray-400">to</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
        </div>
      )}

      {stats && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <KpiCard label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} color="text-green-700" bg="bg-green-50" />
            <KpiCard label="Outstanding" value={`$${stats.outstandingAmount.toFixed(2)}`} color="text-red-700" bg="bg-red-50" />
            <KpiCard label="Jobs Done" value={String(stats.jobsCompleted)} color="text-blue-700" bg="bg-blue-50" />
            <KpiCard label="Scheduled" value={String(stats.jobsScheduled)} color="text-yellow-700" bg="bg-yellow-50" />
            <KpiCard label="Customers" value={String(stats.activeCustomers)} color="text-purple-700" bg="bg-purple-50" />
          </div>

          {/* Revenue by Month */}
          {stats.revenueByMonth.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Revenue by Month</h3>
              <div className="space-y-2">
                {stats.revenueByMonth.map(({ month, total }) => {
                  const maxRevenue = Math.max(...stats.revenueByMonth.map(r => r.total))
                  const pct = maxRevenue > 0 ? (total / maxRevenue) * 100 : 0
                  const label = new Date(month + '-01T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                  return (
                    <div key={month}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-medium text-gray-800">${total.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-brand-green rounded-full h-3 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Jobs by Service */}
          {stats.jobsByService.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Jobs by Service Type</h3>
              <div className="space-y-2">
                {stats.jobsByService.map(({ service, count }) => {
                  const label = SERVICE_TYPES.find(s => s.value === service)?.label ?? service
                  const maxCount = Math.max(...stats.jobsByService.map(s => s.count))
                  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
                  return (
                    <div key={service}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-medium text-gray-800">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-blue-500 rounded-full h-3 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function KpiCard({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-lg p-4 border border-gray-100`}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-xl font-bold ${color} mt-1`}>{value}</p>
    </div>
  )
}
