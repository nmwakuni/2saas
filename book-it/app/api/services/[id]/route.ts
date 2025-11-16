import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - Get single service
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error: any) {
    console.error('Get Service Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

// PATCH - Update service
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify service belongs to user
    const existingService = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, duration, price, category, bufferTime, isActive } = body

    const service = await prisma.service.update({
      where: {
        id: params.id,
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(duration && { duration: parseInt(duration) }),
        ...(price && { price: parseFloat(price) }),
        ...(category && { category }),
        ...(bufferTime !== undefined && { bufferTime: parseInt(bufferTime) }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(service)
  } catch (error: any) {
    console.error('Update Service Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update service' },
      { status: 500 }
    )
  }
}

// DELETE - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify service belongs to user
    const existingService = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    await prisma.service.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error: any) {
    console.error('Delete Service Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete service' },
      { status: 500 }
    )
  }
}
