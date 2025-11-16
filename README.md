# 2SaaS - Three Kenya-Focused SaaS Products

This repository contains 3 independent SaaS applications built with Next.js:

## 🏘️ 1. Rent Collect
**Digital rent collection & tenant management for landlords**

- Tenant management & payment tracking
- Automated SMS reminders
- M-Pesa payment integration
- Receipt generation
- Late payment tracking

**Tech Stack:** Next.js 14, PostgreSQL, Prisma, Africa's Talking (SMS), Daraja API (M-Pesa)

---

## 📅 2. Book It
**Appointment scheduling for service businesses (salons, clinics, mechanics)**

- WhatsApp/web booking
- Calendar management
- SMS reminders (24hr + 2hr before)
- Customer database
- No-show tracking

**Tech Stack:** Next.js 14, PostgreSQL, Prisma, WhatsApp Business API, Africa's Talking (SMS)

---

## 🎯 3. Skill Check
**AI-powered skill assessment platform for recruiters**

- Pre-built skill tests (Excel, English, Customer Service, etc.)
- Auto-grading + AI essay evaluation
- Candidate ranking dashboard
- Anti-cheat measures
- Kenya-specific tests (Kiswahili, M-Pesa knowledge)

**Tech Stack:** Next.js 14, PostgreSQL, Prisma, OpenAI API, Cloudflare R2 (storage)

---

## 🚀 Development

Each app is independent. Navigate to the respective folder:

```bash
# Rent Collection
cd rent-collect
npm install
npm run dev

# Appointment Scheduling
cd book-it
npm install
npm run dev

# Skill Assessment
cd skill-check
npm install
npm run dev
```

---

## 📦 Deployment

Each app deploys independently to Vercel:

- **Rent Collect:** `rent-collect.vercel.app`
- **Book It:** `book-it.vercel.app`
- **Skill Check:** `skill-check.vercel.app`

---

## 🗄️ Database

Each app has its own PostgreSQL database (or share one with separate schemas).

**Options:**
- **Neon** (Postgres, free tier: 0.5GB)
- **Supabase** (Postgres + auth, free tier: 500MB)
- **Railway** (Postgres, $5/month)

---

## 🛠️ Environment Variables

Each app needs:

```env
# Database
DATABASE_URL="postgresql://..."

# SMS (Africa's Talking)
AT_API_KEY="..."
AT_USERNAME="..."

# M-Pesa (Daraja API)
MPESA_CONSUMER_KEY="..."
MPESA_CONSUMER_SECRET="..."
MPESA_SHORTCODE="..."
MPESA_PASSKEY="..."

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."

# OpenAI (Skill Check only)
OPENAI_API_KEY="..."
```

---

## 📈 Build Order

1. **Week 1-2:** Rent Collect (simplest, validates SMS + M-Pesa)
2. **Week 3-4:** Book It (adds WhatsApp + calendar logic)
3. **Week 5-6:** Skill Check (most complex, adds AI + grading)

---

## 💰 Revenue Targets

| App | Price | Target Users | Monthly Revenue |
|-----|-------|-------------|-----------------|
| Rent Collect | KES 75/unit | 200 units | KES 15,000 (~$115) |
| Book It | KES 3,500/mo | 10 salons | KES 35,000 (~$270) |
| Skill Check | KES 300/assessment | 100 tests | KES 30,000 (~$230) |

**Total Potential:** ~KES 80,000/month (~$615) within 3 months

---

## 📝 License

MIT
