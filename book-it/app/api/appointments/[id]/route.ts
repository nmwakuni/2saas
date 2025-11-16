import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sendCancellationNotification } from '@/lib/sms'

// GET - Get single appointment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        customer: true,
        service: true,
        payments: true,
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(appointment)
  } catch (error: any) {
    console.error('Get Appointment Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch appointment' },
      { status: 500 }
    )
  }
}

// PATCH - Update appointment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify appointment belongs to user
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        customer: true,
        service: true,
        user: true,
      },
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status, notes, appointmentDate, startTime, endTime } = body

    // Send cancellation SMS if status changed to cancelled
    if (status === 'cancelled' && existingAppointment.status !== 'cancelled') {
      try {
        await sendCancellationNotification(
          existingAppointment.customer.name,
          existingAppointment.customer.phone,
          existingAppointment.service.name,
          existingAppointment.appointmentDate,
          existingAppointment.startTime,
          existingAppointment.user.businessName
        )
      } catch (smsError) {
        console.error('SMS Error:', smsError)
      }
    }

    const appointment = await prisma.appointment.update({
      where: {
        id: params.id,
      },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(appointmentDate && { appointmentDate: new Date(appointmentDate) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
      },
      include: {
        customer: true,
        service: true,
      },
    })

    return NextResponse.json(appointment)
  } catch (error: any) {
    console.error('Update Appointment Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

// DELETE - Delete appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify appointment belongs to user
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    await prisma.appointment.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Appointment deleted successfully' })
  } catch (error: any) {
    console.error('Delete Appointment Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}
