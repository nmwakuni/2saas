// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock'
process.env.CLERK_SECRET_KEY = 'sk_test_mock'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.AFRICAS_TALKING_API_KEY = 'test_key'
process.env.AFRICAS_TALKING_USERNAME = 'sandbox'
process.env.MPESA_CONSUMER_KEY = 'test_key'
process.env.MPESA_CONSUMER_SECRET = 'test_secret'
process.env.MPESA_ENVIRONMENT = 'sandbox'
