# Open Travel — Production Deployment Guide

This guide walks through deploying the Open Travel platform to:
- **Database:** MongoDB Atlas (Free M0 Cluster)
- **Backend API:** Render (or Railway)
- **Frontend:** Vercel (Next.js 16 App Router)
- **Authentication:** Firebase (Google Sign-In + Session Verification)

---

## Architecture Overview

```
User Browser
    │
    ▼ (HTTPS)
Vercel (Next.js 16 Frontend)
    │
    ├─► Firebase Auth (Client-side Google Popup / Email Login)
    │
    ▼ (Server-to-Server HTTPS with x-internal-key)
Render / Railway (Express.js API)
    │
    ▼
MongoDB Atlas (Cloud Database)
```

---

## Prerequisites

1. **GitHub repository:** Push this codebase to a private or public GitHub repo.
2. **MongoDB Atlas account:** [cloud.mongodb.com](https://cloud.mongodb.com)
3. **Render account:** [render.com](https://render.com) (or [railway.app](https://railway.app))
4. **Vercel account:** [vercel.com](https://vercel.com)
5. **Firebase project:** [console.firebase.google.com](https://console.firebase.google.com)

---

## Step 1: Set up MongoDB Atlas

1. Log into **MongoDB Atlas** and create a free **M0 cluster** (choose your nearest region).
2. **Create a Database User:**
   - Go to **Security → Database Access** → **Add New Database User**.
   - Choose **Password Authentication**, enter a username (e.g. `opentravel_user`) and a secure password.
   - Set privileges to **Read and write to any database**.
3. **Configure Network Access:**
   - Go to **Security → Network Access** → **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) — required because cloud server IPs (Render/Railway) are dynamic.
4. **Get Connection String:**
   - Go to **Deployments → Database → Connect → Drivers (Node.js)**.
   - Copy the URI. It looks like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/opentravel?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password and ensure database name is `opentravel`.

### Seed the Atlas Database

Run the seed script from your local development machine pointing to Atlas:

```bash
# Windows PowerShell
$env:DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/opentravel?retryWrites=true&w=majority"
npm run seed

# macOS / Linux / Git Bash
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/opentravel?retryWrites=true&w=majority" npm run seed
```

You should see:
```
[server] connected to MongoDB
[seed] collections reset.
[seed] database seeded successfully.
```

---

## Step 2: Deploy the Express API Backend on Render

### Option A: Using Render Blueprint (Fastest)

1. Push your code to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
3. Connect your GitHub repository. Render will automatically detect `render.yaml`.
4. Fill in the required environment variable:
   - `DATABASE_URL`: Your MongoDB Atlas URI.
5. Render will automatically generate a secure `INTERNAL_API_KEY` for you.
6. Click **Apply**.

### Option B: Manual Web Service Setup on Render

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name:** `opentravel-api`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server/index.js`
   - **Plan:** Free
4. Under **Health Check Path**, enter: `/api/health`
5. Under **Environment Variables**, add:
   | Key | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/opentravel?retryWrites=true&w=majority` |
   | `INTERNAL_API_KEY` | *(Generate a 32+ character random string and save it)* |
6. Click **Deploy Web Service**.
7. Once deployed, note your service URL (e.g. `https://opentravel-api.onrender.com`).
8. Test the health endpoint in your browser:
   `https://opentravel-api.onrender.com/api/health` -> should return `{"ok":true}`.

> **Note on Free Tier:** Render free tier web services spin down after 15 minutes of inactivity and take ~50 seconds to wake up on the first request. For instant responses, upgrade to Starter or use Railway.

---

## Step 3: Deploy the Next.js Frontend on Vercel

1. Log into [Vercel](https://vercel.com) and click **Add New...** → **Project**.
2. Import your GitHub repository.
3. Keep the default settings (Framework: Next.js, Build Command: `next build`, Output: `.next`).
4. Expand **Environment Variables** and add:

| Key | Description / Value |
| --- | --- |
| `API_URL` | Your Render API URL (e.g. `https://opentravel-api.onrender.com`) without trailing slash |
| `INTERNAL_API_KEY` | **Exact same string** set on Render |
| `AUTH_SECRET` | Generate random base64 string (run `openssl rand -base64 32` or any long random key) |
| `AUTH_TRUST_HOST` | `true` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase Console > Project Settings > Web App config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `your-project` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-project.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `1234567890` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:1234567890:web:...` |
| `FIREBASE_SERVICE_ACCOUNT` | Single-line minified JSON string of your Firebase Service Account private key |

> **Tip for `FIREBASE_SERVICE_ACCOUNT`:**
> Download the service account private key JSON from **Firebase Console → Project Settings → Service accounts → Generate new private key**.
> Minify the JSON into a single line before pasting into Vercel.

5. Click **Deploy**.
6. When the build finishes, you will receive your live Vercel URL (e.g. `https://opentravel.vercel.app`).

---

## Step 4: Configure Firebase for Production Domain

To allow Google Sign-In popups to work on your live Vercel domain:

1. Open [Firebase Console](https://console.firebase.google.com).
2. Go to **Authentication → Settings → Authorized domains**.
3. Click **Add domain** and enter your Vercel domain (e.g. `opentravel.vercel.app` or your custom domain).
4. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
5. Select your Firebase project from the top dropdown.
6. Under **OAuth 2.0 Client IDs**, click the Web client created by Firebase.
7. Under **Authorized JavaScript origins**, add:
   - `https://opentravel.vercel.app`
8. Under **Authorized redirect URIs**, add:
   - `https://opentravel.vercel.app/__/auth/handler` (and `https://your-project.firebaseapp.com/__/auth/handler` if not already present).
9. Click **Save**.

---

## Step 5: Verification & Testing Checklist

- [ ] **API Health Check:** Visit `https://opentravel-api.onrender.com/api/health` → returns `{"ok":true}`.
- [ ] **Home Page:** Visit `https://opentravel.vercel.app` → Featured tours and categories load from MongoDB.
- [ ] **Tours Browse & Detail:** Open `/tours` and click on a tour slug → details, itinerary, and agency load.
- [ ] **Authentication:**
  - Test Google Sign-In on `/login`.
  - Test demo accounts (`admin@opentravel.com`, `agency@opentravel.com`, `customer@opentravel.com`).
- [ ] **Role Dashboards:**
  - Customer: `/dashboard/customer`
  - Agency: `/dashboard/agency` (and `/dashboard/agency/services` to create/edit services)
  - Admin: `/dashboard/admin`
- [ ] **Customer-to-Agency Chat:** Test inquiry messaging on a service detail page.
