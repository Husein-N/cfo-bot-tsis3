# 🤖 CFO Bot — Cloud Cost Estimator

> **TSIS 3 | Cloud Computing for Big Data**
> Spec-Driven Development project using Google Antigravity + Firebase

A single-page web application that estimates monthly **Google Cloud Platform (GCP)** costs for an AI-powered chatbot application. Built using Spec-Driven Development (SDD) — the entire codebase was generated from a formal System Specification (SSOT) document via Google Antigravity agents.

---

## 🚀 Live Demo

**[https://cfo-bot-tsis3.web.app](https://cfo-bot-tsis3.web.app)**

---

## 📸 What It Does

Enter your usage assumptions → get an instant monthly cost breakdown:

| Input | What you provide |
|---|---|
| Messages per day | How many chat messages your app handles |
| Monthly active users | Your user base size |
| AI model tier | Gemini 1.5 Flash (cheap) or Pro (powerful) |
| Token counts | Average input/output tokens per message |
| Storage | Firestore data + Cloud Storage files |

| Output | What you get |
|---|---|
| Total monthly cost | Full GCP bill estimate |
| Per-user cost | Unit economics |
| Per-1,000-message cost | Transaction-level cost |
| Cost breakdown chart | Visual % split across 4 services |

---

## 🏗️ Architecture

This app estimates costs across 4 GCP services:

```
AI Chat Application
       │
       ├── Gemini API        ← AI model (token-based billing)
       ├── Cloud Run         ← Backend compute (serverless)
       ├── Cloud Firestore   ← Chat history database
       └── Cloud Storage     ← File & attachment storage
```

All calculations run **client-side** — no server, no backend, no API calls at runtime. Prices are hardcoded from GCP's published 2025 Q1 pricing.

---

## 📁 Project Structure

```
cfo-bot/
├── public/
│   ├── index.html        ← Main UI — two-panel calculator layout
│   ├── styles.css        ← GCP-themed styling, fully responsive
│   ├── constants.js      ← All GCP pricing constants (SSOT Section 4)
│   ├── calculator.js     ← 4 cost formulas + master total (SSOT Section 5)
│   └── app.js            ← DOM wiring, validation, real-time updates
├── firebase.json         ← Firebase Hosting configuration
├── .firebaserc           ← Firebase project reference
└── README.md
```

### Why this structure?

| File | Responsibility | SSOT section |
|---|---|---|
| `constants.js` | Single source of pricing data — change prices here only | Section 4 |
| `calculator.js` | Pure math functions, zero DOM dependency — fully testable | Section 4 & 5 |
| `app.js` | UI layer only — reads DOM, calls calculator, updates results | Section 7 |
| `index.html` | Structure and layout | Section 7 |

`calculator.js` is intentionally separated from `app.js` so the formulas can be unit-tested in a Node.js environment without any browser dependency.

---

## 💰 Pricing Formulas

### Gemini API (Formula 4.1)
```
monthly_messages    = daily_messages × 30
cost_input          = (monthly_messages × avg_input_tokens  / 1,000,000) × price_per_million
cost_output         = (monthly_messages × avg_output_tokens / 1,000,000) × price_per_million
COST_GEMINI         = cost_input + cost_output
```

### Cloud Run (Formula 4.2)
```
billable_requests   = MAX(0, monthly_requests − 2,000,000)
billable_cpu_sec    = MAX(0, cpu_seconds_total − 180,000)
billable_mem_sec    = MAX(0, mem_seconds_total − 360,000)
COST_CLOUDRUN       = cost_requests + cost_cpu + cost_memory
```

### Firestore (Formula 4.3)
```
billable_reads      = MAX(0, reads_per_day − 50,000) × 30
billable_writes     = MAX(0, writes_per_day − 20,000) × 30
COST_FIRESTORE      = cost_reads + cost_writes + cost_storage
```

### Cloud Storage (Formula 4.4)
```
billable_storage    = MAX(0, storage_gib − 5)
billable_egress     = MAX(0, egress_gib − 1)
COST_STORAGE        = cost_storage + cost_egress + cost_class_a + cost_class_b
```

### Total (Formula 5.0)
```
TOTAL = COST_GEMINI + COST_CLOUDRUN + COST_FIRESTORE + COST_STORAGE
```

---

## 🛠️ Local Development

No build step, no dependencies, no npm install needed.

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/cfo-bot-tsis3.git
cd cfo-bot-tsis3

# Run locally
cd public
python3 -m http.server 8080

# Open in browser
http://localhost:8080
```

---

## 🚢 Firebase Deployment

```bash
# Install Firebase CLI (one time)
npm install -g firebase-tools

# Login
firebase login

# Deploy
firebase deploy --only hosting

# Your app is live at:
# https://cfo-bot-tsis3.web.app
```

---

## 📋 Development Methodology

This project follows **Spec-Driven Development (SDD)**:

```
SSOT Document  →  Antigravity Agents  →  Implementation Plan + Test Specs  →  Code  →  Firebase
   (Phase 1)          (Phase 2)                  (Phase 2 artifacts)        (Phase 3)  (Phase 3)
```

1. **Phase 1** — Wrote a strict System Specification (SSOT) defining all formulas, constraints, and UI requirements before any code was written
2. **Phase 2** — Fed the SSOT to Google Antigravity Agent Manager → generated Implementation Plan and Test Specifications
3. **Phase 3** — Built the app following the Implementation Plan; verified all 13 test cases pass within ±$0.01
4. **Phase 4** — Produced a Pricing Strategy Document using CFO Bot outputs as unit economics data

---

## ✅ Test Results

All 13 test cases from the Test Specification pass within ±$0.01 tolerance:

| Test | Scenario | Expected | Result |
|---|---|---|---|
| TC1.1 | Gemini Flash, 100 msg/day | $0.38 | ✅ |
| TC1.2 | Gemini Flash, 1,000 msg/day | $3.83 | ✅ |
| TC1.3 | Gemini Pro, 10,000 msg/day | $2,625.00 | ✅ |
| TC1.4 | Model switch Flash→Pro | $147.00 | ✅ |
| TC2.1 | Cloud Run below free tier | $0.00 | ✅ |
| TC2.2 | Cloud Run above free tier | $146.68 | ✅ |
| TC3.1 | Firestore free tier | $0.00 | ✅ |
| TC3.2 | Firestore above free tier | $0.45 | ✅ |
| TC4.1 | Cloud Storage under limits | $0.00 | ✅ |
| TC4.2 | Cloud Storage business app | $2.83 | ✅ |
| TC5.1 | Integration — total cost | $4.41 | ✅ |
| TC5.1 | Cost per user | $0.01 | ✅ |
| TC5.1 | Cost per 1k messages | $0.15 | ✅ |

---

## 🔑 Key Findings

- **At 1,000 msg/day** with Gemini Flash: total cost = **$4.40/month** ($0.01/user)
- **Cloud Run and Firestore** are free until ~66,000 messages/day thanks to GCP free tiers
- **Switching Flash → Pro** increases the AI bill by **38×** with zero infrastructure change
- **Cost per user stays flat at $0.01** from 500 MAU to 50,000 MAU on Flash

---

## 📄 Documents

| Document | Description |
|---|---|
| `SSOT_Specification.pdf` | System Specification — Single Source of Truth |
| `Implementation_Plan.pdf` | Phase 2 Antigravity artifact |
| `Test_Specifications.pdf` | Phase 2 test cases with hand-calculated expected values |
| `Pricing_Strategy.docx` | Phase 4 business strategy document |

---

## 🧰 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | Zero framework overhead, <3s load time (SSOT Section 8) |
| Hosting | Firebase Hosting | Required by assignment; free HTTPS URL via Google CDN |
| Styling | Custom CSS | GCP brand colors, no external CSS framework |
| Charts | Inline CSS bars | Simple bar chart without Chart.js dependency |

---

## 👤 Author

Solo project — TSIS 3, Cloud Computing for Big Data course

---

*Prices based on GCP published rates (2025 Q1). Estimates only — actual bills may vary.*
