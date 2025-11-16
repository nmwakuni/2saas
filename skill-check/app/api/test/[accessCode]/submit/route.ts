import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTestCompletionNotification, sendRecruiterNotification } from '@/lib/sms'

// POST - Submit test answers
export async function POST(
  request: NextRequest,
  { params }: { params: { accessCode: string } }
) {
  try {
    const { answers, timeSpent } = await request.json()

    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { accessCode: params.accessCode },
      include: {
        assessment: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
            user: true,
          },
        },
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 404 }
      )
    }

    // Get or create candidate
    let candidate = invitation.candidate
      ? await prisma.candidate.findUnique({
          where: { id: invitation.candidateId! },
        })
      : null

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          name: invitation.candidateName,
          email: invitation.candidateEmail,
          phone: invitation.candidatePhone,
        },
      })
    }

    // Create test session
    const testSession = await prisma.testSession.create({
      data: {
        assessmentId: invitation.assessment.id,
        candidateId: candidate.id,
        timeSpent: parseInt(timeSpent) || 0,
        status: 'completed',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    // Calculate score
    let totalPoints = 0
    let pointsEarned = 0
    let correctAnswers = 0
    let wrongAnswers = 0
    let skippedQuestions = 0

    // Process each answer
    for (const question of invitation.assessment.questions) {
      totalPoints += question.points

      const candidateAnswer = answers[question.id]

      if (!candidateAnswer || candidateAnswer.trim() === '') {
        skippedQuestions++
        await prisma.answer.create({
          data: {
            testSessionId: testSession.id,
            questionId: question.id,
            answerText: '',
            isCorrect: false,
            pointsAwarded: 0,
          },
        })
        continue
      }

      let isCorrect = false
      let pointsAwarded = 0

      // Check if answer is correct
      if (question.type === 'multiple_choice') {
        const correctOption = question.options.find((opt) => opt.isCorrect)
        isCorrect = correctOption?.id === candidateAnswer
      } else if (question.type === 'true_false') {
        const correctOption = question.options.find((opt) => opt.isCorrect)
        isCorrect = correctOption?.text.toLowerCase() === candidateAnswer.toLowerCase()
      }

      if (isCorrect) {
        correctAnswers++
        pointsAwarded = question.points
        pointsEarned += pointsAwarded
      } else {
        wrongAnswers++
      }

      await prisma.answer.create({
        data: {
          testSessionId: testSession.id,
          questionId: question.id,
          answerText: candidateAnswer,
          isCorrect,
          pointsAwarded,
        },
      })
    }

    // Calculate percentage score
    const score = totalPoints > 0 ? (pointsEarned / totalPoints) * 100 : 0
    const passed = score >= invitation.assessment.passingScore

    // Update test session
    await prisma.testSession.update({
      where: { id: testSession.id },
      data: {
        score,
        passed,
        completedAt: new Date(),
      },
    })

    // Create result
    const grade =
      score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'

    const result = await prisma.result.create({
      data: {
        testSessionId: testSession.id,
        score,
        totalQuestions: invitation.assessment.questions.length,
        correctAnswers,
        wrongAnswers,
        skippedQuestions,
        totalPoints,
        pointsEarned,
        passed,
        grade,
        feedback: passed
          ? 'Congratulations! You passed the assessment.'
          : 'Unfortunately, you did not meet the passing score. Keep practicing!',
      },
    })

    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'completed',
        candidateId: candidate.id,
      },
    })

    // Send SMS notifications
    try {
      await sendTestCompletionNotification(
        candidate.name,
        candidate.phone,
        invitation.assessment.title,
        score,
        passed
      )

      if (invitation.assessment.user.phone) {
        await sendRecruiterNotification(
          invitation.assessment.user.phone,
          candidate.name,
          invitation.assessment.title,
          score,
          passed
        )
      }
    } catch (smsError) {
      console.error('SMS notification error:', smsError)
      // Don't fail the request if SMS fails
    }

    return NextResponse.json({
      success: true,
      result: {
        score: Math.round(score * 10) / 10,
        passed,
        grade,
        correctAnswers,
        wrongAnswers,
        skippedQuestions,
        totalQuestions: invitation.assessment.questions.length,
      },
      testSessionId: testSession.id,
    })
  } catch (error: any) {
    console.error('Submit Test Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit test' },
      { status: 500 }
    )
  }
}
