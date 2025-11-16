import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get revenue by month (last 6 months)
    const monthsData = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const startDate = startOfMonth(date)
      const endDate = endOfMonth(date)

      const payments = await prisma.payment.findMany({
        where: {
          appointment: {
            userId,
          },
          status: 'completed',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      const revenue = payments.reduce(
        (sum, p) => sum + parseFloat(p.amount.toString()),
        0
      )

      monthsData.push({
        month: format(date, 'MMM yyyy'),
        revenue: Math.round(revenue),
        bookings: payments.length,
      })
    }

    // Get popular services (top 5 by booking count)
    const servicesData = await prisma.service.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
        appointments: {
          where: {
            status: {
              in: ['confirmed', 'completed'],
            },
          },
          include: {
            payments: {
              where: {
                status: 'completed',
              },
            },
          },
        },
      },
      orderBy: {
        appointments: {
          _count: 'desc',
        },
      },
      take: 5,
    })

    const popularServices = servicesData.map((service) => {
      const totalRevenue = service.appointments.reduce((sum, apt) => {
        const aptRevenue = apt.payments.reduce(
          (pSum, p) => pSum + parseFloat(p.amount.toString()),
          0
        )
        return sum + aptRevenue
      }, 0)

      return {
        name: service.name,
        bookings: service._count.appointments,
        revenue: Math.round(totalRevenue),
      }
    })

    // Get appointment status distribution
    const statusCounts = await prisma.appointment.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true,
      },
    })

    const statusDistribution = statusCounts.map((item) => ({
      status: item.status,
      count: item._count.status,
    }))

    // Get payment method distribution
    const paymentMethods = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        appointment: {
          userId,
        },
        status: 'completed',
      },
      _count: {
        paymentMethod: true,
      },
      _sum: {
        amount: true,
      },
    })

    const paymentMethodData = paymentMethods.map((item) => ({
      method: item.paymentMethod,
      count: item._count.paymentMethod,
      revenue: Math.round(parseFloat(item._sum.amount?.toString() || '0')),
    }))

    // Get overall stats
    const totalAppointments = await prisma.appointment.count({
      where: { userId },
    })

    const totalRevenue = await prisma.payment.aggregate({
      where: {
        appointment: {
          userId,
        },
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
    })

    const totalCustomers = await prisma.customer.count({
      where: {
        appointments: {
          some: {
            userId,
          },
        },
      },
    })

    const totalServices = await prisma.service.count({
      where: { userId },
    })

    // Get current month stats
    const currentMonthStart = startOfMonth(new Date())
    const currentMonthAppointments = await prisma.appointment.count({
      where: {
        userId,
        createdAt: {
          gte: currentMonthStart,
        },
      },
    })

    const currentMonthRevenue = await prisma.payment.aggregate({
      where: {
        appointment: {
          userId,
        },
        status: 'completed',
        createdAt: {
          gte: currentMonthStart,
        },
      },
      _sum: {
        amount: true,
      },
    })

    return NextResponse.json({
      overview: {
        totalAppointments,
        totalRevenue: Math.round(
          parseFloat(totalRevenue._sum.amount?.toString() || '0')
        ),
        totalCustomers,
        totalServices,
        monthlyAppointments: currentMonthAppointments,
        monthlyRevenue: Math.round(
          parseFloat(currentMonthRevenue._sum.amount?.toString() || '0')
        ),
      },
      revenueByMonth: monthsData,
      popularServices,
      statusDistribution,
      paymentMethodData,
    })
  } catch (error: any) {
    console.error('Analytics Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
