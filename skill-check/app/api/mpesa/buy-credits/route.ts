import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { initiateSTKPush } from '@/lib/mpesa'

// POST - Buy credits with M-Pesa
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

    const { phoneNumber, credits, planUpgrade } = await request.json()

    // Calculate amount
    const CREDIT_PRICE = 25 // KES 25 per credit
    const amount = credits * CREDIT_PRICE

    // Initiate M-Pesa STK Push
    const response = await initiateSTKPush(
      phoneNumber,
      amount,
      `CREDITS-${user.id.substring(0, 8)}`,
      `Purchase ${credits} assessment credits`
    )

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount,
        currency: 'KES',
        paymentMethod: 'mpesa',
        transactionRef: response.CheckoutRequestID,
        status: 'pending',
        description: `Purchase ${credits} assessment credits`,
        creditsAdded: credits,
        planUpgrade,
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      checkoutRequestID: response.CheckoutRequestID,
      customerMessage: response.CustomerMessage,
      paymentId: payment.id,
    })
  } catch (error: any) {
    console.error('Buy Credits Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}
