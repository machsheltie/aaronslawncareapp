import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useEquipmentDetail, useLogMaintenance, EQUIPMENT_TYPES, MAINTENANCE_TYPES } from '@/hooks/useEquipment'

export default function EquipmentDetail() {
  const { id } = useParams()
  const { data: equipment, isLoading, error } = useEquipmentDetail(id)
  const logMaintenance = useLogMaintenance()
  const [showForm, setShowForm] = useState(false)
  const [maintDate, setMaintDate] = useState(new Date().toISOString().split('T')[0])
  const [maintType, setMaintType] = useState('general')
  const [maintCost, setMaintCost] = useState('')
  const [maintNotes, setMaintNotes] = useState('')
  const [nextDueDate, setNextDueDate] = useState('')
  const [nextDueHours, setNextDueHours] = useState('')

  const handleLogMaintenance = () => {
    if (!id) return
    logMaintenance.mutate(
      {
        equipment_id: id,
        date: maintDate,
        type: maintType,
        cost: maintCost ? parseFloat(maintCost) : undefined,
        notes: maintNotes || undefined,
        next_due_date: nextDueDate || undefined,
        next_due_hours: nextDueHours ? parseInt(nextDueHours, 10) : undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false)
          setMaintCost('')
          setMaintNotes('')
          setNextDueDate('')
          setNextDueHours('')
          setMaintType('general')
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
      </div>
    )
  }

  if (error || !equipment) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Equipment not found.</p>
        <Link to="/equipment" className="text-brand-green hover:underline">Back to equipment</Link>
      </div>
    )
  }

  const typeLabel = EQUIPMENT_TYPES.find(t => t.value === equipment.type)?.label ?? equipment.type

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/equipment" className="text-sm text-brand-green hover:underline mb-1 inline-block">
            &larr; All Equipment
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">{equipment.name}</h2>
        </div>
        <Link
          to={`/equipment/${equipment.id}/edit`}
          className="bg-brand-green text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-accent transition-colors"
        >
          Edit
        </Link>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 space-y-3">
        <InfoRow label="Type" value={typeLabel} />
        {equipment.hours != null && <InfoRow label="Current Hours" value={`${equipment.hours} hrs`} />}
        {equipment.purchase_date && (
          <InfoRow label="Purchased" value={new Date(equipment.purchase_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
        )}
        {equipment.warranty_expiry && (
          <InfoRow label="Warranty Expires" value={new Date(equipment.warranty_expiry + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
        )}
        {equipment.notes && (
          <div>
            <span className="text-sm text-gray-500">Notes</span>
            <p className="text-sm text-gray-800 mt-0.5">{equipment.notes}</p>
          </div>
        )}
      </div>

      {/* Maintenance Log */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Maintenance Log</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-brand-green hover:text-brand-accent font-medium"
        >
          {showForm ? 'Cancel' : '+ Log Maintenance'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={maintDate}
              onChange={(e) => setMaintDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={maintType} onChange={(e) => setMaintType(e.target.value)} className={inputClass}>
              {MAINTENANCE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={maintCost}
                onChange={(e) => setMaintCost(e.target.value)}
                className={`${inputClass} pl-7`}
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={maintNotes}
              onChange={(e) => setMaintNotes(e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Any details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date <span className="text-gray-400 font-normal">(opt)</span></label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Hours <span className="text-gray-400 font-normal">(opt)</span></label>
              <input
                type="number"
                value={nextDueHours}
                onChange={(e) => setNextDueHours(e.target.value)}
                className={inputClass}
                placeholder="e.g. 500"
              />
            </div>
          </div>
          <button
            onClick={handleLogMaintenance}
            disabled={logMaintenance.isPending}
            className="w-full bg-brand-green text-white py-2 rounded-md font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
          >
            {logMaintenance.isPending ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      )}

      {(!equipment.maintenance_log || equipment.maintenance_log.length === 0) && (
        <div className="text-center py-12 text-gray-500 text-sm">
          No maintenance logged yet.
        </div>
      )}

      {equipment.maintenance_log && equipment.maintenance_log.length > 0 && (
        <div className="space-y-2">
          {[...equipment.maintenance_log]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((log) => {
              const mtLabel = MAINTENANCE_TYPES.find(t => t.value === log.type)?.label ?? log.type
              return (
                <div
                  key={log.id}
                  className="rounded-lg shadow-sm border border-green-200 p-3"
                  style={{ backgroundColor: '#c0efbf' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800">{mtLabel}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {log.cost != null && (
                    <p className="text-sm text-gray-700">${Number(log.cost).toFixed(2)}</p>
                  )}
                  {log.notes && <p className="text-xs text-gray-600 mt-1">{log.notes}</p>}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  )
}

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent'
