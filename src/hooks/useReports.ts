import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ReportStats {
  totalRevenue: number
  outstandingAmount: number
  jobsCompleted: number
  jobsScheduled: number
  activeCustomers: number
  revenueByMonth: { month: string; total: number }[]
  jobsByService: { service: string; count: number }[]
}

export function useReportStats(dateRange?: { from: string; to: string }) {
  return useQuery({
    queryKey: ['reports', dateRange],
    queryFn: async (): Promise<ReportStats> => {
      const now = new Date()
      const from = dateRange?.from ?? new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0]
      const to = dateRange?.to ?? now.toISOString().split('T')[0]

      // Fetch invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total, payment_status, invoice_date')
        .is('deleted_at', null)
        .gte('invoice_date', from)
        .lte('invoice_date', to)

      // Fetch jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('status, service_type, scheduled_date')
        .is('deleted_at', null)
        .gte('scheduled_date', from)
        .lte('scheduled_date', to)

      // Fetch active customers
      const { count: activeCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)

      // Calculate revenue
      const totalRevenue = invoices
        ?.filter(i => i.payment_status === 'paid')
        .reduce((sum, i) => sum + Number(i.total), 0) ?? 0

      const outstandingAmount = invoices
        ?.filter(i => i.payment_status === 'unpaid')
        .reduce((sum, i) => sum + Number(i.total), 0) ?? 0

      // Jobs by status
      const jobsCompleted = jobs?.filter(j => j.status === 'completed').length ?? 0
      const jobsScheduled = jobs?.filter(j => j.status === 'scheduled').length ?? 0

      // Revenue by month
      const monthMap = new Map<string, number>()
      invoices?.filter(i => i.payment_status === 'paid').forEach(i => {
        const month = i.invoice_date.substring(0, 7) // YYYY-MM
        monthMap.set(month, (monthMap.get(month) ?? 0) + Number(i.total))
      })
      const revenueByMonth = Array.from(monthMap.entries())
        .map(([month, total]) => ({ month, total }))
        .sort((a, b) => a.month.localeCompare(b.month))

      // Jobs by service type
      const serviceMap = new Map<string, number>()
      jobs?.forEach(j => {
        serviceMap.set(j.service_type, (serviceMap.get(j.service_type) ?? 0) + 1)
      })
      const jobsByService = Array.from(serviceMap.entries())
        .map(([service, count]) => ({ service, count }))
        .sort((a, b) => b.count - a.count)

      return {
        totalRevenue,
        outstandingAmount,
        jobsCompleted,
        jobsScheduled,
        activeCustomers: activeCustomers ?? 0,
        revenueByMonth,
        jobsByService,
      }
    },
  })
}
