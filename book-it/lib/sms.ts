import AfricasTalking from 'africastalking'

const africasTalking = AfricasTalking({
  apiKey: process.env.AFRICAS_TALKING_API_KEY || '',
  username: process.env.AFRICAS_TALKING_USERNAME || '',
})

const sms = africasTalking.SMS

export interface SMSResult {
  success: boolean
  message: string
  data?: any
}

/**
 * Format Kenyan phone number to international format
 */
export function formatPhoneNumber(phone: string): string {
  let phoneNumber = phone.trim()

  // Remove any spaces, dashes, or parentheses
  phoneNumber = phoneNumber.replace(/[\s\-()]/g, '')

  // If starts with 0, replace with +254
  if (phoneNumber.startsWith('0')) {
    phoneNumber = '+254' + phoneNumber.substring(1)
  }

  // If starts with 254 (without +), add +
  if (phoneNumber.startsWith('254') && !phoneNumber.startsWith('+')) {
    phoneNumber = '+' + phoneNumber
  }

  return phoneNumber
}

/**
 * Send SMS message
 */
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  try {
    const phoneNumber = formatPhoneNumber(to)

    const result = await sms.send({
      to: [phoneNumber],
      message,
    })

    if (result.SMSMessageData.Recipients[0].status === 'Success') {
      return {
        success: true,
        message: 'SMS sent successfully',
        data: result,
      }
    } else {
      return {
        success: false,
        message: result.SMSMessageData.Recipients[0].status || 'Failed to send SMS',
      }
    }
  } catch (error: any) {
    console.error('SMS Error:', error)
    return {
      success: false,
      message: error.message || 'Failed to send SMS',
    }
  }
}

/**
 * Send appointment confirmation SMS
 */
export async function sendAppointmentConfirmation(
  customerName: string,
  customerPhone: string,
  serviceName: string,
  appointmentDate: Date,
  startTime: string,
  businessName: string
): Promise<SMSResult> {
  const formattedDate = appointmentDate.toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const message = `Hello ${customerName}, your appointment for ${serviceName} at ${businessName} is confirmed for ${formattedDate} at ${startTime}. Thank you!`

  return await sendSMS(customerPhone, message)
}

/**
 * Send appointment reminder SMS
 */
export async function sendAppointmentReminder(
  customerName: string,
  customerPhone: string,
  serviceName: string,
  appointmentDate: Date,
  startTime: string,
  businessName: string
): Promise<SMSResult> {
  const formattedDate = appointmentDate.toLocaleDateString('en-KE', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const message = `Reminder: Hi ${customerName}, you have an appointment for ${serviceName} at ${businessName} tomorrow (${formattedDate}) at ${startTime}. See you then!`

  return await sendSMS(customerPhone, message)
}

/**
 * Send cancellation SMS
 */
export async function sendCancellationNotification(
  customerName: string,
  customerPhone: string,
  serviceName: string,
  appointmentDate: Date,
  startTime: string,
  businessName: string
): Promise<SMSResult> {
  const formattedDate = appointmentDate.toLocaleDateString('en-KE', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const message = `Hello ${customerName}, your appointment for ${serviceName} at ${businessName} on ${formattedDate} at ${startTime} has been cancelled. Please contact us to reschedule.`

  return await sendSMS(customerPhone, message)
}
