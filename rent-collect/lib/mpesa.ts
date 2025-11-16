/**
 * M-Pesa Daraja API Integration
 * Documentation: https://developer.safaricom.co.ke/APIs
 */

export type MPesaAuthResponse = {
  access_token: string
  expires_in: string
}

export type MPesaC2BResponse = {
  ConversationID: string
  OriginatorConversationID: string
  ResponseDescription: string
}

/**
 * Get M-Pesa access token
 */
export async function getMPesaAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

  const url =
    process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    const data: MPesaAuthResponse = await response.json()
    return data.access_token
  } catch (error) {
    console.error('M-Pesa Auth Error:', error)
    throw new Error('Failed to get M-Pesa access token')
  }
}

/**
 * Register C2B URLs (one-time setup)
 * This tells M-Pesa where to send payment notifications
 */
export async function registerC2BUrls(
  validationUrl: string,
  confirmationUrl: string
): Promise<any> {
  const token = await getMPesaAccessToken()
  const shortcode = process.env.MPESA_SHORTCODE

  const url =
    process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl'
      : 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl'

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ShortCode: shortcode,
        ResponseType: 'Completed',
        ConfirmationURL: confirmationUrl,
        ValidationURL: validationUrl,
      }),
    })

    return await response.json()
  } catch (error) {
    console.error('M-Pesa C2B Registration Error:', error)
    throw new Error('Failed to register C2B URLs')
  }
}

/**
 * STK Push - Initiate payment from customer's phone
 * (This prompts the customer to enter their M-Pesa PIN)
 */
export async function initiateSTKPush(
  phoneNumber: string,
  amount: number,
  accountReference: string,
  transactionDesc: string
): Promise<any> {
  const token = await getMPesaAccessToken()
  const shortcode = process.env.MPESA_SHORTCODE
  const passkey = process.env.MPESA_PASSKEY
  const callbackUrl = process.env.MPESA_CALLBACK_URL

  // Generate timestamp
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, -3)

  // Generate password
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    'base64'
  )

  // Format phone number (remove +254, add 254)
  let formattedPhone = phoneNumber.replace(/\s/g, '')
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1)
  } else if (formattedPhone.startsWith('+254')) {
    formattedPhone = formattedPhone.substring(1)
  } else if (!formattedPhone.startsWith('254')) {
    formattedPhone = '254' + formattedPhone
  }

  const url =
    process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.floor(amount), // M-Pesa doesn't accept decimals
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      }),
    })

    return await response.json()
  } catch (error) {
    console.error('M-Pesa STK Push Error:', error)
    throw new Error('Failed to initiate STK push')
  }
}

/**
 * Query STK Push transaction status
 */
export async function querySTKPushStatus(checkoutRequestId: string): Promise<any> {
  const token = await getMPesaAccessToken()
  const shortcode = process.env.MPESA_SHORTCODE
  const passkey = process.env.MPESA_PASSKEY

  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, -3)

  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    'base64'
  )

  const url =
    process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
    })

    return await response.json()
  } catch (error) {
    console.error('M-Pesa Query Error:', error)
    throw new Error('Failed to query STK push status')
  }
}

/**
 * Validate callback from M-Pesa
 */
export function validateMPesaCallback(body: any): boolean {
  // Add your validation logic here
  // Check if the callback has required fields
  return (
    body &&
    body.Body &&
    (body.Body.stkCallback || body.Body.CallbackMetadata)
  )
}
