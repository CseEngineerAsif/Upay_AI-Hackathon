# Data Card: Upay Safe Synthetic MFS Dataset

## 1. Overview & Purpose
This dataset is a synthetic simulation of Mobile Financial Service (MFS) transaction activity tailored for the Bangladeshi financial ecosystem (styled after Upay, bKash, and Nagad patterns). It provides the behavioral baseline for evaluating real-time transaction risk, anomaly detection, scam message filtering, and financial health planning.

## 2. Demographic & Behavioral Assumptions
- **Primary User Archetype**:
  - Name: `MD. AL-MAYNUL HASAN`
  - Mobile Number: `01794809461`
  - Balance Baseline: `৳18,450 BDT`
  - Verification: `NID Tier-2 Verified Plus`
  - Average Baseline Transaction: `৳1,200 BDT`
- **Geographic Coverage**:
  - Dhaka Division (65%), Chittagong (15%), Sylhet (10%), Rajshahi, Khulna, and Barisal (10%).
- **Transaction Types**:
  - `send_money` (P2P), `cash_out` (Agent ATM), `mobile_recharge`, `pay_bill` (DESCO, DPDC, WASA), `savings`.
- **Bangla Notes & Banglish Linguistics**:
  - Realistic references: `চা-নাস্তা`, `রিকশা ভাড়া ধানমন্ডি`, `কাচ্চি ভাই ডিনার`, `পল্লি বিদ্যুৎ মে মাস`, `মুদির বাজার স্বপ্ন`, `পাঠাও রাইড`.

## 3. Fraud & Risk Signal Definitions
| Rule Key | Trigger Condition | Points Contribution |
|---|---|---|
| `NEW_RECIPIENT` | First transfer to an unverified phone number | +25 pts |
| `FLAGGED_RECIPIENT_DATABASE` | Number present in reported fraud blacklist | +40 pts |
| `SEVERE_AMOUNT_ANOMALY` | Transfer amount > 4.0x user baseline average | +35 pts |
| `ODD_HOURS_ACTIVITY` | Transaction timestamp between 01:00 AM and 05:30 AM | +15 pts |
| `HIGH_VELOCITY` | > 2 transactions attempted within 15 minutes | +25 pts |
| `SUSPICIOUS_NOTE_KEYWORDS` | Words like `লটারি`, `ট্যাক্স ফি`, `ভেরিফিকেশন`, `ডাবল` | +25 pts |

## 4. Privacy & Masking Guardrails
- **Zero PIN Transmission**: PINs are hashed and verified locally or through secure token minting. PINs are NEVER passed to the Gemini LLM or external APIs.
- **PII Anonymization**:
  - Phone numbers are masked (`017***9461`).
  - Names are obfuscated (`M*** H***`).
  - LLM inputs receive only structured evidence objects with personal data stripped.
- **Human-in-the-Loop Decision Boundary**: The AI model and rule engine advise only with confidence scores and explainability factors. It never automatically denies or blocks user funds; the human user maintains final agency.

## 5. Evaluation & Fairness Distribution
- **6,000-Sample Seeded Evaluation Benchmark (`scripts/evaluate.ts`)**:
  - Deterministic PRNG: Mulberry32 seeded with `Seed: 42` for 100% reproducible replication.
  - Fraud Prevalence: 4.2% (253 fraud scenarios vs 5,747 legitimate transactions).
  - Geographic Representation: Dhaka (58%), Chattogram (18%), Sylhet (10%), Rajshahi (6%), Khulna (5%), Barishal (3%).
  - Hard Negative Modeling: Includes legitimate late-night workers (2 AM transfers), high-value periodic payments (tuition/rent 4x-8x baseline), and legitimate new contact remittances.
  - Model Results Saved: `reports/impact_eval.json` — **SIMULATED (synthetic data)** (Precision: 61.6%, Recall: 74.7%, F1: 67.5%, PR-AUC: 0.713, FPR: 2.1%, Recall@5% FPR: 89.3%, Recall@1% FPR: 58.9%).
- **120 Qualitative Scenario Cases**:
  - Manual stress-testing across age demographics (18-25, 26-40, 41-60, 60+) and account tenures (new <30 days vs established >1 year).

## 6. Limitations & Known Boundaries

### 6.1 Synthetic Simulation vs. Live Banking Data
- **Privacy-Preserving Synthetic Generation**: Due to banking privacy regulations, customer NID confidentiality, and PCI-DSS requirements, this dataset was generated using behavioral distributions and verified MFS fraud typologies rather than raw exported customer records.
- **Novel Attack Vectors**: While 11 core features (velocity, amount-to-baseline ratio, odd hours, account age, balance drain ratio, recipient reports, note flags) reflect established fraud topologies, novel adversarial tactics (e.g., evolving voice deepfakes or distributed mule ring coordination) may require continuous retraining with live fraud labels.

### 6.2 Cold-Start & Short-Tenure Profiles
- **Sparse Historical Footprint**: For newly activated accounts (<14 days old or with <3 completed transfers), the behavioral baseline defaults to synthetic population median values (৳1,200 baseline). This can temporarily elevate false-positive friction for legitimate first-time high-value transfers.
- **Safety Boundary**: The system never denies or freezes funds autonomously; high-risk alerts trigger educational checklists and optional ৳10 test transaction recommendations, keeping agency with the user.

### 6.3 Linguistic & Dialectal Boundaries
- **Supported Regional Variants**: The dialect normalization model covers Standard Bengali, Chattagonian (চাটগাঁইয়া), Sylheti (সিলেটি), Noakhali (নোয়াখাইল্লা), and Rangpuri (রংপুরিয়া).
- **Acoustic Conditions**: Dense ambient acoustic noise (e.g., wet markets, public transport) and rapid hybrid Banglish or localized slang can challenge raw speech transcription. Mandatory PIN verification and audible TTS summaries protect against incorrect executions.

### 6.4 Seasonal & Festival Surges
- **Festival Seasonality**: Spending patterns during religious festivals (Eid-ul-Fitr, Eid-ul-Adha, Durga Puja) exhibit legitimate 3x–6x velocity spikes and late-night activity. A production deployment requires calendar-aware seasonal baselines to mitigate false alarms during holiday shopping windows.

### 6.5 Regulatory & Advisory Scope
- **Consumer Advisory Interface**: All AI and ML scores serve as explainable decision-support for end-users and compliance analysts. They do not substitute for official regulatory Suspicious Transaction Reports (STR/SAR) governed by the Bangladesh Financial Intelligence Unit (BFIU).

