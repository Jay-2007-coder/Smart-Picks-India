# 🛍️ SmartPicks India

SmartPicks India is a premium, full-stack budget-shopping portal and placement preparation platform designed specifically for Indian students and shoppers. The application combines a high-yield affiliate deals aggregator (Amazon/Flipkart alerts, price histories, drop notices) with the **Student Hub**—a comprehensive suite of academic calculators, career tools, and interactive roadmaps.

---

## 🚀 Key Features

### 🛒 1. Smart Deals & Shopping Portal
* **Price History Charts:** Live interactive graphs displaying price fluctuations over 30/90 days to verify genuine deals.
* **Price Drop Alerts:** Save custom price thresholds. The backend scans prices daily and notifies users when target price thresholds are met.
* **Dynamic Search & Filters:** Fast, client-side catalog searching and category filtering powered by indexing.
* **Affiliate Redirects:** Automatic link formatting for Amazon and Flipkart networks.

### 🎓 2. Student Hub Academic & Career Suite
* **Interactive Roadmap Hub:** Career paths for **AI/ML Engineers**, **Web Developers**, and **DevOps Engineers**. Features checkmark module tracking, MongoDB status synchronization, circular progress indicators, and gamified +10 XP notifications with confetti animations.
* **Ecosystem Connection Map:** A React Flow interactive network graph illustrating programming language (JS, Python, C++, SQL, R, Bash, etc.) relations, compiler cores, and drawer resource guides.
* **Placement Application Tracker:** A custom kanban card board mapping company pipelines, OA results, and interview rounds.
* **AI Career Tools:** ATS resume parsing keyword comparisons, interview simulator prompt answer builders, and automated project report outline generators.
* **AI Study Assistant:** Personalized Gemini chat bot assisting in software development, bugs debugging, and subjects learning.
* **DSA Coding Solution Reviewer:** Inspect code blocks for space/time complexity metrics and receive optimized solutions.
* **Academic Calculators:** SGPA/CGPA targets calculator and attendance bunk threshold tracker (to stay safely above 75%).
* **Competitive Leaderboards:** Student profiles sorted by XP milestones, encouraging daily learning.

### 🛡️ 3. Backend Daemon & Automation
* **Price Sync Daemon:** Automated cron workers checking products, logging price changes, and triggering alerts.
* **Telegram Deal Broadcaster:** Automated scheduler bot broadcasting top deals directly to subscriber Telegram channels.
* **NoSQL Security Filters:** Custom sanitation middleware blocking MongoDB query injections and parameter pollutions.

---

## 🛠️ Technology Stack

### Frontend (Next.js Application)
* **Core:** Next.js 16 (App Router), React 19, TypeScript
* **Styling & Motion:** Tailwind CSS, Framer Motion
* **Graphing & Networks:** React Flow (`@xyflow/react`), Chart.js
* **Utilities:** Lucide React, Canvas Confetti

### Backend (Express API Server)
* **Runtime:** Node.js, Express (ES Modules)
* **Database:** MongoDB (using Mongoose ODM)
* **APIs & Runtimes:** Gemini AI API, JWT (JSON Web Tokens), Cookie Parser, Helmet

---

## 📁 Project Structure

```bash
├── app/                      # Next.js App Router (Pages, layouts, dynamic routes)
│   ├── student-hub/          # Student hub utilities
│   │   ├── roadmaps/         # Tech Roadmap Hub & Stepper
│   │   └── ...               # Attendance, Resume, Prep pages
│   ├── api/                  # Frontend api proxy handlers
│   └── layout.tsx            # Global wrappers, Theme, Auth, & SEO
├── components/               # Reusable React components
│   └── roadmap/              # Flow graphs, side drawers, timelines
├── data/                     # Static configurations (roadmaps, languages)
├── hooks/                    # Global React context (useAuth, useCompare)
├── public/                   # Static assets (Google console files, images)
├── server/                   # Backend API server (Express / Node)
│   ├── models/               # MongoDB Mongoose database collections
│   ├── routes/               # Express endpoint handlers
│   ├── middleware/           # Auth, XP, and Limit gates
│   ├── utils/                # Price synchronizer scripts
│   └── server.js             # Express app entry & database connection
```

---

## ⚙️ Local Development Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [MongoDB](https://www.mongodb.com/try/download/community) (Running locally or a MongoDB Atlas URI link)

### 1. Clone & Setup Directories
Clone the repository and install dependencies in the root folder:
```bash
npm install
```

Install backend dependencies:
```bash
cd server
npm install
cd ..
```

### 2. Configure Environment Variables
Create a `.env.local` file in the **root directory**:
```env
NEXT_PUBLIC_SITE_URL=https://smart-picks-india.vercel.app
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_AMAZON_TAG=your-amazon-tag

MONGODB_URI=mongodb://127.0.0.1:27017/smart-picks
ACCESS_TOKEN_SECRET=your_jwt_access_secret
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret

CLIENT_URL=http://localhost:3000
BACKEND_API_URL=http://localhost:5000

TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHANNEL_ID=@your_channel

GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Applications
Start the backend Express server:
```bash
cd server
npm start
```

In a new terminal window, start the frontend Next.js dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your browser to view the application!

---

## 🚀 Deployment
* **Frontend:** Pushing to the `main` branch auto-deploys your Next.js application to **Vercel**.
* **Backend:** Deploy the `server/` directory on platforms like **Render**, **Railway**, or **AWS ECS** pointing to your live MongoDB Atlas Cluster database.
