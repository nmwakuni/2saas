# RentCollect - Digital Rent Collection Platform

Automated rent collection and tenant management platform built for Kenyan landlords and property managers.

## Features

- 🏘️ **Multi-Property Management** - Manage multiple buildings and units
- 👥 **Tenant Tracking** - Store tenant info, lease dates, deposits
- 💰 **Payment Tracking** - Record M-Pesa, cash, and bank payments
- 💬 **SMS Reminders** - Auto-send rent reminders via Africa's Talking
- 📱 **M-Pesa Integration** - Accept payments via Daraja API
- 🧾 **Digital Receipts** - Auto-generate PDF receipts
- 📊 **Analytics Dashboard** - Track occupancy, collections, late payments

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Database**: PostgreSQL + Prisma ORM
- **SMS**: Africa's Talking API
- **Payments**: Safaricom Daraja API (M-Pesa)
- **Auth**: Clerk
- **Hosting**: Vercel (frontend) + Neon/Supabase (database)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted)
- Africa's Talking account (for SMS)
- Safaricom Daraja API credentials (for M-Pesa)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your credentials.

3. **Set up database:**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # (Optional) Open Prisma Studio to view data
   npx prisma studio
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Database Schema

- `User` - Landlord/Property Manager accounts
- `Property` - Buildings/houses
- `Unit` - Individual apartments/rooms
- `Tenant` - Tenant information
- `Payment` - Payment records
- `Reminder` - SMS reminder logs

## API Routes (To Be Built)

- `POST /api/properties` - Create property
- `POST /api/units` - Create unit
- `POST /api/tenants` - Add tenant
- `POST /api/payments` - Record payment
- `POST /api/sms/send` - Send SMS reminder
- `POST /api/mpesa/callback` - M-Pesa payment callback

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables (Production)

Set these in your Vercel dashboard:

- `DATABASE_URL` - Neon/Supabase Postgres URL
- `AFRICAS_TALKING_API_KEY`
- `AFRICAS_TALKING_USERNAME`
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## Pricing Model

**KES 75 per unit per month**

Example:
- 10-unit building = KES 750/month
- 50-unit building = KES 3,750/month
- 100-unit building = KES 7,500/month

## Roadmap

- [x] Landing page
- [x] Database schema
- [ ] Authentication (Clerk)
- [ ] Property/Unit management
- [ ] Tenant management
- [ ] Payment tracking
- [ ] SMS reminders
- [ ] M-Pesa integration
- [ ] Receipt generation
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

## License

MIT
