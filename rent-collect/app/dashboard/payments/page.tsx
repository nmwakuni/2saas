'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Payment = {
  id: string
  amount: number
  paymentDate: string
  paymentMethod: string
  transactionRef: string | null
  month: string
  status: string
  notes: string | null
  tenant: {
    id: string
    name: string
  }
  unit: {
    id: string
    unitNumber: string
    property: {
      id: string
      name: string
    }
  }
}

type Tenant = {
  id: string
  name: string
  unit: {
    id: string
    unitNumber: string
    rentAmount: number
    property: {
      name: string
    }
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    tenantId: '',
    unitId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'mpesa',
    transactionRef: '',
    month: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPayments()
    fetchTenants()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/payments')
      if (res.ok) {
        const data = await res.json()
        setPayments(data)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants')
      if (res.ok) {
        const data = await res.json()
        // Only active tenants
        const activeTenants = data.filter((t: Tenant) => t.unit)
        setTenants(activeTenants)
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
    }
  }

  const handleTenantChange = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId)
    if (tenant) {
      setFormData({
        ...formData,
        tenantId,
        unitId: tenant.unit.id,
        amount: tenant.unit.rentAmount.toString(),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({
          tenantId: '',
          unitId: '',
          amount: '',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'mpesa',
          transactionRef: '',
          month: '',
          notes: '',
        })
        setShowForm(false)
        fetchPayments()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to record payment')
      }
    } catch (error) {
      console.error('Error recording payment:', error)
      alert('Failed to record payment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return

    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchPayments()
      } else {
        alert('Failed to delete payment')
      }
    } catch (error) {
      console.error('Error deleting payment:', error)
      alert('Failed to delete payment')
    }
  }

  // Calculate stats
  const totalRevenue = payments
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)

  const thisMonthPayments = payments.filter((p) => {
    const paymentDate = new Date(p.paymentDate)
    const now = new Date()
    return (
      paymentDate.getMonth() === now.getMonth() &&
      paymentDate.getFullYear() === now.getFullYear() &&
      p.status === 'confirmed'
    )
  })

  const thisMonthRevenue = thisMonthPayments.reduce(
    (sum, p) => sum + parseFloat(p.amount.toString()),
    0
  )

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
          <p className="mt-1 text-gray-600">Track and manage rent payments</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ Record Payment'}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Payments</p>
          <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-2xl font-bold text-green-600">
            KES {thisMonthRevenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            KES {totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Record Payment Form */}
      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Record Payment</h3>

          {tenants.length === 0 ? (
            <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
              <p className="font-medium">No active tenants</p>
              <p className="text-sm mt-1">
                Please add tenants first before recording payments.
              </p>
              <Link
                href="/dashboard/tenants"
                className="text-indigo-600 hover:underline text-sm mt-2 inline-block"
              >
                Go to Tenants →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Tenant *
                  </label>
                  <select
                    required
                    value={formData.tenantId}
                    onChange={(e) => handleTenantChange(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Select a tenant --</option>
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} - {tenant.unit.property.name} Unit{' '}
                        {tenant.unit.unitNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Amount (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g., 25000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentDate: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Method *
                  </label>
                  <select
                    required
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="mpesa">M-Pesa</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Transaction Reference
                  </label>
                  <input
                    type="text"
                    value={formData.transactionRef}
                    onChange={(e) =>
                      setFormData({ ...formData, transactionRef: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g., SH123ABC456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Month *
                  </label>
                  <input
                    type="month"
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Which month is this payment for?
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  rows={2}
                  placeholder="Any additional notes..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {submitting ? 'Recording Payment...' : 'Record Payment'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-gray-800">No payments yet</h3>
          <p className="mt-2 text-gray-600">Record your first payment to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
          >
            Record Payment
          </button>
        </div>
      ) : (
        <div className="rounded-lg bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Tenant</th>
                  <th className="px-6 py-3 font-medium">Property</th>
                  <th className="px-6 py-3 font-medium">Unit</th>
                  <th className="px-6 py-3 font-medium">Month</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Method</th>
                  <th className="px-6 py-3 font-medium">Reference</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="text-sm hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {payment.tenant.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.unit.property.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.unit.unitNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{payment.month}</td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      KES {parseFloat(payment.amount.toString()).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-600">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.transactionRef || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          payment.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(payment.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
