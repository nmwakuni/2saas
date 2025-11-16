import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateMPesaCallback } from '@/lib/mpesa'
import { sendPaymentReceipt } from '@/lib/sms'

// POST - M-Pesa callback endpoint
// This endpoint is called by Safaricom when a payment is completed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2))

    // Validate callback
    if (!validateMPesaCallback(body)) {
      return NextResponse.json({ error: 'Invalid callback' }, { status: 400 })
    }

    const { Body } = body
    const { stkCallback } = Body

    if (!stkCallback) {
      return NextResponse.json({ error: 'Missing stkCallback' }, { status: 400 })
    }

    const { ResultCode, ResultDesc, CallbackMetadata } = stkCallback

    // Check if payment was successful
    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata.Item
      const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value
      const mpesaReceiptNumber = metadata.find(
        (item: any) => item.Name === 'MpesaReceiptNumber'
      )?.Value
      const transactionDate = metadata.find(
        (item: any) => item.Name === 'TransactionDate'
      )?.Value
      const phoneNumber = metadata.find(
        (item: any) => item.Name === 'PhoneNumber'
      )?.Value

      // Extract account reference to find the tenant
      // Format: PropertyName-UnitNumber-Month
      // We need to parse this and find the matching tenant

      // For now, log the payment
      console.log('Payment successful:', {
        amount,
        mpesaReceiptNumber,
        transactionDate,
        phoneNumber,
      })

      // TODO: Find tenant by phone number and create payment record
      // This is simplified - in production you'd want better matching logic

      const tenant = await prisma.tenant.findFirst({
        where: {
          phone: {
            contains: phoneNumber.toString().slice(-9), // Last 9 digits
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

      if (tenant) {
        // Create payment record
        const payment = await prisma.payment.create({
          data: {
            tenantId: tenant.id,
            unitId: tenant.unitId,
            amount: parseFloat(amount),
            paymentDate: new Date(),
            paymentMethod: 'mpesa',
            transactionRef: mpesaReceiptNumber,
            month: new Date().toISOString().slice(0, 7), // YYYY-MM format
            status: 'confirmed',
            notes: `Auto-recorded from M-Pesa. Phone: ${phoneNumber}`,
          },
        })

        // Send SMS receipt
        await sendPaymentReceipt(
          tenant.name,
          tenant.phone,
          parseFloat(amount),
          tenant.unit.property.name,
          tenant.unit.unitNumber,
          new Date(),
          mpesaReceiptNumber
        )

        console.log('Payment record created:', payment.id)
      } else {
        console.log('Tenant not found for phone:', phoneNumber)
      }

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: 'Success',
      })
    } else {
      // Payment failed or was cancelled
      console.log('Payment failed:', ResultDesc)

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: 'Acknowledged',
      })
    }
  } catch (error) {
    console.error('M-Pesa Callback Error:', error)

    // Always return success to M-Pesa to avoid retries
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Acknowledged',
    })
  }
}
