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
├── package.json                # Project dependencies and npm scripts
└── tsconfig.json               # TypeScript configuration
```

---

## 🛠️ Recommended VS Code Extensions
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **TypeScript and JavaScript Language Features** (built-in)
- **ESLint** (`dbaeumer.vscode-eslint`)
