import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// POST - Add question to assessment
export async function POST(
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

    // Verify assessment ownership
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    const { question, type, points, timeLimit, explanation, options } =
      await request.json()

    // Get current question count for ordering
    const questionCount = await prisma.question.count({
      where: { assessmentId: params.id },
    })

    // Create question
    const newQuestion = await prisma.question.create({
      data: {
        question,
        type,
        points: parseInt(points) || 1,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        explanation,
        order: questionCount,
        assessmentId: params.id,
        options: {
          create: options
            ? options.map((opt: any, index: number) => ({
                text: opt.text,
                isCorrect: opt.isCorrect || false,
                order: index,
              }))
            : [],
        },
      },
      include: {
        options: true,
      },
    })

    return NextResponse.json(newQuestion, { status: 201 })
  } catch (error: any) {
    console.error('Create Question Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create question' },
      { status: 500 }
    )
  }
}
