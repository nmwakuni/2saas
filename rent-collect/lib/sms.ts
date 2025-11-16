import AfricasTalking from 'africastalking'

// Initialize Africa's Talking
const africasTalking = AfricasTalking({
  apiKey: process.env.AFRICAS_TALKING_API_KEY || '',
  username: process.env.AFRICAS_TALKING_USERNAME || '',
})

const sms = africasTalking.SMS

export type SMSResult = {
  success: boolean
  message: string
  messageId?: string
  error?: string
}

/**
 * Send an SMS message
 * @param to - Phone number (format: +254712345678 or 0712345678)
 * @param message - Message content
 * @returns Promise with result
 */
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  try {
    // Ensure phone number has country code
    let phoneNumber = to.trim()
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '+254' + phoneNumber.substring(1)
    } else if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+254' + phoneNumber
    }

    const result = await sms.send({
      to: [phoneNumber],
      message,
    })

    if (result.SMSMessageData.Recipients[0].status === 'Success') {
      return {
        success: true,
        message: 'SMS sent successfully',
        messageId: result.SMSMessageData.Recipients[0].messageId,
      }
    } else {
      return {
        success: false,
        message: 'Failed to send SMS',
        error: result.SMSMessageData.Recipients[0].status,
      }
    }
  } catch (error: any) {
    console.error('SMS Error:', error)
    return {
      success: false,
      message: 'SMS sending failed',
      error: error.message,
    }
  }
}

/**
 * Send rent reminder SMS to a tenant
 */
export async function sendRentReminder(
  tenantName: string,
  tenantPhone: string,
  rentAmount: number,
  propertyName: string,
  unitNumber: string,
  dueDate: Date
): Promise<SMSResult> {
  const formattedDate = dueDate.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
  })

  const message = `Hello ${tenantName}, this is a reminder that your rent of KES ${rentAmount.toLocaleString()} for ${propertyName} Unit ${unitNumber} is due on ${formattedDate}. Please make payment on time. Thank you.`

  return await sendSMS(tenantPhone, message)
}

/**
 * Send payment receipt SMS
 */
export async function sendPaymentReceipt(
  tenantName: string,
  tenantPhone: string,
  amount: number,
  propertyName: string,
  unitNumber: string,
  paymentDate: Date,
  transactionRef?: string
): Promise<SMSResult> {
  const formattedDate = paymentDate.toLocaleDateString('en-KE')

  let message = `Receipt: Payment of KES ${amount.toLocaleString()} received for ${propertyName} Unit ${unitNumber} on ${formattedDate}.`

  if (transactionRef) {
    message += ` Ref: ${transactionRef}`
  }

  message += ` Thank you, ${tenantName}!`

  return await sendSMS(tenantPhone, message)
}

/**
 * Send late payment reminder
 */
export async function sendLatePaymentReminder(
  tenantName: string,
  tenantPhone: string,
  rentAmount: number,
  propertyName: string,
  unitNumber: string,
  daysLate: number
): Promise<SMSResult> {
  const message = `Hello ${tenantName}, your rent of KES ${rentAmount.toLocaleString()} for ${propertyName} Unit ${unitNumber} is ${daysLate} days overdue. Please make payment as soon as possible to avoid penalties. Thank you.`

  return await sendSMS(tenantPhone, message)
}
