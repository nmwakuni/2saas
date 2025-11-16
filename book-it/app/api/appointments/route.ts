import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sendAppointmentConfirmation } from '@/lib/sms'

// GET - Get all appointments for user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const where: any = { userId }

    if (status) {
      where.status = status
    }

    if (from || to) {
      where.appointmentDate = {}
      if (from) {
        where.appointmentDate.gte = new Date(from)
      }
      if (to) {
        where.appointmentDate.lte = new Date(to)
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        service: true,
      },
      orderBy: {
        appointmentDate: 'desc',
      },
    })

    return NextResponse.json(appointments)
  } catch (error: any) {
    console.error('Get Appointments Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

// POST - Create a new appointment
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      serviceId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      appointmentDate,
      startTime,
      endTime,
      notes,
    } = body

    if (!serviceId || !appointmentDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify service belongs to user
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId,
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Get or create user profile
    let user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get or create customer
    let customer
    if (customerId) {
      customer = await prisma.customer.findUnique({
        where: { id: customerId },
      })
    } else if (customerName && customerEmail && customerPhone) {
      // Check if customer exists
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          email: customerEmail,
          phone: customerPhone,
        },
      })

      if (existingCustomer) {
        customer = existingCustomer
      } else {
        customer = await prisma.customer.create({
          data: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
        })
      }
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer information required' },
        { status: 400 }
      )
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        appointmentDate: new Date(appointmentDate),
        startTime,
        endTime,
        status: 'confirmed',
        notes,
        userId,
        serviceId,
        customerId: customer.id,
      },
      include: {
        customer: true,
        service: true,
      },
    })

    // Send SMS confirmation
    try {
      await sendAppointmentConfirmation(
        customer.name,
        customer.phone,
        service.name,
        new Date(appointmentDate),
        startTime,
        user.businessName
      )
    } catch (smsError) {
      console.error('SMS Error:', smsError)
      // Continue even if SMS fails
    }

    return NextResponse.json(appointment, { status: 201 })
  } catch (error: any) {
    console.error('Create Appointment Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create appointment' },
      { status: 500 }
    )
  }
}
