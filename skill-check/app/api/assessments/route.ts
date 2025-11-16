import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - List all assessments
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const assessments = await prisma.assessment.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            questions: true,
            testSessions: true,
            invitations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(assessments)
  } catch (error: any) {
    console.error('Get Assessments Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assessments' },
      { status: 500 }
    )
  }
}

// POST - Create new assessment
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { title, description, category, difficulty, duration, passingScore, isPublic } =
      await request.json()

    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        category,
        difficulty: difficulty || 'medium',
        duration: parseInt(duration),
        passingScore: parseInt(passingScore) || 70,
        isPublic: isPublic || false,
        userId: user.id,
      },
    })

    return NextResponse.json(assessment, { status: 201 })
  } catch (error: any) {
    console.error('Create Assessment Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create assessment' },
      { status: 500 }
    )
  }
}
