import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-600 text-white">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white"></div>
            <span className="text-xl font-bold">RentCollect</span>
          </div>
        </div>

        <nav className="mt-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-indigo-700 hover:text-white"
          >
            <span>📊</span>
            <span>Overview</span>
          </Link>
          <Link
            href="/dashboard/properties"
            className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-indigo-700 hover:text-white"
          >
            <span>🏢</span>
            <span>Properties</span>
          </Link>
          <Link
            href="/dashboard/tenants"
            className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-indigo-700 hover:text-white"
          >
            <span>👥</span>
            <span>Tenants</span>
          </Link>
          <Link
            href="/dashboard/payments"
            className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-indigo-700 hover:text-white"
          >
            <span>💰</span>
            <span>Payments</span>
          </Link>
          <Link
            href="/dashboard/reminders"
            className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-indigo-700 hover:text-white"
          >
            <span>💬</span>
            <span>SMS Reminders</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  )
}
