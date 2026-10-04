# রিকার্শন পে (Recursion Pay) — AI-Powered MFS Super-App

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live-success" alt="Live Status" />
  <img src="https://img.shields.io/badge/Platform-Web%20%2F%20AI%20App-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/Language-Bangla%20%2B%20English-orange" alt="Language" />
</p>

<div align="center">
  <a href="https://recursionpay.vercel.app/" target="_blank">
    <strong>🚀 Live Demo</strong>
  </a>
</div>

---

## Overview

**রিকার্শন পে (Recursion Pay)** হলো বাংলাদেশের জন্য ডিজাইন করা একটি AI-ভিত্তিক মোবাইল ফিন্যান্সিয়াল সার্ভিস (MFS) সুপার-অ্যাপ।

এই প্ল্যাটফর্মের লক্ষ্য হলো:
- নিরাপদ ও দ্রুত লেনদেন
- বাংলা ভাষায় সহজ ব্যবহার
- AI-চালিত ঝুঁকি বিশ্লেষণ
- ভয়েস-ভিত্তিক পেমেন্ট
- ব্যাংক/এজেন্ট/টেলিকম/ফিনটেক ইকোসিস্টেমে সুসংহত UX

---

## Why It Matters

বাংলাদেশের মুঠোফোন-ভিত্তিক আর্থিক পরিষেবায় ব্যবহারকারীর সবচেয়ে বড় চ্যালেঞ্জ হলো:
- স্ক্যাম ও ফিশিং
- ভুল/অস্বাভাবিক লেনদেন
- ভাষা ও উপভাষার জটিলতা
- নিরাপত্তা ও গোপনীয়তা
- সহজ, স্বচ্ছ ও আত্মবিশ্বাসজনক UX

**রিকার্শন পে** এই সমস্যা সমাধানে AI, ভয়েস ইন্টিগ্রেশন, নিরাপত্তা-ফার্স্ট ডিজাইন ও সিম্পল ফিনটেক অভিজ্ঞতা একসাথে নিয়ে এসেছে।

---

## Core Features

| Category | Feature | Description |
|---|---|---|
| 🛡️ Security | AI Risk Shield | ডিটারমিনিস্টিক 0–100 স্কোর, অস্বাভাবিক লেনদেন শনাক্তকরণ, ব্যাখ্যাযোগ্য বাংলা সতর্কতা |
| 🛡️ Security | Scam Detection | SMS, URL, phishing, fraud pattern, scam call simulation |
| ⚡ Core MFS | Send Money & Cash Out | দ্রুত পেমেন্ট, ক্যাশ আউট, রিচার্জ, বিল পেমেন্ট |
| ⚡ Core MFS | Savings & Wallet Tools | সঞ্চয়, ফান্ড ট্রান্সফার, উইলেট ব্যবস্থাপনা |
| 🗣️ Voice | Dialect-Aware Voice Pay | চাটগাঁইয়া, সিলেটি, নোয়াখাইল্লা, রংপুরিয়া ভাষা সমর্থন |
| 🎙️ AI Voice | Gemini Live Voice Assistant | রিয়েল-টাইম আউডিও চ্যাট, কনটেক্সট-সচেতন ভয়েস কমান্ড |
| 🤖 AI | Multi-Turn Finance Bot | সাইবার সিকিউরিটি, ব্যাংকিং, বুদ্ধিমান আর্থিক সহায়তা |
| 🧒 Family Finance | Child Wallet & Parent Controls | শিশুদের জন্য পকেটমানি ও অভিভাবক-নিয়ন্ত্রিত খরচ |
| 🤝 Community | Digital Somiti | স্মার্ট ROSCA / savings group automation |
| 🔒 Protection | TrustPay Escrow | ফেসবুক/ইনস্টাগ্রাম শপিংয়ের জন্য নিরাপদ পেমেন্ট | 
| 👔 Workforce | Payslip Auditor | বেতন ও ওভারটাইম যাচাই, শ্রমিকদের আর্থিক স্বচ্ছতা |
| 🎁 Commerce | Offer Hub & Telecom Bundles | ক্যাশব্যাক, ডিসকাউন্ট, টেলিকম অফার, কার্ড/উৎসব সমর্থন |

---

## Product Modules

### 1. AI Safety & Pre-Transaction Risk Engine
- 0–100 deterministic risk scoring
- anomaly detection on amount, patterns, and transaction context
- explainable Bengali safety warnings
- cooling-off period for high-risk transactions
- mandatory human-in-the-loop policy for critical approvals
- scam SMS and malicious URL checking
- practical scam-call simulation for user awareness

### 2. Main MFS Services Grid
- Send Money
- Cash Out
- Mobile Recharge
- Pay Bill
- Add Money
- Savings / Wallet
- Fund Transfer
- Refer & Earn
- NPSB / interoperability
- Safe Hub and transaction controls

### 3. Specialized Payment & Utility Services
- Traffic Fine
- Toll Payment
- Govt Payment
- Education Fee
- NGO Payment
- Insurance Premium
- Donation
- Zakat Direct Contribution

### 4. Regional Voice Pay
- Browser Speech API integration with `bn-BD`
- localized voice commands for Bangla dialects
- audio confirmation before funds are sent
- pin-protected transaction approval to prevent voice-driven fraud

### 5. Audio Intelligence & Live AI Assistant
- real-time full-duplex audio interaction
- automatic speech-to-text transcription
- interactive AI voice test prompts
- secure, human-validated transaction workflows

### 6. Search, Maps & Finance Guidance
- grounded Google Search for recent Bangladesh banking and regulatory updates
- Google Maps integration for nearby agent locations and banking access points
- AI assistant for security, spending, and transaction support

---

## Technology Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Zustand
- Web Speech API / Web Audio API
- Lucide icons and UI polish tools

### Backend
- Node.js
- Express
- TypeScript (`tsx`)
- WebSocket server for live voice streaming
- Google GenAI SDK

### Data & Auth
- Google Cloud Firestore
- Firebase Authentication

---

## Architecture Overview

```text
Client (React App)
      │
      ▼
   REST / WebSocket APIs
      │
      ▼
   Express Server (Node.js / TS)
      │
      ├── Google GenAI SDK
      ├── Firebase Auth / Firestore
      ├── Web Speech + Audio APIs
      └── AI Safety / Finance Logic
```

---
---

## Local Setup

### Prerequisites
- Node.js 18+
- npm or pnpm

### Install Dependencies
```bash
npm install
```

### Environment Variables
Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### Run Development Server
```bash
npm run dev
```

Open: `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

---

## Demo Credentials

The app includes demo account data for quick testing:

- Phone Number: `01794809461`
- PIN: `1234`
- Account Name: `MD. AL-MAYNUL HASAN`
- Balance: `৳ ১৮,৪৫০.৫০`

---

## Security & Privacy Protocols

- Zero-pin exposure in LLM prompts
- Sensitive data masking before processing
- Human approval for sensitive financial actions
- Local fallback architecture for offline resilience
- Secure-by-design flow for voice-triggered transactions

---

## Project Links

- GitHub: https://github.com/CseEngineerAsif/Upay_AI-Hackathon
- Live Demo: https://recursionpay.vercel.app/

---

## Closing Note

**রিকার্শন পে** বাংলাদেশের জন্য একটি নিরাপদ, বুদ্ধিমান, ভাষা-সচেতন, এবং ব্যবহারকারী-কেন্দ্রিক ডিজিটাল ফিনান্স প্ল্যাটফর্ম।

এটি কেবল একটি ওয়ালেট নয় — বরং AI-ভিত্তিক একটি ভবিষ্যত-নির্দেশিত MFS অভিজ্ঞতা।

"বাংলাদেশের মানুষের জন্য, AI দ্বারা চালিত, স্থানীয় ভাষায় শক্তিশালী।" 🇧🇩
