import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Invoice = Database['public']['Tables']['invoices']['Row']
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']

export type InvoiceWithCustomer = Invoice & {
  customers: { name: string; email: string | null; phone: string } | null
}

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid', color: 'bg-red-100 text-red-700' },
  { value: 'processing', label: 'Processing', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-700' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-700' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-500' },
] as const

export function useInvoices(filters?: { status?: string; customerId?: string }) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*, customers(name, email, phone)')
        .is('deleted_at', null)
        .order('invoice_date', { ascending: false })

      if (filters?.status) query = query.eq('payment_status', filters.status)
      if (filters?.customerId) query = query.eq('customer_id', filters.customerId)

      const { data, error } = await query
      if (error) throw error
      return data as InvoiceWithCustomer[]
    },
  })
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('invoices')
        .select('*, customers(name, email, phone, property_address)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as InvoiceWithCustomer
    },
    enabled: !!id,
  })
}

// Generate next invoice number: INV-YYYYMMDD-NNN
async function getNextInvoiceNumber(): Promise<string> {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const prefix = `INV-${today}`

  const { data } = await supabase
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)

  if (data && data.length > 0) {
    const lastNum = parseInt(data[0].invoice_number.split('-')[2] || '0', 10)
    return `${prefix}-${String(lastNum + 1).padStart(3, '0')}`
  }
  return `${prefix}-001`
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      customer_id: string
      job_id?: string
      subtotal: number
      tax?: number
      notes?: string
      due_days?: number
    }) => {
      const invoiceNumber = await getNextInvoiceNumber()
      const tax = input.tax ?? 0
      const total = input.subtotal + tax
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + (input.due_days ?? 30))

      const invoice: InvoiceInsert = {
        customer_id: input.customer_id,
        job_id: input.job_id || null,
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        subtotal: input.subtotal,
        tax,
        total,
        notes: input.notes || null,
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert(invoice)
        .select('*, customers(name, email, phone)')
        .single()
      if (error) throw error
      return data as InvoiceWithCustomer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, paymentMethod }: {
      id: string
      status: string
      paymentMethod?: string
    }) => {
      const updates: Record<string, unknown> = { payment_status: status }
      if (paymentMethod) updates.payment_method = paymentMethod
      if (status === 'paid') {
        updates.paid_at = new Date().toISOString()
        // Get the invoice total to set amount_paid
        const { data: invoice } = await supabase
          .from('invoices')
          .select('total')
          .eq('id', id)
          .single()
        if (invoice) updates.amount_paid = invoice.total
      }

      const { error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useSendInvoiceSms() {
  return useMutation({
    mutationFn: async ({ invoiceId, photoPath }: { invoiceId: string; photoPath?: string }) => {
      const { data, error } = await supabase.functions.invoke('send-invoice-sms', {
        body: { invoiceId, photoPath },
      })
      if (error) throw error
      if (data?.error && !data?.alreadyPaid) throw new Error(data.error)
      return data as { success: boolean; paymentUrl: string; smsSent: boolean; reason?: string }
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}
