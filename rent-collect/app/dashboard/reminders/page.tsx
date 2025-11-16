'use client'

import { useEffect, useState } from 'react'

type Tenant = {
  id: string
  name: string
  phone: string
  unit: {
    id: string
    unitNumber: string
    rentAmount: number
    property: {
      name: string
    }
  }
}

type Reminder = {
  id: string
  type: string
  message: string
  sentAt: string
  status: string
  tenant: {
    name: string
  }
}

export default function RemindersPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    tenantId: '',
    type: 'rent_reminder',
    customMessage: '',
  })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchTenants()
    fetchReminders()
  }, [])

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants')
      if (res.ok) {
        const data = await res.json()
        // Only active tenants
        const activeTenants = data.filter(
          (t: any) => t.status === 'active' && t.unit
        )
        setTenants(activeTenants)
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReminders = async () => {
    try {
      // We'll need to create an API route for this
      // For now, we can fetch from tenants and get their reminders
      const res = await fetch('/api/tenants')
      if (res.ok) {
        const data = await res.json()
        const allReminders: Reminder[] = []
        data.forEach((tenant: any) => {
          if (tenant.reminders) {
            tenant.reminders.forEach((reminder: any) => {
              allReminders.push({
                ...reminder,
                tenant: { name: tenant.name },
              })
            })
          }
        })
        // Sort by most recent
        allReminders.sort(
          (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        )
        setReminders(allReminders)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    }
  }

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert('SMS sent successfully!')
        setFormData({
          tenantId: '',
          type: 'rent_reminder',
          customMessage: '',
        })
        setShowForm(false)
        fetchReminders()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to send SMS')
      }
    } catch (error) {
      console.error('Error sending SMS:', error)
      alert('Failed to send SMS')
    } finally {
      setSending(false)
    }
  }

  const handleSendBulk = async () => {
    if (
      !confirm(
        `Send rent reminders to all ${tenants.length} active tenants? This will use SMS credits.`
      )
    )
      return

    setSending(true)
    let successCount = 0
    let failCount = 0

    for (const tenant of tenants) {
      try {
        const res = await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: tenant.id,
            type: 'rent_reminder',
          }),
        })

        if (res.ok) {
          successCount++
        } else {
          failCount++
        }
      } catch (error) {
        failCount++
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    alert(
      `Bulk SMS complete!\nSuccess: ${successCount}\nFailed: ${failCount}`
    )
    setSending(false)
    fetchReminders()
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">SMS Reminders</h2>
          <p className="mt-1 text-gray-600">
            Send rent reminders to your tenants
          </p>
        </div>
        <div className="flex gap-2">
          {tenants.length > 0 && (
            <button
              onClick={handleSendBulk}
              disabled={sending}
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
            >
              {sending ? 'Sending...' : 'Send to All Tenants'}
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            {showForm ? 'Cancel' : '+ Send SMS'}
          </button>
        </div>
      </div>

      {/* Send SMS Form */}
      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Send SMS Reminder
          </h3>

          {tenants.length === 0 ? (
            <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
              <p className="font-medium">No active tenants</p>
              <p className="text-sm mt-1">
                Please add tenants first before sending SMS reminders.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendSMS} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Tenant *
                </label>
                <select
                  required
                  value={formData.tenantId}
                  onChange={(e) =>
                    setFormData({ ...formData, tenantId: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select a tenant --</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} - {tenant.unit.property.name} Unit{' '}
                      {tenant.unit.unitNumber} ({tenant.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="rent_reminder">Rent Reminder</option>
                  <option value="custom">Custom Message</option>
                </select>
              </div>

              {formData.type === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Custom Message *
                  </label>
                  <textarea
                    required
                    value={formData.customMessage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customMessage: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                    rows={4}
                    maxLength={160}
                    placeholder="Enter your message (max 160 characters)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.customMessage.length}/160 characters
                  </p>
                </div>
              )}

              {formData.type === 'rent_reminder' && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Preview:</strong> The tenant will receive an
                    automated rent reminder message with their rent amount, due
                    date, property name, and unit number.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {sending ? 'Sending SMS...' : 'Send SMS'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* SMS History */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">SMS History</h3>

        {reminders.length === 0 ? (
          <p className="text-center py-8 text-gray-600">
            No SMS reminders sent yet
          </p>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {reminder.tenant.name}
                      </p>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          reminder.status === 'sent'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {reminder.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Type:{' '}
                      <span className="capitalize">
                        {reminder.type.replace('_', ' ')}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {reminder.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(reminder.sentAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <h4 className="font-semibold text-blue-900">💡 Tips for SMS Reminders</h4>
        <ul className="mt-2 space-y-1 text-sm text-blue-800">
          <li>• Send reminders 5-7 days before rent is due</li>
          <li>• Keep messages professional and polite</li>
          <li>• Include payment details (amount, due date, property)</li>
          <li>• Use bulk sending at the start of each month</li>
          <li>
            • Make sure your Africa's Talking account has SMS credits
          </li>
        </ul>
      </div>
    </div>
  )
}
