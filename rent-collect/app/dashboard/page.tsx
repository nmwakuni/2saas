import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  // Fetch stats (we'll implement this properly with real data later)
  const stats = {
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
  }

  const occupancyRate = stats.totalUnits > 0
    ? ((stats.occupiedUnits / stats.totalUnits) * 100).toFixed(1)
    : 0

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
        <p className="mt-2 text-gray-600">Here's what's happening with your properties</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProperties}</p>
            </div>
            <div className="text-4xl">🏢</div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Units</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUnits}</p>
            </div>
            <div className="text-4xl">🏘️</div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{occupancyRate}%</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">KES {stats.monthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800">Quick Actions</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/properties">
            <div className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="text-3xl mb-3">🏢</div>
              <h4 className="font-semibold text-gray-900">Add Property</h4>
              <p className="mt-1 text-sm text-gray-600">Create a new property or building</p>
            </div>
          </Link>

          <Link href="/dashboard/tenants">
            <div className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="text-3xl mb-3">👤</div>
              <h4 className="font-semibold text-gray-900">Add Tenant</h4>
              <p className="mt-1 text-sm text-gray-600">Register a new tenant</p>
            </div>
          </Link>

          <Link href="/dashboard/payments">
            <div className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="text-3xl mb-3">💵</div>
              <h4 className="font-semibold text-gray-900">Record Payment</h4>
              <p className="mt-1 text-gray-600 text-sm">Log a rent payment</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity / Getting Started */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800">Getting Started</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-green-600">✓</span>
            <span className="text-gray-700">Account created</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">○</span>
            <span className="text-gray-600">Add your first property</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">○</span>
            <span className="text-gray-600">Add units to your property</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">○</span>
            <span className="text-gray-600">Register tenants</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">○</span>
            <span className="text-gray-600">Record your first payment</span>
          </div>
        </div>
      </div>
    </div>
  )
}
