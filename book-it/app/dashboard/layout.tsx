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
      <aside className="w-64 bg-blue-600 text-white">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-blue-600 font-bold">
              B
            </div>
            <span className="text-xl font-bold">Book It</span>
          </div>
        </div>

        <nav className="mt-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-blue-700 hover:text-white"
          >
            <span>📊</span>
            <span>Overview</span>
          </Link>
          <Link
            href="/dashboard/appointments"
            className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-blue-700 hover:text-white"
          >
            <span>📅</span>
            <span>Appointments</span>
          </Link>
          <Link
            href="/dashboard/calendar"
            className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-blue-700 hover:text-white"
          >
            <span>🗓️</span>
            <span>Calendar</span>
          </Link>
          <Link
            href="/dashboard/services"
            className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-blue-700 hover:text-white"
          >
            <span>✂️</span>
            <span>Services</span>
          </Link>
          <Link
            href="/dashboard/customers"
            className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-blue-700 hover:text-white"
          >
            <span>👥</span>
            <span>Customers</span>
          </Link>
          <Link
            href="/dashboard/availability"
            className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-blue-700 hover:text-white"
          >
            <span>⏰</span>
            <span>Availability</span>
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-blue-700 hover:text-white"
          >
            <span>📈</span>
            <span>Analytics</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-blue-700 hover:text-white"
          >
            <span>⚙️</span>
            <span>Settings</span>
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
