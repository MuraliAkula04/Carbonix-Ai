# 🌱 Carbonix AI — Full-Stack Personal Carbon Intelligence Platform

> **Measure · Predict · Optimize**  
> A full-stack web application designed to help individuals monitor, forecast, and reduce their personal carbon footprint through data-driven intelligence, optimization algorithms, and AI assistance.

---

## 🏛️ System Architecture

Per the **Product Requirements Document (PRD)** and **Technical Requirements Document (TRD)**, Carbonix AI has been migrated from a client-side Firebase prototype into a robust 3-tier full-stack architecture:

```
USER
  │
  ▼
React 19 + Vite (Single Page Application)
  │ (HTTPS / REST + JWT Bearer Auth)
  ▼
Node.js + Express.js REST API
  │ (Centralized Validation & Intelligence Services)
  ▼
Prisma ORM
  │
  ▼
PostgreSQL / SQLite Persistent Storage
```

---

## 🚀 Key Features & Migrated Capabilities

### 1. ⚡ Backend Carbon Calculation Engine
- **Server-Side Security**: All emissions calculations (`quantity × factor`) execute on the backend rather than trusting client payloads.
- **Configurable Emission Factors**: Centralized factors stored with historical reproducibility:
  - **Electricity**: Grid (0.82 kg CO₂/kWh), Solar (0.04 kg CO₂/kWh), Wind (0.02 kg CO₂/kWh)
  - **Transport**: Car (0.21 kg/km), Motorcycle (0.11 kg/km), Bus (0.08 kg/km), Train (0.04 kg/km), Flight (0.25 kg/km), Cycling (0.0 kg/km), Walking (0.0 kg/km)
  - **Diet**: Meat (70 kg/mo), Mixed (40 kg/mo), Vegetarian (20 kg/mo), Vegan (15 kg/mo)

### 2. 🧮 216-Strategy Optimization Engine
- Migrated from legacy logic into a backend microservice.
- Brute-force evaluates **216 combinations** across electricity, travel, and food reductions (`[0, 10, 20, 30, 40, 50]%`).
- Applies feasibility penalties and personalizes weights to rank the **Top Strategies** with actionable tips.

### 3. 📈 Trend-Aware Prediction Engine
- Analyzes user's historical trajectory (increasing, decreasing, stable).
- Applies trend multipliers (e.g. `+10%`, `+2%`, `-3%`) to forecast upcoming monthly footprint.
- Real-time scenario sliders allow users to test what-if reduction scenarios with live interactive Chart.js visualizations.

### 4. 🤖 Context-Aware AI Sustainability Chatbot
- **Strict Topic Guard**: Rejects off-topic inquiries firmly while welcoming sustainability, energy, transport, diet, and climate questions.
- **Dynamic Context Builder**: Automatically queries the user's live database profile, latest monthly totals, highest emitting category, and goals to provide personalized advice.

### 5. 🎯 Goal Setting & Progress Tracking
- Dual-input synchronizer (target in kg CO₂ or % reduction).
- Live progress bar with celebration triggers when targets are achieved.

### 6. 🛠️ Interactive Tool Simulators
- **Bill OCR Simulator**: Simulates utility bill upload and OCR kWh extraction with 1-click application.
- **Metro Travel Estimator**: Pre-calibrated regional commute benchmarks (London, New York, Tokyo, Berlin, Sydney, Rural).

---

## 📁 Repository Structure

```
Carbonix-Ai-main/
├── backend/                  # Express.js REST API + Prisma
│   ├── prisma/
│   │   └── schema.prisma     # Relational schema (User, Activity, Goal, Recommendation, Chat)
│   ├── src/
│   │   ├── config/           # Database & environment configurations
│   │   ├── controllers/      # Auth, Activity, Analytics, Prediction, Optimization, Goal, Chat
│   │   ├── middleware/       # JWT Auth, Zod validation, Centralized error handling
│   │   ├── routes/           # REST API endpoints mounted under /api
│   │   ├── services/         # Carbon engine, Analytics, Prediction, Optimization, Chatbot
│   │   ├── tests/            # Automated API verification test suite
│   │   ├── utils/            # Emission factor matrices & benchmarks
│   │   └── server.js         # Master Express server
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # React 19 + Vite Application
│   ├── public/
│   │   └── logo.png          # Carbonix AI official logo
│   ├── src/
│   │   ├── components/       # StatCard, Charts, GoalCard, Simulators, ChatbotWidget
│   │   ├── context/          # AuthContext (JWT session), ThemeContext (Dark/Light)
│   │   ├── layouts/          # Responsive Sidebar & Topbar layout
│   │   ├── pages/            # Landing, Login, Dashboard, Activities, Predictions, Suggestions, Goals, Profile
│   │   ├── services/         # ApiClient (HTTP fetch + JWT handling)
│   │   ├── index.css         # Design system & dark/light theme CSS tokens
│   │   ├── App.jsx           # React Router with ProtectedRoute
│   │   └── main.jsx
│   └── package.json
│
├── css/                      # Original styles (preserved)
├── js/                       # Original JS modules (preserved)
├── dashboard.html            # Original dashboard (preserved)
├── login.html                # Original login (preserved)
└── README.md
```

---

## 🏃 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on v24)
- npm v9+

### 1. Start the Backend API
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```
The REST API will launch at **`http://localhost:5000`** (Health check: `http://localhost:5000/api/health`).

> **Connecting to PostgreSQL (Neon / Supabase)**:
> In `backend/prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
> In `backend/.env`, set your connection string:
> `DATABASE_URL="postgresql://user:password@your-host.neon.tech/carbonix?sslmode=require"`
> Then run `npx prisma db push`.

### 2. Start the Frontend App
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will start at **`http://localhost:5173`**.

---

## 🔑 Demo Credentials
You can log in instantly using the demo account button on the login page, or sign up with your own email:
- **Email**: `ecotester@carbonix.ai`
- **Password**: `password123`

---

## 🧪 Automated Verification Suite
To run the automated 10-point backend verification test suite:
```bash
cd backend
node src/tests/verifyBackend.js
```
Expected output:
```
✔ Health Check OK
✔ Registration & Password Hashing OK
✔ JWT Authentication OK
✔ Server-Side Carbon Calculation OK
✔ Analytics Summary & Aggregation OK
✔ Reduction Goals & Progress OK
✔ Trend-Aware Prediction Forecasting OK
✔ 216-Strategy Optimization Engine OK
✔ Strict Sustainability Chatbot Guard & Context OK
🎉 ALL 10 BACKEND VERIFICATION CHECKS PASSED
```
