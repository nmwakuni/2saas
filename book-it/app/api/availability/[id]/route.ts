import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// DELETE - Delete availability slot
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify availability belongs to user
    const existingAvailability = await prisma.availability.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!existingAvailability) {
      return NextResponse.json(
        { error: 'Availability not found' },
        { status: 404 }
      )
    }

    await prisma.availability.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Availability deleted successfully' })
  } catch (error: any) {
    console.error('Delete Availability Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete availability' },
      { status: 500 }
    )
  }
}

// PATCH - Update availability slot
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify availability belongs to user
    const existingAvailability = await prisma.availability.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!existingAvailability) {
      return NextResponse.json(
        { error: 'Availability not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { isActive } = body

    const availability = await prisma.availability.update({
      where: {
        id: params.id,
      },
      data: {
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(availability)
  } catch (error: any) {
    console.error('Update Availability Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update availability' },
      { status: 500 }
    )
  }
}
