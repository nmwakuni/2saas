import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - Get all customers (who have appointments with this user)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customers who have appointments with this user
    const customers = await prisma.customer.findMany({
      where: {
        appointments: {
          some: {
            userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(customers)
  } catch (error: any) {
    console.error('Get Customers Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

// POST - Create or find a customer
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, notes } = body

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        email,
        phone,
      },
    })

    if (existingCustomer) {
      // Update customer if needed
      const customer = await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          name,
          notes,
        },
      })
      return NextResponse.json(customer)
    }

    // Create new customer
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        notes,
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    console.error('Create Customer Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: 500 }
    )
  }
}
