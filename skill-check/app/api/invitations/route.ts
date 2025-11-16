import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sendAssessmentInvitation } from '@/lib/sms'
import { randomBytes } from 'crypto'

// POST - Send invitation
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

    // Check credits
    if (user.creditsLeft <= 0) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please purchase more.' },
        { status: 403 }
      )
    }

    const { assessmentId, candidateName, candidateEmail, candidatePhone, expiresInDays } =
      await request.json()

    // Verify assessment ownership
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: user.id,
      },
    })

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Generate unique access code
    const accessCode = randomBytes(8).toString('hex').toUpperCase()

    // Calculate expiry
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        candidateName,
        candidateEmail,
        candidatePhone,
        accessCode,
        expiresAt,
        userId: user.id,
        assessmentId,
      },
    })

    // Send SMS
    try {
      await sendAssessmentInvitation(
        candidateName,
        candidatePhone,
        assessment.title,
        accessCode,
        user.companyName || 'Skill Check'
      )

      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
        },
      })
    } catch (smsError) {
      console.error('SMS Error:', smsError)
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'failed',
        },
      })
    }

    // Deduct credit
    await prisma.user.update({
      where: { id: user.id },
      data: {
        creditsLeft: user.creditsLeft - 1,
      },
    })

    return NextResponse.json(invitation, { status: 201 })
  } catch (error: any) {
    console.error('Send Invitation Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send invitation' },
      { status: 500 }
    )
  }
}

// GET - List invitations
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

    const invitations = await prisma.invitation.findMany({
      where: { userId: user.id },
      include: {
        assessment: true,
        candidate: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invitations)
  } catch (error: any) {
    console.error('Get Invitations Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}
