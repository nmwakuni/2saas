import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET all tenants for the logged-in user
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenants = await prisma.tenant.findMany({
      where: {
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
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(tenants)
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 })
  }
}

// POST - Create a new tenant
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      unitId,
      name,
      phone,
      email,
      idNumber,
      moveInDate,
      depositAmount,
      rentDueDay,
    } = body

    if (!unitId || !name || !phone || !moveInDate || !depositAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify unit belongs to user's property
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        property: {
          userId,
        },
      },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    // Create tenant and update unit status
    const tenant = await prisma.tenant.create({
      data: {
        unitId,
        name,
        phone,
        email,
        idNumber,
        moveInDate: new Date(moveInDate),
        depositAmount: parseFloat(depositAmount),
        rentDueDay: parseInt(rentDueDay) || 1,
        status: 'active',
      },
    })

    // Update unit status to occupied
    await prisma.unit.update({
      where: { id: unitId },
      data: { status: 'occupied' },
    })

    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 })
  }
}
