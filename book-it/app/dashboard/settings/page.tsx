'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [reminderStats, setReminderStats] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)

  const checkUpcomingReminders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/reminders/send')
      const data = await res.json()
      setReminderStats(data)
    } catch (error) {
      console.error('Error checking reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendTestReminder = async () => {
    if (
      !confirm(
        'This will send SMS reminders to all customers with appointments in the next 24 hours. Continue?'
      )
    ) {
      return
    }

    try {
      setLoading(true)
      const cronSecret = prompt('Enter CRON_SECRET (from environment variables):')
      if (!cronSecret) return

      const res = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cronSecret}`,
        },
      })

      const data = await res.json()
      setTestResult(data)
      alert(
        data.success
          ? `Success! Sent ${data.sent} reminders, ${data.failed} failed`
          : `Error: ${data.error}`
      )
    } catch (error) {
      console.error('Error sending test reminder:', error)
      alert('Failed to send test reminder')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkUpcomingReminders()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your business settings and preferences
        </p>
      </div>

      {/* SMS Reminders Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          SMS Reminder System
        </h2>

        <div className="space-y-4">
          {/* Auto Reminders Info */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-green-900">
                  Automatic Reminders Enabled
                </h3>
                <p className="mt-1 text-sm text-green-800">
                  Customers receive SMS reminders 24 hours before their
                  confirmed appointments. Reminders run daily at 9:00 AM EAT.
                </p>
              </div>
            </div>
          </div>

          {/* Upcoming Reminders Stats */}
          {reminderStats && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-2 font-semibold text-gray-900">
                Upcoming Reminders (Next 24 Hours)
              </h3>
              <p className="text-sm text-gray-600">
                {reminderStats.count} appointment{reminderStats.count !== 1 ? 's' : ''}{' '}
                scheduled
              </p>
              {reminderStats.appointments &&
                reminderStats.appointments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {reminderStats.appointments.map((apt: any) => (
                      <div
                        key={apt.id}
                        className="rounded border border-gray-300 bg-white p-2 text-sm"
                      >
                        <div className="font-medium">{apt.customer}</div>
                        <div className="text-gray-600">
                          {apt.service} - {apt.time}
                        </div>
                        <div className="text-xs text-gray-500">
                          Reminders sent: {apt.remindersSent}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* Test Reminder Button */}
          <div className="flex gap-3">
            <button
              onClick={checkUpcomingReminders}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Refresh Stats'}
            </button>
            <button
              onClick={sendTestReminder}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Test Reminders Now'}
            </button>
          </div>

          {/* Test Results */}
          {testResult && (
            <div
              className={`rounded-lg border p-4 ${
                testResult.success
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <h3
                className={`font-semibold ${
                  testResult.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {testResult.message}
              </h3>
              {testResult.results && testResult.results.length > 0 && (
                <div className="mt-2 space-y-1 text-sm">
                  {testResult.results.map((result: any, index: number) => (
                    <div
                      key={index}
                      className={
                        result.status === 'sent'
                          ? 'text-green-800'
                          : 'text-red-800'
                      }
                    >
                      {result.customer}: {result.status}
                      {result.error && ` (${result.error})`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Business Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Business Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <input
              type="text"
              placeholder="Your Business Name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              Used in SMS messages to customers
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contact Phone
            </label>
            <input
              type="tel"
              placeholder="0712345678"
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Business Email
            </label>
            <input
              type="email"
              placeholder="contact@yourbusiness.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>

          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>

      {/* API Configuration */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          API Configuration
        </h2>

        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">
              Environment Variables Required
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>• AFRICAS_TALKING_API_KEY - Your Africa&apos;s Talking API key</li>
              <li>• AFRICAS_TALKING_USERNAME - Your AT username</li>
              <li>• MPESA_CONSUMER_KEY - Safaricom consumer key</li>
              <li>• MPESA_CONSUMER_SECRET - Safaricom consumer secret</li>
              <li>• MPESA_PASSKEY - M-Pesa passkey</li>
              <li>• CRON_SECRET - Secret for cron job authentication</li>
            </ul>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="font-semibold text-yellow-900">Cron Job Setup</h3>
            <p className="mt-1 text-sm text-yellow-800">
              Automatic reminders are configured in vercel.json to run daily at
              9:00 AM EAT. When deployed to Vercel, this runs automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
