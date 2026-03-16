import jsPDF from 'jspdf'
import type { InvoiceWithCustomer } from '@/hooks/useInvoices'

export function generateInvoicePdf(invoice: InvoiceWithCustomer) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Brand colors
  const brandGreen: [number, number, number] = [45, 80, 22] // #2D5016
  const darkGray: [number, number, number] = [51, 51, 51]
  const medGray: [number, number, number] = [119, 119, 119]

  // Header bar
  doc.setFillColor(...brandGreen)
  doc.rect(0, 0, pageWidth, 35, 'F')

  // Business name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text("Aaron's Lawn Care", 14, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('(502) 926-8524  |  gnaua429@gmail.com', 14, 28)

  // Invoice title
  doc.setTextColor(...darkGray)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', pageWidth - 14, 55, { align: 'right' })

  // Invoice details (right side)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...medGray)
  doc.text('Invoice #:', pageWidth - 70, 65)
  doc.text('Date:', pageWidth - 70, 72)
  doc.text('Due:', pageWidth - 70, 79)

  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'bold')
  doc.text(invoice.invoice_number, pageWidth - 14, 65, { align: 'right' })
  doc.text(
    new Date(invoice.invoice_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    pageWidth - 14, 72, { align: 'right' }
  )
  doc.text(
    new Date(invoice.due_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    pageWidth - 14, 79, { align: 'right' }
  )

  // Status badge
  const isPaid = invoice.payment_status === 'paid'
  if (isPaid) {
    doc.setFillColor(34, 139, 34)
    doc.roundedRect(pageWidth - 40, 83, 26, 8, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.text('PAID', pageWidth - 27, 88.5, { align: 'center' })
  }

  // Bill To
  let y = 65
  doc.setTextColor(...medGray)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('BILL TO:', 14, y)
  y += 8

  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(invoice.customers?.name ?? 'Customer', 14, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  if ((invoice.customers as unknown as { property_address?: string })?.property_address) {
    doc.text((invoice.customers as unknown as { property_address: string }).property_address, 14, y)
    y += 5
  }
  if (invoice.customers?.phone) {
    doc.text(invoice.customers.phone, 14, y)
    y += 5
  }
  if (invoice.customers?.email) {
    doc.text(invoice.customers.email, 14, y)
    y += 5
  }

  // Line items table header
  y = 105
  doc.setFillColor(245, 245, 245)
  doc.rect(14, y, pageWidth - 28, 10, 'F')
  doc.setTextColor(...darkGray)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Description', 18, y + 7)
  doc.text('Amount', pageWidth - 18, y + 7, { align: 'right' })

  // Line item (service description from notes)
  y += 14
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...darkGray)
  doc.text(invoice.notes || 'Lawn care service', 18, y)
  doc.text(`$${Number(invoice.subtotal).toFixed(2)}`, pageWidth - 18, y, { align: 'right' })

  // Separator
  y += 10
  doc.setDrawColor(220, 220, 220)
  doc.line(14, y, pageWidth - 14, y)

  // Totals
  y += 10
  const totalsX = pageWidth - 70

  doc.setTextColor(...medGray)
  doc.setFontSize(10)
  doc.text('Subtotal:', totalsX, y)
  doc.setTextColor(...darkGray)
  doc.text(`$${Number(invoice.subtotal).toFixed(2)}`, pageWidth - 18, y, { align: 'right' })

  y += 7
  doc.setTextColor(...medGray)
  doc.text('Tax:', totalsX, y)
  doc.setTextColor(...darkGray)
  doc.text(`$${Number(invoice.tax).toFixed(2)}`, pageWidth - 18, y, { align: 'right' })

  y += 3
  doc.setDrawColor(200, 200, 200)
  doc.line(totalsX, y, pageWidth - 14, y)

  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...brandGreen)
  doc.text('Total Due:', totalsX, y)
  doc.text(`$${Number(invoice.total).toFixed(2)}`, pageWidth - 18, y, { align: 'right' })

  if (isPaid && invoice.paid_at) {
    y += 10
    doc.setFontSize(10)
    doc.setTextColor(34, 139, 34)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Paid on ${new Date(invoice.paid_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      pageWidth - 18, y, { align: 'right' }
    )
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20
  doc.setDrawColor(220, 220, 220)
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5)
  doc.setFontSize(9)
  doc.setTextColor(...medGray)
  doc.setFont('helvetica', 'normal')
  doc.text("Thank you for choosing Aaron's Lawn Care!", pageWidth / 2, footerY, { align: 'center' })
  doc.text('Greater Louisville, Kentucky  |  (502) 926-8524', pageWidth / 2, footerY + 5, { align: 'center' })

  return doc
}

export function downloadInvoicePdf(invoice: InvoiceWithCustomer) {
  const doc = generateInvoicePdf(invoice)
  doc.save(`${invoice.invoice_number}.pdf`)
}
