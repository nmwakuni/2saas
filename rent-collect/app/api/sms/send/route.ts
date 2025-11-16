import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sendSMS, sendRentReminder } from '@/lib/sms'

// POST - Send SMS reminder
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tenantId, type, customMessage } = body

    if (!tenantId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, type' },
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

    let result

    if (type === 'rent_reminder') {
      // Calculate next rent due date
      const now = new Date()
      const dueDay = tenant.rentDueDay
      const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay)

      // If due date has passed this month, set for next month
      if (dueDate < now) {
        dueDate.setMonth(dueDate.getMonth() + 1)
      }

      result = await sendRentReminder(
        tenant.name,
        tenant.phone,
        parseFloat(tenant.unit.rentAmount.toString()),
        tenant.unit.property.name,
        tenant.unit.unitNumber,
        dueDate
      )
    } else if (type === 'custom') {
      if (!customMessage) {
        return NextResponse.json(
          { error: 'Custom message is required' },
          { status: 400 }
        )
      }
      result = await sendSMS(tenant.phone, customMessage)
    } else {
      return NextResponse.json({ error: 'Invalid SMS type' }, { status: 400 })
    }

    // Log the reminder in database
    await prisma.reminder.create({
      data: {
        tenantId: tenant.id,
        type,
        message: customMessage || `Rent reminder for ${tenant.unit.property.name}`,
        status: result.success ? 'sent' : 'failed',
        errorMessage: result.error,
      },
    })

    if (result.success) {
      return NextResponse.json({
        message: 'SMS sent successfully',
        messageId: result.messageId,
      })
    } else {
      return NextResponse.json(
        { error: result.message, details: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}
