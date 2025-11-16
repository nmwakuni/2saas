import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { initiateSTKPush } from '@/lib/mpesa'

// POST - Initiate M-Pesa payment
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { appointmentId, phoneNumber, amount } = body

    if (!appointmentId || !phoneNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify appointment belongs to user
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        userId,
      },
      include: {
        customer: true,
        service: true,
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Initiate STK Push
    const response = await initiateSTKPush(
      phoneNumber,
      amount,
      `APPT-${appointment.id.substring(0, 8)}`,
      `Payment for ${appointment.service.name}`
    )

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        paymentMethod: 'mpesa',
        transactionRef: response.CheckoutRequestID,
        status: 'pending',
        appointmentId: appointment.id,
      },
    })

    return NextResponse.json({
      success: true,
      checkoutRequestID: response.CheckoutRequestID,
      customerMessage: response.CustomerMessage,
      paymentId: payment.id,
    })
  } catch (error: any) {
    console.error('M-Pesa Initiate Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}
