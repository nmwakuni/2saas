import { formatPhoneNumber } from '@/lib/sms'

describe('SMS Utilities', () => {
  describe('formatPhoneNumber', () => {
    it('should format Kenyan phone numbers starting with 0', () => {
      expect(formatPhoneNumber('0712345678')).toBe('+254712345678')
    })

    it('should handle phone numbers already with +254', () => {
      expect(formatPhoneNumber('+254712345678')).toBe('+254712345678')
    })

    it('should handle phone numbers starting with 254', () => {
      expect(formatPhoneNumber('254712345678')).toBe('+254712345678')
    })

    it('should handle phone numbers with spaces', () => {
      expect(formatPhoneNumber('0712 345 678')).toBe('+254712345678')
    })

    it('should handle phone numbers with dashes', () => {
      expect(formatPhoneNumber('0712-345-678')).toBe('+254712345678')
    })
  })
})
