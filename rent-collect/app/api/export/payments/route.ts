import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

// GET - Export payments as CSV
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all payments for user's properties
    const payments = await prisma.payment.findMany({
      where: {
        unit: {
          property: {
            userId,
          },
        },
      },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
          },
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
    })

    // Generate CSV
    const headers = [
      'Payment ID',
      'Date',
      'Month',
      'Tenant Name',
      'Tenant Phone',
      'Property',
      'Unit',
      'Amount (KES)',
      'Payment Method',
      'Transaction Ref',
      'Status',
      'Notes',
    ]

    const rows = payments.map((payment) => [
      payment.id,
      format(new Date(payment.paymentDate), 'yyyy-MM-dd HH:mm:ss'),
      payment.month,
      payment.tenant.name,
      payment.tenant.phone,
      payment.unit.property.name,
      payment.unit.unitNumber,
      parseFloat(payment.amount.toString()).toFixed(2),
      payment.paymentMethod.toUpperCase(),
      payment.transactionRef || '',
      payment.status,
      payment.notes || '',
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
        'Content-Disposition': `attachment; filename="payments-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    })
  } catch (error: any) {
    console.error('Export Payments Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export payments' },
      { status: 500 }
    )
  }
}
