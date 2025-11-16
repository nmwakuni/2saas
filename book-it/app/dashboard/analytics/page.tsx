'use client'

import { useState, useEffect } from 'react'
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

interface AnalyticsData {
  overview: {
    totalAppointments: number
    totalRevenue: number
    totalCustomers: number
    totalServices: number
    monthlyAppointments: number
    monthlyRevenue: number
  }
  revenueByMonth: Array<{
    month: string
    revenue: number
    bookings: number
  }>
  popularServices: Array<{
    name: string
    bookings: number
    revenue: number
  }>
  statusDistribution: Array<{
    status: string
    count: number
  }>
  paymentMethodData: Array<{
    method: string
    count: number
    revenue: number
  }>
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#FCD34D',
  confirmed: '#34D399',
  completed: '#3B82F6',
  cancelled: '#F87171',
}

const PAYMENT_COLORS: Record<string, string> = {
  mpesa: '#10B981',
  cash: '#6366F1',
  card: '#F59E0B',
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics')
      const analyticsData = await res.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-red-500">Failed to load analytics</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your business performance and insights
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Appointments
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {data.overview.totalAppointments}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {data.overview.monthlyAppointments} this month
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <span className="text-3xl">📅</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                KES {data.overview.totalRevenue.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                KES {data.overview.monthlyRevenue.toLocaleString()} this month
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <span className="text-3xl">💰</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {data.overview.totalCustomers}
              </p>
              <p className="mt-1 text-sm text-gray-500">Unique customers</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <span className="text-3xl">👥</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Services</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {data.overview.totalServices}
              </p>
              <p className="mt-1 text-sm text-gray-500">Service offerings</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <span className="text-3xl">✂️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Revenue & Bookings Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.revenueByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Revenue (KES)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="bookings"
              stroke="#10B981"
              strokeWidth={2}
              name="Bookings"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Popular Services & Status Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Popular Services */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Top Services by Bookings
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.popularServices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#3B82F6" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Appointment Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.statusDistribution}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.status}: ${entry.count}`}
              >
                {data.statusDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.status] || '#9CA3AF'}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Revenue & Payment Methods */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Service Revenue */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Revenue by Service
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.popularServices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue (KES)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Payment Methods
          </h2>
          {data.paymentMethodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.paymentMethodData}
                  dataKey="revenue"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.method}: KES ${entry.revenue}`}
                >
                  {data.paymentMethodData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PAYMENT_COLORS[entry.method] || '#9CA3AF'}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
              <p className="text-gray-500">No payment data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Services Performance Table */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Service Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                    Service
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                    Bookings
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.popularServices.map((service, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {service.name}
                    </td>
                    <td className="px-4 py-2 text-right text-sm text-gray-600">
                      {service.bookings}
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-green-600">
                      KES {service.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods Table */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Payment Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
                    Method
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                    Transactions
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.paymentMethodData.length > 0 ? (
                  data.paymentMethodData.map((method, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm capitalize text-gray-900">
                        {method.method}
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-gray-600">
                        {method.count}
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-green-600">
                        KES {method.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No payment data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
