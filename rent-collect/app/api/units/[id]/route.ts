import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET single unit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const unit = await prisma.unit.findFirst({
      where: {
        id,
        property: {
          userId,
        },
      },
      include: {
        property: true,
        tenants: true,
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
          take: 10,
        },
      },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    return NextResponse.json(unit)
  } catch (error) {
    console.error('Error fetching unit:', error)
    return NextResponse.json({ error: 'Failed to fetch unit' }, { status: 500 })
  }
}

// PATCH - Update unit
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { unitNumber, rentAmount, status } = body

    // Verify unit belongs to user's property
    const existingUnit = await prisma.unit.findFirst({
      where: {
        id,
        property: {
          userId,
        },
      },
    })

    if (!existingUnit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        ...(unitNumber && { unitNumber }),
        ...(rentAmount !== undefined && { rentAmount }),
        ...(status && { status }),
      },
    })

    return NextResponse.json(unit)
  } catch (error) {
    console.error('Error updating unit:', error)
    return NextResponse.json({ error: 'Failed to update unit' }, { status: 500 })
  }
}

// DELETE unit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify unit belongs to user's property
    const existingUnit = await prisma.unit.findFirst({
      where: {
        id,
        property: {
          userId,
        },
      },
    })

    if (!existingUnit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    await prisma.unit.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Unit deleted successfully' })
  } catch (error) {
    console.error('Error deleting unit:', error)
    return NextResponse.json({ error: 'Failed to delete unit' }, { status: 500 })
  }
}
