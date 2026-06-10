# 🤖 Automated Pinterest Posting — Setup Guide

This guide walks you through the **one-time setup** to activate fully automated Pinterest posting for SmartPicks India.

---

## What Gets Built

```
You add 1 row to Google Sheet
         ↓
9:00 AM + 8:00 PM IST — GitHub runs automatically
         ↓
Gemini AI writes the pin title + description
         ↓
Canvas generates a 1000×1500 pin image:
  • Discount badge  • Product name  • Price in ₹  • CTA button  • Brand colors
         ↓
Image uploaded to ImgBB (free, permanent hosting)
         ↓
Pinterest API posts to the right board
         ↓
3 pins per run × 2 runs/day = 6 pins/day = ~180 pins/month 🎉
```

---

## Step 1 — Pinterest Developer Token

1. Go to **[developers.pinterest.com](https://developers.pinterest.com)**
2. Click **"My Apps"** → **"Create App"**
3. Fill in App Name (e.g. `SmartPicks Poster`) and any website URL
4. After creation, go to **"Access tokens"** tab
5. Click **"Generate access token"**
6. Select scopes: `pins:read`, `pins:write`, `boards:read`, `boards:write`
7. Copy the token — this is your `PINTEREST_TOKEN`

---

## Step 2 — Pinterest Board IDs

For each board you want to post to:
1. Open the board on Pinterest in your browser
2. The URL looks like: `pinterest.com/yourusername/your-board-name/`
3. To get the **Board ID**: go to the board, click the **edit (✏️) button** → the URL changes to something like `pinterest.com/yourusername/your-board-name/edit/` — the numeric ID is in the API response.

**Easier method:** Use the Pinterest API Explorer:
1. Go to [developers.pinterest.com/tools/api-explorer](https://developers.pinterest.com/tools/api-explorer)
2. Call `GET /boards` — it will list all your boards with their IDs

You'll get IDs like: `123456789012345678`

Create one board per category you use:
- `Tech & Electronics` → `PINTEREST_BOARD_TECH`
- `Kitchen` → `PINTEREST_BOARD_KITCHEN`
- `Home & Living` → `PINTEREST_BOARD_HOME`
- `Gadgets` → `PINTEREST_BOARD_GADGETS`

Or use **one single board** and only set `PINTEREST_BOARD_ID` as the default.

---

## Step 3 — ImgBB API Key (Free Image Hosting)

1. Go to **[imgbb.com](https://imgbb.com)** and create a free account
2. After logging in, go to **[api.imgbb.com](https://api.imgbb.com)**
3. Your API key will be shown on that page — copy it
4. This is your `IMGBB_API_KEY`

> Free plan allows unlimited uploads — no expiry if you set expiration to `0` (permanent).

---

## Step 4 — Add GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Secret Name | Value | Required? |
|---|---|---|
| `PINTEREST_TOKEN` | Your Pinterest access token | ✅ Required |
| `IMGBB_API_KEY` | Your ImgBB API key | ✅ Required |
| `PINTEREST_BOARD_ID` | Default board ID (fallback for all categories) | ✅ Required |
| `PINTEREST_BOARD_TECH` | Board ID for Tech products | Optional |
| `PINTEREST_BOARD_KITCHEN` | Board ID for Kitchen products | Optional |
| `PINTEREST_BOARD_HOME` | Board ID for Home products | Optional |
| `PINTEREST_BOARD_GADGETS` | Board ID for Gadgets | Optional |
| `PINTEREST_BOARD_FASHION` | Board ID for Fashion | Optional |
| `PINTEREST_BOARD_STUDY` | Board ID for Study/Office | Optional |
| `GEMINI_API_KEY` | Already set ✅ | Already done |
| `SHEET_CSV_URL` | Already set ✅ | Already done |

> **Tip:** If you only have 1 board, just set `PINTEREST_BOARD_ID` and leave all the category-specific ones empty. All products will post to that one board.

---

## Step 5 — Update Your Google Sheet (Optional but Recommended)

Add a new column to your Google Sheet named exactly:
```
pinterest_posted
```

Leave it **blank** for new rows. If you ever want to manually skip a product from being pinned, type `yes` in that cell.

> **Note:** Even without this column, the system automatically tracks posted products in a file called `data/pinterest-posted.json` in your repo. So duplicates are prevented regardless.

---

## Step 6 — Update Your Google Sheet: Add Price Columns

To enable the **discount badge** and **price display** on pin images, add these optional columns to your Google Sheet:

| Column Name | Example | Purpose |
|---|---|---|
| `Price` | `1299` | Current selling price |
| `Old Price` | `2999` | Original MRP (for discount % calculation) |

If left blank, the image still generates beautifully — just without the price and discount badge.

---

## How the Automation Works

### File: `scripts/post-to-pinterest.mjs`
The main script that:
1. Reads your Google Sheet CSV
2. Skips already-posted products (tracked in `data/pinterest-posted.json`)
3. Uses Gemini AI to write a viral pin title + description
4. Draws a professional 1000×1500 pin image with brand colors, discount badge, product image, price, and CTA button
5. Uploads the image to ImgBB
6. Posts to the correct Pinterest board based on product category
7. Marks the product as posted

### File: `.github/workflows/pinterest-auto-post.yml`
Runs at:
- **9:00 AM IST** every day
- **8:00 PM IST** every day

Each run posts **3 pins** → 6 pins/day total.

---

## Testing

To test manually:
1. Go to your GitHub repo → **Actions** tab
2. Click **"Auto Pinterest Poster"** in the left sidebar
3. Click **"Run workflow"** → **"Run workflow"** button
4. Watch the logs to see each step

---

## Troubleshooting

| Error | Fix |
|---|---|
| `Missing PINTEREST_TOKEN` | Add the secret in GitHub Settings → Secrets |
| `Pinterest API error 401` | Token expired — regenerate at developers.pinterest.com |
| `Pinterest API error 403` | Token missing `pins:write` scope — regenerate with correct scopes |
| `ImgBB upload failed` | Check IMGBB_API_KEY is correct |
| `No board ID found for category` | Set `PINTEREST_BOARD_ID` as the default fallback secret |
| `Canvas load image failed` | Image URL is broken or blocked — ensure Image URL column has valid public URLs |

---

## Pin Image Design

Each auto-generated pin looks like this:

```
┌──────────────────────────────┐
│  ✦ SmartPicks India ✦       │  ← Red brand bar
├──────────────────────────────┤
│  Best Amazon Deals in India  │  ← Tagline
│                              │
│  ┌──────────────────────┐    │
│  │                      │    │
│  │   [Product Image]    │  🔴 │  ← Product image (white card bg)
│  │                      │ 20% │  ← Discount badge (gold circle)
│  └──────────────────────┘ OFF │
│                              │
│  🏷️ TECH                    │  ← Category pill (red)
│                              │
│  Sony WH-1000XM5             │
│  Headphones Review...        │  ← Product name (white, bold)
│                              │
│     ~~₹19,999~~              │  ← Old price (struck through)
│        ₹12,990               │  ← Current price (gold, large)
│                              │
│  ┌──────────────────────┐    │
│  │  🛒 Shop on Amazon → │    │  ← CTA button (red)
│  └──────────────────────┘    │
│  smart-picks-india.vercel.app│  ← Site URL
└──────────────────────────────┘
```
