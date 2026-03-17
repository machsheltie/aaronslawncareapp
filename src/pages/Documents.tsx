import { Link } from 'react-router-dom'

const cards = [
  {
    title: 'Quotes',
    description: 'Create and manage quotes',
    to: '/documents/quotes',
    enabled: true,
  },
  {
    title: 'Invoices',
    description: 'Billing and payment tracking',
    to: '/documents/invoices',
    enabled: true,
  },
  {
    title: 'Contracts',
    description: 'Service agreements',
    to: '/documents/contracts',
    enabled: false,
  },
]

export default function Documents() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Documents</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) =>
          card.enabled ? (
            <Link
              key={card.title}
              to={card.to}
              className="rounded-lg shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow"
              style={{ backgroundColor: '#c0efbf' }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.description}</p>
            </Link>
          ) : (
            <div
              key={card.title}
              className="rounded-lg shadow-sm border border-gray-200 p-6 opacity-50"
              style={{ backgroundColor: '#e8f5e8' }}
            >
              <h3 className="text-lg font-semibold text-gray-500 mb-1">{card.title}</h3>
              <p className="text-sm text-gray-400">{card.description}</p>
              <span className="inline-block mt-2 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">Coming Soon</span>
            </div>
          )
        )}
      </div>
    </div>
  )
}
