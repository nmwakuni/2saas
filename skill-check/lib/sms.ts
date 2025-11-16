import AfricasTalking from 'africastalking'

const africastalking = AfricasTalking({
  apiKey: process.env.AFRICAS_TALKING_API_KEY || '',
  username: process.env.AFRICAS_TALKING_USERNAME || 'sandbox',
})

const sms = africastalking.SMS

export interface SMSResult {
  success: boolean
  message: string
  data?: any
}

// Format phone number to international format (+254...)
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '')

  // Handle Kenyan numbers
  if (cleaned.startsWith('254')) {
    return '+' + cleaned
  } else if (cleaned.startsWith('0')) {
    return '+254' + cleaned.substring(1)
  } else if (cleaned.length === 9) {
    return '+254' + cleaned
  }

  return '+' + cleaned
}

// Send generic SMS
export async function sendSMS(
  to: string,
  message: string
): Promise<SMSResult> {
  try {
    const formattedPhone = formatPhoneNumber(to)

    const result = await sms.send({
      to: [formattedPhone],
      message,
    })

    return {
      success: true,
      message: 'SMS sent successfully',
      data: result,
    }
  } catch (error: any) {
    console.error('SMS Error:', error)
    return {
      success: false,
      message: error.message || 'Failed to send SMS',
      data: error,
    }
  }
}

// Send assessment invitation
export async function sendAssessmentInvitation(
  candidateName: string,
  candidatePhone: string,
  assessmentTitle: string,
  accessCode: string,
  companyName: string
): Promise<SMSResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const testUrl = `${appUrl}/test/${accessCode}`

  const message = `Hello ${candidateName},

${companyName} has invited you to take a skill assessment: ${assessmentTitle}

Access your test here: ${testUrl}
Access Code: ${accessCode}

Good luck!`

  return await sendSMS(candidatePhone, message)
}

// Send test completion notification
export async function sendTestCompletionNotification(
  candidateName: string,
  candidatePhone: string,
  assessmentTitle: string,
  score: number,
  passed: boolean
): Promise<SMSResult> {
  const status = passed ? 'PASSED' : 'NOT PASSED'
  const message = `Hello ${candidateName},

You have completed the ${assessmentTitle} assessment.

Score: ${score}%
Status: ${status}

Thank you for your participation!`

  return await sendSMS(candidatePhone, message)
}

// Send result notification to recruiter
export async function sendRecruiterNotification(
  recruiterPhone: string,
  candidateName: string,
  assessmentTitle: string,
  score: number,
  passed: boolean
): Promise<SMSResult> {
  const status = passed ? 'PASSED' : 'FAILED'
  const message = `Skill Check Alert:

${candidateName} completed "${assessmentTitle}"

Score: ${score}%
Status: ${status}

Check full results in your dashboard.`

  return await sendSMS(recruiterPhone, message)
}
