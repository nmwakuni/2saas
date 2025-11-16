import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

// GET - Export revenue summary as CSV
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get last 12 months revenue data
    const monthsData = []
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const startDate = startOfMonth(date)
      const endDate = endOfMonth(date)

      const payments = await prisma.payment.findMany({
        where: {
          unit: {
            property: {
              userId,
            },
          },
          paymentDate: {
            gte: startDate,
            lte: endDate,
          },
          status: 'confirmed',
        },
      })

      const revenue = payments.reduce(
        (sum, p) => sum + parseFloat(p.amount.toString()),
        0
      )

      const avgPayment = payments.length > 0 ? revenue / payments.length : 0

      // Count by payment method
      const mpesaCount = payments.filter((p) => p.paymentMethod === 'mpesa').length
      const cashCount = payments.filter((p) => p.paymentMethod === 'cash').length
      const bankCount = payments.filter((p) => p.paymentMethod === 'bank').length

      monthsData.push({
        month: format(date, 'yyyy-MM'),
        monthName: format(date, 'MMM yyyy'),
        revenue: revenue.toFixed(2),
        paymentCount: payments.length,
        avgPayment: avgPayment.toFixed(2),
        mpesaCount,
        cashCount,
        bankCount,
      })
    }

    // Generate CSV
    const headers = [
      'Month',
      'Month Name',
      'Total Revenue (KES)',
      'Payment Count',
      'Average Payment (KES)',
      'M-Pesa Payments',
      'Cash Payments',
      'Bank Payments',
    ]

    const rows = monthsData.map((month) => [
      month.month,
      month.monthName,
      month.revenue,
      month.paymentCount,
      month.avgPayment,
      month.mpesaCount,
      month.cashCount,
      month.bankCount,
    ])

    // Add totals row
    const totalRevenue = monthsData.reduce(
      (sum, m) => sum + parseFloat(m.revenue),
      0
    )
    const totalPayments = monthsData.reduce((sum, m) => sum + m.paymentCount, 0)
    const avgPaymentOverall =
      totalPayments > 0 ? totalRevenue / totalPayments : 0

    rows.push([
      'TOTAL',
      '12 Months',
      totalRevenue.toFixed(2),
      totalPayments,
      avgPaymentOverall.toFixed(2),
      monthsData.reduce((sum, m) => sum + m.mpesaCount, 0),
      monthsData.reduce((sum, m) => sum + m.cashCount, 0),
      monthsData.reduce((sum, m) => sum + m.bankCount, 0),
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
        'Content-Disposition': `attachment; filename="revenue-summary-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    })
  } catch (error: any) {
    console.error('Export Revenue Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export revenue summary' },
      { status: 500 }
    )
  }
}
