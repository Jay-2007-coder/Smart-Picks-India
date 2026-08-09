# Smart Picks India — Engineering Deep Dive

> **Purpose**: Onboarding guide for new engineers. Every file name, function name, and code snippet used here is pulled directly from the repo.

---

## 1. Tech Stack + Why

| Layer | Technology | Role in THIS project |
|---|---|---|
| **Frontend Framework** | Next.js 16.2.6 (React 19) | App Router, SSR/SSG for product pages, API proxy via `rewrites()` |
| **Frontend Language** | TypeScript 5 | Type-safe components, hooks, and server functions |
| **Styling** | TailwindCSS v4 + vanilla CSS | `app/globals.css` defines the full design system; Tailwind utility classes in JSX |
| **Backend Framework** | Express 4 (Node.js ≥18) | REST API server living in `server/` — completely separate runtime from Next.js |
| **Database** | MongoDB (via Mongoose 8) | Document store for Users, Products, Deals, Sessions, PriceHistory, PriceAlerts, etc. |
| **Auth** | JWT (access + refresh token pair) stored in HttpOnly cookies | Dual-token rotation with DB-backed session revocation |
| **AI** | Google Gemini API (`@google/generative-ai`) | Product recommendations, chatbot, compare tool, student-hub AI tools |
| **Payments** | Razorpay (`razorpay` SDK) | Student Hub "Pro" subscription checkout |
| **Notifications** | Nodemailer (email) + Twilio (SMS/OTP) + custom Telegram bot | Price drop alerts, email verification, OTP login |
| **Analytics** | Vercel Analytics + Google Analytics 4 | Page-level and event-level tracking |
| **Hosting (FE)** | Vercel | Serverless deployment of the Next.js app |
| **Hosting (BE)** | Render (inferred from BRAIN.md comments) | Node/Express server deployment |
| **Image processing** | `@napi-rs/canvas` | Server-side OG image generation (`app/og/`) |
| **UI primitives** | Radix UI (accordion, dialog, dropdown, toast) | Accessible headless component base |
| **Animations** | Framer Motion 12, Three.js | Hero section 3D animations, micro-interactions |
| **Rate Limiting** | `express-rate-limit` | API and auth endpoint brute-force protection |
| **Schema validation** | Zod (both FE and BE) | Request body validation on the Express routes |

---

## 2. How the Backend Works (Step-by-Step Mechanics)

### Entry Point: `server/server.js`

The server boots in this precise order:

```
1. import "./loadEnv.js"           ← loads .env.local then .env from repo root
2. const app = express()           ← create Express app
3. Middleware stack applied (see below)
4. 13 route routers mounted
5. 404 + global error handlers registered
6. mongoose.connect(MONGODB_URI)   ← connect to MongoDB
7. On successful connect:
   a. Ensure critical indexes exist (slug, refreshToken, email, etc.)
   b. syncProductsFromCatalog()    ← parse products.ts → upsert to MongoDB
   c. syncProductPrices()          ← update price fields in Product docs
   d. initPriceSyncCron()          ← seed 90-day price history + set 24h setInterval
   e. app.listen(PORT)             ← start HTTP server on port 5000
```

### Middleware Stack (applied globally, in order)

```
helmet()          → Sets security HTTP headers (CSP, HSTS, etc.)
sanitizeMongo()   → Strips any key starting with $ or containing . from req.body/query/params
preventHpp()      → Collapses duplicate query params to last value (prevents array injection)
cors()            → Whitelists localhost:3000, CLIENT_URL, *.vercel.app in production
express.json()    → Parses JSON bodies up to 5 MB (supports base64 avatar uploads)
cookieParser()    → Parses HttpOnly cookies so auth middleware can read accessToken/refreshToken
app.set("trust proxy", 1) → Correct IP for rate limiter behind Vercel/Render reverse proxy
apiLimiter        → Applied to /api/* — 100 req / 15 min per IP
request logger    → console.log("[API Request]: METHOD /path")
```

### Route Registration

All routes share the prefix `/api/v1/`:

```
/api/v1/auth         → authRouter      (register, login, OAuth, OTP, logout)
/api/v1/user         → userRouter      (profile, password change, image upload)
/api/v1/alerts       → alertsRouter    (price alert CRUD + check)
/api/v1/assistant    → assistantRouter (AI chatbot endpoint)
/api/v1/deals        → dealsRouter     (community deal feed, product pages, flash deals)
/api/v1/admin        → adminRouter     (guarded by requireAdmin middleware)
/api/v1/digital-store → digitalStoreRouter (products, purchases, downloads)
/api/v1/student-hub  → studentHubRouter (AI tools, resume, interview prep, etc.)
/api/v1/newsletter   → newsletterRouter
/api/v1/affiliate    → affiliateRouter
/api/v1/ai           → aiRouter        (recommend + compare endpoints)
/api/v1/blog         → blogRouter
/api/v1/roadmaps     → roadmapProgressRouter
GET /health          → health check endpoint
```

### Full Request Lifecycle (Email Login Example)

```
POST /api/v1/auth/login
│
├─ helmet() — adds security headers
├─ sanitizeMongo() — strips $ keys from body
├─ preventHpp() — de-duplicates query params
├─ cors() — validates Origin header
├─ express.json() — parses { email, password, rememberMe }
├─ cookieParser() — reads cookies (not relevant here, no cookies sent yet)
├─ apiLimiter — 100 req/15min check passes
├─ Request logger — logs "POST /api/v1/auth/login"
│
└─ authRouter.post("/login", authLimiter, validate(loginSchema), handler)
        │
        ├─ authLimiter — 5 attempts / 10 min strict check
        ├─ validate(loginSchema) — Zod parses body, returns 400 on failure
        └─ async handler:
              1. User.findOne({ email })                      ← MongoDB lookup
              2. user.isLocked()                              ← check lockoutUntil
              3. bcrypt.compare(password, user.password)      ← verify hash
              4. If wrong: user.failedLoginAttempts++, save, return 401
              5. If right: reset attempts, add loginHistory entry, save
              6. generateAccessToken(userId)                  ← JWT, 15m expiry
              7. generateRefreshToken(userId)                 ← JWT, 7d expiry
              8. new Session({...refreshToken...}).save()     ← DB session record
              9. setAuthCookies(res, accessToken, refreshToken, rememberMe)
             10. res.json({ success: true, user: {...} })
```

Key files: `server/routes/auth.js` | `server/utils/tokens.js`

### Authentication Implementation (Dual-Token)

**Token creation** (`server/utils/tokens.js`):
```js
generateAccessToken(userId)  → jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
generateRefreshToken(userId) → jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" })
```

**Cookie storage** (`setAuthCookies`):
- `accessToken` cookie: `httpOnly: true`, `secure` in prod, `sameSite: "lax"`, `maxAge: 15min`
- `refreshToken` cookie: same flags, `maxAge: 7d` if `rememberMe`, else session cookie

**Verification** (`server/middleware/auth.js` → `protect(req, res, next)`):
```
1. Read req.cookies.accessToken
2. If present: jwt.verify(accessToken, ACCESS_TOKEN_SECRET)
   → decoded.userId → User.findById(id).select("-password")
   → Check user.isLocked()
   → Check hubPlan expiry, downgrade if needed
   → req.user = user; next()
3. If TokenExpiredError or no accessToken:
   → handleTokenRefresh(req, res, next, refreshToken)
      a. jwt.verify(refreshToken, REFRESH_TOKEN_SECRET)
      b. Session.findOne({ userId, refreshToken }) ← DB revocation check
      c. User.findById(userId)
      d. generateAccessToken(userId)
      e. setAuthCookies(res, newAccessToken, refreshToken, hasExpiry)
      f. req.user = user; next()
```

**Admin gate**: `requireAdmin` middleware checks `req.user.role === "admin"`.

### Database Queries — Real Examples

**Fetch product by slug:**
```js
// server/routes/deals.js line 68
let product = await Product.findOne({ slug });
```

**Upsert daily price log:**
```js
// server/jobs/priceSync.js line 61
await PriceHistory.findOneAndUpdate(
  { slug: product.slug, date: { $gte: today, $lt: tomorrow } },
  { slug: product.slug, price: variedPrice, date: new Date() },
  { upsert: true, new: true }
);
```

**Populate deal submitter:**
```js
// server/routes/deals.js line 34
const deals = await Deal.find({}).populate("submittedBy", "name profileImage").sort({ score: -1 });
```

**Session revocation lookup:**
```js
// server/middleware/auth.js line 69
const dbSession = await Session.findOne({ userId: decoded.userId, refreshToken });
```

### Error Handling

Every route handler wraps its body in `try { ... } catch (err) { next(err) }`. The global error handler at the bottom of `server.js`:
```js
app.use((err, req, res, next) => {
  console.error("🔥 Error caught by Express:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected server error occurred",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});
```
Stack trace is stripped in production. Zod validation errors short-circuit in the `validate()` middleware factory with structured field errors.

---

## 3. How the Frontend Works (Step-by-Step Mechanics)

### Boot Sequence

```
Browser → GET /
→ Next.js App Router serves app/layout.tsx as the root shell
→ RootLayout renders:
    <ThemeProvider>          ← next-themes (class-based light/dark)
      <AuthProvider>         ← hooks/use-auth.tsx React Context
        <CompareProvider>    ← hooks/useCompare.tsx React Context
          <Navbar />
          <main>{children}</main>   ← page.tsx renders here
          <Footer />
          <AIChatbot />
          <StickyCompareBar />
          <ScrollToTop />
          <Analytics />      ← Vercel Analytics
        </CompareProvider>
      </AuthProvider>
    </ThemeProvider>
```

On mount, `AuthProvider` calls `checkSession()`:
```js
// hooks/use-auth.tsx line 45
const checkSession = async () => {
  const response = await fetch("/api/v1/auth/me");
  // ...
  if (response.ok && data.success) setUser(data.user);
};
useEffect(() => { checkSession(); }, []);
```
This fires a request to the backend on every fresh page load to hydrate `user` state from the existing cookie.

### Routing

Next.js App Router uses filesystem-based routing. The `app/` directory maps to:

```
app/page.tsx              → /                 (Home — Server Component, revalidate: 60s)
app/product/[slug]/       → /product/:slug    (Product detail page)
app/deals/                → /deals
app/student-hub/          → /student-hub
app/dashboard/            → /dashboard        (Protected — redirects to /login)
app/login/                → /login
app/register/             → /register
app/blog/                 → /blog
app/compare/              → /compare
app/digital-store/        → /digital-store
app/admin/                → /admin            (Admin panel)
app/api/product-image/    → /api/product-image (Next.js Route Handler)
app/api/search/           → /api/search       (Next.js Route Handler)
```

The `app/page.tsx` home page is a **Server Component** with `export const revalidate = 60` (ISR, re-generates every 60 seconds). Client-interactive sections like `FlashDealsSection`, `AIChatbot`, and `HomePersonalizer` are separate `"use client"` components.

### State Management

There is **no Redux or Zustand**. State lives in three layers:

| Layer | What lives here | Implementation |
|---|---|---|
| **Global Auth State** | `user`, `loading`, all auth functions | React Context in `hooks/use-auth.tsx` |
| **Global Compare State** | `compareList` array of products | React Context in `hooks/useCompare.tsx` |
| **Local Component State** | UI state (modals, filters, loading spinners) | `useState` inside components |
| **Server-fetched Data** | Products, deals, blog posts | Next.js `fetch()` in Server Components or `useState` + `useEffect` in Client Components |
| **Persistent Client State** | Recently viewed products, user interests | `localStorage` (read in `RecentlyViewedTracker`, `HomePersonalizer`) |

### How the Frontend Fetches Data

The frontend uses the **native `fetch()` API** — no Axios, no React Query. All calls go to relative paths like `/api/v1/...` which are transparently proxied by Next.js to the Express backend (see Section 4).

```js
// hooks/use-auth.tsx — login example
const response = await fetch("/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(credentials),
});
```

Auth state changes are reflected immediately by calling `setUser(data.user)` after a successful response.

---

## 4. How Frontend and Backend Are Connected

### The Proxy Bridge (`next.config.ts`)

This is the critical connection point. Next.js rewrites any call to `/api/v1/*` to the Express backend:

```ts
// next.config.ts line 48
async rewrites() {
  return [
    {
      source: "/api/v1/:path*",
      destination: `${process.env.BACKEND_API_URL || "http://localhost:5000"}/api/v1/:path*`,
    },
  ];
},
```

**What this means for developers:**
- Frontend calls `fetch("/api/v1/auth/login")` — same origin, no CORS
- Next.js server-side intercepts the request and proxies it to `http://localhost:5000/api/v1/auth/login`
- The response (including `Set-Cookie` headers) flows back to the browser
- In production, `BACKEND_API_URL` points to the Render Express server URL

**No client-side CORS issue** because the request appears to come from the same domain (`smart-picks-india.vercel.app`). CORS on the Express server (`allowedOrigins`) is only needed for direct server-to-server calls or local development.

### Complete Feature Trace: User Login

**Step 1 — User clicks "Login" in `app/login/`**

The login page form uses `react-hook-form` with Zod resolvers. On submit, it calls `login()` from `useAuth()`:

```tsx
// Login page component (inside app/login/)
const { login } = useAuth();
const onSubmit = async (data) => {
  const result = await login(data);
  if (result.success) router.push("/dashboard");
};
```

**Step 2 — Frontend sends the API request**

```js
// hooks/use-auth.tsx line 67
const response = await fetch("/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "jay@example.com", password: "P@ssw0rd!", rememberMe: true }),
});
```

**Step 3 — Next.js proxy intercepts and forwards**

Next.js rewrites `/api/v1/auth/login` → `http://localhost:5000/api/v1/auth/login`

**Step 4 — Express receives on `authRouter.post("/login")`**

Route: `server/routes/auth.js` line 258

Middleware chain: `authLimiter` → `validate(loginSchema)` → handler

Handler logic:
```js
// 1. Find user
user = await User.findOne({ email });
// 2. Check lock
if (user.isLocked()) return 403
// 3. Verify password
const isMatch = await bcrypt.compare(password, user.password);
// 4. Generate tokens
const accessToken = generateAccessToken(user._id.toString()); // JWT, 15m
const refreshToken = generateRefreshToken(user._id.toString()); // JWT, 7d
// 5. Persist session
await new Session({ userId, refreshToken, userAgent, ipAddress, expiresAt }).save();
// 6. Set cookies
setAuthCookies(res, accessToken, refreshToken, rememberMe=true);
```

**Step 5 — Backend sends response**

```json
HTTP 200
Set-Cookie: accessToken=<jwt>; HttpOnly; SameSite=Lax; Max-Age=900
Set-Cookie: refreshToken=<jwt>; HttpOnly; SameSite=Lax; Max-Age=604800

{
  "success": true,
  "user": {
    "id": "...",
    "name": "Jay",
    "email": "jay@example.com",
    "role": "user",
    "hubPlan": "free",
    "xp": 0
  }
}
```

**Step 6 — Frontend receives and updates state**

```js
// hooks/use-auth.tsx line 73
const data = await response.json();
if (response.ok && data.success) {
  setUser(data.user);           // ← React Context state update
  return { success: true, message: "Logged in successfully" };
}
```

**Step 7 — UI re-renders**

`setUser(data.user)` triggers a re-render of every component that calls `useAuth()`. The `Navbar` immediately shows the user avatar/name. The login page redirects to `/dashboard` via `router.push()`.

### Auth Tokens in Subsequent Requests

The cookies are `httpOnly` — JavaScript cannot read them. The browser automatically attaches them to every same-origin request. The Express `protect` middleware reads `req.cookies.accessToken` and `req.cookies.refreshToken` via `cookie-parser`.

When the 15-minute access token expires, the `protect` middleware silently re-issues a new one from the refresh token in a DB-validated rotation, and the original request continues without the user noticing.

### CORS and Environment Configs

| Env | Frontend Origin | Backend URL | CORS |
|---|---|---|---|
| **Dev** | `http://localhost:3000` | `http://localhost:5000` | `localhost:3000` whitelisted |
| **Prod** | `https://smart-picks-india.vercel.app` | `https://smartpicksindia-api.onrender.com` (or similar) | `CLIENT_URL` + `*.vercel.app` whitelisted |

The Express CORS config (`server.js` lines 73–99) explicitly allows `*.vercel.app` as a suffix match for preview deployments.

---

## 5. Database Connection

### Connection Setup

```js
// server/server.js line 28
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart-picks-auth";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    // ensure indexes, run sync, start server
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // hard crash — no partial startup
  });
```

Mongoose handles the connection pool internally (default pool size of 5). No explicit pool configuration is set.

### Configuration

Environment variables (read from `../.env.local` or `../.env` relative to `server/`):

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart-picks-auth
```

The `loadEnv.js` reads from the **project root's** `.env.local` by walking `../` from the `server/` dir.

### Indexes Created at Startup

```js
await db.collection("products").createIndex({ slug: 1 }, { unique: true, background: true });
await db.collection("pricehistories").createIndex({ slug: 1, recordedAt: -1 }, { background: true });
await db.collection("pricealerts").createIndex({ slug: 1, isActive: 1 }, { background: true });
await db.collection("sessions").createIndex({ refreshToken: 1 }, { background: true });
await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true }); // TTL
await db.collection("users").createIndex({ email: 1 }, { unique: true, background: true });
```

The TTL index on `sessions.expiresAt` auto-deletes expired session records from MongoDB — no manual cleanup needed.

### Full Schema Example: `User` Model

```js
// server/models/User.js
const UserSchema = new mongoose.Schema({
  name:                String (required, trim)
  email:               String (required, unique, lowercase)
  phone:               String (unique, sparse — allows multiple nulls)
  password:            String (required only if no socialAccounts)
  isEmailVerified:     Boolean (default: false)
  isPhoneVerified:     Boolean (default: false)
  profileImage:        String (base64 stored in DB!)
  failedLoginAttempts: Number (default: 0) — for lockout
  lockoutUntil:        Date   (null until locked)
  role:                enum["user", "admin"] (default: "user")
  telegramChatId:      String (for price alert delivery)
  socialAccounts:      [{ provider, accountId, email, avatarUrl }]
  loginHistory:        [{ timestamp, ipAddress, device, status }]
  xp:                  Number (default: 0) — Student Hub gamification
  hubPlan:             enum["free", "pro"] (default: "free")
  hubPlanExpiresAt:    Date (null — set to +30 days when plan activated)
  hubUsage:            Number (daily AI call counter)
  hubUsageResetAt:     Date (tracks last reset — avoids save() collision bug)
  referralCode:        String (unique, sparse)
  referredBy:          ObjectId → User
  walletBalance:       Number (default: 0, ₹50 credited per referred user)
}, { timestamps: true })

// Instance method
UserSchema.methods.isLocked = function() {
  return !!(this.lockoutUntil && this.lockoutUntil > Date.now());
};
```

Maps to MongoDB collection: `users`

---

## 6. Full Request-to-Response Diagram

### Login Flow

```
[User fills login form]
        │
        ▼
[app/login/page.tsx]
  react-hook-form onSubmit(data)
        │
        ▼
[hooks/use-auth.tsx → login()]
  fetch("POST /api/v1/auth/login", { body: { email, password } })
        │
        ▼
[next.config.ts rewrites()]
  /api/v1/* → http://localhost:5000/api/v1/*
        │
        ▼
[server/server.js middleware stack]
  helmet → sanitizeMongo → preventHpp → cors → json → cookieParser → apiLimiter → logger
        │
        ▼
[server/routes/auth.js]
  router.post("/login") matched
  → authLimiter (5/10min strict)
  → validate(loginSchema) [Zod parse, 400 on fail]
  → async handler
        │
        ▼
[Business Logic — server/routes/auth.js lines 258–393]
  User.findOne({ email })          ← MongoDB query [users collection]
  user.isLocked()                  ← instance method check
  bcrypt.compare(pw, hash)         ← password verify
  generateAccessToken(userId)      ← server/utils/tokens.js
  generateRefreshToken(userId)     ← server/utils/tokens.js
  new Session({...}).save()        ← MongoDB insert [sessions collection]
  setAuthCookies(res, at, rt)      ← server/utils/tokens.js
        │
        ▼
[HTTP Response]
  200 OK
  Set-Cookie: accessToken (15m, HttpOnly)
  Set-Cookie: refreshToken (7d, HttpOnly)
  Body: { success: true, user: { id, name, email, role, hubPlan, xp } }
        │
        ▼ (proxied back through Next.js)
        ▼
[hooks/use-auth.tsx]
  data = await response.json()
  setUser(data.user)               ← React Context state update
        │
        ▼
[React re-renders all consumers of useAuth()]
  Navbar.tsx → shows user avatar/name
  dashboard/page.tsx → access granted
  login page → router.push("/dashboard")
```

### Product Page Flow (Flash Deals)

```
[User visits /deals]
        │
        ▼
[app/deals/page.tsx OR components/DealsClient.tsx]
  fetch("/api/v1/deals/flash")     ← GET request
        │
        ▼ (Next.js proxy)
        ▼
[server/routes/deals.js router.get("/flash")]
  Product.find({ flashDeal: true, flashDealEndsAt: { $gt: now } })
  → fallback if empty: Product.find({}).filter(p => p.originalPrice > p.price).slice(0,5)
        │
        ▼
[Response]
  { success: true, deals: [ { slug, title, price, oldPrice, flashDealEndsAt, ... } ] }
        │
        ▼
[components/FlashDealsSection.tsx or DealsClient.tsx]
  useState/useEffect sets deals array
  FlashDealTimer.tsx renders countdown per deal
        │
        ▼
[Re-render with deal cards]
```

---

## 7. Config & Environment Variables

### Frontend (`/.env.local`)

| Variable | What it controls |
|---|---|
| `BACKEND_API_URL` | Express server URL used by Next.js rewrites. Default: `http://localhost:5000` |
| `NEXT_PUBLIC_SITE_URL` | Used in layout metadata and sitemap generation |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 measurement ID (e.g. `G-XXXXXXXXXX`). Injected in `<head>` if set |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number (e.g. `919876543210`) for the deal alert button |

### Backend (`/server/` reads from `/.env.local` in the project root)

| Variable | What it controls |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` / `ACCESS_TOKEN_SECRET` | Secret for signing 15-min access tokens |
| `JWT_REFRESH_SECRET` / `REFRESH_TOKEN_SECRET` | Secret for signing 7-day refresh tokens |
| `PORT` | Express listen port (default: 5000) |
| `CLIENT_URL` | Allowed CORS origin + OAuth redirect target (e.g. `https://smart-picks-india.vercel.app`) |
| `BACKEND_URL` | Full backend URL used in OAuth redirect URIs |
| `GEMINI_API_KEY` | Google Gemini AI API key |
| `TELEGRAM_BOT_TOKEN` | Telegram bot for price drop notifications |
| `TELEGRAM_CHAT_ID` | Default channel/chat for admin alerts |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payment gateway credentials |
| `RAZORPAY_PLAN_ID_STUDENT_PRO` | Razorpay subscription plan ID for Student Hub Pro |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Real Google OAuth2 credentials (falls back to mock if absent) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Real GitHub OAuth credentials (falls back to mock if absent) |
| `NODE_ENV` | `development` or `production` — controls cookie `secure` flag, stack trace exposure, mock login gate |

### Dev vs Production Differences

| Behavior | Development | Production |
|---|---|---|
| Cookie `secure` flag | `false` (HTTP ok) | `true` (HTTPS only) |
| Stack trace in error response | Included | Stripped |
| Mock social login (`/api/v1/auth/social-login`) | Enabled | **Blocked** (returns 403) |
| CORS | Any `localhost:*` | Only `CLIENT_URL` + `*.vercel.app` |
| Backend URL | `http://localhost:5000` | Render HTTPS URL |

---

## 8. Gaps & Observations

### ⚠️ Known Issues and Design Quirks

**1. `products.ts` is parsed with regex, not TypeScript compilation**

`server/utils/priceSync.js` reads the frontend data file (`data/products.ts`) at runtime using `fs.readFileSync()` + regex patterns like `content.match(/\{[\s\S]*?\}/g)`. This is fragile — any unusual multiline string, nested object, or comment in `products.ts` can silently produce zero products parsed. There is no type safety on the server for this data ingestion.

**2. Environment variable naming inconsistency**

The `.env.example` lists `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`, but `server/utils/tokens.js` and `server/middleware/auth.js` read `process.env.ACCESS_TOKEN_SECRET` and `process.env.REFRESH_TOKEN_SECRET`. These are different key names. The `.env.local` probably has both, but this mismatch will silently fall back to the hardcoded default strings `"access_secret_123456_key"` if the wrong name is used.

**3. Profile images stored as base64 in MongoDB**

`server/routes/user.js` (upload endpoint) stores the base64 image string directly in `user.profileImage`. For users with large avatars, this bloats the `users` collection documents. There's no CDN or object storage (S3/Cloudinary) integration.

**4. Flash deals are simulated, not real**

If no product has `flashDeal: true` in the database, the `/api/v1/deals/flash` endpoint generates fake flash deals from discounted products with a simulated `flashDealEndsAt` of `Date.now() + 3.75 hours`. These are not real Amazon flash deals.

**5. Price history is synthetic**

`server/jobs/priceSync.js` seeds 90 days of retroactive price history with `Math.random()` ±4% fluctuation. The "90-day price chart" users see is completely fabricated price data, not scraped from Amazon.

**6. `scraper.js` exists but status is unclear**

`server/utils/scraper.js` (7.4 KB) exists, suggesting a web scraping utility for live Amazon prices. It is not wired into the main startup or cron job. The price sync actually operates on the CSV/TS catalog files, not live scraping.

**7. `app/api/search/` and `app/api/product-image/` are internal Next.js Route Handlers**

These are NOT proxied to Express — they are pure Next.js API routes. `product-image` proxies Amazon images server-side (avoids mixed-content/referer issues). `search` likely does server-side Fuse.js fuzzy search on the static product catalog.

**8. OAuth is half-implemented**

Google and GitHub OAuth redirect URIs are constructed as `${CLIENT_URL}/api/v1/auth/google/callback`, meaning the callback hits the Next.js proxy which forwards to Express. But the `auth.js` route file has both a real OAuth exchange path and a mock `/social-login` endpoint. Microsoft OAuth is fully mocked (`/login?mock_provider=microsoft` redirect). This works in dev but the real OAuth flow needs careful production URL configuration.

**9. `setInterval` for cron jobs (no persistence)**

The 24-hour price sync uses `setInterval` inside `initPriceSyncCron()`. If the server restarts, the interval resets. On a free-tier Render deployment that spins down after inactivity, this means the cron may fire irregularly or not at all after a cold start.

**10. `Favorite` model exists but usage is unclear**

`server/models/Favorite.js` (656 bytes) is defined but no corresponding route file was found in `server/routes/`. Wishlisting/favorites may be a planned or partially-abandoned feature.

---

## Quick Reference: Key File Map

| Task | File |
|---|---|
| Backend entry point | `server/server.js` |
| Auth middleware (JWT verify + refresh) | `server/middleware/auth.js` |
| Login / Register / OAuth routes | `server/routes/auth.js` |
| Deals & product page routes | `server/routes/deals.js` |
| AI recommendation + compare | `server/routes/ai.js` |
| Token creation + cookie helpers | `server/utils/tokens.js` |
| Zod validation schemas + middleware | `server/utils/validation.js` |
| Price sync + catalog ingestion | `server/utils/priceSync.js` |
| 24h price cron job | `server/jobs/priceSync.js` |
| User model (full schema) | `server/models/User.js` |
| Product model | `server/models/Product.js` |
| Session model (TTL) | `server/models/Session.js` |
| Deal model (hot score algo) | `server/models/Deal.js` |
| Next.js proxy + security headers | `next.config.ts` |
| App shell + global providers | `app/layout.tsx` |
| Auth React Context (all client calls) | `hooks/use-auth.tsx` |
| Rate limiters | `server/middleware/rateLimiter.js` |
| Env variable reference | `.env.example` |
