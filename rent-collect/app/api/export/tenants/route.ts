import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

// GET - Export tenants as CSV
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all tenants for user's properties
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
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Generate CSV
    const headers = [
      'Tenant ID',
      'Name',
      'Phone',
      'Email',
      'Property',
      'Unit',
      'Rent Amount (KES)',
      'Move-in Date',
      'Deposit (KES)',
      'Rent Due Day',
      'Status',
    ]

    const rows = tenants.map((tenant) => [
      tenant.id,
      tenant.name,
      tenant.phone,
      tenant.email || '',
      tenant.unit.property.name,
      tenant.unit.unitNumber,
      parseFloat(tenant.unit.rentAmount.toString()).toFixed(2),
      format(new Date(tenant.moveInDate), 'yyyy-MM-dd'),
      parseFloat(tenant.depositAmount.toString()).toFixed(2),
      tenant.rentDueDay,
      tenant.status,
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
        'Content-Disposition': `attachment; filename="tenants-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    })
  } catch (error: any) {
    console.error('Export Tenants Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export tenants' },
      { status: 500 }
    )
  }
}
