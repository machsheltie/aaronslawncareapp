import { Link } from 'react-router-dom'
import { useEquipment, EQUIPMENT_TYPES } from '@/hooks/useEquipment'

export default function Equipment() {
  const { data: equipment, isLoading, error } = useEquipment()

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Equipment</h2>
        <Link
          to="/equipment/new"
          className="inline-flex items-center justify-center bg-brand-green text-white px-4 py-2 rounded-md font-medium hover:bg-brand-accent transition-colors"
        >
          + Add Equipment
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Failed to load equipment: {error.message}
        </div>
      )}

      {equipment && equipment.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No equipment tracked yet. Add your first piece of equipment!
        </div>
      )}

      {equipment && equipment.length > 0 && (
        <div className="space-y-3">
          {equipment.map((item) => {
            const typeLabel = EQUIPMENT_TYPES.find(t => t.value === item.type)?.label ?? item.type
            return (
              <Link
                key={item.id}
                to={`/equipment/${item.id}`}
                className="block rounded-lg shadow-sm border border-green-200 p-4 hover:shadow-md transition-shadow"
                style={{ backgroundColor: '#c0efbf' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">{typeLabel}</p>
                  </div>
                  <div className="text-right">
                    {item.hours != null && (
                      <p className="text-sm font-medium text-gray-700">{item.hours} hrs</p>
                    )}
                    {item.warranty_expiry && (
                      <p className="text-xs text-gray-500">
                        Warranty: {new Date(item.warranty_expiry + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
