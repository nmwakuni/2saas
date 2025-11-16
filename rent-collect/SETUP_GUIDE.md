# RentCollect - Complete Setup Guide

This guide will walk you through setting up RentCollect from scratch.

## Prerequisites

- Node.js 18+ installed
- Git installed
- A GitHub account (for deployment)
- Basic command line knowledge

---

## Step 1: Clone and Install

```bash
# Navigate to the rent-collect directory
cd rent-collect

# Install dependencies
npm install
```

---

## Step 2: Database Setup

### Option A: Neon (Recommended - Free Tier)

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy the connection string (starts with `postgresql://`)
5. Add to `.env`:
   ```
   DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
   ```

### Option B: Supabase (Alternative - Free Tier)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (Connection Pooling)
5. Add to `.env`

### Option C: Local PostgreSQL

```bash
# Install PostgreSQL locally
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt install postgresql

# Create database
createdb rent_collect

# Add to .env
DATABASE_URL="postgresql://localhost:5432/rent_collect"
```

---

## Step 3: Authentication Setup (Clerk)

1. Go to [clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Go to API Keys
5. Copy the keys and add to `.env`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   ```

6. Configure sign-in methods:
   - Go to User & Authentication → Email, Phone, Username
   - Enable **Email** and **Phone** (for Kenyan users)
   - Save changes

---

## Step 4: SMS Setup (Africa's Talking)

### Create Account

1. Go to [africastalking.com](https://africastalking.com)
2. Sign up for a free account
3. Verify your email and phone number

### Get API Credentials

1. Go to your Dashboard
2. Navigate to Settings → API Keys
3. Create a new API key
4. Copy the API Key and Username
5. Add to `.env`:
   ```
   AFRICAS_TALKING_API_KEY="your_api_key_here"
   AFRICAS_TALKING_USERNAME="sandbox" # or your production username
   ```

### Add SMS Credits

**Sandbox (Testing):**
- Sandbox comes with free test credits
- Can only send to registered test numbers
- Go to Sandbox → SMS to add test phone numbers

**Production:**
- Buy SMS credits (KES 0.80 per SMS in Kenya)
- Go to Billing → Add Credits
- Minimum: KES 100

### Test SMS

```bash
# Send a test SMS through the Africa's Talking dashboard
# SMS → Sandbox → Send SMS
# Enter your phone number and a test message
```

---

## Step 5: M-Pesa Setup (Daraja API)

### Create Safaricom Developer Account

1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Sign up for an account
3. Verify your email

### Create an App (Sandbox)

1. Log in to your account
2. Go to **My Apps**
3. Click **Add a New App**
4. Select **Lipa Na M-Pesa Online**
5. Fill in the details:
   - App Name: `RentCollect`
   - Description: `Rent collection platform`
6. Create the app

### Get API Credentials

1. Open your app
2. Go to **Keys** tab
3. Copy the credentials:
   ```
   Consumer Key
   Consumer Secret
   ```
4. Go to **Test Credentials** (for sandbox)
5. Copy:
   ```
   Shortcode: 174379 (sandbox shortcode)
   Passkey: (provided in test credentials)
   ```

### Add to .env

```env
MPESA_ENVIRONMENT="sandbox"
MPESA_CONSUMER_KEY="your_consumer_key"
MPESA_CONSUMER_SECRET="your_consumer_secret"
MPESA_SHORTCODE="174379"
MPESA_PASSKEY="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
MPESA_CALLBACK_URL="https://your-app.vercel.app/api/mpesa/callback"
```

### Production M-Pesa

To go live:
1. Complete KYC verification on Safaricom
2. Get a Paybill or Till Number
3. Request production credentials
4. Update `.env` with:
   ```
   MPESA_ENVIRONMENT="production"
   MPESA_SHORTCODE="your_paybill_number"
   # ... other production credentials
   ```

---

## Step 6: Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
# Opens at http://localhost:5555
```

---

## Step 7: Environment Variables

Create a `.env` file in the `rent-collect` directory:

```bash
# Copy the example file
cp .env.example .env

# Edit with your actual values
nano .env  # or use any text editor
```

Your `.env` should look like this:

```env
# Database
DATABASE_URL="postgresql://user:pass@host/database?sslmode=require"

# Africa's Talking SMS API
AFRICAS_TALKING_API_KEY="your_actual_api_key"
AFRICAS_TALKING_USERNAME="sandbox"

# M-Pesa Daraja API (Safaricom)
MPESA_ENVIRONMENT="sandbox"
MPESA_CONSUMER_KEY="your_actual_consumer_key"
MPESA_CONSUMER_SECRET="your_actual_consumer_secret"
MPESA_SHORTCODE="174379"
MPESA_PASSKEY="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
MPESA_CALLBACK_URL="http://localhost:3000/api/mpesa/callback"

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_actual_key"
CLERK_SECRET_KEY="sk_test_your_actual_secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Step 8: Run the App

```bash
# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

---

## Step 9: Test the Application

### Create Test Data

1. **Sign Up**: Go to http://localhost:3000 and create an account
2. **Add Property**:
   - Go to Properties
   - Click "Add Property"
   - Enter: Name: "Test Apartments", Address: "123 Test St", Type: "Apartment"
3. **Add Unit**:
   - Click on the property
   - Add Unit: Number: "A1", Rent: "25000"
4. **Add Tenant**:
   - Go to Tenants
   - Add Tenant: Name: "John Doe", Phone: "0712345678", etc.
5. **Record Payment**:
   - Go to Payments
   - Select tenant, enter amount, date
6. **Test SMS**:
   - Go to SMS Reminders
   - Send a test SMS to your phone

### Test M-Pesa (Sandbox)

1. Go to Payments
2. Try to initiate an M-Pesa payment
3. Use test credentials from Safaricom Developer Portal
4. Test phone: 254708374149 (sandbox test number)
5. Test PIN: Any 4 digits in sandbox

---

## Step 10: Deploy to Production

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts
# Set up environment variables in Vercel dashboard
```

### Set Environment Variables in Vercel

1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Add all variables from your `.env` file
4. Update `MPESA_CALLBACK_URL` to your production URL:
   ```
   https://your-app.vercel.app/api/mpesa/callback
   ```

### Update M-Pesa Callback URL

1. Go to Safaricom Developer Portal
2. Update your app's callback URL to your production domain
3. Or use the `/api/mpesa/initiate` endpoint to register URLs programmatically

---

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db pull

# If it fails, check:
# 1. DATABASE_URL is correct
# 2. Database exists
# 3. Network allows connection (firewall, IP whitelist)
```

### SMS Not Sending

1. Check Africa's Talking credits
2. Verify phone number format (should be 0712345678 or +254712345678)
3. Check sandbox vs production username
4. View logs in Africa's Talking dashboard

### M-Pesa Errors

1. **Invalid Access Token**: Check consumer key/secret
2. **Invalid Shortcode**: Use 174379 for sandbox
3. **Callback not received**:
   - Make sure callback URL is publicly accessible
   - Use ngrok for local testing: `ngrok http 3000`
   - Update `MPESA_CALLBACK_URL` to ngrok URL

### Clerk Authentication Issues

1. Check that publishable key starts with `pk_`
2. Check that secret key starts with `sk_`
3. Ensure keys match the environment (test vs production)

---

## Production Checklist

Before going live:

- [ ] Switch to production database (not Neon free tier for scale)
- [ ] Switch Africa's Talking to production (buy credits)
- [ ] Get production M-Pesa credentials (Paybill/Till)
- [ ] Update Clerk to production environment
- [ ] Set up custom domain
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure backups for database
- [ ] Test all features in production
- [ ] Add terms of service and privacy policy

---

## Getting Help

- **Clerk Docs**: https://clerk.com/docs
- **Africa's Talking Docs**: https://developers.africastalking.com
- **M-Pesa Docs**: https://developer.safaricom.co.ke/Documentation
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## Cost Breakdown (Monthly)

**Free Tier:**
- Vercel: Free (hobby plan)
- Neon: Free (0.5GB database)
- Clerk: Free (10,000 MAU)

**Paid Services:**
- Africa's Talking SMS: ~KES 0.80 per SMS
  - 100 SMS/month = KES 80
  - 1000 SMS/month = KES 800
- M-Pesa Paybill: KES 5,000 setup + variable per transaction
- Production Database (if needed): ~$10-20/month

**Total Cost to Start**: ~KES 100-500/month (mostly SMS)

---

## Next Steps

1. Customize the branding (logo, colors)
2. Add more features (reports, analytics)
3. Build mobile app (React Native)
4. Add email notifications
5. Integrate accounting software
6. Add tenant portal

Good luck building RentCollect! 🎉
