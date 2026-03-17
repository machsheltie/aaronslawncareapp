import { useState } from 'react'
import { useCustomers } from '@/hooks/useCustomers'
import { useCreateReminder } from '@/hooks/useReminders'

interface FollowUpFormProps {
  defaultCustomerId?: string
  onClose: () => void
}

export default function FollowUpForm({ defaultCustomerId, onClose }: FollowUpFormProps) {
  const { data: customers } = useCustomers()
  const createReminder = useCreateReminder()

  const [mode, setMode] = useState<'existing' | 'new'>(defaultCustomerId ? 'existing' : 'existing')
  const [customerId, setCustomerId] = useState(defaultCustomerId ?? '')
  const [prospectName, setProspectName] = useState('')
  const [prospectPhone, setProspectPhone] = useState('')
  const [reminderDate, setReminderDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')

  const filteredCustomers = customers?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const handleSubmit = () => {
    if (!note.trim() || !reminderDate) return

    if (mode === 'existing' && !customerId) return
    if (mode === 'new' && !prospectName.trim()) return

    createReminder.mutate(
      {
        customer_id: mode === 'existing' ? customerId : null,
        prospect_name: mode === 'new' ? prospectName.trim() : null,
        prospect_phone: mode === 'new' ? (prospectPhone.trim() || null) : null,
        reminder_date: reminderDate,
        note: note.trim(),
      },
      { onSuccess: () => onClose() }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Schedule Follow-Up</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('existing')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'existing' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Existing Customer
          </button>
          <button
            onClick={() => setMode('new')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'new' ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            New Contact
          </button>
        </div>

        {mode === 'existing' && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-1 focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
            {search && filteredCustomers.length > 0 && !customerId && (
              <div className="border border-gray-200 rounded-md max-h-32 overflow-y-auto">
                {filteredCustomers.slice(0, 8).map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setCustomerId(c.id); setSearch(c.name) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            {customerId && (
              <button
                onClick={() => { setCustomerId(''); setSearch('') }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear selection
              </button>
            )}
          </div>
        )}

        {mode === 'new' && (
          <div className="space-y-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                placeholder="Contact name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={prospectPhone}
                onChange={(e) => setProspectPhone(e.target.value)}
                placeholder="502-555-0100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>
          </div>
        )}

        {/* Date */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
          <input
            type="date"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
        </div>

        {/* Note */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="What's the follow-up about?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={createReminder.isPending || !note.trim() || !reminderDate}
            className="flex-1 bg-brand-green text-white py-2 rounded-md font-medium text-sm hover:bg-brand-accent transition-colors disabled:opacity-50"
          >
            {createReminder.isPending ? 'Saving...' : 'Schedule Follow-Up'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
