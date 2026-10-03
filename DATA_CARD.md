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
- 120 benchmark cases evaluated for precision, recall, and false-positive rate across:
  - Regions: Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, Barisal.
  - Age Demographics: 18-25, 26-40, 41-60, 60+.
  - Account Tenure: New accounts (<30 days) vs Established accounts (>1 year).
