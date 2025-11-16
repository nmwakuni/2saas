import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

// GET - Export units as CSV
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all units for user's properties
    const units = await prisma.unit.findMany({
      where: {
        property: {
          userId,
        },
      },
      include: {
        property: true,
        tenants: {
          where: {
            status: 'active',
          },
        },
      },
      orderBy: [
        {
          property: {
            name: 'asc',
          },
        },
        {
          unitNumber: 'asc',
        },
      ],
    })

    // Generate CSV
    const headers = [
      'Unit ID',
      'Property',
      'Unit Number',
      'Rent Amount (KES)',
      'Status',
      'Current Tenant',
      'Tenant Phone',
    ]

    const rows = units.map((unit) => {
      const tenant = unit.tenants[0] // Get first active tenant
      return [
        unit.id,
        unit.property.name,
        unit.unitNumber,
        parseFloat(unit.rentAmount.toString()).toFixed(2),
        unit.status,
        tenant ? tenant.name : 'N/A',
        tenant ? tenant.phone : 'N/A',
      ]
    })

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
        'Content-Disposition': `attachment; filename="units-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    })
  } catch (error: any) {
    console.error('Export Units Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export units' },
      { status: 500 }
    )
  }
}
