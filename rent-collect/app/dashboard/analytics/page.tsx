import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import Link from 'next/link'

export default async function AnalyticsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Get last 6 months revenue data
  const monthsData = []
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const startDate = startOfMonth(date)
    const endDate = endOfMonth(date)

    const payments = await prisma.payment.findMany({
      where: {
        unit: { property: { userId } },
        paymentDate: { gte: startDate, lte: endDate },
        status: 'confirmed',
      },
    })

    const revenue = payments.reduce(
      (sum, p) => sum + parseFloat(p.amount.toString()),
      0
    )

    monthsData.push({
      month: format(date, 'MMM yyyy'),
      revenue,
      payments: payments.length,
    })
  }

  // Get occupancy data
  const totalUnits = await prisma.unit.count({
    where: { property: { userId } },
  })

  const occupiedUnits = await prisma.unit.count({
    where: { property: { userId }, status: 'occupied' },
  })

  const vacantUnits = totalUnits - occupiedUnits
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0

  // Get top performing properties
  const properties = await prisma.property.findMany({
    where: { userId },
    include: {
      units: {
        include: {
          payments: {
            where: {
              paymentDate: {
                gte: startOfMonth(new Date()),
                lte: endOfMonth(new Date()),
              },
              status: 'confirmed',
            },
          },
        },
      },
    },
  })

  const propertyStats = properties.map((property) => {
    const revenue = property.units.reduce((sum, unit) => {
      const unitRevenue = unit.payments.reduce(
        (pSum, payment) => pSum + parseFloat(payment.amount.toString()),
        0
      )
      return sum + unitRevenue
    }, 0)

    return {
      id: property.id,
      name: property.name,
      revenue,
      units: property.units.length,
    }
  })

  propertyStats.sort((a, b) => b.revenue - a.revenue)

  // Get arrears (overdue payments)
  const today = new Date()
  const currentMonth = format(today, 'yyyy-MM')

  const tenants = await prisma.tenant.findMany({
    where: {
      unit: { property: { userId } },
      status: 'active',
    },
    include: {
      unit: {
        include: {
          property: true,
        },
      },
      payments: {
        where: {
          month: currentMonth,
          status: 'confirmed',
        },
      },
    },
  })

  const tenantsInArrears = tenants.filter((tenant) => {
    const hasPaidThisMonth = tenant.payments.length > 0
    const rentDueDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      tenant.rentDueDay
    )
    return !hasPaidThisMonth && today > rentDueDate
  })

  const totalArrears = tenantsInArrears.reduce((sum, tenant) => {
    return sum + parseFloat(tenant.unit.rentAmount.toString())
  }, 0)

  // Payment method distribution
  const allPayments = await prisma.payment.findMany({
    where: {
      unit: { property: { userId } },
      status: 'confirmed',
    },
  })

  const paymentMethodCounts = allPayments.reduce(
    (acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const paymentMethodData = Object.entries(paymentMethodCounts).map(
    ([method, count]) => ({
      name: method.toUpperCase(),
      value: count,
    })
  )

  const COLORS = ['#4F46E5', '#8B5CF6', '#EC4899', '#F59E0B']

  // Calculate total revenue (all time)
  const totalRevenue = allPayments.reduce(
    (sum, p) => sum + parseFloat(p.amount.toString()),
    0
  )

  // This month revenue
  const thisMonthRevenue =
    monthsData.length > 0 ? monthsData[monthsData.length - 1].revenue : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics & Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Insights into your property portfolio performance
          </p>
        </div>
        <Link
          href="/dashboard/analytics/export"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          📥 Export Reports
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <span className="text-2xl">💰</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            KES {totalRevenue.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-500">All time</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">This Month</p>
            <span className="text-2xl">📈</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            KES {thisMonthRevenue.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {monthsData.length > 0 ? monthsData[monthsData.length - 1].month : ''}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
            <span className="text-2xl">🏘️</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {occupancyRate.toFixed(1)}%
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {occupiedUnits} / {totalUnits} units occupied
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Arrears</p>
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-red-600">
            KES {totalArrears.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {tenantsInArrears.length} tenants overdue
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Revenue Trend (Last 6 Months)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `KES ${value.toLocaleString()}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4F46E5"
                strokeWidth={2}
                name="Revenue (KES)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Payment Methods Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Payments Count */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Number of Payments Per Month
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="payments" fill="#8B5CF6" name="Payments" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performing Properties */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Top Properties (This Month)
          </h2>
          <div className="space-y-4">
            {propertyStats.slice(0, 5).map((property, index) => (
              <div key={property.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{property.name}</p>
                    <p className="text-sm text-gray-500">{property.units} units</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">
                  KES {property.revenue.toLocaleString()}
                </p>
              </div>
            ))}
            {propertyStats.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                No properties yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Arrears Table */}
      {tenantsInArrears.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Tenants in Arrears ({tenantsInArrears.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rent Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Due Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tenantsInArrears.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link
                        href={`/dashboard/tenants/${tenant.id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        {tenant.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {tenant.unit.property.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {tenant.unit.unitNumber}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      KES {parseFloat(tenant.unit.rentAmount.toString()).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      Day {tenant.rentDueDay}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {tenant.phone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/dashboard/reminders"
            className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-2xl">📱</span>
            <div>
              <p className="font-medium text-gray-900">Send Reminders</p>
              <p className="text-sm text-gray-500">
                Remind {tenantsInArrears.length} tenants
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/payments"
            className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-2xl">💳</span>
            <div>
              <p className="font-medium text-gray-900">Record Payment</p>
              <p className="text-sm text-gray-500">Add new payment</p>
            </div>
          </Link>

          <Link
            href="/dashboard/analytics/export"
            className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-medium text-gray-900">Export Reports</p>
              <p className="text-sm text-gray-500">Download CSV data</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
