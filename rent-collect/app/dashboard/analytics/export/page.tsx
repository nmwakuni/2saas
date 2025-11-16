import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ExportPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="mb-4">
          <Link
            href="/dashboard/analytics"
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
          >
            ← Back to Analytics
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Export Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Download your data in CSV format for further analysis
        </p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Payments Export */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
            <span className="text-2xl">💳</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Payments Report
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            Export all payment transactions with tenant and property details
          </p>
          <form action="/api/export/payments" method="GET">
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Download Payments CSV
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-400">
            Includes: Date, Tenant, Property, Unit, Amount, Method, Status
          </p>
        </div>

        {/* Tenants Export */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
            <span className="text-2xl">👥</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Tenants Report
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            Export all tenant information including contact details and lease info
          </p>
          <form action="/api/export/tenants" method="GET">
            <button
              type="submit"
              className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              Download Tenants CSV
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-400">
            Includes: Name, Phone, Email, Property, Unit, Move-in Date, Status
          </p>
        </div>

        {/* Properties Export */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100">
            <span className="text-2xl">🏢</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Properties Report
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            Export all properties with unit counts and occupancy rates
          </p>
          <form action="/api/export/properties" method="GET">
            <button
              type="submit"
              className="w-full rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
            >
              Download Properties CSV
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-400">
            Includes: Name, Address, Type, Total Units, Occupied Units
          </p>
        </div>

        {/* Arrears Export */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Arrears Report
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            Export list of tenants with overdue payments for follow-up
          </p>
          <form action="/api/export/arrears" method="GET">
            <button
              type="submit"
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Download Arrears CSV
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-400">
            Includes: Tenant, Phone, Property, Unit, Rent Amount, Due Day
          </p>
        </div>

        {/* Revenue Summary Export */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
            <span className="text-2xl">📈</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Revenue Summary
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            Export monthly revenue summary for the last 12 months
          </p>
          <form action="/api/export/revenue" method="GET">
            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Download Revenue CSV
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-400">
            Includes: Month, Total Revenue, Payment Count, Avg Payment
          </p>
        </div>

        {/* Units Export */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
            <span className="text-2xl">🏘️</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Units Report
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            Export all units with rent amounts and occupancy status
          </p>
          <form action="/api/export/units" method="GET">
            <button
              type="submit"
              className="w-full rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
            >
              Download Units CSV
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-400">
            Includes: Property, Unit Number, Rent Amount, Status, Tenant
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-blue-900">
              Tips for Using Exported Data
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>• Open CSV files in Excel, Google Sheets, or any spreadsheet software</li>
              <li>• Use pivot tables to analyze revenue by property or month</li>
              <li>• Filter arrears report to prioritize follow-up calls</li>
              <li>• Import into accounting software like QuickBooks or Xero</li>
              <li>• Create custom charts and visualizations from the data</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom Date Range (Future Enhancement) */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm opacity-60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Custom Date Range Export
            </h3>
            <p className="text-sm text-gray-500">
              Coming soon: Export data for specific date ranges
            </p>
          </div>
          <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  )
}
