import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSeasonalMessages, useSendSeasonalMessage, SEASONAL_CATEGORIES } from '@/hooks/useSeasonalMessages'

export default function SeasonalReminders() {
  const { data: messages, isLoading, error } = useSeasonalMessages()
  const sendMessage = useSendSeasonalMessage()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const handleSend = (messageId: string) => {
    sendMessage.mutate(
      { messageId },
      {
        onSuccess: (result) => {
          setConfirmId(null)
          alert(`Sent to ${result.sentCount} customer${result.sentCount !== 1 ? 's' : ''} with email on file.`)
        },
        onError: (err) => {
          setConfirmId(null)
          alert('Failed to send: ' + (err as Error).message)
        },
      }
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Seasonal Reminders</h2>
        <Link
          to="/seasonal-reminders/new"
          className="inline-flex items-center justify-center bg-brand-green text-white px-4 py-2 rounded-md font-medium hover:bg-brand-accent transition-colors"
        >
          + Create Template
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Failed to load messages: {error.message}
        </div>
      )}

      {messages && messages.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No seasonal templates yet. Create your first one!
        </div>
      )}

      {messages && messages.length > 0 && (
        <div className="space-y-3">
          {messages.map((msg) => {
            const catLabel = SEASONAL_CATEGORIES.find(c => c.value === msg.category)?.label ?? msg.category
            return (
              <div
                key={msg.id}
                className="rounded-lg shadow-sm border border-green-200 p-4"
                style={{ backgroundColor: '#c0efbf' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{msg.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-200 text-green-800 font-medium">
                        {catLabel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{msg.subject}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{msg.body}</p>
                    {msg.created_at && (
                      <p className="text-xs text-gray-400 mt-2">
                        Created: {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link
                      to={`/seasonal-reminders/${msg.id}/edit`}
                      className="text-xs text-brand-green hover:text-brand-accent font-medium"
                    >
                      Edit
                    </Link>
                    {confirmId === msg.id ? (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleSend(msg.id)}
                          disabled={sendMessage.isPending}
                          className="text-xs bg-brand-green text-white px-3 py-1 rounded font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
                        >
                          {sendMessage.isPending ? 'Sending...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(msg.id)}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded font-medium hover:bg-blue-200 transition-colors"
                      >
                        Send
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
