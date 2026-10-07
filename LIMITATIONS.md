# Engineering Limitations, Simulated Scope & Production Roadmap (`LIMITATIONS.md`)

> **Strict Audit & Transparency Notice:**  
> Every benchmark figure in this repository is derived from deterministic synthetic evaluation (`reports/impact_eval.json`, Seed `42`, `6,000` transactions + `200` dialect utterances) and is explicitly badged **`SIMULATED (synthetic data)`** across the UI and documentation. No mock integration is presented as a live bank or MFS production switch.

---

## 1. Synthetic Evaluation & Data Limitations (`SIMULATED`)

1. **Synthetic Transaction Corpus (`6,000` Transactions, Seed `42`):**
   - Because access to live production MFS transaction logs (bKash, Nagad, Rocket, Upay) is restricted under Bangladesh Bank customer data confidentiality regulations `[CITE: Bangladesh Bank Payment Systems Department Guidelines, 2024]`, our LightGBM fraud risk engine (`functions/mlRiskModel.ts`, `functions/risk_model.json`) is trained and evaluated on a reproducible synthetic dataset (`scripts/train_risk_model.py`, `scripts/evaluate.ts`, documented in `DATA_CARD.md`).
   - Reported metrics — **Precision `61.6%`**, **Recall `74.7%`**, **F1 `67.5%`**, **PR-AUC `0.713`**, **Recall @ 1% FPR `58.9%`**, **Recall @ 5% FPR `89.3%`**, and **Fraud Loss Prevented Rate `77.1%` vs `18.3%` Baseline** — are **SIMULATED** results and have not yet been validated on live customer traffic.
2. **Adversarial Concept Drift:**
   - Real-world scam rings in Bangladesh (lottery scams, fake government relief disbursements, impersonation of MFS agents/support `[CITE: BIBM MFS Fraud Survey, 2024]`) continuously rotate phone numbers and social-engineering scripts. A static tree ensemble will experience concept drift without weekly retraining on confirmed fraud labels.
3. **Behavioral Assumption Sensitivity:**
   - Business ROI projections in `src/utils/impactModel.ts` depend on explicit, user-auditable parameters (e.g., `78%` cancellation rate on specific AI warning + 15-second cooling-off vs `18%` on a generic warning). In the Impact Dashboard (`src/components/admin/ImpactDashboardModal.tsx`), all 7 assumptions are editable with live recalculation so judges can stress-test conservative and pessimistic scenarios.

---

## 2. Simulated Ecosystem Integrations vs. Production Architecture

To avoid feature sprawl ambiguity, the application prioritizes **4 Core Validated Pillars** on the Home screen and Smart Services drawer:
1. **Pre-Transaction AI Fraud Shield & 15s Cooling-Off** (`functions/riskEngine.ts`, `functions/mlRiskModel.ts`)
2. **Dialect-Aware Voice Payment** (`functions/dialectVoiceAi.ts`, `src/utils/dialectVoiceManager.ts`)
3. **TrustPay F-Commerce Milestone Escrow** (`functions/trustPayAi.ts`, `src/components/trustpay/`)
4. **Digital Somiti Group ROSCA Ledger** (`functions/somitiAi.ts`, `src/components/somiti/`)

All secondary ecosystem modules are retained under **Extended Ecosystem Labs (`SIMULATED`)** and carry explicit architectural boundaries:

| Module / Integration | Current Prototype Status (`SIMULATED`) | Production Target Architecture |
| :--- | :--- | :--- |
| **NPSB / Bank Transfer / Govt Bill Pay** | Simulated settlement state machine in `UpayPaymentFlowModal.tsx` | ISO 20022 / Bangladesh Bank NPSB switch integration via mTLS HSM gateway |
| **Agent Liquidity & Float Network** | Simulated agent float & cash-reservation slots (`LiquidityNetworkScreen.tsx`) | Real-time distributor DMS feed + signed dealer e-float escrow ledger |
| **Cross-Wallet Federated Risk Exchange** | Simulated privacy-preserving risk query (`CrossWalletRiskScreen.tsx`) | Multi-MFS Private Set Intersection (PSI) & SHA-256 hash consortium API |
| **Climate Shield Parametric Relief** | Simulated flood/cyclone alert & G2P disbursement (`ClimateShieldScreen.tsx`) | BMD/FFWC webhook trigger + BFD/Ministry G2P treasury settlement |
| **NID / e-KYC Onboarding** | Camera viewfinder + simulated verification (`RegistrationFlow.tsx`) | Election Commission (NIDW) Porichoy API live biometric/demographic match |

---

## 3. Responsible AI & Security Controls (Implemented vs. Production Hardening)

### Implemented in This Repository:
- **Zero-Trust Firestore Security Rules (`firestore.rules`):**
  - Default deny across all paths (`match /{document=**} { allow read, write: if false; }`).
  - Removed all demo bypasses (`user_main_maynul`, `|| !isSignedIn()`, `|| isSignedIn()`).
  - `/users/{uid}` and subcollections (`/transactions`, `/goals`) are strictly restricted to `request.auth.uid == uid` (with read-only analyst access on `/transactions`).
  - Clients are explicitly blocked from writing `balance`, `pin`, `pinHash`, `pinSalt`, `role`, `riskScore`, or `riskLevel`.
  - `/analyst_queue` is restricted to verified analysts (`request.auth.token.role == 'analyst'` or `/analysts/{uid}`).
  - `/guardian_alerts` is restricted strictly to the ward owner (`userId`) or invited guardian (`guardianId`).
  - `/fraud_blocklist/{phoneHash}` is governed by SHA-256 hex keys with admin-only write access.
- **Server-Side Salted `scrypt` PIN Verification (`functions/pinSecurity.ts` & `server.ts`):**
  - Eliminated client-side plain PIN comparisons and `'1234'` fallbacks in `src/store/useAppStore.ts`, `src/utils/accountManager.ts`, and `src/components/modals/AuxiliaryModals.tsx`.
  - Added `POST /api/auth/verify-pin` and `POST /api/auth/set-pin` using 16-byte random salts, 64-byte `crypto.scryptSync` digests, and `crypto.timingSafeEqual`.
  - Enforces automatic **15-minute account lockout after 5 consecutive failed PIN attempts** (`HTTP 423 Locked`).
  - Demo user's hashed PIN is seeded exclusively on the server when `DEMO_MODE=true`.
- **Governed SHA-256 Fraud Blocklist (`functions/fraudBlocklist.ts`):**
  - Replaced hardcoded `KNOWN_FLAGGED_NUMBERS` in `functions/riskEngine.ts` with a versioned SHA-256 phone-hash blocklist (`{ phoneHash, source, addedBy, addedAt, version, status }`) synced with Firestore `fraud_blocklist` and managed via admin-only endpoints (`GET/POST/DELETE /api/admin/blocklist`).
- **API Hardening (`server.ts`, `middleware/auth.ts`, `middleware/validation.ts`):**
  - `helmet` security headers, `100kb` JSON payload cap, strict `.strict()` Zod schema validation on all endpoints, `100 req / 15 min / IP` global rate limit, and `10 req / min / IP` strict rate limit on `/api/ai/*`, `/api/auth/*`, and `/api/safety/risk-check`.
  - Strict PII masking (`maskPhoneNumber`, `maskName`, `sanitizePrivacyText`) and prompt-injection delimiters (`<<<USER_SUPPLIED_DATA_START>>>`) before any Gemini API call.

### Remaining Production Hardening Steps:
- **Distributed State & Ledger Persistence:** Server-side PIN lockout counters and seed state currently reside in single-instance memory with optional Firestore sync; production deployment requires Redis cluster state for rate-limiting/lockouts and an ACID double-entry core banking ledger (Cloud SQL PostgreSQL).
- **Hardware-Backed Attestation:** Biometric login on the web preview is simulated; production mobile apps require Android Keystore / iOS Secure Enclave WebAuthn/FIDO2 cryptographic attestation.

---

## 4. Next: 90-Day Field Pilot Plan

To transition from `SIMULATED` synthetic benchmarks to empirical field evidence, we propose a 3-phase pilot:
1. **Phase 1 — Shadow-Mode Scoring (Weeks 1–4, `N = 5,000` opt-in users):** Run `lgbm-fraud-v1.2.0` in shadow mode on live anonymized transaction streams to measure real-world False Positive Rate (FPR) and latency (`p95 < 50ms`) without interrupting user flows.
2. **Phase 2 — Randomized Controlled A/B Trial (Weeks 5–8):** Compare Control Group (conventional MFS confirmation screen) vs. Treatment Group (LightGBM risk score + Bangla explanation + 15s cooling-off) to measure empirical **Warned-Scam Cancellation Rate** and **Legitimate Transaction Completion Rate**.
3. **Phase 3 — Regional Dialect Field Study (Weeks 9–12):** Evaluate ASR + dialect intent parsing with `500` first-time MFS users across Chattogram, Sylhet, Noakhali, and Rangpur agent points to measure live **Voice-Payment Task Completion Rate** and accessibility uplift.
