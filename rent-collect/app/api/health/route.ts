import { NextResponse } from 'next/server'

// GET - Health check endpoint for Docker
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'RentCollect API',
    },
    { status: 200 }
  )
}
