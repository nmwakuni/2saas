# Book It - Setup Guide

Welcome to Book It, a comprehensive appointment scheduling system for Kenyan businesses with integrated M-Pesa payments and SMS reminders.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [External Services Configuration](#external-services-configuration)
5. [Running the Application](#running-the-application)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Git
- A Clerk account (free tier available)
- An Africa's Talking account
- M-Pesa Daraja API credentials (Safaricom)

## Environment Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd book-it
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/book_it"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Africa's Talking SMS
AFRICAS_TALKING_API_KEY=your_api_key
AFRICAS_TALKING_USERNAME=your_username

# M-Pesa Daraja API
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_ENVIRONMENT=sandbox
# Use 'production' when ready to go live

# Cron Job Security
CRON_SECRET=your_random_secret_string

# Optional: M-Pesa Callback URL (set when deploying)
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Using psql
createdb book_it

# Or using PostgreSQL client
psql -U postgres
CREATE DATABASE book_it;
```

### 2. Run Prisma Migrations

```bash
npx prisma migrate dev
```

### 3. (Optional) Seed Database

You can use Prisma Studio to add initial data:

```bash
npx prisma studio
```

This opens a browser interface at http://localhost:5555 where you can:
- Create your first services
- Add availability slots
- Test customer creation

## External Services Configuration

### Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create a free account
2. Create a new application
3. In the dashboard, navigate to "API Keys"
4. Copy the publishable key and secret key to your `.env` file
5. Configure allowed domains in production

### Africa's Talking SMS

1. Sign up at [africastalking.com](https://africastalking.com)
2. Create a new app in sandbox mode
3. Get your API key and username from the dashboard
4. Add them to your `.env` file
5. **Pricing**: KES 0.80 per SMS in Kenya
6. For production, purchase a sender ID and go live

### M-Pesa Daraja API

#### Sandbox Setup (Testing)

1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an account and log in
3. Create a new app for Lipa Na M-Pesa Online (STK Push)
4. Get your Consumer Key and Consumer Secret
5. Test credentials are provided in sandbox
6. Use test phone numbers from Safaricom documentation

#### Production Setup

1. Contact Safaricom through Daraja support
2. Complete the business verification process
3. Get production credentials
4. Register your callback URL
5. Update `.env` with production credentials
6. Set `MPESA_ENVIRONMENT=production`

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

### Using Docker (Recommended)

See [DOCKER.md](./DOCKER.md) for detailed Docker setup instructions.

Quick start:

```bash
docker-compose up -d
```

## Features Overview

### 1. Service Management
- Create and manage your services (e.g., haircut, consultation)
- Set pricing and duration for each service
- Categorize services for easy organization

### 2. Availability Management
- Set weekly availability schedules
- Multiple time slots per day
- Toggle slots on/off for holidays/vacations

### 3. Appointment Booking
- Customer database with history tracking
- Calendar view of all appointments
- Status management (pending, confirmed, completed, cancelled)
- Automatic SMS confirmations

### 4. M-Pesa Integration
- Instant STK Push payments
- Payment tracking and reconciliation
- Support for multiple payment methods

### 5. SMS Reminders
- Automatic 24-hour reminders
- Configurable via cron jobs
- Delivery tracking and status updates

### 6. Analytics Dashboard
- Revenue trends over time
- Popular services analysis
- Payment method breakdown
- Customer insights

## Cron Jobs for Reminders

### Vercel Deployment

The `vercel.json` file configures automatic reminders to run daily at 9:00 AM EAT.

No additional setup needed when deploying to Vercel.

### Other Platforms

If deploying elsewhere, set up a cron job to call:

```bash
curl -X POST https://yourdomain.com/api/reminders/send \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Schedule: `0 9 * * *` (9:00 AM daily)

## Testing

Run the test suite:

```bash
npm test
```

Watch mode for development:

```bash
npm run test:watch
```

Coverage report:

```bash
npm run test:coverage
```

## Code Quality

### Linting

```bash
npm run lint
npm run lint:fix
```

### Formatting

```bash
npm run format
npm run format:check
```

### Type Checking

```bash
npm run type-check
```

### Run All Checks

```bash
npm run validate
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Vercel automatically:
- Builds your application
- Sets up cron jobs from `vercel.json`
- Provides HTTPS and CDN

### Other Platforms

For Railway, Render, or DigitalOcean:

1. Set up PostgreSQL database
2. Configure environment variables
3. Use Docker deployment (see DOCKER.md)
4. Set up external cron service for reminders

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Reset database if needed
npx prisma migrate reset
```

### SMS Not Sending

1. Verify Africa's Talking credentials
2. Check API balance
3. Ensure phone numbers are in correct format (+254...)
4. Check logs in Africa's Talking dashboard

### M-Pesa Issues

**Sandbox:**
- Use test phone numbers from Daraja docs
- Ensure you're using sandbox credentials
- Check Daraja API logs

**Production:**
- Verify callback URL is accessible
- Check business shortcode configuration
- Ensure passkey is correct

### Cron Jobs Not Running

1. Verify `CRON_SECRET` is set correctly
2. Check Vercel logs for cron execution
3. Test manually: `curl -X POST ...`

## Support

For issues:
1. Check this guide
2. Review [DOCKER.md](./DOCKER.md) for Docker-specific issues
3. Check application logs
4. Review external service dashboards (Clerk, Africa's Talking, Daraja)

## Next Steps

1. Create your business profile in Settings
2. Add your services
3. Set your availability
4. Start accepting bookings!

## Cost Estimation (Kenyan Market)

**Monthly Costs:**
- Clerk Auth: Free (up to 10,000 users)
- Database (Neon/Supabase): Free - KES 1,500
- SMS (100 appointments): ~KES 80
- M-Pesa: Free (customer pays transaction fee)
- Hosting (Vercel): Free - KES 2,500

**Total**: KES 0 - 4,080/month for small business

Good luck with your appointment booking business! 🚀
