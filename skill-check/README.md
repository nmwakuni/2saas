# Skill Check - Skill Assessment Platform

A comprehensive skill assessment platform built for Kenyan recruiters and HR professionals. Create tests, invite candidates via SMS, and make data-driven hiring decisions.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748)

## Features

### Core Functionality
- **Custom Assessments** - Create technical, aptitude, or personality tests
- **Multiple Question Types** - Multiple choice, true/false, short answer, coding
- **Timed Tests** - Set overall duration with auto-submit
- **Auto-Scoring** - Instant results with detailed analytics
- **Pass/Fail Grading** - Configurable passing scores

### Kenyan Market Integration
- **SMS Invitations** - Africa's Talking integration with unique access codes
- **M-Pesa Payments** - Buy credits with M-Pesa STK Push
- **SMS Notifications** - Test completion alerts
- **Local Currency** - KES pricing

### Candidate Experience
- **No Account Required** - Test via access codes
- **Mobile-Friendly** - Optimized for smartphones
- **Real-time Timer** - Auto-submit on timeout
- **Progress Tracking** - Question navigator
- **Instant Results** - Immediate feedback

## Tech Stack

- Next.js 16, React 19, TypeScript, TailwindCSS 4
- Prisma ORM with PostgreSQL
- Clerk Authentication
- Africa's Talking SMS, M-Pesa Daraja API

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

## Environment Variables

See `.env.example` for all required variables

## Docker Deployment

```bash
docker-compose up -d
```

## Pricing

- **Free**: 10 credits
- **Pro**: KES 2,500/month (100 credits)
- **Enterprise**: Custom

## License

MIT

---

**Skill Check** - Hire Smarter, Test Candidates Faster
