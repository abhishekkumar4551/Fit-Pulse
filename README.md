# FitPulse AI — Personalized Fitness & Nutrition Platform

A full-stack personalized AI fitness and nutrition web application built with **React**, **TypeScript**, **Tailwind CSS**, **Node.js & Express.js**, **JWT + bcrypt authentication**, **MongoDB document storage architecture**, and **Gemini 3.8 Flash AI integration**.

---

## 🚀 Quick Start in Visual Studio Code (VS Code)

### Step 1: Download / Export the Project
1. In the Google AI Studio interface, click on the **Export** icon or menu at the top right and choose **Download ZIP** (or **Export to GitHub**).
2. Extract the downloaded ZIP archive into a folder on your computer (e.g. `fitpulse-ai`).

### Step 2: Open in VS Code
1. Launch **Visual Studio Code**.
2. Click **File > Open Folder...** (or `Cmd+O` on Mac / `Ctrl+O` on Windows/Linux).
3. Select the extracted `fitpulse-ai` project directory.
4. Open the integrated terminal in VS Code:
   - Press **`Ctrl + \``** (or go to **Terminal > New Terminal** in the top menu).

### Step 3: Install Node.js & Dependencies
Make sure you have [Node.js (v18 or higher)](https://nodejs.org) installed on your computer.

In your VS Code terminal, run:
```bash
npm install
```

### Step 4: Configure Environment Variables
1. Create a `.env` file in the root directory by copying `.env.example`:
   - On Windows PowerShell:
     ```powershell
     cp .env.example .env
     ```
   - On Mac / Linux / Bash:
     ```bash
     cp .env.example .env
     ```
2. Open `.env` in VS Code and paste your Gemini API key (obtainable free from [Google AI Studio](https://aistudio.google.com/app/apikey)):
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   PORT=3000
   JWT_SECRET="fitpulse-super-secret-jwt-key-2026"
   ```

*(Note: If no API key is provided, FitPulse AI automatically uses its built-in sports science algorithmic engine as a fallback, so the application runs 100% smoothly either way!)*

### Step 5: Start the Full-Stack Application
In your VS Code terminal, run:
```bash
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## ☁️ Deploying to Render (Step-by-Step)

If you are hosting your app on [Render](https://render.com) (free Web Service):

### 1. Push code to your GitHub Repository
Make sure your updated code (including explicit `.ts` import extensions) is pushed to GitHub.

### 2. Create a Web Service on Render
1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `fitpulse-ai` (or any name you prefer)
   - **Language**: `Node`
   - **Branch**: `main` (or your active branch)
   - **Region**: Any (e.g. Oregon, Frankfurt, Singapore)
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     node server.ts
     ```
     *(Note: You can also use `npx tsx server.ts` if your hosting environment uses an older Node version.)*

### 3. Add Environment Variables
Under the **Environment Variables** section on Render, add:
- `NODE_ENV` = `production`
- `JWT_SECRET` = `any_strong_random_secret_string_here`
- `GEMINI_API_KEY` = `your_gemini_api_key` *(optional — if omitted, the app gracefully falls back to the local sports science engine)*

Render automatically injects the `PORT` variable, and `server.ts` will bind to it and serve both the production static SPA and the backend REST API!

---

## ▲ Deploying to Vercel (Step-by-Step)

FitPulse AI includes full out-of-the-box support for [Vercel](https://vercel.com):

### 1. Import Repository into Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... > Project**.
2. Select your `Fit-Pulse` GitHub repository and click **Import**.

### 2. Configure Project Settings
Vercel will automatically detect the settings from `vercel.json` and `package.json`:
- **Framework Preset**: `Vite`
- **Root Directory**: `./` (leave default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3. Add Environment Variables
Under the **Environment Variables** accordion, add:
- `JWT_SECRET` = `your-secure-random-jwt-key`
- `GEMINI_API_KEY` = `your_gemini_api_key` *(optional)*

### 4. Click Deploy
Click **Deploy**! Vercel will:
- Build and host the optimized React frontend on the Vercel Global Edge CDN with SPA client-side routing.
- Automatically route all `/api/*` REST endpoints to the serverless handler in `api/index.ts`.
- Run the scheduled daily workout reminder cron job via `/api/cron/reminders` (defined in `vercel.json`).
- Provide an instant health check endpoint at `https://your-app.vercel.app/api/health`.

> **Tip (Vercel Build Cache / Network Reset Troubleshooting):**
> If you ever encounter an `ECONNRESET` during `npm install` on Vercel due to transient public npm registry drops, the included `.npmrc` automatically retries up to 5 times. You can also trigger a clean build on Vercel by navigating to **Deployments > [Latest Deployment] > ... > Redeploy** and selecting **Redeploy with existing Build Cache unchecked**.

---

## 🧪 Running Unit Tests
To execute the automated unit test suite (testing BMI, Mifflin-St Jeor BMR, TDEE activity multipliers, macro deficit/surplus formulas, and notification scheduler rules):
```bash
npm test
```

---

## 👥 Pre-Seeded Accounts (1-Click Login Available)

For quick demonstration and B.Tech CSE evaluation, the app includes an instant **Role Switcher** in the top navigation bar, or you can log in manually:

| Role | Email | Password | Features |
| :--- | :--- | :--- | :--- |
| **Athlete (User)** | `alex@fitpulse.ai` | `password123` | Personal dashboard, live workout runner, macro targets, progress charts, AI plan generator |
| **Staff (Trainer)** | `coach.sarah@fitpulse.ai` | `password123` | Client roster, review client weights, submit trainer feedback notes |
| **Admin** | `admin@fitpulse.ai` | `password123` | User & role management, platform statistics, global exercise database |

---

## 📁 Project Architecture & Folder Structure

```
├── api/
│   └── index.ts                # Vercel Serverless Function entry point
├── data/
│   └── fitness_db.json         # MongoDB-compatible document store (persisted to disk)
├── server/
│   ├── ai.ts                   # Gemini 3.8 Flash SDK integration + sports science engine
│   ├── db.ts                   # MongoDB collection schemas (users, profiles, workouts, diets, progress, etc.)
│   └── scheduler.ts            # Background job runner for automated daily workout notifications
├── src/
│   ├── components/
│   │   ├── AdminPortal.tsx     # Admin user management & analytics
│   │   ├── AuthModal.tsx       # JWT Register & Login modal
│   │   ├── Dashboard.tsx       # Main dashboard with KPI cards, today's workout & macros
│   │   ├── DietView.tsx        # Structured meal plans, macronutrient breakdowns & safety disclaimer
│   │   ├── ExercisesView.tsx   # 30+ exercise library with muscle filters & technique guides
│   │   ├── LogWeightModal.tsx  # Daily weight and workout check-in modal
│   │   ├── Navbar.tsx          # Responsive navigation, theme toggle, role switcher, notification bell
│   │   ├── NotificationCenterModal.tsx # In-app notification center & delivered email preview
│   │   ├── ProfileView.tsx     # Biometrics & real-time metabolic calculator (BMI/BMR/TDEE)
│   │   ├── ProgressView.tsx    # Interactive SVG weight trend chart & historical logs
│   │   └── WorkoutsView.tsx    # Split schedules, interactive workout runner & rest stopwatch
│   ├── context/
│   │   └── AuthContext.tsx     # Authentication & role management provider
│   ├── services/
│   │   └── api.ts              # Frontend API client with JWT bearer tokens
│   ├── types/
│   │   └── index.ts            # TypeScript data contracts & collection interfaces
│   ├── utils/
│   │   ├── fitnessCalc.ts      # Pure metabolic math (BMI, BMR, TDEE, macros)
│   │   ├── fitnessCalc.test.ts # Unit tests for fitness calculations
│   │   ├── schedulerUtils.ts   # Pure notification rules & email HTML generator
│   │   └── schedulerUtils.test.ts # Unit tests for scheduler rules
│   ├── App.tsx                 # Root application coordinator
│   ├── main.tsx                # React DOM entry point
│   └── index.css               # Tailwind CSS styles
├── server.ts                   # Express server mounting APIs and Vite middlewares
├── vercel.json                 # Vercel deployment configuration, rewrites & cron schedules
├── package.json                # Project dependencies and npm scripts
└── tsconfig.json               # TypeScript configuration
```

---

## 🛠️ Recommended VS Code Extensions
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **TypeScript and JavaScript Language Features** (built-in)
- **ESLint** (`dbaeumer.vscode-eslint`)
