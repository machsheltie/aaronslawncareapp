import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useExpenses, EXPENSE_CATEGORIES } from '@/hooks/useExpenses'

export default function Expenses() {
  const [category, setCategory] = useState('')
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const { data: expenses, isLoading, error } = useExpenses({
    category: category || undefined,
    month: month || undefined,
  })

  const total = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
        <Link
          to="/expenses/new"
          className="inline-flex items-center justify-center bg-brand-green text-white px-4 py-2 rounded-md font-medium hover:bg-brand-accent transition-colors"
        >
          + Add Expense
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
      </div>

      {/* Running Total */}
      <div
        className="rounded-lg border border-green-200 p-4 mb-4 flex items-center justify-between"
        style={{ backgroundColor: '#c0efbf' }}
      >
        <span className="text-sm font-medium text-gray-700">Total</span>
        <span className="text-xl font-bold text-gray-800">${total.toFixed(2)}</span>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Failed to load expenses: {error.message}
        </div>
      )}

      {expenses && expenses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No expenses found for this period.
        </div>
      )}

      {expenses && expenses.length > 0 && (
        <div className="space-y-2">
          {expenses.map((expense) => {
            const catLabel = EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label ?? expense.category
            return (
              <Link
                key={expense.id}
                to={`/expenses/${expense.id}/edit`}
                className="block rounded-lg shadow-sm border border-green-200 p-3 hover:shadow-md transition-shadow"
                style={{ backgroundColor: '#c0efbf' }}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-200 text-green-800 font-medium">
                        {catLabel}
                      </span>
                      {expense.vendor && (
                        <span className="text-sm text-gray-700 truncate">{expense.vendor}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(expense.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-800 ml-4">${Number(expense.amount).toFixed(2)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
