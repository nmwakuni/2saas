'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

interface Appointment {
  id: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: string
  notes?: string
  service: Service
  customer: Customer
  payments: Array<{
    id: string
    amount: number
    status: string
    paymentMethod: string
  }>
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  // Form state
  const [formData, setFormData] = useState({
    serviceId: '',
    customerId: '',
    appointmentDate: '',
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
    // New customer fields
    newCustomerName: '',
    newCustomerEmail: '',
    newCustomerPhone: '',
  })
  const [isNewCustomer, setIsNewCustomer] = useState(false)

  useEffect(() => {
    fetchAppointments()
    fetchServices()
    fetchCustomers()
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

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      const data = await res.json()
      setServices(data)
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      const data = await res.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = isNewCustomer
        ? {
            serviceId: formData.serviceId,
            appointmentDate: formData.appointmentDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            notes: formData.notes,
            name: formData.newCustomerName,
            email: formData.newCustomerEmail,
            phone: formData.newCustomerPhone,
          }
        : {
            serviceId: formData.serviceId,
            customerId: formData.customerId,
            appointmentDate: formData.appointmentDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            notes: formData.notes,
          }

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setShowForm(false)
        setFormData({
          serviceId: '',
          customerId: '',
          appointmentDate: '',
          startTime: '09:00',
          endTime: '10:00',
          notes: '',
          newCustomerName: '',
          newCustomerEmail: '',
          newCustomerPhone: '',
        })
        setIsNewCustomer(false)
        fetchAppointments()
        alert('Appointment created successfully! SMS confirmation sent.')
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Failed to create appointment')
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        fetchAppointments()
        if (status === 'cancelled') {
          alert('Appointment cancelled. SMS notification sent.')
        }
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchAppointments()
        alert('Appointment deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      alert('Failed to delete appointment')
    }
  }

  const handleInitiatePayment = async (appointment: Appointment) => {
    const phoneNumber = prompt(
      `Enter phone number for M-Pesa payment (default: ${appointment.customer.phone})`,
      appointment.customer.phone
    )

    if (!phoneNumber) return

    try {
      const res = await fetch('/api/mpesa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          phoneNumber,
          amount: appointment.service.price,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(
          `M-Pesa STK Push sent! ${data.customerMessage}\n\nCheckout ID: ${data.checkoutRequestID}`
        )
        fetchAppointments()
      } else {
        alert(`Payment error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error initiating payment:', error)
      alert('Failed to initiate payment')
    }
  }

  const handleServiceChange = (serviceId: string) => {
    setFormData({ ...formData, serviceId })
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      // Auto-calculate end time based on service duration
      const [hours, minutes] = formData.startTime.split(':')
      const startMinutes = parseInt(hours) * 60 + parseInt(minutes)
      const endMinutes = startMinutes + service.duration
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
      setFormData((prev) => ({ ...prev, serviceId, endTime }))
    }
  }

  const filteredAppointments = appointments.filter((apt) =>
    filterStatus === 'all' ? true : apt.status === filterStatus
  )

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading appointments...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all your appointments
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showForm ? '✕ Cancel' : '+ New Appointment'}
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Create Appointment Form */}
      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Create New Appointment
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Service Selection */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Service *
                </label>
                <select
                  required
                  value={formData.serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - KES {service.price} ({service.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Selection */}
              <div className="md:col-span-2">
                <div className="mb-2 flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Customer *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNewCustomer(!isNewCustomer)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {isNewCustomer ? 'Select existing customer' : '+ New customer'}
                  </button>
                </div>

                {isNewCustomer ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <input
                      type="text"
                      required
                      placeholder="Customer Name"
                      value={formData.newCustomerName}
                      onChange={(e) =>
                        setFormData({ ...formData, newCustomerName: e.target.value })
                      }
                      className="rounded-lg border border-gray-300 px-4 py-2"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={formData.newCustomerEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, newCustomerEmail: e.target.value })
                      }
                      className="rounded-lg border border-gray-300 px-4 py-2"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone (0712345678)"
                      value={formData.newCustomerPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, newCustomerPhone: e.target.value })
                      }
                      className="rounded-lg border border-gray-300 px-4 py-2"
                    />
                  </div>
                ) : (
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) =>
                      setFormData({ ...formData, customerId: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Appointment Date */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.appointmentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, appointmentDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => {
                    const startTime = e.target.value
                    setFormData({ ...formData, startTime })
                    // Recalculate end time if service is selected
                    const service = services.find((s) => s.id === formData.serviceId)
                    if (service) {
                      const [hours, minutes] = startTime.split(':')
                      const startMinutes = parseInt(hours) * 60 + parseInt(minutes)
                      const endMinutes = startMinutes + service.duration
                      const endHours = Math.floor(endMinutes / 60)
                      const endMins = endMinutes % 60
                      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
                      setFormData((prev) => ({ ...prev, endTime }))
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  placeholder="Any special requirements or notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Create Appointment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="text-gray-500">
            No {filterStatus !== 'all' && filterStatus} appointments found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {appointment.service.name}
                    </h3>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        STATUS_COLORS[
                          appointment.status as keyof typeof STATUS_COLORS
                        ]
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
                    <div>
                      <span className="font-medium">Customer:</span>{' '}
                      {appointment.customer.name}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{' '}
                      {appointment.customer.phone}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{' '}
                      {format(parseISO(appointment.appointmentDate), 'PPP')}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span>{' '}
                      {appointment.startTime} - {appointment.endTime}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span> KES{' '}
                      {appointment.service.price}
                    </div>
                    <div>
                      <span className="font-medium">Payment:</span>{' '}
                      {appointment.payments.length > 0
                        ? `${appointment.payments[0].status} (${appointment.payments[0].paymentMethod})`
                        : 'Not paid'}
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-3 rounded bg-gray-50 p-3 text-sm text-gray-600">
                      <span className="font-medium">Notes:</span>{' '}
                      {appointment.notes}
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  {appointment.status === 'pending' && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(appointment.id, 'confirmed')
                      }
                      className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                    >
                      Confirm
                    </button>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(appointment.id, 'completed')
                      }
                      className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      Complete
                    </button>
                  )}
                  {(appointment.status === 'pending' ||
                    appointment.status === 'confirmed') && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateStatus(appointment.id, 'cancelled')
                        }
                        className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                      >
                        Cancel
                      </button>
                      {appointment.payments.length === 0 && (
                        <button
                          onClick={() => handleInitiatePayment(appointment)}
                          className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                        >
                          Pay (M-Pesa)
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(appointment.id)}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
