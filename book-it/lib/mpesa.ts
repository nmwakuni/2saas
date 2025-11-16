interface MPesaAuthResponse {
  access_token: string
  expires_in: string
}

interface STKPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

/**
 * Get M-Pesa access token
 */
export async function getMPesaAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET

  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa credentials not configured')
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

  const url =
    process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get M-Pesa access token')
  }

  const data: MPesaAuthResponse = await response.json()
  return data.access_token
}

/**
 * Format phone number for M-Pesa (254XXXXXXXXX)
 */
export function formatMPesaPhoneNumber(phone: string): string {
  let phoneNumber = phone.trim().replace(/[\s\-()]/g, '')

  // Remove + if present
  if (phoneNumber.startsWith('+')) {
    phoneNumber = phoneNumber.substring(1)
  }

  // If starts with 0, replace with 254
  if (phoneNumber.startsWith('0')) {
    phoneNumber = '254' + phoneNumber.substring(1)
  }

  // If starts with 7 or 1, add 254 prefix
  if (phoneNumber.startsWith('7') || phoneNumber.startsWith('1')) {
    phoneNumber = '254' + phoneNumber
  }

  return phoneNumber
}

/**
 * Initiate STK Push (Lipa Na M-Pesa Online)
 */
export async function initiateSTKPush(
  phoneNumber: string,
  amount: number,
  accountReference: string,
  transactionDesc: string
): Promise<STKPushResponse> {
  const token = await getMPesaAccessToken()
  const formattedPhone = formatMPesaPhoneNumber(phoneNumber)

  const shortCode = process.env.MPESA_SHORTCODE || '174379'
  const passkey = process.env.MPESA_PASSKEY || ''
  const callbackUrl = process.env.MPESA_CALLBACK_URL || ''

  // Generate timestamp (YYYYMMDDHHmmss)
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .substring(0, 14)

  // Generate password
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString(
    'base64'
  )

  const url =
    process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.floor(amount),
    PartyA: formattedPhone,
    PartyB: shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.errorMessage || 'Failed to initiate M-Pesa payment')
  }

  const data: STKPushResponse = await response.json()
  return data
}

/**
 * Query STK Push status
 */
export async function querySTKPushStatus(checkoutRequestID: string): Promise<any> {
  const token = await getMPesaAccessToken()
  const shortCode = process.env.MPESA_SHORTCODE || '174379'
  const passkey = process.env.MPESA_PASSKEY || ''

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .substring(0, 14)

  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString(
    'base64'
  )

  const url =
    process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestID,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to query M-Pesa payment status')
  }

  const data = await response.json()
  return data
}
