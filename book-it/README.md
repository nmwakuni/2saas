# Book It - Appointment Scheduling System

A comprehensive appointment scheduling system built for Kenyan businesses, featuring M-Pesa payments, SMS reminders, and powerful analytics.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Functionality
- **Service Management** - Create and manage your service offerings with pricing and duration
- **Availability Scheduling** - Set weekly availability with multiple time slots per day
- **Customer Database** - Track customer information and appointment history
- **Appointment Booking** - Complete booking system with status management
- **Calendar View** - Visual calendar for managing appointments

### Kenyan Market Integration
- **M-Pesa Integration** - Accept payments via Safaricom M-Pesa STK Push
- **SMS Notifications** - Automatic confirmations and reminders via Africa's Talking
- **Local Currency** - All pricing in Kenyan Shillings (KES)
- **Mobile-First Design** - Optimized for mobile users

### Business Intelligence
- **Analytics Dashboard** - Revenue trends, popular services, payment breakdown
- **Performance Tracking** - Monitor bookings, revenue, and customer growth
- **Automated Reminders** - Send 24-hour appointment reminders automatically

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL 15+
- **Authentication**: Clerk
- **Payments**: M-Pesa Daraja API
- **SMS**: Africa's Talking API
- **Charts**: Recharts
- **Deployment**: Vercel / Docker

## Screenshots

### Landing Page
Beautiful conversion-optimized landing page with clear call-to-action.

### Dashboard
Real-time overview of appointments, revenue, and business metrics.

### Calendar View
Visual calendar showing all appointments with color-coded status.

### Analytics
Comprehensive analytics with charts for revenue, services, and payments.

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd book-it
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- Database URL
- Clerk authentication keys
- Africa's Talking API credentials
- M-Pesa Daraja API credentials

4. **Set up the database**

```bash
npx prisma migrate dev
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Docker Deployment

### Quick Start with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

See [DOCKER.md](./DOCKER.md) for detailed Docker deployment guide.

## Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup and configuration guide
- **[DOCKER.md](./DOCKER.md)** - Docker deployment instructions
- **[API Documentation](#api-documentation)** - API endpoints reference

## Project Structure

```
book-it/
├── app/
│   ├── api/              # API routes
│   │   ├── appointments/ # Appointment CRUD
│   │   ├── services/     # Service management
│   │   ├── customers/    # Customer database
│   │   ├── availability/ # Availability management
│   │   ├── mpesa/        # M-Pesa integration
│   │   ├── reminders/    # SMS reminder system
│   │   └── analytics/    # Analytics data
│   ├── dashboard/        # Dashboard pages
│   │   ├── appointments/ # Appointments UI
│   │   ├── calendar/     # Calendar view
│   │   ├── services/     # Services management
│   │   ├── customers/    # Customer database
│   │   ├── availability/ # Availability settings
│   │   ├── analytics/    # Analytics dashboard
│   │   └── settings/     # Settings page
│   ├── sign-in/          # Authentication pages
│   └── page.tsx          # Landing page
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── sms.ts            # SMS utilities
│   └── mpesa.ts          # M-Pesa utilities
├── prisma/
│   └── schema.prisma     # Database schema
├── __tests__/            # Test files
└── public/               # Static assets
```

## API Documentation

### Appointments

```bash
GET    /api/appointments       # List all appointments
POST   /api/appointments       # Create appointment
GET    /api/appointments/:id   # Get single appointment
PATCH  /api/appointments/:id   # Update appointment
DELETE /api/appointments/:id   # Delete appointment
```

### Services

```bash
GET    /api/services           # List all services
POST   /api/services           # Create service
PATCH  /api/services/:id       # Update service
DELETE /api/services/:id       # Delete service
```

### M-Pesa

```bash
POST   /api/mpesa/initiate     # Initiate STK push
POST   /api/mpesa/callback     # M-Pesa callback handler
GET    /api/mpesa/query/:id    # Query transaction status
```

### Analytics

```bash
GET    /api/analytics          # Get business analytics
```

## Environment Variables

See `.env.example` for complete list. Key variables:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
AFRICAS_TALKING_API_KEY=...
AFRICAS_TALKING_USERNAME=...
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
CRON_SECRET=...
```

## Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking
npm run validate         # Run all checks

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio

# Docker
npm run docker:build     # Build Docker image
npm run docker:up        # Start containers
npm run docker:down      # Stop containers
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

Vercel automatically:
- Builds the application
- Sets up cron jobs for reminders
- Provides HTTPS and CDN

### Docker

See [DOCKER.md](./DOCKER.md) for production Docker deployment.

### Other Platforms

The app can be deployed to:
- Railway
- Render
- DigitalOcean App Platform
- AWS (EC2, ECS, Lambda)
- Google Cloud Run

## Cost Estimate (Monthly)

For a small business in Kenya:

- **Hosting** (Vercel): Free - KES 2,500
- **Database** (Neon/Supabase): Free - KES 1,500
- **Authentication** (Clerk): Free (up to 10,000 users)
- **SMS** (Africa's Talking): ~KES 0.80 per SMS
- **M-Pesa**: Free (customer pays transaction fee)

**Total**: KES 0 - 4,080/month + SMS costs

## Features Roadmap

- [ ] Customer portal for self-booking
- [ ] Email notifications
- [ ] Recurring appointments
- [ ] Staff management (multiple service providers)
- [ ] Inventory tracking
- [ ] Loyalty program
- [ ] WhatsApp integration
- [ ] Mobile app (React Native)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for setup help
- Check [DOCKER.md](./DOCKER.md) for Docker issues
- Open an issue on GitHub

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [Clerk](https://clerk.com/)
- SMS by [Africa's Talking](https://africastalking.com/)
- Payments by [Safaricom M-Pesa](https://developer.safaricom.co.ke/)

## Author

Built for the Kenyan market with love.

---

**Book It** - Accept bookings 24/7, even while you sleep.
