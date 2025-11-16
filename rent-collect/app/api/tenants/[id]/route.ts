import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET single tenant
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

    const tenant = await prisma.tenant.findFirst({
      where: {
        id,
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
        },
        reminders: {
          orderBy: {
            sentAt: 'desc',
          },
          take: 10,
        },
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error('Error fetching tenant:', error)
    return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 })
  }
}

// PATCH - Update tenant
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
    const {
      name,
      phone,
      email,
      idNumber,
      moveOutDate,
      depositAmount,
      rentDueDay,
      status,
    } = body

    // Verify tenant belongs to user's property
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        id,
        unit: {
          property: {
            userId,
          },
        },
      },
      include: {
        unit: true,
      },
    })

    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email !== undefined && { email }),
        ...(idNumber !== undefined && { idNumber }),
        ...(moveOutDate && { moveOutDate: new Date(moveOutDate) }),
        ...(depositAmount !== undefined && { depositAmount: parseFloat(depositAmount) }),
        ...(rentDueDay !== undefined && { rentDueDay: parseInt(rentDueDay) }),
        ...(status && { status }),
      },
    })

    // If tenant moved out, update unit status
    if (status === 'moved_out') {
      await prisma.unit.update({
        where: { id: existingTenant.unitId },
        data: { status: 'vacant' },
      })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 })
  }
}

// DELETE tenant
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

    // Verify tenant belongs to user's property
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        id,
        unit: {
          property: {
            userId,
          },
        },
      },
      include: {
        unit: true,
      },
    })

    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Delete tenant
    await prisma.tenant.delete({
      where: { id },
    })

    // Update unit status to vacant
    await prisma.unit.update({
      where: { id: existingTenant.unitId },
      data: { status: 'vacant' },
    })

    return NextResponse.json({ message: 'Tenant deleted successfully' })
  } catch (error) {
    console.error('Error deleting tenant:', error)
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 })
  }
}
