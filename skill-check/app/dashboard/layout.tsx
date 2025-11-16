import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-600 text-white">
        <div className="flex h-16 items-center gap-2 border-b border-purple-700 px-6">
          <span className="text-2xl">🎯</span>
          <span className="text-xl font-bold">Skill Check</span>
        </div>

        <nav className="mt-6 space-y-1 px-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <span>📊</span>
            <span>Overview</span>
          </Link>
          <Link
            href="/dashboard/assessments"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <span>✍️</span>
            <span>Assessments</span>
          </Link>
          <Link
            href="/dashboard/invitations"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <span>📱</span>
            <span>Invitations</span>
          </Link>
          <Link
            href="/dashboard/results"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <span>📈</span>
            <span>Results</span>
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <span>📉</span>
            <span>Analytics</span>
          </Link>
          <Link
            href="/dashboard/credits"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <span>💰</span>
            <span>Buy Credits</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
