'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Property = {
  id: string
  name: string
  address: string
  type: string
  units: Unit[]
}

type Unit = {
  id: string
  unitNumber: string
  rentAmount: number
  status: string
  tenants: any[]
}

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddUnit, setShowAddUnit] = useState(false)
  const [unitForm, setUnitForm] = useState({
    unitNumber: '',
    rentAmount: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProperty()
  }, [id])

  const fetchProperty = async () => {
    try {
      const res = await fetch(`/api/properties/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProperty(data)
      } else if (res.status === 404) {
        router.push('/dashboard/properties')
      }
    } catch (error) {
      console.error('Error fetching property:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: id,
          unitNumber: unitForm.unitNumber,
          rentAmount: parseFloat(unitForm.rentAmount),
        }),
      })

      if (res.ok) {
        setUnitForm({ unitNumber: '', rentAmount: '' })
        setShowAddUnit(false)
        fetchProperty()
      } else {
        alert('Failed to add unit')
      }
    } catch (error) {
      console.error('Error adding unit:', error)
      alert('Failed to add unit')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Are you sure you want to delete this unit?')) return

    try {
      const res = await fetch(`/api/units/${unitId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchProperty()
      } else {
        alert('Failed to delete unit')
      }
    } catch (error) {
      console.error('Error deleting unit:', error)
      alert('Failed to delete unit')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!property) {
    return <div className="text-center py-12">Property not found</div>
  }

  const occupiedUnits = property.units.filter((u) => u.status === 'occupied').length
  const occupancyRate =
    property.units.length > 0
      ? ((occupiedUnits / property.units.length) * 100).toFixed(1)
      : 0

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/properties" className="text-indigo-600 hover:underline">
          ← Back to Properties
        </Link>
        <h2 className="mt-2 text-2xl font-bold text-gray-800">{property.name}</h2>
        <p className="text-gray-600">{property.address}</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Units</p>
          <p className="text-2xl font-bold text-gray-900">{property.units.length}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Occupied</p>
          <p className="text-2xl font-bold text-gray-900">{occupiedUnits}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Occupancy Rate</p>
          <p className="text-2xl font-bold text-gray-900">{occupancyRate}%</p>
        </div>
      </div>

      {/* Units Section */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800">Units</h3>
        <button
          onClick={() => setShowAddUnit(!showAddUnit)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          {showAddUnit ? 'Cancel' : '+ Add Unit'}
        </button>
      </div>

      {/* Add Unit Form */}
      {showAddUnit && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h4 className="mb-4 text-lg font-semibold text-gray-800">Add New Unit</h4>
          <form onSubmit={handleAddUnit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Unit Number *
                </label>
                <input
                  type="text"
                  required
                  value={unitForm.unitNumber}
                  onChange={(e) =>
                    setUnitForm({ ...unitForm, unitNumber: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g., A1, 101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monthly Rent (KES) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={unitForm.rentAmount}
                  onChange={(e) =>
                    setUnitForm({ ...unitForm, rentAmount: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g., 25000"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {submitting ? 'Adding...' : 'Add Unit'}
            </button>
          </form>
        </div>
      )}

      {/* Units List */}
      {property.units.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-800">No units yet</h3>
          <p className="mt-2 text-gray-600">Add units to this property to get started</p>
          <button
            onClick={() => setShowAddUnit(true)}
            className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
          >
            Add Unit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {property.units.map((unit) => (
            <div key={unit.id} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Unit {unit.unitNumber}
                    </h4>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        unit.status === 'occupied'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {unit.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Rent: <span className="font-semibold text-gray-900">KES {unit.rentAmount.toLocaleString()}/month</span>
                  </p>
                  {unit.tenants.length > 0 && (
                    <p className="mt-1 text-sm text-gray-600">
                      Tenant: <span className="font-medium text-gray-900">{unit.tenants[0].name}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/units/${unit.id}`}>
                    <button className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200">
                      View
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDeleteUnit(unit.id)}
                    className="rounded-lg bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
