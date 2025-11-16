import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - Get single expense
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const expense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        property: true,
        unit: true,
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error: any) {
    console.error('Get Expense Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch expense' },
      { status: 500 }
    )
  }
}

// PATCH - Update expense
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify expense belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      description,
      amount,
      category,
      expenseDate,
      vendor,
      propertyId,
      unitId,
      status,
      notes,
    } = body

    const expense = await prisma.expense.update({
      where: {
        id: params.id,
      },
      data: {
        ...(description && { description }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(category && { category }),
        ...(expenseDate && { expenseDate: new Date(expenseDate) }),
        ...(vendor !== undefined && { vendor }),
        ...(propertyId !== undefined && { propertyId }),
        ...(unitId !== undefined && { unitId }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        property: true,
        unit: true,
      },
    })

    return NextResponse.json(expense)
  } catch (error: any) {
    console.error('Update Expense Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update expense' },
      { status: 500 }
    )
  }
}

// DELETE - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify expense belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    await prisma.expense.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Expense deleted successfully' })
  } catch (error: any) {
    console.error('Delete Expense Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete expense' },
      { status: 500 }
    )
  }
}
