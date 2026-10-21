# RaahSetu (राहसेतु) — AI-Powered Rural Career, Skills & Financial Inclusion Platform

**RaahSetu** ("Bridge of Pathways") is a social-impact fintech & edtech platform designed for rural Indian youth (ages 18–25). It bridges the gap between grassroots village needs, skill verification, transition financing, and safe city employment.

---

## 🏆 Hackathon Judging Criteria Alignment

| Judging Criterion | Weight | Key Differentiators in RaahSetu |
| :--- | :---: | :--- |
| **A. Innovation & Originality** | **25%** | **Gaon Demand Ledger** (aggregates village voice/text needs & dynamically shifts career rankings), **Kamao-Seekho Micro-Gigs** (earn simulated ₹ & build verifiable Skill Passport), **Pehla Kadam Bridge** (unblocks the ₹8,000 relocation gap via explainable zero-interest CSR grants). |
| **B. Technical Feasibility & Architecture** | **20%** | Modular **FastAPI** backend + **SQLite** persistent database + **React / TypeScript / Vite / Tailwind** frontend. Real mathematical decision rules, zero external paid API dependencies, and 100% offline-runnable fallback. |
| **C. Usability & Scalability** | **20%** | Mobile-first responsive UI, instant **English / Hindi (हिंदी)** bilingual toggle, and **Chaupal Sync** (single-packet QR code peer-to-peer lesson transfer without internet). |
| **D. Business Value & Monetisation** | **15%** | Facilitator/Partner Dashboard with live database-aggregated operational metrics, **5 sustainable revenue pillars** (CSR employability, employer verification fee, Digital Saathi MSME subscriptions, State Skill Missions, and Credentialing API), plus an **interactive CSR Programme Economics & SROI simulator**. |
| **E. Customer Impact & UX** | **20%** | Seeded real-world persona **Priya Sharma (20, ITI Electrical, Bilaspur)** transitioning to a Tata Power Solar Apprenticeship in Pune with safe hostel verification, 24x7 emergency network, and peer buddy support. |

---

## 🧭 The 4-Act Guided Demo Walkthrough (Priya Sharma)

### **Act 1: The Village Need (Gaon Demand Ledger)**
- **Path:** `/demand-ledger`
- **What to Observe:** 
  - Village map and demand cards for Bilaspur (Ajmer).
  - 42 households reported broken solar irrigation pumps with unmet local technician needs.
  - Adding a voice/text demand response dynamically recalculates local demand multipliers and provides an **explainable shift** (e.g., Solar Technician match jumps from 86% to 94.5%).

### **Act 2: The Student Earns & Proves (Kamao-Seekho Micro-Gigs)**
- **Path:** `/micro-gigs`
- **What to Observe:**
  - Micro-gigs feed across Digital Saathi, Scholarship Verification, and Language Data.
  - Priya completes the *"Ramesh Kirana Store: 3-Phase Wiring Safety Audit"*.
  - Task verification credits **₹250 simulated demo earnings** directly into her student wallet ledger and mints a verified credential into her **Skill Passport** (`/passport`).

### **Act 3: The ₹8,000 Relocation Barrier (Pehla Kadam Bridge)**
- **Path:** `/bridge-funding`
- **What to Observe:**
  - Priya secures a 1-year apprenticeship offer with Tata Power Solar in Pune (₹14,500/month stipend).
  - Financial barrier: She needs **₹8,000 upfront** for train travel (₹1,450), hostel deposit (₹4,500), and safety equipment (₹2,050).
  - She enters her expenses and requests a Pehla Kadam Bridge grant.
  - **Transparent Decision Engine:** Her verified skills (4 badges), offer authenticity score (98%), and high village demand index unlock a **100% Zero-Interest CSR Grant** with automatic waiver logic upon 90 days of apprenticeship attendance.

### **Act 4: Safe Transition & Outcome (Pravas Kavach)**
- **Path:** `/pravas-kavach`
- **What to Observe:**
  - Employer physical safety audit (Grade A Safety, CCTV, female supervisors).
  - Verified women's hostel booking (*Suman Mahila Working Women PG Hostel*).
  - 24x7 emergency contacts and local peer buddy (*Pooja Di*).
  - 6-step pre-departure checklist.
  - Final Transition Outcome card showing verified joining status.

---

## 🚀 Quickstart & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*The database automatically creates and seeds `backend/raahsetu.db` on initial startup.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

### 3. One-Click Demo Access
- Click **"Demo as Priya (Student)"** on the Login page (`/login`) to explore the complete student flow.
- Click **"Demo as Facilitator"** to access the Partner & Impact Dashboard (`/facilitator`).
- Click **"Reset Demo"** in the top navigation bar at any time to restore the seeded database state.

---

## 🧪 Automated Verification Suite
Run the comprehensive test script to verify all 13 core subsystems:
```bash
cd backend
python verify_e2e.py
```
**Test Results:**
```
=================================================================
   RAAHSETU END-TO-END VERIFICATION & AUDIT SUITE
=================================================================
[PASS] Backend Health Check
[PASS] Demo Auth: Logged in as Priya Sharma
[PASS] Act 1: Gaon Demand Categories
[PASS] Act 1: Voice Signal Dynamic Career Shift Explainer
[PASS] Act 2: Micro-Gigs Feed
[PASS] Act 2: Simulated Student Wallet (Priya)
[PASS] Act 3: Pehla Kadam Bridge Records
[PASS] Act 4: Pravas Kavach Transition Record
[PASS] Prep Dojo: Fraud Dojo Scenarios
[PASS] Prep Dojo: Mock Saakshatkar Questions
[PASS] Facilitator: Live DB Aggregated Metrics
[PASS] Facilitator: CSR Economics & SROI Calculator
[PASS] Demo Control: 1-Click Reset
-----------------------------------------------------------------
FINAL AUDIT RESULTS: 13/13 tests passed (100%)
=================================================================
```

---

## 🔐 Ethical & Responsible AI Safeguards
- **Simulated Financial Transactions:** All rewards, wallets, and grant amounts are clearly labeled as simulated educational demo credits. No fake UPI, live banking, or real money transfers are claimed.
- **Privacy First:** No raw Aadhaar numbers or biometric data are stored.
- **Explainable Decision Engine:** The funding rules engine and career recommendation formulas expose transparent weights and plain-language reasoning without black-box bias.
- **Non-Discriminatory:** Ranking criteria are strictly based on demonstrated skill evidence, village demand signals, and opportunity prerequisites.
