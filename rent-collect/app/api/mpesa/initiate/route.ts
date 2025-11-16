import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { initiateSTKPush } from '@/lib/mpesa'

// POST - Initiate M-Pesa payment (STK Push)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tenantId, amount, phoneNumber, month } = body

    if (!tenantId || !amount || !phoneNumber || !month) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify tenant belongs to user's property
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        unit: {
          property: {
            userId,
          },
        },
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Initiate STK Push
    const accountRef = `${tenant.unit.property.name}-${tenant.unit.unitNumber}-${month}`
    const description = `Rent payment for ${tenant.unit.property.name} Unit ${tenant.unit.unitNumber}`

    const result = await initiateSTKPush(
      phoneNumber,
      parseFloat(amount),
      accountRef,
      description
    )

    if (result.ResponseCode === '0') {
      // Success - STK push sent to customer's phone
      // Store the checkout request ID for later verification
      // You might want to create a pending payment record here

      return NextResponse.json({
        message:
          'Payment request sent to phone. Please check your phone and enter M-Pesa PIN.',
        checkoutRequestId: result.CheckoutRequestID,
        merchantRequestId: result.MerchantRequestID,
      })
    } else {
      return NextResponse.json(
        { error: result.ResponseDescription || 'M-Pesa request failed' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('M-Pesa Initiate Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initiate M-Pesa payment' },
      { status: 500 }
    )
  }
}
