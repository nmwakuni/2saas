'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Tenant = {
  id: string
  name: string
  phone: string
  email: string | null
  idNumber: string | null
  moveInDate: string
  moveOutDate: string | null
  depositAmount: number
  rentDueDay: number
  status: string
  unit: {
    id: string
    unitNumber: string
    rentAmount: number
    property: {
      id: string
      name: string
    }
  }
  payments: any[]
}

type Property = {
  id: string
  name: string
  units: {
    id: string
    unitNumber: string
    status: string
    rentAmount: number
  }[]
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    unitId: '',
    name: '',
    phone: '',
    email: '',
    idNumber: '',
    moveInDate: '',
    depositAmount: '',
    rentDueDay: '1',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTenants()
    fetchProperties()
  }, [])

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants')
      if (res.ok) {
        const data = await res.json()
        setTenants(data)
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties')
      if (res.ok) {
        const data = await res.json()
        setProperties(data)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({
          unitId: '',
          name: '',
          phone: '',
          email: '',
          idNumber: '',
          moveInDate: '',
          depositAmount: '',
          rentDueDay: '1',
        })
        setShowForm(false)
        fetchTenants()
        fetchProperties() // Refresh to update unit statuses
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create tenant')
      }
    } catch (error) {
      console.error('Error creating tenant:', error)
      alert('Failed to create tenant')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return

    try {
      const res = await fetch(`/api/tenants/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchTenants()
        fetchProperties() // Refresh to update unit statuses
      } else {
        alert('Failed to delete tenant')
      }
    } catch (error) {
      console.error('Error deleting tenant:', error)
      alert('Failed to delete tenant')
    }
  }

  const handleMoveOut = async (tenant: Tenant) => {
    if (!confirm(`Mark ${tenant.name} as moved out?`)) return

    try {
      const res = await fetch(`/api/tenants/${tenant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'moved_out',
          moveOutDate: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        fetchTenants()
        fetchProperties() // Refresh to update unit statuses
      } else {
        alert('Failed to update tenant')
      }
    } catch (error) {
      console.error('Error updating tenant:', error)
      alert('Failed to update tenant')
    }
  }

  // Get vacant units for the form
  const vacantUnits = properties.flatMap((property) =>
    property.units
      .filter((unit) => unit.status === 'vacant')
      .map((unit) => ({
        ...unit,
        propertyName: property.name,
      }))
  )

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tenants</h2>
          <p className="mt-1 text-gray-600">Manage your tenants and their information</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ Add Tenant'}
        </button>
      </div>

      {/* Add Tenant Form */}
      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Add New Tenant</h3>

          {vacantUnits.length === 0 ? (
            <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
              <p className="font-medium">No vacant units available</p>
              <p className="text-sm mt-1">
                Please add a property and units first, or ensure you have vacant units.
              </p>
              <Link href="/dashboard/properties" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
                Go to Properties →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Unit *
                  </label>
                  <select
                    required
                    value={formData.unitId}
                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Select a vacant unit --</option>
                    {vacantUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.propertyName} - Unit {unit.unitNumber} (KES {unit.rentAmount.toLocaleString()}/month)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tenant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g., John Kamau"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g., 0712345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g., john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ID Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g., 12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Move-in Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.moveInDate}
                    onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Security Deposit (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g., 50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rent Due Day (1-31) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="31"
                    value={formData.rentDueDay}
                    onChange={(e) => setFormData({ ...formData, rentDueDay: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g., 1"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {submitting ? 'Adding Tenant...' : 'Add Tenant'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tenants List */}
      {tenants.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-800">No tenants yet</h3>
          <p className="mt-2 text-gray-600">
            Add your first tenant to start tracking rent payments
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
          >
            Add Tenant
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        tenant.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-gray-600">Property:</span>{' '}
                      <span className="font-medium text-gray-900">{tenant.unit.property.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Unit:</span>{' '}
                      <span className="font-medium text-gray-900">{tenant.unit.unitNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>{' '}
                      <span className="font-medium text-gray-900">{tenant.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rent:</span>{' '}
                      <span className="font-medium text-gray-900">
                        KES {tenant.unit.rentAmount.toLocaleString()}/month
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Move-in:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {new Date(tenant.moveInDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Deposit:</span>{' '}
                      <span className="font-medium text-gray-900">
                        KES {tenant.depositAmount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rent Due:</span>{' '}
                      <span className="font-medium text-gray-900">Day {tenant.rentDueDay} of month</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Payments:</span>{' '}
                      <span className="font-medium text-gray-900">{tenant.payments.length} recorded</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link href={`/dashboard/tenants/${tenant.id}`}>
                    <button className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200">
                      View Details
                    </button>
                  </Link>
                  {tenant.status === 'active' && (
                    <button
                      onClick={() => handleMoveOut(tenant)}
                      className="rounded-lg bg-orange-100 px-3 py-1 text-sm text-orange-700 hover:bg-orange-200"
                    >
                      Move Out
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(tenant.id)}
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
