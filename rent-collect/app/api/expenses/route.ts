import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - Get all expenses for user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    const where: any = { userId }

    if (propertyId) {
      where.propertyId = propertyId
    }

    if (category) {
      where.category = category
    }

    if (status) {
      where.status = status
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        property: true,
        unit: true,
      },
      orderBy: {
        expenseDate: 'desc',
      },
    })

    return NextResponse.json(expenses)
  } catch (error: any) {
    console.error('Get Expenses Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

// POST - Create a new expense
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    if (!description || !amount || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify property belongs to user if propertyId provided
    if (propertyId) {
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          userId,
        },
      })

      if (!property) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        )
      }
    }

    // Verify unit belongs to user if unitId provided
    if (unitId) {
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
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        category,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        vendor,
        propertyId,
        unitId,
        status: status || 'paid',
        notes,
        userId,
      },
      include: {
        property: true,
        unit: true,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error: any) {
    console.error('Create Expense Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create expense' },
      { status: 500 }
    )
  }
}
