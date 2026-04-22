# Email Scrapper.io

Email Scrapper.io is a modern, production-ready SaaS platform designed for intelligent lead discovery and outbound email management. It combines a powerful background scraping engine with a seamless Gmail integration to help you find, organize, and contact leads efficiently.

## 🚀 Features

*   **Intelligent Lead Discovery**: Enter any domain, and the background worker will scrape and extract public email addresses.
*   **LinkedIn Enrichment**: Generate predicted email formats for LinkedIn prospects based on their name and company.
*   **Native Gmail Integration**: Connect your Google account to sync your inbox. Read, archive, snooze, and send replies directly from the dashboard.
*   **AI-Powered Drafts**: Leverage Google's Gemini AI to instantly generate contextual, professional email replies.
*   **Built-in CRM**: Manage all discovered leads in the "My Leads" dashboard, track confidence scores, and export data to CSV.
*   **Secure Authentication**: NextAuth.js integration supporting both Magic Links (Email/Password) and Google OAuth providers.
*   **Background Processing**: Utilizes BullMQ and Redis for reliable, asynchronous execution of scraping tasks without blocking the main UI.
*   **Real-time Notifications**: Get alerted instantly when background discovery tasks are completed.

## 🛠 Tech Stack

*   **Frontend**: Next.js 16 (App Router), React, Tailwind CSS, Lucide Icons
*   **Backend**: Node.js, Next.js API Routes
*   **Database**: PostgreSQL managed via Prisma ORM
*   **Queue/Worker**: BullMQ with Redis
*   **Authentication**: NextAuth.js (v5 Beta)
*   **AI Integration**: Google Gen AI SDK (Gemini 2.0 Flash)
*   **APIs**: Google Workspace (Gmail API)

## 📦 Local Development

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL Database
*   Redis Server
*   Google Cloud Console Project (for Gmail API & OAuth)
*   Google AI Studio API Key (for Gemini)

### 1. Setup Environment Variables

Create a `.env` file in the root directory based on `.env.example` (or configure the following):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secure_random_string"

# Google Integration
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"

# Gemini AI
GEMINI_API_KEY="your_gemini_api_key"

# Optional SMTP for Password Resets
# SMTP_SERVER="smtp.resend.com"
# SMTP_PORT="587"
# SMTP_USER="resend"
# SMTP_PASSWORD="your_resend_api_key"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Database

```bash
npx prisma db push
npx prisma generate
```

### 4. Start the Application

You need to run two processes simultaneously: the Next.js frontend/API and the background worker.

**Terminal 1 (Next.js App):**
```bash
npm run dev
```

**Terminal 2 (Background Worker):**
```bash
npm run worker
```

The application will be available at `http://localhost:3000`.

## 🚢 Production Deployment

For production, it's recommended to split the architecture:
1.  Deploy the Next.js application to **Vercel**.
2.  Deploy the Redis and PostgreSQL databases to managed services like **Upstash** and **Supabase**.
3.  Deploy the Worker script to a background service provider like **Render** or **Railway**.
