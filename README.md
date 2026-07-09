# 🛍️ Smart Picks India

<div align="center">

![Smart Picks India](https://smart-picks-india.vercel.app/og-image.jpg)

**The all-in-one Amazon affiliate deals platform + AI-powered Student Hub for Indian students**

[![Live Site](https://img.shields.io/badge/Live%20Site-smart--picks--india.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://smart-picks-india.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express-4-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI%20Powered-blue?style=for-the-badge&logo=google)](https://ai.google.dev)

</div>

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Live Demo](#live-demo)
3. [Key Features](#key-features)
4. [Tech Stack](#tech-stack)
5. [Architecture](#architecture)
6. [Project Structure](#project-structure)
7. [Local Development](#local-development)
8. [Environment Variables](#environment-variables)
9. [Deployment](#deployment)
10. [GitHub Actions CI/CD](#github-actions-cicd)
11. [Contributing](#contributing)

---

## Overview

**Smart Picks India** is a full-stack monorepo combining two products into one:

| Product | Description |
|---|---|
| 🛒 **Deals & Shopping** | Amazon affiliate portal with 500+ products, 90-day price history charts, real-time price drop alerts via Email & Telegram, and an AI-powered product finder |
| 🎓 **Student Hub** | Suite of 15+ AI tools for CS/IT students — career roadmaps, AI skill tree builder, resume analyzer, interview prep, placement tracker, and more |

**Revenue Model:**
- Amazon affiliate commissions (tag: `smartpick07d2-21`)
- Digital store product sales via Razorpay
- Student Hub Pro subscriptions (₹X/month via Razorpay recurring plans)

---

## Live Demo

🌐 **Frontend:** [smart-picks-india.vercel.app](https://smart-picks-india.vercel.app)  
🔌 **Backend API:** [smart-picks-india.onrender.com](https://smart-picks-india.onrender.com/health)

---

## Key Features

### 🛒 Shopping & Deals

| Feature | Details |
|---|---|
| **500+ Product Catalog** | Curated Amazon India products with affiliate links, ratings, pros/cons |
| **90-Day Price History Charts** | Interactive Chart.js graphs showing real price trends |
| **Price Drop Alerts** | Set target price → get Email or Telegram notification on drop |
| **AI Product Finder** | Describe your budget/needs → Gemini recommends the best products |
| **Flash Deals + Countdown** | Time-limited deals with live countdown timers |
| **Recently Viewed** | localStorage-persisted browsing history bar |
| **Product Comparison** | Compare up to 4 products side-by-side |
| **Fuzzy Search** | Client-side Fuse.js search across the entire catalog |
| **Telegram Broadcast** | Price drops auto-posted to public Telegram channel |

### 🎓 Student Hub (AI-Powered)

| Tool | Endpoint | Description |
|---|---|---|
| **AI Skill Tree Builder** | `/student-hub/ai-skill-tree` | Gemini generates a custom 8-node career roadmap with quizzes + XP rewards |
| **Interview Generator** | `/student-hub/interview-generator` | 8 Q&A pairs with topics for any role/company |
| **Resume Analyzer** | `/student-hub/resume-analyzer` | ATS score, keyword density, section analysis |
| **DSA Code Evaluator** | `/student-hub/coding-helper` | Time/space complexity, bug detection, refactored solution |
| **Project Report Writer** | `/student-hub/project-report-generator` | Full markdown project report outline |
| **Smart Notes** | `/student-hub/smart-notes` | AI notes from PDFs/DOCX files with flashcards & quiz |
| **Study Buddy Chat** | `/student-hub/ai-study-assistant` | Multi-turn Gemini chat for any subject |
| **Project Idea Generator** | `/student-hub/project-idea-generator` | 3 anti-cliché project ideas with roadmaps |
| **Developer Roadmaps** | `/student-hub/roadmaps` | Interactive phase-by-phase roadmaps: Web Dev, AI/ML, DevOps |
| **Placement Tracker** | `/student-hub/placement-tracker` | Kanban board for tracking company applications & interview stages |
| **Portfolio Generator** | `/student-hub/portfolio-generator` | AI-generated portfolio based on your skills |
| **CGPA Calculator** | `/student-hub/cgpa-calculator` | SGPA/CGPA target planner |
| **Attendance Calculator** | `/student-hub/attendance-calculator` | How many classes you can bunk and stay above 75% |
| **Leaderboard** | `/student-hub/leaderboard` | Top students ranked by XP |

### 🏪 Digital Store

- Free & paid downloadable products (PDFs, guides, templates)
- Razorpay payment integration with HMAC signature verification
- Secure one-time download tokens
- MongoDB binary buffer fallback for ephemeral disk hosting

### 🤖 Automation

- **Pinterest**: GitHub Actions posts 6 pins/day with Gemini-generated captions
- **Price Sync**: Daily cron job logs price history and fires alerts on drops
- **Product Pipeline**: Google Sheets → GitHub Action → Gemini → `data/products.ts` → Vercel auto-deploy

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js (App Router) | 16.2.6 | SSG/ISR pages, API proxy rewrites |
| React | 19 | UI framework |
| TypeScript | 5 | Type safety throughout |
| Tailwind CSS | v4 | Styling with custom design tokens |
| Framer Motion | latest | Page/component animations |
| @xyflow/react | latest | Interactive skill tree & roadmap flow diagrams |
| Chart.js | latest | 90-day price history charts |
| Fuse.js | latest | Client-side fuzzy search |
| Radix UI | latest | Accessible primitives (Dialog, Accordion, Dropdown) |
| next/font | — | Inter + Outfit Google Fonts |
| Lucide React | latest | Icon library |
| pdfjs-dist + mammoth | latest | Client-side PDF/DOCX text extraction for Smart Notes |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime (ESM modules) |
| Express | 4 | HTTP server + router |
| MongoDB + Mongoose | 8 | Database + ODM |
| Google Gemini API | 2.5 Flash | AI features with model cascade fallback |
| Razorpay | latest | Payments (digital store + Pro subscriptions) |
| JWT (jsonwebtoken) | latest | Access + Refresh token auth |
| bcryptjs | latest | Password + OTP hashing |
| Helmet | latest | HTTP security headers |
| express-rate-limit | latest | 100 req/15min API rate limiting |
| Nodemailer | latest | Transactional email (SMTP) |
| Telegram Bot API | — | Price alerts + deal broadcasts |
| Twilio | latest | SMS OTP delivery |
| Zod | 3 | Server-side schema validation |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER / CLIENT                          │
│   Next.js 16 (React 19) — Vercel Hosting                    │
│   SSG/ISR pages + "use client" components                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ /api/v1/* → Proxy Rewrite (next.config.ts)
                       │ httpOnly JWT Cookies
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               EXPRESS BACKEND (server/)                      │
│   Node.js 18+ · ESM · Port 5000                             │
│   Render.com · Helmet · CORS · Rate Limit · JWT Auth         │
└──────────────────────┬──────────────────────────────────────┘
                       │ Mongoose ODM
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               MONGODB ATLAS                                  │
│   20 collections: users, sessions, products, pricehistories, │
│   pricealerts, blogs, deals, digitalproducts, purchases...   │
└─────────────────────────────────────────────────────────────┘

EXTERNAL:
  Gemini API     → AI tools, chatbot, Pinterest captions
  Razorpay       → Payments + subscriptions
  Telegram API   → Price drop alerts + deal channel
  Twilio SMS     → OTP login
  Nodemailer     → Transactional emails
  Pinterest API  → Automated pin posting (GitHub Actions)
  Google Sheets  → Product data source (GitHub Actions)
```

**Key Design Decision:** The 500+ product catalog lives in `data/products.ts` (TypeScript file), not MongoDB. This enables pure SSG/ISR without a database dependency for public product pages. MongoDB is used only for user data, price history, and dynamic content.

---

## Project Structure

```
smart-picks-india/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout — ThemeProvider, AuthProvider, CompareProvider
│   ├── page.tsx                 # Homepage (SSG + ISR 60s)
│   ├── globals.css              # Tailwind v4 + CSS design tokens
│   ├── product/[slug]/          # Product detail pages (ISR 60s)
│   ├── category/[slug]/         # Category listing
│   ├── deals/                   # Dynamic deals browser
│   ├── blog/                    # Blog listing + [slug] detail
│   ├── student-hub/             # All Student Hub tools (15+ pages)
│   │   ├── ai-skill-tree/       # AI Skill Tree Builder (Gemini + ReactFlow)
│   │   ├── roadmaps/            # Developer roadmap visualizer
│   │   ├── smart-notes/         # AI notes from PDF/DOCX
│   │   ├── placement-tracker/   # Kanban application board
│   │   └── ...                  # 10+ more AI tools
│   ├── digital-store/           # Digital products storefront
│   ├── admin/                   # Admin CMS panel
│   ├── dashboard/               # User dashboard
│   └── api/                     # Next.js route handlers
│
├── components/                  # 36 reusable React components
│   ├── Navbar.tsx               # Main navigation (auth-aware)
│   ├── AIChatbot.tsx            # Floating AI chat widget
│   ├── PriceHistoryChart.tsx    # 90-day Chart.js price chart
│   ├── PriceAlertTracker.tsx    # Price alert UI
│   ├── DealsClient.tsx          # Deals browser with filters
│   └── roadmap/                 # Roadmap flow components
│
├── data/                        # Static data (source of truth)
│   ├── products.ts              # 500+ Amazon products (~159KB)
│   ├── roadmaps.ts              # Developer roadmap data
│   ├── categories.ts            # Product category definitions
│   └── blogPosts.ts             # Static blog content
│
├── hooks/                       # Custom React hooks
│   ├── use-auth.tsx             # AuthProvider + useAuth() context
│   └── useCompare.tsx           # Product comparison context
│
├── lib/                         # Pure utilities
│   ├── seo.ts                   # Metadata + JSON-LD schema generators
│   └── utils.ts                 # formatPrice, calculateDiscount
│
├── scripts/                     # GitHub Actions automation
│   ├── generate-products.mjs    # Google Sheets → Gemini → products.ts
│   ├── update-prices.mjs        # Price sync from Google Sheets
│   └── post-to-pinterest.mjs    # Automated Pinterest pin poster
│
├── server/                      # Express backend
│   ├── server.js                # Entry point + middleware stack
│   ├── routes/                  # 13 Express routers
│   │   ├── auth.js              # Register, Login, OAuth, OTP, Reset
│   │   ├── studentHub.js        # All 15+ Student Hub AI endpoints
│   │   ├── admin.js             # Admin CMS endpoints
│   │   ├── digitalStore.js      # Store + Razorpay checkout
│   │   └── ...                  # 9 more routers
│   ├── models/                  # 18 Mongoose schemas
│   ├── middleware/              # auth.js, hubLimits.js, xp.js, rateLimiter.js
│   ├── utils/                   # gemini.js, email.js, telegram.js, tokens.js
│   └── jobs/                    # priceSync.js (24h cron daemon)
│
├── .github/workflows/           # 2 automated GitHub Actions
│   ├── update-products.yml      # Daily 10AM IST: product sync + price update
│   └── pinterest-auto-post.yml  # 9AM + 8PM IST: Pinterest pin posting
│
├── next.config.ts               # Image domains + /api/v1/* proxy rewrite
└── BRAIN.md                     # Complete technical documentation
```

---

## Local Development

### Prerequisites

- [Node.js v18+](https://nodejs.org/)
- MongoDB (local) or [MongoDB Atlas](https://www.mongodb.com/atlas) URI
- [Google Gemini API Key](https://ai.google.dev/) (free tier available)

### 1. Clone & Install

```bash
git clone https://github.com/Jay-2007-coder/Smart-Picks-India.git
cd Smart-Picks-India

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Configure Environment

Create `.env.local` in the **root directory**:

```env
# ── Frontend ─────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_AMAZON_TAG=smartpick07d2-21
BACKEND_API_URL=http://localhost:5000

# ── Backend ──────────────────────────────────────────────────
MONGODB_URI=mongodb://127.0.0.1:27017/smart-picks-auth
JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
CLIENT_URL=http://localhost:3000
PORT=5000

# ── AI (Required for Student Hub tools) ──────────────────────
GEMINI_API_KEY=your_gemini_api_key

# ── Payments (Optional — sandbox auto-approves if absent) ────
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_PLAN_ID_STUDENT_PRO=plan_xxxxxxxxxx

# ── Notifications (Optional — logs to console if absent) ─────
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHANNEL_ID=@your_channel_id
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@smartpicksindia.com
```

### 3. Run

```bash
# Terminal 1 — Frontend (localhost:3000)
npm run dev

# Terminal 2 — Backend (localhost:5000)
cd server && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Note:** All `/api/v1/*` requests from the frontend are automatically proxied to the backend via `next.config.ts` rewrites. No CORS configuration needed locally.

---

## Environment Variables

### Frontend (Vercel Environment Variables)

| Variable | Required | Description |
|---|---|---|
| `BACKEND_API_URL` | ✅ Yes | Backend server URL (e.g. `https://smart-picks-india.onrender.com`) |
| `NEXT_PUBLIC_SITE_URL` | ✅ Yes | Frontend URL for SEO + sitemaps |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`) |
| `NEXT_PUBLIC_AMAZON_TAG` | Optional | Amazon affiliate tag (defaults to `smartpick07d2-21`) |

### Backend (Render Environment Variables)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ Yes | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | ✅ Yes | Access token signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | ✅ Yes | Refresh token signing secret (min 32 chars) |
| `CLIENT_URL` | ✅ Yes | Frontend URL for CORS |
| `GEMINI_API_KEY` | Recommended | Enables all AI features |
| `RAZORPAY_KEY_ID` | Optional | Payments (sandbox auto-approve if absent) |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay secret |
| `TELEGRAM_BOT_TOKEN` | Optional | Price alert + deal broadcast bot |
| `SMTP_HOST/PORT/USER/PASS` | Optional | Transactional emails |
| `TWILIO_*` | Optional | SMS OTP delivery |

### GitHub Actions Secrets

| Secret | Used By |
|---|---|
| `GEMINI_API_KEY` | Product generation + Pinterest captions |
| `SHEET_CSV_URL` | Google Sheets product data source |
| `PINTEREST_TOKEN` | Pinterest API v5 pin posting |
| `IMGBB_API_KEY` | Pinterest pin image hosting |
| `PINTEREST_BOARD_ID` | Default Pinterest board |

---

## Deployment

### Frontend → Vercel

Push to `main` branch → Vercel auto-deploys.

1. Import repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `/` (project root)
3. Add all frontend environment variables in Vercel dashboard
4. Deploy

### Backend → Render

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect this GitHub repo
3. Set **Root Directory** to `server/`
4. **Build Command:** `npm install`
5. **Start Command:** `node server.js`
6. Add all backend environment variables
7. Copy the Render URL → add as `BACKEND_API_URL` in Vercel

### Database → MongoDB Atlas

1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create database user + whitelist `0.0.0.0/0`
3. Copy connection string → add as `MONGODB_URI` in Render

> **Seed Digital Products:** After backend is live, run:
> ```bash
> cd server && npm run seed:store
> ```

---

## GitHub Actions CI/CD

### Workflow 1: `update-products.yml` — Daily 10:00 AM IST

```
Google Sheets CSV
    → scripts/generate-products.mjs (Gemini generates descriptions)
        → Appends to data/products.ts + server/data/products.ts
    → scripts/update-prices.mjs
        → Updates prices in data/products.ts
    → Commits → Vercel auto-redeploys
```

**Setup:** Add `SHEET_CSV_URL` and `GEMINI_API_KEY` in GitHub → Settings → Secrets → Actions. See [SETUP.md](./SETUP.md) for full instructions.

### Workflow 2: `pinterest-auto-post.yml` — 9:00 AM + 8:00 PM IST

```
Posts up to 3 pins per run (6 pins/day)
    → Canvas-rendered 1000×1500 product images
    → ImgBB hosting → Pinterest API v5
    → Updates data/pinterest-posted.json [skip ci]
```

---

## Security

| Layer | Implementation |
|---|---|
| Auth | Dual JWT (15min access + 7d refresh) in httpOnly cookies |
| Session Revocation | Refresh tokens stored in DB — revoked on logout |
| Rate Limiting | 100 req/15min (API), 5 req/10min (auth routes) |
| Account Lockout | 5 failed logins → 15-minute lockout |
| NoSQL Injection | Custom `sanitizeMongo` middleware (strips `$` keys) |
| XSS | httpOnly cookies + Helmet CSP headers |
| Payment Integrity | Razorpay HMAC-SHA256 signature verification |
| Password Storage | bcrypt with salt rounds |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Read `BRAIN.md` — it contains critical architecture decisions, known issues, and modification warnings
4. Commit changes: `git commit -m "feat: add your feature"`
5. Push and open a Pull Request

> ⚠️ **Before modifying `data/products.ts`, `server/utils/priceSync.js`, or `hooks/use-auth.tsx`** — read the [Critical Modification Warnings](./BRAIN.md#17-critical-modification-warnings) section in BRAIN.md first.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

Made with ❤️ for Indian students and shoppers

[🌐 Live Site](https://smart-picks-india.vercel.app) · [📘 Docs (BRAIN.md)](./BRAIN.md) · [🐛 Report Bug](https://github.com/Jay-2007-coder/Smart-Picks-India/issues)

</div>
