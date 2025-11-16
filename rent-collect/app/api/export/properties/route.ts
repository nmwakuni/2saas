import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

// GET - Export properties as CSV
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all properties for user
    const properties = await prisma.property.findMany({
      where: {
        userId,
      },
      include: {
        units: {
          include: {
            tenants: {
              where: {
                status: 'active',
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Generate CSV
    const headers = [
      'Property ID',
      'Name',
      'Address',
      'Type',
      'Total Units',
      'Occupied Units',
      'Vacant Units',
      'Occupancy Rate (%)',
      'Active Tenants',
    ]

    const rows = properties.map((property) => {
      const totalUnits = property.units.length
      const occupiedUnits = property.units.filter((u) => u.status === 'occupied').length
      const vacantUnits = totalUnits - occupiedUnits
      const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : '0'
      const activeTenants = property.units.reduce(
        (sum, unit) => sum + unit.tenants.length,
        0
      )

      return [
        property.id,
        property.name,
        property.address,
        property.type,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        occupancyRate,
        activeTenants,
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
        'Content-Disposition': `attachment; filename="properties-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    })
  } catch (error: any) {
    console.error('Export Properties Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export properties' },
      { status: 500 }
    )
  }
}
