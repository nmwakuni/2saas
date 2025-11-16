export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600"></div>
            <span className="text-xl font-bold text-gray-900">RentCollect</span>
          </div>
          <button className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900">
            Digital Rent Collection for Kenyan Landlords
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Track tenants, collect rent via M-Pesa, send SMS reminders, and generate receipts automatically.
            No more Excel sheets or missing payments.
          </p>
          <button className="rounded-lg bg-indigo-600 px-8 py-4 text-lg font-medium text-white hover:bg-indigo-700">
            Start Free Trial
          </button>
          <p className="mt-4 text-sm text-gray-500">
            No credit card required • KES 75/unit/month after trial
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">M-Pesa Integration</h3>
            <p className="text-gray-600">
              Tenants pay via M-Pesa. Payments tracked automatically with instant receipts.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">SMS Reminders</h3>
            <p className="text-gray-600">
              Automated rent reminders sent 5 days before due date. No more chasing tenants.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Dashboard Analytics</h3>
            <p className="text-gray-600">
              See total collected, pending payments, and occupancy rates at a glance.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <span className="text-2xl">🧾</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Digital Receipts</h3>
            <p className="text-gray-600">
              Auto-generate PDF receipts sent via SMS. Full payment history for each tenant.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Multi-Property</h3>
            <p className="text-gray-600">
              Manage multiple buildings from one dashboard. Perfect for property managers.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Late Payment Tracking</h3>
            <p className="text-gray-600">
              Automatically calculate late fees and track overdue payments.
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="mx-auto mt-20 max-w-2xl">
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <div className="mb-6 text-center">
              <span className="text-5xl font-bold text-indigo-600">KES 75</span>
              <span className="text-xl text-gray-600">/unit/month</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">Unlimited tenants per unit</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">M-Pesa integration included</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">SMS reminders (first 100/month free)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">Digital receipts & reports</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">24/7 support</span>
              </li>
            </ul>
            <div className="mt-8 text-center">
              <button className="rounded-lg bg-indigo-600 px-8 py-4 text-lg font-medium text-white hover:bg-indigo-700">
                Start 30-Day Free Trial
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 RentCollect. Built for Kenyan landlords and property managers.</p>
        </div>
      </footer>
    </div>
  );
}
