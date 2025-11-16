'use client'

import { useState, useEffect } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns'

interface Service {
  id: string
  name: string
  price: number
}

interface Customer {
  id: string
  name: string
  phone: string
}

interface Appointment {
  id: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: string
  service: Service
  customer: Customer
}

const STATUS_COLORS = {
  pending: 'bg-yellow-400',
  confirmed: 'bg-green-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-400',
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments')
      const data = await res.json()
      setAppointments(data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) =>
      isSameDay(parseISO(apt.appointmentDate), date)
    )
  }

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50"
          >
            ← Previous
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50"
          >
            Next →
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Today
          </button>
        </div>
      </div>
    )
  }

  const renderDaysOfWeek = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day}
            className="rounded-lg bg-gray-100 p-3 text-center font-semibold text-gray-700"
          >
            {day}
          </div>
        ))}
      </div>
    )
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd')
        const cloneDay = day
        const dayAppointments = getAppointmentsForDate(day)

        days.push(
          <div
            key={day.toString()}
            onClick={() => setSelectedDate(cloneDay)}
            className={`min-h-32 cursor-pointer rounded-lg border-2 p-2 transition-all hover:border-blue-400 ${
              !isSameMonth(day, monthStart)
                ? 'bg-gray-50 text-gray-400'
                : 'bg-white'
            } ${
              isSameDay(day, new Date())
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200'
            } ${
              selectedDate && isSameDay(day, selectedDate)
                ? 'border-blue-500 ring-2 ring-blue-300'
                : ''
            }`}
          >
            <div className="mb-1 text-right font-semibold">{formattedDate}</div>
            <div className="space-y-1">
              {dayAppointments.slice(0, 3).map((apt) => (
                <div
                  key={apt.id}
                  className={`truncate rounded px-1 py-0.5 text-xs text-white ${
                    STATUS_COLORS[apt.status as keyof typeof STATUS_COLORS]
                  }`}
                  title={`${apt.startTime} - ${apt.customer.name} - ${apt.service.name}`}
                >
                  {apt.startTime} {apt.customer.name}
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{dayAppointments.length - 3} more
                </div>
              )}
            </div>
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-2">
          {days}
        </div>
      )
      days = []
    }

    return <div className="space-y-2">{rows}</div>
  }

  const renderSelectedDateDetails = () => {
    if (!selectedDate) {
      return (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-gray-500">
            Click on a date to view appointments
          </p>
        </div>
      )
    }

    const dayAppointments = getAppointmentsForDate(selectedDate)

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <button
            onClick={() => {
              // Navigate to appointments page with pre-filled date
              window.location.href = `/dashboard/appointments?date=${format(
                selectedDate,
                'yyyy-MM-dd'
              )}`
            }}
            className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
          >
            + New Appointment
          </button>
        </div>

        {dayAppointments.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p className="text-gray-500">No appointments scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayAppointments
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((apt) => (
                <div
                  key={apt.id}
                  className={`rounded-lg border-l-4 bg-gray-50 p-4 ${
                    apt.status === 'pending'
                      ? 'border-yellow-400'
                      : apt.status === 'confirmed'
                        ? 'border-green-500'
                        : apt.status === 'completed'
                          ? 'border-blue-500'
                          : 'border-red-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {apt.startTime} - {apt.endTime}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                            STATUS_COLORS[
                              apt.status as keyof typeof STATUS_COLORS
                            ]
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">{apt.service.name}</span>{' '}
                        - {apt.customer.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {apt.customer.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        KES {apt.service.price}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {renderHeader()}

      {/* Legend */}
      <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-yellow-400"></div>
          <span className="text-sm text-gray-600">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-green-500"></div>
          <span className="text-sm text-gray-600">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-500"></div>
          <span className="text-sm text-gray-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-red-400"></div>
          <span className="text-sm text-gray-600">Cancelled</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {renderDaysOfWeek()}
          {renderCells()}
        </div>
      </div>

      {/* Selected Date Details */}
      {renderSelectedDateDetails()}
    </div>
  )
}
