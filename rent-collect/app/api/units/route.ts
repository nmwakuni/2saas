import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// POST - Create a new unit
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { propertyId, unitNumber, rentAmount } = body

    if (!propertyId || !unitNumber || !rentAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId,
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Check if unit number already exists for this property
    const existingUnit = await prisma.unit.findFirst({
      where: {
        propertyId,
        unitNumber,
      },
    })

    if (existingUnit) {
      return NextResponse.json(
        { error: 'Unit number already exists for this property' },
        { status: 400 }
      )
    }

    const unit = await prisma.unit.create({
      data: {
        propertyId,
        unitNumber,
        rentAmount,
        status: 'vacant',
      },
    })

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
  }
}
