import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  // Get or create user
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    const clerkUser = await auth()
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.sessionClaims?.email as string || '',
        creditsLeft: 10,
      },
    })
  }

  // Get stats
  const totalAssessments = await prisma.assessment.count({
    where: { userId: user.id },
  })

  const activeAssessments = await prisma.assessment.count({
    where: { userId: user.id, status: 'active' },
  })

  const totalInvitations = await prisma.invitation.count({
    where: { userId: user.id },
  })

  const completedTests = await prisma.testSession.count({
    where: {
      assessment: { userId: user.id },
      status: 'completed',
    },
  })

  const passedTests = await prisma.testSession.count({
    where: {
      assessment: { userId: user.id },
      status: 'completed',
      passed: true,
    },
  })

  const passRate =
    completedTests > 0
      ? Math.round((passedTests / completedTests) * 100)
      : 0

  // Recent test sessions
  const recentSessions = await prisma.testSession.findMany({
    where: {
      assessment: { userId: user.id },
    },
    include: {
      assessment: true,
      candidate: true,
      result: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your assessments
        </p>
      </div>

      {/* Credits Card */}
      <div className="rounded-lg border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Assessment Credits
            </p>
            <p className="mt-2 text-4xl font-bold text-purple-600">
              {user.creditsLeft}
            </p>
            <p className="mt-1 text-sm text-gray-500">credits remaining</p>
          </div>
          <Link
            href="/dashboard/credits"
            className="rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700"
          >
            Buy More Credits
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Assessments
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {totalAssessments}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <span className="text-2xl">✍️</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Tests
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {activeAssessments}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Invitations Sent
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {totalInvitations}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <span className="text-2xl">📱</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pass Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {passRate}%
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Test Sessions
          </h2>
          <Link
            href="/dashboard/results"
            className="text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            View All →
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <p className="text-gray-500">No test sessions yet</p>
            <Link
              href="/dashboard/assessments"
              className="mt-4 inline-block text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Create your first assessment →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {session.candidate.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {session.assessment.title}
                  </p>
                </div>
                <div className="text-right">
                  {session.status === 'completed' ? (
                    <>
                      <p
                        className={`font-semibold ${
                          session.passed
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {session.score?.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.passed ? 'Passed' : 'Failed'}
                      </p>
                    </>
                  ) : (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                      {session.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/dashboard/assessments/new"
          className="flex items-center gap-4 rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-purple-300 hover:bg-purple-50"
        >
          <div className="rounded-full bg-purple-100 p-3">
            <span className="text-2xl">➕</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              Create New Assessment
            </p>
            <p className="text-sm text-gray-500">
              Build a new skill test for candidates
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/invitations/new"
          className="flex items-center gap-4 rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-300 hover:bg-blue-50"
        >
          <div className="rounded-full bg-blue-100 p-3">
            <span className="text-2xl">📤</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Send Invitation</p>
            <p className="text-sm text-gray-500">
              Invite candidates to take a test
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
