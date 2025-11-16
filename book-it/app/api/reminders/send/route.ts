import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAppointmentReminder } from '@/lib/sms'
import { addHours, isBefore, isAfter, subHours } from 'date-fns'

// POST - Send appointment reminders (called by cron job)
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const reminderWindow = addHours(now, 24) // Send reminders for appointments in next 24 hours

    // Get confirmed appointments in the next 24 hours that haven't been reminded
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        status: 'confirmed',
        appointmentDate: {
          gte: now,
          lte: reminderWindow,
        },
      },
      include: {
        customer: true,
        service: true,
        user: true,
        notifications: {
          where: {
            type: 'reminder',
            createdAt: {
              gte: subHours(now, 25), // Check if reminder was sent in last 25 hours
            },
          },
        },
      },
    })

    let sentCount = 0
    let errorCount = 0
    const results = []

    for (const appointment of upcomingAppointments) {
      // Skip if reminder already sent recently
      if (appointment.notifications.length > 0) {
        continue
      }

      try {
        // Combine appointment date with start time
        const [hours, minutes] = appointment.startTime.split(':')
        const appointmentDateTime = new Date(appointment.appointmentDate)
        appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

        // Send SMS reminder
        await sendAppointmentReminder(
          appointment.customer.name,
          appointment.customer.phone,
          appointment.service.name,
          appointmentDateTime,
          appointment.user.businessName || 'Book It'
        )

        // Create notification record
        await prisma.notification.create({
          data: {
            type: 'reminder',
            channel: 'sms',
            recipient: appointment.customer.phone,
            content: `Reminder: You have an appointment for ${appointment.service.name} tomorrow at ${appointment.startTime}`,
            status: 'sent',
            appointmentId: appointment.id,
          },
        })

        sentCount++
        results.push({
          appointmentId: appointment.id,
          customer: appointment.customer.name,
          status: 'sent',
        })
      } catch (error: any) {
        console.error(
          `Failed to send reminder for appointment ${appointment.id}:`,
          error
        )
        errorCount++
        results.push({
          appointmentId: appointment.id,
          customer: appointment.customer.name,
          status: 'failed',
          error: error.message,
        })

        // Create failed notification record
        await prisma.notification.create({
          data: {
            type: 'reminder',
            channel: 'sms',
            recipient: appointment.customer.phone,
            content: `Reminder failed`,
            status: 'failed',
            appointmentId: appointment.id,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} reminders, ${errorCount} failed`,
      totalProcessed: upcomingAppointments.length,
      sent: sentCount,
      failed: errorCount,
      results,
    })
  } catch (error: any) {
    console.error('Send Reminders Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send reminders' },
      { status: 500 }
    )
  }
}

// GET - Test endpoint to check upcoming appointments
export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const reminderWindow = addHours(now, 24)

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        status: 'confirmed',
        appointmentDate: {
          gte: now,
          lte: reminderWindow,
        },
      },
      include: {
        customer: true,
        service: true,
        notifications: {
          where: {
            type: 'reminder',
          },
        },
      },
    })

    return NextResponse.json({
      count: upcomingAppointments.length,
      appointments: upcomingAppointments.map((apt) => ({
        id: apt.id,
        customer: apt.customer.name,
        service: apt.service.name,
        date: apt.appointmentDate,
        time: apt.startTime,
        remindersSent: apt.notifications.length,
      })),
    })
  } catch (error: any) {
    console.error('Check Reminders Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check reminders' },
      { status: 500 }
    )
  }
}
