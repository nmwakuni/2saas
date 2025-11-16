import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, addDays, startOfDay, endOfDay } from 'date-fns'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Get or create user
  let user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email: 'user@example.com', // Will be updated via Clerk webhook
        name: 'Business Owner',
        businessName: 'My Business',
        businessType: 'general',
      },
    })
  }

  const now = new Date()
  const startOfThisMonth = startOfMonth(now)
  const endOfThisMonth = endOfMonth(now)
  const tomorrow = addDays(startOfDay(now), 1)
  const endOfTomorrow = endOfDay(tomorrow)

  // Get statistics
  const totalServices = await prisma.service.count({
    where: { userId },
  })

  const totalCustomers = await prisma.customer.count()

  const totalAppointments = await prisma.appointment.count({
    where: { userId },
  })

  const thisMonthAppointments = await prisma.appointment.count({
    where: {
      userId,
      appointmentDate: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
    },
  })

  const tomorrowAppointments = await prisma.appointment.count({
    where: {
      userId,
      appointmentDate: {
        gte: tomorrow,
        lte: endOfTomorrow,
      },
      status: {
        in: ['pending', 'confirmed'],
      },
    },
  })

  const thisMonthRevenue = await prisma.payment.aggregate({
    where: {
      appointment: {
        userId,
        appointmentDate: {
          gte: startOfThisMonth,
          lte: endOfThisMonth,
        },
      },
      status: 'paid',
    },
    _sum: {
      amount: true,
    },
  })

  const revenue = thisMonthRevenue._sum.amount || 0

  // Get upcoming appointments
  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      userId,
      appointmentDate: {
        gte: now,
      },
      status: {
        in: ['pending', 'confirmed'],
      },
    },
    include: {
      customer: true,
      service: true,
    },
    orderBy: {
      appointmentDate: 'asc',
    },
    take: 5,
  })

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name}! 👋
        </h2>
        <p className="mt-1 text-gray-500">
          Here's what's happening with your business today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Total Appointments</p>
            <span className="text-2xl">📅</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalAppointments}</p>
          <p className="mt-1 text-sm text-gray-500">All time</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">This Month</p>
            <span className="text-2xl">📊</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {thisMonthAppointments}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {format(now, 'MMMM yyyy')}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Revenue</p>
            <span className="text-2xl">💰</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            KES {Number(revenue).toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-500">This month</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Tomorrow</p>
            <span className="text-2xl">🔔</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {tomorrowAppointments}
          </p>
          <p className="mt-1 text-sm text-gray-500">Appointments</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/dashboard/appointments/new"
            className="flex items-center gap-3 rounded-lg border-2 border-blue-600 bg-blue-50 p-4 transition-colors hover:bg-blue-100"
          >
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-medium text-gray-900">New Appointment</p>
              <p className="text-sm text-gray-600">Book a customer</p>
            </div>
          </Link>

          <Link
            href="/dashboard/services"
            className="flex items-center gap-3 rounded-lg border-2 border-gray-300 p-4 transition-colors hover:border-gray-400 hover:bg-gray-50"
          >
            <span className="text-2xl">✂️</span>
            <div>
              <p className="font-medium text-gray-900">Manage Services</p>
              <p className="text-sm text-gray-600">{totalServices} services</p>
            </div>
          </Link>

          <Link
            href="/dashboard/customers"
            className="flex items-center gap-3 rounded-lg border-2 border-gray-300 p-4 transition-colors hover:border-gray-400 hover:bg-gray-50"
          >
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-medium text-gray-900">View Customers</p>
              <p className="text-sm text-gray-600">{totalCustomers} customers</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Appointments
            </h3>
            <Link
              href="/dashboard/appointments"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all →
            </Link>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {upcomingAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No upcoming appointments</p>
              <Link
                href="/dashboard/appointments/new"
                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Create your first appointment →
              </Link>
            </div>
          ) : (
            upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-6 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                    {appointment.customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {appointment.customer.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.service.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {format(new Date(appointment.appointmentDate), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">{appointment.startTime}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Setup Guide (if no services) */}
      {totalServices === 0 && (
        <div className="rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
          <h3 className="mb-4 text-xl font-bold text-gray-900">
            🚀 Let's Get You Started!
          </h3>
          <p className="mb-6 text-gray-700">
            Follow these steps to start accepting appointments:
          </p>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                1
              </span>
              <div>
                <Link
                  href="/dashboard/services"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Create your services →
                </Link>
                <p className="text-sm text-gray-600">
                  Add the services you offer (haircuts, consultations, etc.)
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                2
              </span>
              <div>
                <Link
                  href="/dashboard/availability"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Set your availability →
                </Link>
                <p className="text-sm text-gray-600">
                  Define when you're available for appointments
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                3
              </span>
              <div>
                <Link
                  href="/dashboard/settings"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Configure settings →
                </Link>
                <p className="text-sm text-gray-600">
                  Set up SMS reminders and payment options
                </p>
              </div>
            </li>
          </ol>
        </div>
      )}
    </div>
  )
}
