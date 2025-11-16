import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - Single assessment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const assessment = await prisma.assessment.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(assessment)
  } catch (error: any) {
    console.error('Get Assessment Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assessment' },
      { status: 500 }
    )
  }
}

// PATCH - Update assessment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const data = await request.json()

    const assessment = await prisma.assessment.updateMany({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        ...data,
        duration: data.duration ? parseInt(data.duration) : undefined,
        passingScore: data.passingScore
          ? parseInt(data.passingScore)
          : undefined,
      },
    })

    if (assessment.count === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update Assessment Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update assessment' },
      { status: 500 }
    )
  }
}

// DELETE - Delete assessment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const assessment = await prisma.assessment.deleteMany({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (assessment.count === 0) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete Assessment Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete assessment' },
      { status: 500 }
    )
  }
}
