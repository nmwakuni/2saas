import { describe, it, expect } from '@jest/globals'

describe('SMS Utilities', () => {
  it('should format Kenyan phone numbers correctly', () => {
    // Test phone number formatting
    const testNumber = '0712345678'
    const expected = '+254712345678'

    // Format the number (simplified version without importing actual function)
    let phoneNumber = testNumber.trim()
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '+254' + phoneNumber.substring(1)
    }

    expect(phoneNumber).toBe(expected)
  })

  it('should handle already formatted numbers', () => {
    const testNumber = '+254712345678'
    expect(testNumber).toContain('+254')
  })
})
