'use client'

import { useState, useEffect } from 'react'

interface Availability {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    dayOfWeek: '1',
    startTime: '09:00',
    endTime: '17:00',
  })

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
    try {
      const res = await fetch('/api/availability')
      const data = await res.json()
      setAvailability(data)
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowForm(false)
        setFormData({
          dayOfWeek: '1',
          startTime: '09:00',
          endTime: '17:00',
        })
        fetchAvailability()
        alert('Availability added!')
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving availability:', error)
      alert('Failed to save availability')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time slot?')) return

    try {
      const res = await fetch(`/api/availability/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchAvailability()
        alert('Time slot deleted!')
      } else {
        alert('Failed to delete time slot')
      }
    } catch (error) {
      console.error('Error deleting availability:', error)
      alert('Failed to delete time slot')
    }
  }

  const toggleActive = async (slot: Availability) => {
    try {
      const res = await fetch(`/api/availability/${slot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slot.isActive }),
      })

      if (res.ok) {
        fetchAvailability()
      }
    } catch (error) {
      console.error('Error toggling availability:', error)
    }
  }

  const getAvailabilityForDay = (dayOfWeek: number) => {
    return availability
      .filter((slot) => slot.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading availability...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Availability</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set your weekly schedule for accepting appointments
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showForm ? '✕ Cancel' : '+ Add Time Slot'}
        </button>
      </div>

      {/* Add Time Slot Form */}
      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Add New Time Slot
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Day of Week
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, dayOfWeek: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                >
                  {DAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
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
                Add Time Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {DAYS.map((day) => {
          const daySlots = getAvailabilityForDay(day.value)
          return (
            <div
              key={day.value}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {day.label}
                </h3>
                <span className="text-sm text-gray-500">
                  {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                </span>
              </div>

              {daySlots.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-500">No availability set</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between rounded-lg border ${
                        slot.isActive
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      } p-3`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleActive(slot)}
                          className={`flex h-5 w-5 items-center justify-center rounded ${
                            slot.isActive
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-300 text-gray-500'
                          }`}
                        >
                          {slot.isActive && '✓'}
                        </button>
                        <div>
                          <p className="font-medium text-gray-900">
                            {slot.startTime} - {slot.endTime}
                          </p>
                          <p className="text-xs text-gray-500">
                            {slot.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-blue-900">Tips for Setting Availability</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>• Add multiple time slots per day if you have breaks</li>
              <li>• Toggle slots on/off for temporary changes (e.g., holidays)</li>
              <li>• Appointments will only be available during active time slots</li>
              <li>• Don't forget to account for service duration and buffer time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
