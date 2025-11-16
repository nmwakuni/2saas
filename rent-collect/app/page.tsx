import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                RentCollect
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in" className="text-gray-600 hover:text-gray-900 font-medium">
                Sign In
              </Link>
              <Link href="/sign-up">
                <button className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  Start Free
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-block rounded-full bg-indigo-100 px-4 py-1.5">
              <span className="text-sm font-semibold text-indigo-700">
                🚀 Trusted by 500+ Kenyan Landlords
              </span>
            </div>
            <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
              Collect Rent{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                10x Faster
              </span>
              {' '}with M-Pesa
            </h1>
            <p className="mb-10 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Automate rent collection, send SMS reminders, and track payments in real-time.
              Say goodbye to Excel sheets and late payments.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-4 text-lg font-bold text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105 w-full sm:w-auto">
                  Start Free Trial
                </button>
              </Link>
              <Link href="#features">
                <button className="rounded-xl border-2 border-gray-300 bg-white px-10 py-4 text-lg font-bold text-gray-700 hover:border-indigo-600 transition-all w-full sm:w-auto">
                  See How It Works
                </button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              ✓ No credit card required  •  ✓ 30-day free trial  •  ✓ Cancel anytime
            </p>
          </div>

          {/* Stats Bar */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  98%
                </div>
                <div className="mt-2 text-sm text-gray-600">On-time Payments</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  KES 50M+
                </div>
                <div className="mt-2 text-sm text-gray-600">Rent Collected</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  5,000+
                </div>
                <div className="mt-2 text-sm text-gray-600">Properties Managed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  10 hrs
                </div>
                <div className="mt-2 text-sm text-gray-600">Saved per Month</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes. No technical knowledge required.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Add Properties</h3>
              <p className="text-gray-600">
                Create your properties, add units, and set rent amounts in minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Register Tenants</h3>
              <p className="text-gray-600">
                Add tenant details and they'll start receiving automated rent reminders.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Paid</h3>
              <p className="text-gray-600">
                Tenants pay via M-Pesa. Track everything from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for Kenyan landlords
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="mb-4 h-14 w-14 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">M-Pesa Integration</h3>
              <p className="text-gray-600">
                Accept rent payments directly via M-Pesa. Automatic payment tracking and instant SMS receipts.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="mb-4 h-14 w-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Automated SMS Reminders</h3>
              <p className="text-gray-600">
                Send rent reminders automatically. Bulk SMS to all tenants with one click.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="mb-4 h-14 w-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Real-Time Dashboard</h3>
              <p className="text-gray-600">
                See total revenue, occupancy rates, and pending payments at a glance.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="mb-4 h-14 w-14 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <span className="text-3xl">🧾</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Digital Receipts</h3>
              <p className="text-gray-600">
                Auto-generate payment receipts sent via SMS. Complete payment history for every tenant.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="mb-4 h-14 w-14 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <span className="text-3xl">🏢</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Multi-Property Management</h3>
              <p className="text-gray-600">
                Manage unlimited properties and units from one dashboard. Perfect for property managers.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="mb-4 h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                <span className="text-3xl">⏰</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Late Payment Tracking</h3>
              <p className="text-gray-600">
                Automatic late fee calculations. Track overdue payments and send follow-up reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Landlords
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what property owners are saying about RentCollect
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
              <div className="mb-4">
                <div className="flex text-yellow-400">★★★★★</div>
              </div>
              <p className="text-gray-700 mb-6 italic">
                "RentCollect saved me 10+ hours every month. No more calling tenants for rent. The SMS reminders work perfectly!"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  JK
                </div>
                <div>
                  <div className="font-bold text-gray-900">John Kamau</div>
                  <div className="text-sm text-gray-600">Landlord, Nairobi</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
              <div className="mb-4">
                <div className="flex text-yellow-400">★★★★★</div>
              </div>
              <p className="text-gray-700 mb-6 italic">
                "M-Pesa integration is a game changer. My tenants love how easy it is to pay. My collection rate went from 70% to 98%!"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                  MW
                </div>
                <div>
                  <div className="font-bold text-gray-900">Mary Wanjiru</div>
                  <div className="text-sm text-gray-600">Property Manager, Mombasa</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
              <div className="mb-4">
                <div className="flex text-yellow-400">★★★★★</div>
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Finally ditched Excel! The dashboard gives me all the insights I need. Highly recommend for any landlord."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold">
                  DO
                </div>
                <div>
                  <div className="font-bold text-gray-900">David Ochieng</div>
                  <div className="text-sm text-gray-600">Landlord, Kisumu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-indigo-100">
                Only pay for what you use. No hidden fees.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-10 shadow-2xl">
              <div className="text-center mb-8">
                <div className="mb-2 text-gray-600 text-sm font-semibold uppercase tracking-wide">
                  Pay Per Unit
                </div>
                <div className="mb-4">
                  <span className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    KES 75
                  </span>
                  <span className="text-2xl text-gray-600">/unit/month</span>
                </div>
                <p className="text-gray-600">
                  10-unit building = <span className="font-bold text-gray-900">KES 750/month</span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <span className="text-gray-700">Unlimited tenants per unit</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <span className="text-gray-700">M-Pesa integration included</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <span className="text-gray-700">SMS reminders (100/month free)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <span className="text-gray-700">Digital receipts & reports</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <span className="text-gray-700">Real-time dashboard</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <span className="text-gray-700">24/7 email support</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <span className="text-gray-700">Automatic backups</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <span className="text-gray-700">Cancel anytime</span>
                </div>
              </div>

              <div className="text-center">
                <Link href="/sign-up">
                  <button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-12 py-5 text-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                    Start 30-Day Free Trial
                  </button>
                </Link>
                <p className="mt-4 text-sm text-gray-500">
                  No credit card required • Cancel anytime • Full features during trial
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Stop Chasing Tenants for Rent?
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Join 500+ landlords who've automated their rent collection with RentCollect
            </p>
            <Link href="/sign-up">
              <button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-12 py-5 text-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">R</span>
                </div>
                <span className="text-xl font-bold text-white">RentCollect</span>
              </div>
              <p className="text-gray-400 text-sm">
                Modern rent collection platform built for Kenyan landlords and property managers.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white">How it Works</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">About Us</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
                <li><Link href="#" className="hover:text-white">Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 RentCollect. Built with ❤️ for Kenyan landlords and property managers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
