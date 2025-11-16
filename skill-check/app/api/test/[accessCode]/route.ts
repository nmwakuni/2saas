import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get test by access code (public - no auth)
export async function GET(
  request: NextRequest,
  { params }: { params: { accessCode: string } }
) {
  try {
    // Find invitation by access code
    const invitation = await prisma.invitation.findUnique({
      where: { accessCode: params.accessCode },
      include: {
        assessment: {
          include: {
            questions: {
              include: {
                options: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        candidate: true,
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 404 }
      )
    }

    // Check if expired
    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 403 }
      )
    }

    // Check if already completed
    if (invitation.status === 'completed') {
      return NextResponse.json(
        { error: 'You have already completed this test' },
        { status: 403 }
      )
    }

    // Hide correct answers from questions
    const sanitizedAssessment = {
      ...invitation.assessment,
      questions: invitation.assessment.questions.map((q) => ({
        ...q,
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          order: opt.order,
          // Don't send isCorrect to client
        })),
      })),
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        candidateName: invitation.candidateName,
        candidateEmail: invitation.candidateEmail,
      },
      assessment: sanitizedAssessment,
      candidate: invitation.candidate,
    })
  } catch (error: any) {
    console.error('Get Test Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch test' },
      { status: 500 }
    )
  }
}
