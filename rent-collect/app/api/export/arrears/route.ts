import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

// GET - Export arrears as CSV
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    const currentMonth = format(today, 'yyyy-MM')

    // Fetch all active tenants
    const tenants = await prisma.tenant.findMany({
      where: {
        unit: {
          property: {
            userId,
          },
        },
        status: 'active',
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        payments: {
          where: {
            month: currentMonth,
            status: 'confirmed',
          },
        },
      },
    })

    // Filter tenants in arrears
    const tenantsInArrears = tenants.filter((tenant) => {
      const hasPaidThisMonth = tenant.payments.length > 0
      const rentDueDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        tenant.rentDueDay
      )
      return !hasPaidThisMonth && today > rentDueDate
    })

    // Calculate days overdue for each tenant
    const tenantsWithOverdue = tenantsInArrears.map((tenant) => {
      const rentDueDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        tenant.rentDueDay
      )
      const daysOverdue = Math.floor(
        (today.getTime() - rentDueDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      return { ...tenant, daysOverdue }
    })

    // Generate CSV
    const headers = [
      'Tenant ID',
      'Tenant Name',
      'Phone',
      'Email',
      'Property',
      'Unit',
      'Rent Amount (KES)',
      'Due Day',
      'Days Overdue',
      'Month',
    ]

    const rows = tenantsWithOverdue.map((tenant) => [
      tenant.id,
      tenant.name,
      tenant.phone,
      tenant.email || '',
      tenant.unit.property.name,
      tenant.unit.unitNumber,
      parseFloat(tenant.unit.rentAmount.toString()).toFixed(2),
      tenant.rentDueDay,
      tenant.daysOverdue,
      currentMonth,
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="arrears-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    })
  } catch (error: any) {
    console.error('Export Arrears Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export arrears' },
      { status: 500 }
    )
  }
}
