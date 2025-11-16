'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
      address: string
    }
  }
  payments: Payment[]
  reminders: Reminder[]
}

type Payment = {
  id: string
  amount: number
  paymentDate: string
  paymentMethod: string
  transactionRef: string | null
  month: string
  status: string
}

type Reminder = {
  id: string
  type: string
  message: string
  sentAt: string
  status: string
}

export default function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTenant()
  }, [id])

  const fetchTenant = async () => {
    try {
      const res = await fetch(`/api/tenants/${id}`)
      if (res.ok) {
        const data = await res.json()
        setTenant(data)
      } else if (res.status === 404) {
        router.push('/dashboard/tenants')
      }
    } catch (error) {
      console.error('Error fetching tenant:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!tenant) {
    return <div className="text-center py-12">Tenant not found</div>
  }

  const totalPaid = tenant.payments
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)

  const monthsSinceMoveIn = Math.floor(
    (new Date().getTime() - new Date(tenant.moveInDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
  )

  const expectedPayments = monthsSinceMoveIn * parseFloat(tenant.unit.rentAmount.toString())
  const balance = expectedPayments - totalPaid

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/tenants" className="text-indigo-600 hover:underline">
          ← Back to Tenants
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{tenant.name}</h2>
            <p className="text-gray-600">
              {tenant.unit.property.name} - Unit {tenant.unit.unitNumber}
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tenant.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {tenant.status}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Monthly Rent</p>
          <p className="text-2xl font-bold text-gray-900">
            KES {tenant.unit.rentAmount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">
            KES {totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Balance</p>
          <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            KES {balance.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Payments Made</p>
          <p className="text-2xl font-bold text-gray-900">{tenant.payments.length}</p>
        </div>
      </div>

      {/* Tenant Information */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Tenant Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-600">Full Name</p>
            <p className="font-medium text-gray-900">{tenant.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone Number</p>
            <p className="font-medium text-gray-900">{tenant.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium text-gray-900">{tenant.email || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ID Number</p>
            <p className="font-medium text-gray-900">{tenant.idNumber || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Move-in Date</p>
            <p className="font-medium text-gray-900">
              {new Date(tenant.moveInDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Move-out Date</p>
            <p className="font-medium text-gray-900">
              {tenant.moveOutDate
                ? new Date(tenant.moveOutDate).toLocaleDateString()
                : 'Still active'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Security Deposit</p>
            <p className="font-medium text-gray-900">KES {tenant.depositAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Rent Due Day</p>
            <p className="font-medium text-gray-900">Day {tenant.rentDueDay} of each month</p>
          </div>
        </div>
      </div>

      {/* Unit Information */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Unit Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-600">Property</p>
            <p className="font-medium text-gray-900">{tenant.unit.property.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Address</p>
            <p className="font-medium text-gray-900">{tenant.unit.property.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Unit Number</p>
            <p className="font-medium text-gray-900">{tenant.unit.unitNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Monthly Rent</p>
            <p className="font-medium text-gray-900">
              KES {tenant.unit.rentAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
          <Link href={`/dashboard/payments?tenant=${tenant.id}`}>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
              Record Payment
            </button>
          </Link>
        </div>

        {tenant.payments.length === 0 ? (
          <p className="text-center py-8 text-gray-600">No payments recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-600">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Month</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {tenant.payments.map((payment) => (
                  <tr key={payment.id} className="border-b text-sm">
                    <td className="py-3">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td className="py-3">{payment.month}</td>
                    <td className="py-3 font-medium">KES {parseFloat(payment.amount.toString()).toLocaleString()}</td>
                    <td className="py-3 capitalize">{payment.paymentMethod}</td>
                    <td className="py-3 text-gray-600">{payment.transactionRef || '-'}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          payment.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SMS Reminders */}
      {tenant.reminders && tenant.reminders.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">SMS Reminders Sent</h3>
          <div className="space-y-3">
            {tenant.reminders.map((reminder) => (
              <div key={reminder.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{reminder.type}</p>
                    <p className="mt-1 text-sm text-gray-600">{reminder.message}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(reminder.sentAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      reminder.status === 'sent'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {reminder.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
