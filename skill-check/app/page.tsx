import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="text-xl font-bold text-gray-900">
                Skill Check
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
              Hire{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Smarter
              </span>
              <br />
              Test Candidates Faster
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-600">
              Create professional skill assessments, invite candidates via SMS,
              and make data-driven hiring decisions. Built for Kenyan recruiters.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="rounded-lg bg-purple-600 px-8 py-4 text-lg font-semibold text-white hover:bg-purple-700"
              >
                Start Free Trial
              </Link>
              <Link
                href="#features"
                className="rounded-lg border-2 border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '10+', label: 'Free Assessments' },
              { value: '< 5 min', label: 'Setup Time' },
              { value: 'SMS', label: 'Instant Invites' },
              { value: '100%', label: 'Kenyan Built' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Everything You Need to Test Talent
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Powerful features designed specifically for Kenyan recruiters and HR professionals
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: '✍️',
                title: 'Custom Assessments',
                description:
                  'Create technical, aptitude, or personality tests with multiple question types',
              },
              {
                icon: '📱',
                title: 'SMS Invitations',
                description:
                  'Invite candidates via SMS with unique access codes. No email required.',
              },
              {
                icon: '⏱️',
                title: 'Timed Tests',
                description:
                  'Set time limits per test or per question. Auto-submit on timeout.',
              },
              {
                icon: '📊',
                title: 'Instant Results',
                description:
                  'Automatic scoring with detailed analytics. See who passed immediately.',
              },
              {
                icon: '💰',
                title: 'M-Pesa Payments',
                description:
                  'Buy more assessment credits with M-Pesa. Pay as you grow.',
              },
              {
                icon: '🎓',
                title: 'Digital Certificates',
                description:
                  'Auto-generate certificates for candidates who pass your tests.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Get started in minutes, not hours
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Create Assessment',
                description:
                  'Build your test with our easy question builder. Multiple choice, coding, or custom.',
              },
              {
                step: '2',
                title: 'Invite Candidates',
                description:
                  'Send SMS invites with unique access codes. Candidates take tests on any device.',
              },
              {
                step: '3',
                title: 'Review Results',
                description:
                  'Get instant scores and analytics. Download reports. Make better hiring decisions.',
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-2xl font-bold text-white">
                    {step.step}
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Start free, pay only for what you need
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: 'Free',
                price: 'KES 0',
                period: 'forever',
                features: [
                  '10 assessment credits',
                  '10 SMS invitations',
                  'All question types',
                  'Basic analytics',
                  'Email support',
                ],
                cta: 'Get Started',
                highlighted: false,
              },
              {
                name: 'Pro',
                price: 'KES 2,500',
                period: 'per month',
                features: [
                  '100 assessment credits',
                  '100 SMS invitations',
                  'Advanced analytics',
                  'Custom branding',
                  'Priority support',
                  'Bulk invites',
                ],
                cta: 'Start Pro Trial',
                highlighted: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'contact us',
                features: [
                  'Unlimited assessments',
                  'Unlimited SMS',
                  'Custom integrations',
                  'Dedicated support',
                  'SLA guarantee',
                  'Training included',
                ],
                cta: 'Contact Sales',
                highlighted: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-lg border-2 p-8 ${
                  plan.highlighted
                    ? 'border-purple-600 bg-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-purple-600">
                  {plan.name}
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600"> / {plan.period}</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`block rounded-lg px-6 py-3 text-center font-semibold ${
                    plan.highlighted
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-4xl font-bold text-white">
            Ready to Transform Your Hiring?
          </h2>
          <p className="mb-8 text-xl text-purple-100">
            Join Kenyan companies making smarter hiring decisions with Skill Check
          </p>
          <Link
            href="/sign-up"
            className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-purple-600 hover:bg-gray-100"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span className="text-lg font-bold text-gray-900">
                  Skill Check
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Professional skill assessments for Kenyan businesses
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-gray-900">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#features">Features</Link>
                </li>
                <li>
                  <Link href="#pricing">Pricing</Link>
                </li>
                <li>
                  <Link href="/sign-up">Get Started</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-gray-900">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-gray-900">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            © 2024 Skill Check. Built for Kenya with ❤️
          </div>
        </div>
      </footer>
    </div>
  )
}
