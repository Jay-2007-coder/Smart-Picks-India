# BRAIN.md — Smart Picks India
> **Single Source of Truth** for AI agents and developers.  
> Last generated: 2026-06-26 | Next.js 16.2.6 · React 19 · Express 4 · MongoDB (Mongoose)

---

## Table of Contents

1. [Project Overview & Business Model](#1-project-overview--business-model)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Frontend — Next.js App](#4-frontend--nextjs-app)
   - 4.1 [Routing & Pages](#41-routing--pages)
   - 4.2 [Global Layout & Providers](#42-global-layout--providers)
   - 4.3 [Data Sources (Static vs Dynamic)](#43-data-sources-static-vs-dynamic)
   - 4.4 [Component Inventory](#44-component-inventory)
   - 4.5 [Custom Hooks](#45-custom-hooks)
   - 4.6 [Lib Utilities](#46-lib-utilities)
5. [Backend — Express Server](#5-backend--express-server)
   - 5.1 [Server Bootstrap & Middleware Stack](#51-server-bootstrap--middleware-stack)
   - 5.2 [API Route Map](#52-api-route-map)
   - 5.3 [Authentication System](#53-authentication-system)
   - 5.4 [Database Models (MongoDB/Mongoose)](#54-database-models-mongodbmongoose)
   - 5.5 [Background Jobs & Cron Daemons](#55-background-jobs--cron-daemons)
   - 5.6 [Server Utilities](#56-server-utilities)
6. [Data Layer & State Flow](#6-data-layer--state-flow)
   - 6.1 [Static Product Catalog](#61-static-product-catalog)
   - 6.2 [Price Sync Pipeline](#62-price-sync-pipeline)
   - 6.3 [Client-Side State](#63-client-side-state)
   - 6.4 [localStorage Usage](#64-localstorage-usage)
7. [Key Business Features](#7-key-business-features)
   - 7.1 [Price Alert & Drop Notification System](#71-price-alert--drop-notification-system)
   - 7.2 [Digital Store & Razorpay Payments](#72-digital-store--razorpay-payments)
   - 7.3 [Student Hub (AI-Powered Tools)](#73-student-hub-ai-powered-tools)
   - 7.4 [AI Chatbot & Product Finder](#74-ai-chatbot--product-finder)
   - 7.5 [Pinterest Automation Pipeline](#75-pinterest-automation-pipeline)
8. [External Integrations](#8-external-integrations)
9. [Security Architecture](#9-security-architecture)
10. [SEO & Analytics Infrastructure](#10-seo--analytics-infrastructure)
11. [Environment Variables Reference](#11-environment-variables-reference)
12. [GitHub Actions CI/CD](#12-github-actions-cicd)
13. [Deployment Topology](#13-deployment-topology)
14. [Data Flow Diagrams](#14-data-flow-diagrams)
15. [Technical Debt & Known Issues](#15-technical-debt--known-issues)
16. [Conventions & Coding Patterns](#16-conventions--coding-patterns)
17. [Critical Modification Warnings](#17-critical-modification-warnings)

---

## 1. Project Overview & Business Model

**Smart Picks India** is an Amazon affiliate product review and deals platform targeting Indian consumers. It combines a public product catalogue, AI-powered features, a paid digital download store, and an education hub for students.

### Revenue Streams
| Stream | Mechanism |
|---|---|
| **Amazon Affiliate Commission** | Every product `affiliateLink` carries the tag `smartpick07d2-21`. Clicks → purchases → Amazon pays commissions. |
| **Digital Store Sales** | Users buy PDFs/resources via Razorpay. Server issues a one-time secure download token. |
| **Student Hub Pro Subscriptions** | `hubPlan: "pro"` unlocks unlimited AI tool runs. Paid via Razorpay recurring plan (`RAZORPAY_PLAN_ID_STUDENT_PRO`). |

### Core Value Proposition
- Curated product reviews with price history charts showing 90-day trends
- Real-time price drop alerts delivered via Email or Telegram
- AI tools for CS/IT students (interview prep, resume analysis, project ideas, etc.)
- Automated Pinterest marketing generating 6 pins/day via GitHub Actions

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                          │
│   Next.js 16 (React 19) — Vercel Hosting                    │
│   SSG/ISR pages + Client Components                         │
└───────────────────┬─────────────────────────────────────────┘
                    │ /api/v1/* (Rewrites via next.config.ts)
                    │ httpOnly Cookie auth
                    ▼
┌─────────────────────────────────────────────────────────────┐
│               EXPRESS BACKEND (server/)                      │
│   Node.js 18+ · ESM modules · Port 5000                     │
│   Render.com (or self-hosted) hosting                        │
│   Helmet · CORS · Rate Limiting · JWT Auth                   │
└───────────────────┬─────────────────────────────────────────┘
                    │ Mongoose ODM
                    ▼
┌─────────────────────────────────────────────────────────────┐
│               MONGODB ATLAS                                  │
│   Database: smart-picks-auth                                 │
│   Collections: users, sessions, products, pricehistories,    │
│   pricealerts, digitalproducts, purchases, blogs, deals,    │
│   newsletters, otps, tokens, affiliateapplications,         │
│   downloadhistories, favorites, roadmapprogresses           │
└─────────────────────────────────────────────────────────────┘

EXTERNAL SERVICES:
  Google Gemini API  →  AI chatbot, Student Hub tools, Pinterest captions
  Telegram Bot API   →  Price drop alerts, deal announcements to channel
  Razorpay API       →  Digital store payments + Student Pro subscriptions
  Twilio SMS         →  OTP delivery for phone login
  Nodemailer (SMTP)  →  Email verification, password reset, purchase receipts
  ImgBB API          →  Image hosting for Pinterest pins
  Pinterest API v5   →  Automated pin posting (GitHub Actions)
  Google Sheets CSV  →  Product data source (GitHub Actions pipeline)
  Vercel Analytics   →  Web analytics (client-side)
  Google Analytics 4 →  Traffic analytics (via NEXT_PUBLIC_GA_ID)
```

---

## 3. Monorepo Structure

```
smart-picks-india/               ← Root (Next.js frontend)
├── app/                         ← Next.js App Router pages
│   ├── layout.tsx               ← Root layout with all global providers
│   ├── page.tsx                 ← Homepage (SSG, revalidate: 60s)
│   ├── globals.css              ← All CSS variables, Tailwind v4 base styles
│   ├── robots.ts                ← Dynamic robots.txt
│   ├── sitemap.ts               ← Dynamic XML sitemap generator
│   ├── product/[slug]/page.tsx  ← Product detail page (ISR, revalidate: 60s)
│   ├── category/[slug]/         ← Category listing page
│   ├── deals/                   ← Deals browser (DealsClient.tsx)
│   ├── blog/                    ← Blog listing + [slug] detail
│   ├── search/                  ← Client-side Fuse.js search
│   ├── compare/                 ← Product comparison tool
│   ├── dashboard/               ← User dashboard (purchases, profile, alerts)
│   ├── admin/                   ← Admin-only management panel
│   ├── digital-store/           ← Digital products storefront
│   ├── student-hub/             ← AI education tools hub
│   ├── affiliate/               ← Affiliate program application
│   ├── login/ register/         ← Auth pages
│   ├── forgot-password/         ← Password reset flow
│   ├── verify-email/ verify-otp ← Email/phone verification
│   ├── submit-deal/             ← User-submitted deals
│   ├── about/ contact/ terms/   ← Static informational pages
│   ├── privacy-policy/          ← Privacy policy page
│   ├── disclaimer/              ← Affiliate disclaimer
│   └── api/                     ← Next.js route handlers
│       ├── product-image/       ← Image proxy route
│       └── search/              ← Search API handler
│
├── components/                  ← All React UI components (36 files + 2 dirs)
├── hooks/                       ← Custom React hooks
│   ├── use-auth.tsx             ← Auth context provider + useAuth hook
│   ├── useCompare.tsx           ← Product comparison state (context)
│   └── useSearch.ts             ← Debounced Fuse.js search hook
│
├── lib/                         ← Shared pure utilities
│   ├── seo.ts                   ← Metadata, JSON-LD schema generators
│   ├── utils.ts                 ← formatPrice, calculateDiscount helpers
│   ├── affiliate.ts             ← Amazon affiliate link helpers
│   └── highlighter.ts           ← Code syntax highlighter for blog posts
│
├── data/                        ← Static data files (source of truth for products)
│   ├── products.ts              ← Master product catalog (~159KB, 500+ products)
│   ├── categories.ts            ← Category definitions with icons
│   ├── blogPosts.ts             ← Static blog posts
│   ├── deals.ts                 ← Static deals data
│   ├── roadmaps.ts              ← CS/IT learning roadmaps
│   ├── languages.ts             ← Programming languages data for student hub
│   └── pinterest-posted.json   ← Tracker for Pinterest automation
│
├── scripts/                     ← Automation scripts (run by GitHub Actions)
│   ├── generate-products.mjs    ← Reads Google Sheet CSV → generates product entries
│   ├── update-prices.mjs        ← Syncs prices from Google Sheet to products.ts
│   ├── post-to-pinterest.mjs    ← Automated Pinterest pin poster
│   ├── auto-discover-products.mjs ← Product discovery script
│   └── build-local-products.mjs   ← Local product builder utility
│
├── server/                      ← Express backend (separate Node app)
│   ├── server.js                ← Entry point
│   ├── loadEnv.js               ← Custom env loader
│   ├── routes/                  ← 13 Express routers
│   ├── models/                  ← 16 Mongoose schemas
│   ├── middleware/               ← 4 middleware files
│   ├── utils/                   ← 8 utility modules
│   ├── jobs/                    ← 1 cron daemon (priceSync)
│   ├── seeders/                 ← DB seeder scripts
│   ├── data/                    ← Mirror of data/products.ts for backend parsing
│   └── uploads/                 ← Digital product file storage (ephemeral on Render)
│
├── public/                      ← Static assets
├── .github/workflows/           ← 2 GitHub Actions workflows
├── next.config.ts               ← Next.js config (image domains, rewrites, headers)
├── tsconfig.json                ← TypeScript config (@/ path alias = project root)
└── BRAIN.md                     ← This file
```

---

## 4. Frontend — Next.js App

### 4.1 Routing & Pages

The app uses **Next.js App Router** (v16.2.6 — note: this is a non-standard version, verify APIs against `node_modules/next/dist/docs/`).

| Route | Type | Data Source | Notes |
|---|---|---|---|
| `/` | SSG + ISR (60s) | `data/products.ts` + backend `/api/v1/blog` | Blogs merged: dynamic (backend) + static |
| `/product/[slug]` | ISR (60s) | `data/products.ts` → fallback backend `/api/v1/deals/product/:slug` | `generateStaticParams` pre-renders all catalog slugs |
| `/category/[slug]` | Client-rendered | `data/products.ts` | Filter by `product.category` |
| `/deals` | Client-rendered | `DealsClient.tsx` calls `/api/v1/deals` | Has filter/sort UI |
| `/blog` | SSG + ISR | `data/blogPosts.ts` + backend | Merged, sorted by date |
| `/blog/[slug]` | ISR | Static + backend | Markdown rendering |
| `/search` | Client | `useSearch` hook, Fuse.js | Fuzzy search on `data/products.ts` |
| `/compare` | Client | `useCompare` context | State stored in context |
| `/dashboard` | Client (auth required) | `/api/v1/user/*`, `/api/v1/digital-store/*` | Redirects if not logged in |
| `/admin` | Client (admin role) | `/api/v1/admin/*` | Role-checked client-side |
| `/digital-store` | Client | `/api/v1/digital-store/` | Product listings + Razorpay checkout |
| `/student-hub` | Client (auth + hub limits) | `/api/v1/student-hub/*` | Gated by `hubPlan` and daily usage |
| `/login` `/register` | Client | `/api/v1/auth/*` | Social login simulation + OTP login |
| `/sitemap.xml` | Dynamic route (`sitemap.ts`) | `data/products.ts` + backend | Auto-generated XML sitemap |
| `/robots.txt` | Dynamic route (`robots.ts`) | Static config | Standard SEO robots.txt |

### 4.2 Global Layout & Providers

`app/layout.tsx` wraps the entire app in this provider hierarchy (order matters):

```
ThemeProvider (next-themes, light default)
  └── AuthProvider (hooks/use-auth.tsx — manages user JWT state)
        └── CompareProvider (hooks/useCompare.tsx — product comparison)
              └── <Navbar /> <main> <Footer />
                  <AIChatbot />         ← Floating AI chatbot widget
                  <StickyCompareBar />  ← Appears when 2+ items compared
                  <ScrollToTop />       ← Back-to-top button
                  <Analytics />         ← Vercel Analytics
```

**Font loading**: `Inter` (body) + `Outfit` (display/headings) via `next/font/google`. CSS variables `--font-inter` and `--font-outfit` are set on `<body>`.

**Pinterest verification**: `<meta name="p:domain_verify" content="41b175c4...">` in `<head>`.

**Google Analytics**: Conditionally rendered only when `NEXT_PUBLIC_GA_ID` is set.

### 4.3 Data Sources (Static vs Dynamic)

This is the most critical architectural decision: **the product catalog lives in `data/products.ts` as a compiled TypeScript file, not in the database.**

```
data/products.ts  ←→  server/data/products.ts  (mirror copy for backend parsing)
       ↑                        ↑
   Next.js imports         Server regex-parses (no TS transpiler)
   at build/ISR time       for chatbot & price sync
```

**Why this design**: It enables pure SSG/ISR without a database dependency for the public-facing catalog, keeps the site fast even if the backend is down, and makes SEO-critical product pages statically generated. The backend serves as the source of truth for user data, price history, and dynamic content (deals, blogs).

**Product lookup waterfall in `/product/[slug]`**:
1. Try `products.find(p => p.slug === slug)` in the static catalog  
2. If not found, fetch `BACKEND_API_URL/api/v1/deals/product/:slug`  
3. If still not found, call `notFound()` (404)

### 4.4 Component Inventory

| Component | Purpose | Key Props / Behavior |
|---|---|---|
| `Navbar.tsx` | Main navigation (31KB) | Responsive, search inline, auth state, mobile drawer |
| `HeroSection.tsx` | Homepage hero | Accepts `heroProducts[]` from page.tsx |
| `ProductCard.tsx` | Reusable product card | `onClick` triggers `useCompare` add; `RecentlyViewedTracker` on product page |
| `DealsClient.tsx` | Deals page (24KB) | Client-side filtering, sort, pagination; calls `/api/v1/deals` |
| `AIChatbot.tsx` | Floating AI chat widget | Calls `/api/v1/ai/chat`; maintains local message history |
| `AIProductFinder.tsx` | Homepage AI product recommendation | Calls `/api/v1/ai/find-products` |
| `PriceHistoryChart.tsx` | 90-day price chart | Fetches `/api/v1/alerts/history/:slug`; uses Chart.js |
| `PriceAlertTracker.tsx` | Set price alerts UI | Calls `/api/v1/alerts`; requires auth |
| `FlashDealsSection.tsx` | Homepage flash deals with countdown timers | Uses `FlashDealTimer.tsx` |
| `HomePersonalizer.tsx` | Interest-based product feed | Uses `InterestPicker.tsx`, localStorage for interest prefs |
| `RecentlyViewedBar.tsx` | Recently viewed products bar | Reads `recentlyViewed` from localStorage |
| `RecentlyViewedTracker.tsx` | Invisible tracker component | Appends slug to localStorage on mount |
| `StickyCompareBar.tsx` | Bottom sticky compare bar | Reads from `useCompare` context |
| `QuickViewModal.tsx` | Product quick view modal | Radix UI Dialog |
| `BlogClient.tsx` | Blog listing/filtering | Client-side category filter |
| `Skeletons.tsx` | Loading skeleton components | Used during suspense/loading states |
| `GoogleAnalytics.tsx` | GA4 integration | Injects gtag script |
| `NewsletterSection.tsx` | Email newsletter signup | Posts to `/api/v1/newsletter/subscribe` |
| `PinterestShareButton.tsx` | Share to Pinterest button | Uses Pinterest share API |
| `WhatsAppAlertButton.tsx` | WhatsApp alert CTA | Uses `NEXT_PUBLIC_WHATSAPP_NUMBER` env var |
| `ScrollToTop.tsx` | Scroll-to-top button | Appears after scrolling down |
| `FAQAccordion.tsx` | FAQ section | Uses Radix UI Accordion |
| `Breadcrumbs.tsx` | Page breadcrumbs | Accepts `items[]` array |
| `CTASection.tsx` | Buy-now CTA area on product page | Affiliate link + price display |
| `Footer.tsx` | Site footer | Links, social icons, newsletter |
| `CategoryGrid.tsx` | Category grid on homepage | Shows count per category |
| `BlogCard.tsx` | Blog post card | Used in homepage + blog listing |
| `LoadingSkeleton.tsx` | Generic loading skeleton | Lightweight single skeleton |
| `AnimatedSectionHeader.tsx` | Section headers with animation | Supports eyebrow, title, subtitle, action |
| `AmbientBackground.tsx` | Ambient animated background | CSS/canvas decoration for homepage |
| `DealBadge.tsx` | Deal percentage badge | Small badge component |
| `RatingStars.tsx` | Star rating display | Accepts `rating` + `reviewCount` |
| `RelatedProducts.tsx` | Related products section | Filters same category, excludes current slug |
| `AffiliateDisclosure.tsx` | Amazon affiliate disclosure text | Required for FTC compliance |
| `auth/` | Auth form components | Login, Register, OTP, Social buttons |
| `roadmap/` | Roadmap visualizer components | Uses `@xyflow/react` for flow diagrams |

### 4.5 Custom Hooks

#### `hooks/use-auth.tsx` — `AuthProvider` + `useAuth()`
The primary auth state manager. **All API calls use relative URLs (`/api/v1/...`)** which Next.js proxies to the backend.

- `user`: Current user object or `null`
- `loading`: `true` until initial session check resolves
- **Session check on mount**: Calls `GET /api/v1/auth/me` to restore session from httpOnly cookies
- **Logout**: Calls `POST /api/v1/auth/logout` then redirects to `/login`
- Auth state is **not persisted** in localStorage — it relies entirely on cookies. Refresh loads from server.

**⚠️ BREAKING RISK**: If you change this hook's API shape, update every component that calls `useAuth()`.

#### `hooks/useCompare.tsx` — `CompareProvider` + `useCompare()`
- Stores up to 4 products for comparison in React context (not localStorage)
- State is lost on page refresh — by design (lightweight feature)
- Exposes `compareList`, `addToCompare(product)`, `removeFromCompare(slug)`, `clearCompare()`

#### `hooks/useSearch.ts` — `useSearch(query, debounceMs)`
- Debounced Fuse.js search over `data/products.ts`
- Returns `results[]` filtered by fuzzy match on `title`, `category`, `tags`, `description`
- No backend call — pure client-side search

### 4.6 Lib Utilities

#### `lib/utils.ts`
```typescript
formatPrice(price: number): string     // → "₹1,299"  (Indian locale formatting)
calculateDiscount(price, oldPrice): number  // → integer percent
```

#### `lib/seo.ts`
- `siteConfig`: Global site metadata (name, URL, Amazon tag, keywords)
- `generateMetadata(input)`: Returns Next.js metadata object with OG + Twitter cards
- `generateProductSchema(product)`: Schema.org `Product` JSON-LD
- `generateFAQSchema(faqs)`: Schema.org `FAQPage` JSON-LD
- `generateArticleSchema(article)`: Schema.org `Article` JSON-LD

**Amazon tag**: `smartpick07d2-21` (hardcoded fallback; overrideable via `NEXT_PUBLIC_AMAZON_TAG`)

#### `lib/affiliate.ts`
Helper utilities for building Amazon affiliate URLs.

#### `lib/highlighter.ts`
Code syntax highlighting for blog posts rendered as Markdown.

---

## 5. Backend — Express Server

### 5.1 Server Bootstrap & Middleware Stack

**Entry point**: `server/server.js` (ESM module, `"type": "module"` in package.json)

**Startup sequence**:
1. Load env vars (`loadEnv.js` — loads `../.env.local` then `../.env`)
2. Apply security middleware stack (in order):
   - `helmet()` — HTTP security headers
   - `sanitizeMongo` — Custom NoSQL injection sanitizer (strips `$` keys and `.` in keys)
   - `preventHpp` — HTTP Parameter Pollution prevention (keeps last value of duplicate query params)
   - `cors()` — Allows: `localhost:3000`, `CLIENT_URL`, any `*.vercel.app`, any localhost port
   - `express.json({ limit: "5mb" })` — Body size limit (5MB for base64 avatar uploads)
   - `cookieParser()`
   - `app.set("trust proxy", 1)` — Required for Render.com and rate limiter IP accuracy
   - `apiLimiter` — 100 req/15min per IP on all `/api/*` routes
   - Request logger middleware
3. Mount all 13 route handlers
4. 404 catch-all handler
5. Global error handler (hides stack trace in production)
6. Connect to MongoDB, then on success:
   - Run `syncProductsFromCatalog()` — syncs `data/products.ts` → MongoDB
   - Run `syncProductPrices()` — logs initial price history
   - Start `initPriceSyncCron()` — 24h price logging daemon
   - Start Express `app.listen(PORT)`

### 5.2 API Route Map

All routes are mounted under `/api/v1/`. Next.js rewrites `/api/v1/:path*` → `BACKEND_API_URL/api/v1/:path*`.

| Prefix | Router File | Auth | Purpose |
|---|---|---|---|
| `/auth` | `routes/auth.js` | Mixed | Register, Login, OTP, Social OAuth, Password Reset |
| `/user` | `routes/user.js` | Protected | Profile, password change, avatar upload, favorites |
| `/alerts` | `routes/alerts.js` | Protected | Price alerts CRUD, price history fetch |
| `/assistant` | `routes/assistant.js` | Optional | Legacy AI assistant |
| `/deals` | `routes/deals.js` | Public | Deal listings, product lookup by slug |
| `/admin` | `routes/admin.js` | Admin only | Full CMS — products, blogs, deals, users, analytics |
| `/digital-store` | `routes/digitalStore.js` | Mixed | Product listings, checkout, downloads, reviews |
| `/student-hub` | `routes/studentHub.js` | Protected + Hub | 10+ AI educational tools |
| `/newsletter` | `routes/newsletter.js` | Public | Email newsletter signup/unsubscribe |
| `/affiliate` | `routes/affiliate.js` | Public | Affiliate program applications |
| `/ai` | `routes/ai.js` | Optional | Homepage chatbot + product finder |
| `/blog` | `routes/blog.js` | Mixed | Blog CRUD (admin write, public read) |
| `/roadmaps` | `routes/roadmapProgress.js` | Protected | Roadmap progress tracking |

**Health check**: `GET /health` — returns server status + version string `"sync-now-v1"`

### 5.3 Authentication System

**Token Strategy**: Dual JWT — short-lived Access Token + long-lived Refresh Token in **httpOnly cookies**.

```
Login → generateAccessToken(userId) [15 min]
      → generateRefreshToken(userId) [7 days]
      → Cookies: accessToken + refreshToken (httpOnly, Secure in production)
      → Session record saved to DB (for revocation)
```

**Token Refresh Flow** (`middleware/auth.js → protect()`):
1. If `accessToken` cookie present → verify with `JWT_ACCESS_SECRET` → attach `req.user`
2. If expired → auto-refresh using `refreshToken` cookie:
   - Verify refresh token signature
   - Check refresh token exists in `sessions` collection (revocation check)
   - Generate new `accessToken`, update cookie, proceed
3. If both fail → 401

**Security features**:
- Account lockout after 5 failed login attempts (15-minute lockout via `lockoutUntil`)
- `failedLoginAttempts` counter reset on successful login
- Auth routes rate-limited: 5 requests/10min via `authLimiter`
- Tokens stored as SHA-256 hashes in DB (not plaintext)
- Social login (Google/GitHub) uses real OAuth PKCE flow; Microsoft falls back to mock
- Email auto-verified on registration (immediate login allowed)

**hubPlan expiry check**: The `protect` middleware also checks if a user's `pro` plan has expired and downgrades them to `free` automatically on each authenticated request.

### 5.4 Database Models (MongoDB/Mongoose)

| Model | Collection | Key Fields | Purpose |
|---|---|---|---|
| `User` | `users` | name, email, phone, password(hashed), role, hubPlan, hubPlanExpiresAt, hubUsage, xp, walletBalance, referralCode, telegramChatId | Central user entity |
| `Session` | `sessions` | userId, refreshToken, userAgent, ipAddress, expiresAt | Active session tracking for JWT revocation |
| `Token` | `tokens` | userId, tokenHash(sha256), type, expiresAt | One-time tokens (email_verification, password_reset) |
| `Otp` | `otps` | phone, codeHash(bcrypt), purpose, expiresAt, resendCooldownUntil | SMS OTP records |
| `Product` | `products` | slug, title, asin, category, price, originalPrice, discount, affiliateLink, trending, featured, flashDeal, flashDealEndsAt | MongoDB mirror of `data/products.ts` catalog |
| `PriceHistory` | `pricehistories` | slug, price, date | 90-day rolling price log |
| `PriceAlert` | `pricealerts` | userId, slug, targetPrice, deliveryMethod, isActive | User price watchlist entries |
| `Deal` | `deals` | title, description, image, link, discount, category, expiresAt | Admin-curated deals |
| `Blog` | `blogs` | title, slug, content, image, category, tags, featured, authorName | Dynamic blog posts |
| `Newsletter` | `newsletters` | email, isSubscribed, unsubscribeToken | Email list management |
| `DigitalProduct` | `digitalproducts` | title, slug, type(free/paid/freemium), price, filePath, fileBuffer, coverImageBuffer | Digital download products |
| `Purchase` | `purchases` | userId, productId, orderId, paymentId, status, secureToken, downloadCount | Razorpay payment records |
| `DownloadHistory` | `downloadhistories` | userId, productId, purchaseId, ipAddress | Download audit log |
| `Favorite` | `favorites` | userId, productId | Digital store bookmarks |
| `AffiliateApplication` | `affiliateapplications` | name, email, website, reason | Affiliate program leads |
| `RoadmapProgress` | `roadmapprogresses` | userId, roadmapId, completedNodes | Student roadmap completion tracking |

**⚠️ CRITICAL**: The `Product` model in MongoDB is a **derived replica** of `data/products.ts`. It is rebuilt every server restart via `syncProductsFromCatalog()`. **Never treat MongoDB products as the source of truth** — changes made directly to MongoDB will be **overwritten on next server restart**. Edit `data/products.ts` instead.

### 5.5 Background Jobs & Cron Daemons

#### Startup Jobs (run once on MongoDB connect)
1. **`syncProductsFromCatalog()`** (`server/utils/priceSync.js`)
   - Regex-parses `data/products.ts` (no TypeScript transpiler — pure string regex)
   - For each product: upserts to `products` collection by slug
   - **Deletes** products from MongoDB that no longer exist in `data/products.ts`
   - Flash deal expiry set to `now + 3.75 hours` for newly created products

2. **`syncProductPrices()`** (`server/utils/priceSync.js`)
   - Reads all products from MongoDB
   - For each product: checks if price changed since last history entry
   - If changed: creates new `PriceHistory` record
   - If price **dropped**: triggers `checkAndTriggerAlerts()` + `postDealToChannel()`

3. **`initPriceSyncCron()`** (`server/jobs/priceSync.js`)
   - First seeds 90-day retroactive price history if none exists (random walk simulation)
   - Then schedules `runDailyPriceLog()` every 24 hours via `setInterval`
   - `runDailyPriceLog()`: adds ±3% simulated daily variation, purges records >90 days old

**⚠️ NOTE**: The price sync uses **simulated price variation** (±3–4% random walk), NOT real Amazon API prices. Real price changes only occur when `data/products.ts` is updated (via GitHub Actions `update-prices.mjs`).

### 5.6 Server Utilities

#### `server/utils/gemini.js`
- `GEMINI_MODELS` cascade: `["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.0-pro"]`
- `callGemini(systemPrompt, userPrompt, responseJson?)`: Tries each model in sequence, falls back to next on quota errors (429/503/rate_limit). Returns `null` if all models exhausted.
- `cleanGeminiJson(rawText)`: Robust JSON parser that handles code fences, trailing commas, and inline comments — all routes use this to parse AI responses.
- All AI routes have **mock fallbacks** — if `callGemini` returns null, they return hardcoded demo data so the feature degrades gracefully.

#### `server/utils/email.js`
- Uses Nodemailer with SMTP (configured via `SMTP_HOST/PORT/USER/PASS`)
- If SMTP not configured: **logs to console** (mock mode) — no crash
- Exports: `sendEmail()`, `sendVerificationEmail()`, `sendPasswordResetEmail()`

#### `server/utils/telegram.js`
- `sendTelegramMessage(chatId, html)`: Sends HTML-formatted messages via Bot API
- `chatId = null` → uses `TELEGRAM_CHANNEL_ID` (public deal broadcast channel)
- If `TELEGRAM_BOT_TOKEN` not configured: **logs to console** (mock mode)

#### `server/utils/sms.js`
- Twilio-based SMS for OTP delivery
- Mock mode if Twilio credentials missing

#### `server/utils/tokens.js`
- `generateAccessToken(userId)`: Signs JWT with `JWT_ACCESS_SECRET`, 15min expiry
- `generateRefreshToken(userId)`: Signs JWT with `JWT_REFRESH_SECRET`, 7d expiry
- `setAuthCookies(res, accessToken, refreshToken, rememberMe)`: Sets httpOnly cookies
- `clearAuthCookies(res)`: Clears both cookies

#### `server/utils/validation.js`
- Zod v3 schemas for all auth inputs (email, password strength, phone format, etc.)
- `validate(schema)` middleware factory that returns 400 with field errors

---

## 6. Data Layer & State Flow

### 6.1 Static Product Catalog

`data/products.ts` is the **master product catalog**. It is a TypeScript array export:

```typescript
export const products: Product[] = [
  {
    slug: "...",
    title: "...",
    image: "https://m.media-amazon.com/...",
    category: "tech",
    description: "...",
    price: 1299,
    oldPrice: 2499,
    rating: 4.3,
    reviewCount: 1500,
    affiliateLink: "https://www.amazon.in/dp/XXXXXXXXXX?tag=smartpick07d2-21",
    features: [...],
    pros: [...],
    cons: [...],
    featured: false,
    trending: true,
    dealOfTheDay: false,
    tags: [...]
  },
  // 500+ products...
];
```

**How products are added** (automated pipeline):
```
Google Sheets CSV → GitHub Action (daily 10AM IST)
  → scripts/generate-products.mjs
    → Gemini API generates: slug, title, description, features, pros, cons, tags
    → Appends TypeScript object to data/products.ts
    → Also appends Pinterest caption to pinterest-captions.md
    → Commits to main branch
  → scripts/update-prices.mjs  
    → Reads Price column from Sheet
    → Updates matching products in data/products.ts
    → Commits to main branch
→ Vercel auto-deploys new commit
→ server/data/products.ts also updated (same file committed to both paths)
```

### 6.2 Price Sync Pipeline

```
data/products.ts (source)
       ↓ (server startup)
syncProductsFromCatalog()
       ↓
products MongoDB collection (derived replica)
       ↓
syncProductPrices()
       ↓ (if price changed)
PriceHistory collection (90-day rolling log)
       ↓ (if price DROPPED)
checkAndTriggerAlerts() → Email/Telegram to users with active alerts
postDealToChannel()     → Telegram public channel broadcast
```

### 6.3 Client-Side State

| State | Where | Scope | Persistence |
|---|---|---|---|
| Auth user | `AuthProvider` React context | Global | None (cookie-backed, server session) |
| Compare list | `CompareProvider` React context | Global | None (lost on refresh) |
| Theme (dark/light) | `next-themes` ThemeProvider | Global | localStorage (`theme` key) |
| Search results | `useSearch` hook (local state) | Component | None |
| Chat history (chatbot) | `AIChatbot` local state | Component | None |
| Interest preferences | `HomePersonalizer` + `InterestPicker` | Component | localStorage |

### 6.4 localStorage Usage

| Key | Data | Set By | Read By |
|---|---|---|---|
| `recentlyViewed` | `string[]` of slugs (max 10) | `RecentlyViewedTracker` on mount | `RecentlyViewedBar` |
| `theme` | `"light"` \| `"dark"` \| `"system"` | `next-themes` | `next-themes` |
| `userInterests` | `string[]` of category names | `InterestPicker` | `HomePersonalizer` |

---

## 7. Key Business Features

### 7.1 Price Alert & Drop Notification System

**User flow**:
1. User visits `/product/[slug]` → sees `PriceAlertTracker` component
2. User sets target price + chooses delivery: email or telegram
3. Component calls `POST /api/v1/alerts` (requires auth)
4. Server creates `PriceAlert` record: `{ userId, slug, targetPrice, deliveryMethod, isActive: true }`

**Trigger flow** (server-side, during price sync):
1. `syncProductPrices()` detects a price drop
2. Calls `checkAndTriggerAlerts(product, oldPrice)`
3. Queries: `PriceAlert.find({ slug, isActive: true, targetPrice: { $gte: currentPrice } })`
4. For each matching alert:
   - `deliveryMethod === "email"` → `sendEmail()` with HTML price drop template
   - `deliveryMethod === "telegram"` → `sendTelegramMessage(user.telegramChatId, html)`
5. Alert marked `isActive: false` (one-time trigger, user must re-enable)

**Public Telegram channel**: When any price drops, `postDealToChannel(product, oldPrice)` broadcasts to the public `TELEGRAM_CHANNEL_ID` (the `@smartpicks_deals_deal` channel).

**⚠️ Risk**: Because price syncing uses simulated ±3-4% variation, alerts may fire based on random fluctuation rather than real Amazon price changes. This is a known technical debt — see Section 15.

### 7.2 Digital Store & Razorpay Payments

**Product types**: `free` | `paid` | `freemium`

**File storage strategy** (dual, for Render.com ephemeral disk):
1. **Primary**: `server/uploads/digital-products/` (local filesystem)
2. **Fallback**: `fileBuffer` + `fileMimeType` fields in MongoDB (binary storage)
3. **Emergency fallback**: Generates placeholder `.txt` file on the fly

**Checkout flow**:
```
POST /api/v1/digital-store/checkout/order
  → Creates Razorpay order (or sandbox_order_ prefix if no keys)
  → Creates Purchase record { status: "pending" }
  → Returns orderId + keyId to client

Client: Razorpay SDK opens payment modal
  → On success: POST /api/v1/digital-store/checkout/verify
      → Verifies HMAC-SHA256 signature (or auto-approves in sandbox)
      → Sets purchase.status = "completed"
      → Generates secureToken (UUID) for download
      → Sends purchase confirmation email

Download: GET /api/v1/digital-store/download/:token
  → Validates token → serves file or MongoDB buffer
  → Increments downloadCount; enforces downloadLimit (0 = unlimited)
```

**Sandbox mode**: If `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET` are absent, all payments auto-approve. Orders use `sandbox_order_` prefix. Any signature verifies as successful.

### 7.3 Student Hub (AI-Powered Tools)

Protected by `protect` + `checkHubLimits` middleware.

**Free plan limit**: 80 AI tool runs per calendar day (day resets based on `user.updatedAt` date string comparison)

**Pro plan**: Unlimited runs, expires 30 days from purchase. Auto-downgraded to free on expiry.

| Tool | Endpoint | Input | Output |
|---|---|---|---|
| Interview Question Generator | `POST /student-hub/interview-generator` | role, level, company | 8 Q&A pairs with topics |
| Resume Analyzer | `POST /student-hub/resume-analyzer` | resumeText, jobDescription | ATS score, keyword density, section scores, improvements |
| Project Report Writer | `POST /student-hub/project-report` | title, description, techStack | Markdown project report outline |
| DSA Code Evaluator | `POST /student-hub/coding-helper` | code, questionTitle, language | Complexity, bugs, refactored solution |
| Study Buddy Chat | `POST /student-hub/study-assistant` | message, history[] | Markdown reply with code |
| Project Idea Generator | `POST /student-hub/project-idea-generator` | techStack[], level, domain | 3 anti-cliché project ideas with roadmaps |
| Smart Notes Generator | `POST /student-hub/smart-notes/generate` | subject, style, mode, filesContext | Structured notes + key takeaways + formulas |
| Smart Notes Chat | `POST /student-hub/smart-notes/chat` | message, history, filesContext | Contextual reply using file context |
| Flashcard Generator | `POST /student-hub/smart-notes/flashcards` | subject, filesContext | 4–6 flashcards |
| Quiz Generator | `POST /student-hub/smart-notes/quiz` | subject, filesContext | 3–5 MCQ/TrueFalse/FillBlank questions |
| Quiz Submit (XP) | `POST /student-hub/quiz/submit` | score, totalQuestions | XP awarded |
| Leaderboard | `GET /student-hub/leaderboard` | — | Top 10 users by XP |

**XP System**: `awardXp` middleware (`server/middleware/xp.js`) increments `user.xp` on each successful POST to student hub endpoints.

**Gemini file context**: The smart-notes suite accepts `filesContext` — extracted text from PDF/DOCX files parsed client-side using `pdfjs-dist` and `mammoth` libraries.

### 7.4 AI Chatbot & Product Finder

**Chatbot** (`routes/ai.js → POST /ai/chat`):
- System prompt positions it as "SmartPicks AI" focused on Indian product recommendations
- Has access to product catalog context (passed by the frontend from `data/products.ts`)
- Full multi-turn history support via Gemini API `contents[]` array

**Product Finder** (`routes/ai.js → POST /ai/find-products`):
- Takes user budget/requirements as prompt
- Gemini searches/filters products and returns recommendations
- Falls back to price-sorted catalog slice if Gemini quota exhausted

### 7.5 Pinterest Automation Pipeline

**Workflow**: GitHub Actions → `scripts/post-to-pinterest.mjs` (2× daily)

```
Schedule: 9:00 AM IST + 8:00 PM IST (3:30 UTC + 14:30 UTC)

Each run:
1. Fetch Google Sheets CSV (SHEET_CSV_URL)
2. Load data/pinterest-posted.json (dedup tracker)
3. Load pinterest-captions.md (pre-generated captions)
4. For each unposted product (up to 3 per run):
   a. Gemini → generate viral pin title + description
   b. Canvas (@napi-rs/canvas) → draw 1000×1500 pin image with:
      - Brand bar (SmartPicks India red)
      - Product image (fetched from URL)
      - Discount badge (gold circle)
      - Price display with strikethrough old price
      - CTA button "Shop on Amazon →"
   c. ImgBB API → upload image, get hosted URL
   d. Pinterest API v5 → create pin
      - Falls back to Pinterest Sandbox API on 403/401
      - Auto-creates sandbox board if needed
   e. Mark as posted in pinterest-posted.json
5. Commit updated pinterest-posted.json to main (skip-ci)
```

**Board routing**: Each category maps to its own Pinterest board ID via `PINTEREST_BOARD_TECH`, `PINTEREST_BOARD_KITCHEN`, etc. Falls back to `PINTEREST_BOARD_ID` (default).

**Pin link**: Tries to match product name in `pinterest-captions.md` for the SmartPicks India product page URL. Falls back to Amazon affiliate link.

---

## 8. External Integrations

| Service | Usage | Config Keys | Fallback Behavior |
|---|---|---|---|
| **Google Gemini API** | AI chatbot, Student Hub tools, Pinterest captions, product generation | `GEMINI_API_KEY` | Mock responses returned; feature degrades gracefully |
| **Razorpay** | Digital store payments, Student Pro subscriptions | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_PLAN_ID_STUDENT_PRO` | Sandbox auto-approve mode |
| **Telegram Bot API** | Price alerts, deal broadcast channel | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_CHANNEL_ID` | Console log mock |
| **Twilio SMS** | OTP delivery for phone login | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | Console log mock |
| **Nodemailer/SMTP** | Transactional emails (verification, reset, receipts) | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Console log mock |
| **Pinterest API v5** | Automated pin posting | `PINTEREST_TOKEN`, `PINTEREST_BOARD_ID`, category board IDs | Falls back to sandbox API |
| **ImgBB API** | Image hosting for Pinterest pins | `IMGBB_API_KEY` | Script exits with error |
| **Google Sheets CSV** | Product source data | `SHEET_CSV_URL` (public CSV export URL) | Script exits with error |
| **Google OAuth** | Social login | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Falls back to mock flow |
| **GitHub OAuth** | Social login | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Falls back to mock flow |
| **Google Analytics 4** | Web analytics | `NEXT_PUBLIC_GA_ID` | Analytics simply not loaded |
| **Vercel Analytics** | Performance analytics | Auto (Vercel deployment) | No-op locally |
| **Amazon Associates** | Affiliate revenue | Tag: `smartpick07d2-21` (in product links) | N/A |

---

## 9. Security Architecture

### Request Security Layers

```
Incoming request
    │
    ├── Helmet (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, etc.)
    ├── sanitizeMongo (removes $ and . keys from body/query/params)
    ├── preventHpp (deduplicate query array params)
    ├── CORS (allowlist: localhost, CLIENT_URL, *.vercel.app)
    ├── apiLimiter (100 req/15min per IP, all /api/* routes)
    ├── [auth routes] authLimiter (5 req/10min per IP)
    ├── [protected routes] protect middleware (JWT verify + auto-refresh)
    └── [admin routes] requireAdmin (role check)
```

### Security Decisions & Rationale

| Decision | Reason |
|---|---|
| httpOnly cookies (not Authorization header) | XSS cannot steal tokens; CSRF mitigated by `SameSite=Lax` |
| SHA-256 hash of email/password tokens in DB | Token compromise doesn't expose plaintext |
| bcrypt for passwords and OTPs | Timing-safe comparison; bcrypt salts prevent rainbow tables |
| Account lockout (5 failed attempts, 15 min) | Brute-force protection |
| Refresh token in DB for revocation | Can invalidate specific sessions (on logout, password change) |
| `filePath` excluded from digital product API responses | Prevents path disclosure |
| HMAC-SHA256 signature verification for Razorpay | Prevents fake payment confirmations |
| `express.json({ limit: "5mb" })` | Prevents body payload DoS |
| `trust proxy: 1` | Accurate IP for rate limiting behind Render/Vercel proxy |

### Known Security Limitations
- **Social login is simulated**: `POST /api/v1/auth/social-login` accepts `provider + accountId + email` from client without real OAuth server-side verification. Google OAuth is real (`/auth/google` → redirect flow), but the `/social-login` endpoint could be abused by sending arbitrary credentials. Fix: remove or restrict this endpoint in production.
- **NoSQL injection protection is custom**: The `sanitizeMongo` middleware is hand-rolled. Consider adding `mongo-sanitize` or `express-mongo-sanitize` as additional defense.
- **Rate limiter is in-memory**: `express-rate-limit` uses in-memory store; horizontal scaling (multiple server instances) will bypass limits. Use Redis store for production scale.

---

## 10. SEO & Analytics Infrastructure

### On-Page SEO
- Every page uses `generateMetadata()` from `lib/seo.ts` for page-specific OG/Twitter meta
- Product pages: `Product` + `FAQPage` JSON-LD structured data
- Blog pages: `Article` JSON-LD
- Homepage: `FAQPage` JSON-LD
- `app/sitemap.ts`: Dynamic sitemap listing all product and blog slugs
- `app/robots.ts`: Allows all crawlers, points to sitemap

### Image SEO
- Next.js Image Optimization (`next/image`) for all product images
- Configured domains in `next.config.ts`: `m.media-amazon.com`, `ws-in.amazon-adsystem.com`, `images-na.ssl-images-amazon.com`, `images.unsplash.com`, `picsum.photos`
- Format: `avif` > `webp` (modern format preference)

### Analytics Setup
- **Google Analytics 4**: Add `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` to env to enable
- **Vercel Analytics**: Always active on Vercel deployments (the `<Analytics />` component)
- Pinterest Rich Pins: Domain verified via `<meta name="p:domain_verify">` in layout

---

## 11. Environment Variables Reference

### Frontend (`.env.local` at root)
| Variable | Required | Purpose |
|---|---|---|
| `BACKEND_API_URL` | Yes | Express server URL (e.g. `https://smart-picks.onrender.com`) — defaults to `http://localhost:5000` |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL for metadata |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional | WhatsApp number for deal alerts button |
| `NEXT_PUBLIC_AMAZON_TAG` | Optional | Amazon affiliate tag — defaults to `smartpick07d2-21` |

### Backend (`.env.local` at root, loaded by `server/loadEnv.js`)
| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Yes | JWT access token signing key |
| `JWT_REFRESH_SECRET` | Yes | JWT refresh token signing key |
| `PORT` | No | Express port (default: 5000) |
| `CLIENT_URL` | Yes | Frontend URL for CORS + email links |
| `GEMINI_API_KEY` | Optional | Google Gemini API key (AI features) |
| `TELEGRAM_BOT_TOKEN` | Optional | Telegram bot token |
| `TELEGRAM_CHAT_ID` | Optional | Default Telegram channel ID |
| `TELEGRAM_CHANNEL_ID` | Optional | Public deal broadcast channel ID |
| `RAZORPAY_KEY_ID` | Optional | Razorpay key (sandbox if absent) |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay secret |
| `RAZORPAY_PLAN_ID_STUDENT_PRO` | Optional | Recurring plan ID for Student Pro |
| `SMTP_HOST` | Optional | SMTP server host |
| `SMTP_PORT` | Optional | SMTP port (default: 587) |
| `SMTP_USER` | Optional | SMTP username |
| `SMTP_PASS` | Optional | SMTP password |
| `EMAIL_FROM` | Optional | Sender email address |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth client secret |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Optional | Twilio sender phone number |

### GitHub Actions Secrets (used by workflows)
| Secret | Used By |
|---|---|
| `GEMINI_API_KEY` | `generate-products.mjs`, `post-to-pinterest.mjs` |
| `SHEET_CSV_URL` | `generate-products.mjs`, `update-prices.mjs`, `post-to-pinterest.mjs` |
| `PINTEREST_TOKEN` | `post-to-pinterest.mjs` |
| `IMGBB_API_KEY` | `post-to-pinterest.mjs` |
| `PINTEREST_BOARD_ID` | `post-to-pinterest.mjs` (default board) |
| `PINTEREST_BOARD_TECH/KITCHEN/HOME/GADGETS/FASHION/STUDY` | `post-to-pinterest.mjs` (per-category) |

---

## 12. GitHub Actions CI/CD

### Workflow 1: `update-products.yml` — Daily Product Update (10AM IST daily)

**Job 1: `update-products`**
- Reads Google Sheet CSV via `SHEET_CSV_URL`
- For each row not already in `data/products.ts`: calls Gemini to generate description, features, pros, cons, slug
- Appends TypeScript product object to `data/products.ts`
- Appends Pinterest caption to `pinterest-captions.md`
- Commits: `data/products.ts`, `server/data/products.ts`, `pinterest-captions.md`

**Job 2: `sync-prices`** (runs after Job 1)
- Reads prices from Google Sheet `Price` and `Old Price` columns
- Updates matching products in `data/products.ts` if price differs
- Commits: `data/products.ts`, `server/data/products.ts`

**⚠️ CRITICAL**: Committing to `data/products.ts` triggers a Vercel rebuild. This is the intended CD mechanism — product updates auto-deploy.

### Workflow 2: `pinterest-auto-post.yml` — Pinterest Automation (2×/day)

- 9:00 AM IST + 8:00 PM IST
- Posts up to 3 pins per run (6 pins/day)
- Updates `data/pinterest-posted.json` tracker and commits with `[skip ci]` tag to avoid triggering Vercel rebuilds

---

## 13. Deployment Topology

### Production
```
Frontend:  Vercel (auto-deploy on main branch push)
           URL: https://smart-picks-india.vercel.app
           Build: next build (Next.js 16)
           
Backend:   Render.com (or equivalent Node.js host)
           URL: https://smart-picks-india.onrender.com (example)
           Build: npm install → node server.js
           Environment: Node 18+
           
Database:  MongoDB Atlas (cloud-managed)
           
File Storage: Render ephemeral disk (uploads/) + MongoDB binary fallback
```

### Local Development
```bash
# Terminal 1: Frontend
cd smart-picks-india/
npm run dev           # Starts Next.js on localhost:3000 (webpack mode)

# Terminal 2: Backend
cd smart-picks-india/server/
npm run dev           # Starts nodemon on localhost:5000

# Required: MongoDB running locally or MONGODB_URI pointing to Atlas
```

**Dev proxy**: `next.config.ts` rewrites `/api/v1/:path*` → `http://localhost:5000/api/v1/:path*`, so the frontend always uses relative URLs.

---

## 14. Data Flow Diagrams

### User Registration Flow
```
Client → POST /api/v1/auth/register
  → Validate (Zod registerSchema)
  → Check email uniqueness
  → bcrypt hash password
  → Process referral code (credit ₹50 to referrer)
  → Create User (isEmailVerified: true — immediate login allowed)
  → Generate SHA-256 hashed email verification token → save to tokens collection
  → Send verification email (async, non-blocking)
  → Return 201 success
```

### Authenticated Request Flow
```
Client (with cookies) → Any Protected Endpoint
  → protect() middleware reads accessToken cookie
  → jwt.verify(accessToken, JWT_ACCESS_SECRET)
  ↓ (if valid)
  → User.findById(decoded.userId).select("-password")
  → Check lockout, check hubPlan expiry
  → req.user = user → next()
  ↓ (if expired)
  → handleTokenRefresh() reads refreshToken cookie
  → jwt.verify(refreshToken, JWT_REFRESH_SECRET)
  → Session.findOne({ userId, refreshToken }) — revocation check
  → Generate new accessToken
  → setAuthCookies(res, newToken, existingRefreshToken)
  → req.user = user → next()
```

### Price Drop Alert Flow
```
data/products.ts changes (GitHub Action commit)
  → Vercel redeploys frontend
  → Server restart: syncProductsFromCatalog() → Product updated in MongoDB
  → syncProductPrices() detects price ≠ last PriceHistory entry
  → Creates PriceHistory record
  → product.price < latestHistory.price?
    → YES: checkAndTriggerAlerts(product, oldPrice)
      → PriceAlert.find({ slug, isActive: true, targetPrice: $gte currentPrice })
      → For each alert:
          deliveryMethod="email" → sendEmail() to user
          deliveryMethod="telegram" → sendTelegramMessage(user.telegramChatId)
          alert.isActive = false → save
    → YES: postDealToChannel(product, oldPrice)
      → sendTelegramMessage(null, html) → TELEGRAM_CHANNEL_ID broadcast
```

---

## 15. Technical Debt & Known Issues

### High Priority
1. **Simulated prices, not real Amazon prices**: The price sync uses random ±3-4% variation around the base price in `data/products.ts`. There is no Amazon Product Advertising API integration. Price alerts therefore fire on artificial fluctuations. Fix: integrate Amazon PA-API or a price scraper.

2. **`/api/v1/auth/social-login` is insecure**: This endpoint accepts any `provider + accountId + email` from the client and creates/logs in a user without server-side OAuth verification. The real Google OAuth flow (`/auth/google` redirect) is properly secured, but this endpoint is a backdoor. Fix: remove it or require a verifiable ID token.

3. **Server `data/products.ts` is regex-parsed**: `server/utils/priceSync.js` uses regex (`entry.match(/\{[\s\S]*?\}/g)`) to parse the TypeScript file. This is brittle — multiline strings, nested objects, or template literals in product data can break the parser. Fix: use a proper TS/JSON data file or JSON co-source.

4. **Rate limiter uses in-memory store**: Does not work correctly with multiple server instances. Fix: add Redis store (`rate-limit-redis`).

### Medium Priority
5. **No image proxy for Amazon images**: Product images served directly from `m.media-amazon.com`. If Amazon changes their CDN URLs or throttles, images break. The Next.js Image Optimization does cache them, but only after first request.

6. **`getStaticParams` not paginated**: `generateStaticParams()` on the product page returns ALL products, which could cause very long build times as the catalog grows.

7. **User `hubUsage` reset logic is fragile**: The daily reset checks `new Date(user.updatedAt).toDateString() !== new Date().toDateString()`. Any non-POST request that touches `user.updatedAt` will reset the window. Fix: use a dedicated `hubUsageResetDate` field.

8. **Digital file storage on ephemeral disk**: Render.com free tier loses uploaded files on restart. The MongoDB binary buffer fallback works, but storing large files in MongoDB is not ideal. Fix: use S3 or Cloudinary for file storage.

### Low Priority
9. **No refresh token rotation**: The current flow keeps the same refresh token alive for 7 days. Implement token rotation (issue new refresh token on each refresh) to reduce replay attack window.

10. **`pinterest-captions.md` grows unbounded**: The file is appended to indefinitely. Consider archiving or trimming periodically.

11. **`data/products.ts` is 159KB**: Importing this file in every page increases bundle size. Consider splitting by category or moving to a JSON format that can be lazy-loaded.

---

## 16. Conventions & Coding Patterns

### Frontend
- **TypeScript** throughout the frontend (`@/` alias = project root via `tsconfig.json`)
- **Tailwind CSS v4** with custom design tokens in `globals.css`
- **Server Components by default**; add `"use client"` only when necessary
- **Async Server Components** for data fetching (no `useEffect` in page components)
- **ISR with `revalidate = 60`**: Both homepage and product pages use 60-second revalidation
- **Radix UI** for accessible interactive primitives (Dialog, Accordion, Dropdown)
- **Framer Motion** for animations
- **Lucide React** for icons
- **`cn()` pattern** via `clsx` + `tailwind-merge` for conditional classNames

### Backend
- **ESM modules** throughout (`"type": "module"` in server/package.json)
- **Async/await** + `next(err)` error forwarding pattern in all route handlers
- **Zod v3** for server-side input validation (note: frontend uses Zod v4)
- **All services degrade gracefully**: Email, Telegram, Twilio, Gemini — all have mock fallbacks
- **Route handler pattern**:
  ```javascript
  router.post("/endpoint", [middleware...], async (req, res, next) => {
    try {
      // ... handler logic
    } catch (err) {
      next(err); // Always forward to global error handler
    }
  });
  ```
- **Response shape**: Always `{ success: true/false, message: "...", ...data }`

### Database
- All models use `{ timestamps: true }` (auto `createdAt` + `updatedAt`)
- `slug` fields are the cross-system identifier linking `data/products.ts` ↔ `products` collection ↔ `pricehistories` ↔ `pricealerts`
- Password and token fields NEVER returned in API responses (Mongoose `.select("-password")`)

### Naming Conventions
- **Page files**: `page.tsx` in App Router directories
- **Component files**: PascalCase `.tsx`
- **Hook files**: `use-*.tsx` or `use*.ts`
- **Server routes**: camelCase `.js` in `routes/`
- **Models**: PascalCase `.js` in `models/`
- **Utilities**: camelCase `.js` in `utils/`
- **Scripts**: kebab-case `.mjs` in `scripts/`

---

## 17. Critical Modification Warnings

### ⛔ DO NOT modify without understanding cascading effects

| File/Area | Risk Level | Why |
|---|---|---|
| `data/products.ts` | 🔴 Critical | This is the source of truth for 500+ products. Syntax errors break the entire site build. The server regex parser is fragile. GitHub Action auto-commits here. |
| `server/utils/priceSync.js → syncProductsFromCatalog()` | 🔴 Critical | Runs on every server restart. Any bug here can wipe the MongoDB products collection (it deletes products not in catalog). |
| `server/middleware/auth.js → protect()` | 🔴 Critical | Every authenticated endpoint uses this. Breaking it locks all logged-in users out. |
| `hooks/use-auth.tsx` | 🔴 Critical | Global auth state. Changing the `User` interface shape requires updating every component that reads user properties. |
| `next.config.ts → rewrites` | 🔴 Critical | The `/api/v1/:path*` rewrite is how the frontend reaches the backend. Breaking this disconnects all API calls. |
| `server/utils/gemini.js → callGemini()` | 🟡 High | All AI features depend on this. The model cascade order matters (fastest model first). Changing `GEMINI_MODELS` array order affects performance. |
| `server/models/User.js` | 🟡 High | Adding required fields without defaults will fail for existing users. Changing `hubPlan` enum breaks subscription checks across 5+ files. |
| `server/routes/auth.js` | 🟡 High | 871 lines. OAuth callbacks have hardcoded redirect URI patterns that must match OAuth app settings. |
| `data/pinterest-posted.json` | 🟠 Medium | Committing changes to this file without `[skip ci]` triggers a Vercel rebuild unnecessarily. The GitHub Action uses `[skip ci]` correctly. |
| `scripts/generate-products.mjs` | 🟠 Medium | Writes directly to `data/products.ts`. A bad run can corrupt the file. Always test with a dry run before modifying the script. |
| `.github/workflows/update-products.yml` | 🟠 Medium | Changes to the commit file pattern must match what the scripts actually write. Otherwise changes are not committed or unintended files are committed. |

### Adding a New Product Category
1. Add to `data/categories.ts`
2. Add a matching Pinterest board secret in GitHub Secrets and `BOARD_IDS` in `scripts/post-to-pinterest.mjs`
3. No backend changes needed (category is a free-form string field)

### Adding a New API Endpoint
1. Create handler in appropriate `server/routes/*.js` file
2. If auth-protected: add `protect` middleware before handler
3. If admin-only: add `requireAdmin` after `protect`
4. If student-hub: add `checkHubLimits` and `awardXp` middleware
5. Mount in `server/server.js` (or it's already mounted if adding to existing router)
6. The Next.js proxy handles routing automatically (no `next.config.ts` changes needed)

### Changing the JWT Secret
- Changing `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` immediately invalidates ALL existing tokens
- All users will be logged out on their next request
- Flush the `sessions` collection in MongoDB after rotating secrets

### Deploying to a New Backend Host
1. Update `BACKEND_API_URL` in the frontend `.env.local`
2. Update `CLIENT_URL` in the backend `.env.local` (for CORS and email links)
3. Ensure the new host runs Node.js 18+
4. Set `trust proxy: 1` is already in `server.js` — ensure the host is behind a proxy
5. The `uploads/` directory is ephemeral on most hosts — verify MongoDB binary buffer fallback works
6. Run `npm run seed:store` to seed initial digital products: `cd server && npm run seed:store`
