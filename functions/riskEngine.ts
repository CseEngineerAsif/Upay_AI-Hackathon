import { RiskAssessment, RiskRuleSignal, Transaction } from '../src/types';
import { buildFeatures, mlRisk, MlRiskResult } from './mlRiskModel';
import { isPhoneHashBlocklisted } from './fraudBlocklist';

export interface RiskInputParams {
  transactionId?: string;
  userId: string;
  amount: number;
  recipientPhone: string;
  recipientName?: string;
  note?: string;
  userBaselineAvgAmount?: number;
  userRecentTransactions?: Transaction[];
  userBalance?: number;
  isNewDevice?: boolean;
  isNewLocation?: boolean;
  timestamp?: string;
}

const SUSPICIOUS_NOTE_WORDS = [
  'লটারি', 'উপহার', 'ট্যাক্স', 'ভেরিফিকেশন', 'পিন', 'ওটিপি', 'জরুরি টাকা',
  'আটকে গেছে', 'বোনাস', 'ডিপোজিট', 'ইনভেস্টমেন্ট', 'ডাবল', 'সুযোগ',
  'lottery', 'winner', 'gift', 'prize', 'invest', 'double', 'urgent', 'tax', 'fee',
  'ignore previous', 'system prompt', 'mark this', '[security_filtered]', 'override'
];

export function evaluateTransactionRisk(params: RiskInputParams): {
  score: number;
  level: 'low' | 'medium' | 'high';
  signals: RiskRuleSignal[];
  baselineDiffPct: number;
  recipientTrustScore: number;
  suggestSmallTest: boolean;
  coolingPeriodSeconds: number;
} {
  const signals: RiskRuleSignal[] = [];
  let totalScore = 0;

  const baselineAvg = params.userBaselineAvgAmount || 1200;
  const history = params.userRecentTransactions || [];
  const normalizedPhone = params.recipientPhone.replace(/[\s-]/g, '');

  // 1. Recipient History & Trust
  const prevTxToRecipient = history.filter(
    tx => tx.recipient.replace(/[\s-]/g, '') === normalizedPhone
  );
  const isNewRecipient = prevTxToRecipient.length === 0;

  let recipientTrustScore = 85; // baseline trust
  if (isNewRecipient) {
    recipientTrustScore = 30;
    const pts = 25;
    totalScore += pts;
    signals.push({
      rule: 'NEW_RECIPIENT',
      labelBn: 'নতুন প্রাপক',
      labelEn: 'First-time Recipient',
      points: pts,
      severity: 'medium',
      detailsBn: 'এই নম্বরে আপনি আগে কখনো টাকা পাঠাননি।'
    });
  } else {
    recipientTrustScore = Math.min(100, 50 + prevTxToRecipient.length * 10);
  }

  // Governed SHA-256 fraud_blocklist check
  const blocklistCheck = isPhoneHashBlocklisted(normalizedPhone);
  if (blocklistCheck.listed) {
    const pts = 40;
    totalScore += pts;
    recipientTrustScore = 5;
    signals.push({
      rule: 'FLAGGED_RECIPIENT_DATABASE',
      labelBn: 'সন্দেহজনক নম্বর ডাটাবেজ (SHA-256 ব্লকলিস্ট)',
      labelEn: 'Governed Fraud Blocklist (SHA-256)',
      points: pts,
      severity: 'high',
      detailsBn: `এই নম্বরের SHA-256 হ্যাশ অনুমোদিত প্রতারণা তালিকায় (উৎস: ${blocklistCheck.entry?.source || 'analyst_escalation'}, সংস্করণ v${blocklistCheck.blocklistVersion}) চিহ্নিত করা হয়েছে।`
    });
  }

  // 2. Amount Anomaly vs Baseline
  const ratio = params.amount / baselineAvg;
  const baselineDiffPct = Math.round((ratio - 1) * 100);

  if (ratio >= 4.0) {
    const pts = 35;
    totalScore += pts;
    signals.push({
      rule: 'SEVERE_AMOUNT_ANOMALY',
      labelBn: 'অস্বাভাবিক উচ্চ পরিমাণ',
      labelEn: 'Severe Amount Anomaly',
      points: pts,
      severity: 'high',
      detailsBn: `লেনদেনের পরিমাণ (৳${params.amount.toLocaleString()}) আপনার সাধারণ গড়ের (৳${baselineAvg.toLocaleString()}) চেয়ে ${ratio.toFixed(1)} গুণ বেশি।`
    });
  } else if (ratio >= 2.2) {
    const pts = 20;
    totalScore += pts;
    signals.push({
      rule: 'MODERATE_AMOUNT_ANOMALY',
      labelBn: 'গড়ের চেয়ে বেশি পরিমাণ',
      labelEn: 'Above Average Amount',
      points: pts,
      severity: 'medium',
      detailsBn: `পরিমাণটি আপনার স্বাভাবিক লেনদেনের তুলনায় উল্লেখযোগ্যভাবে বেশি।`
    });
  }

  // 3. Odd Hour Check (1:00 AM - 5:30 AM local time)
  const txDate = params.timestamp ? new Date(params.timestamp) : new Date();
  const hour = txDate.getHours();
  if (hour >= 1 && hour < 6) {
    const pts = 15;
    totalScore += pts;
    signals.push({
      rule: 'ODD_HOURS_ACTIVITY',
      labelBn: 'অস্বাভাবিক সময়ে লেনদেন',
      labelEn: 'Late Night Odd Hours',
      points: pts,
      severity: 'medium',
      detailsBn: `রাত ১টা থেকে ভোর ৬টার মধ্যে প্রতারণার ঝুঁকি সাধারণত বেশি থাকে।`
    });
  }

  // 4. Velocity Check (transactions in last 15 mins)
  const now = txDate.getTime();
  const recent15m = history.filter(tx => {
    const t = new Date(tx.timestamp).getTime();
    return Math.abs(now - t) <= 15 * 60 * 1000;
  });

  if (recent15m.length >= 3) {
    const pts = 25;
    totalScore += pts;
    signals.push({
      rule: 'HIGH_VELOCITY',
      labelBn: 'দ্রুত ঘন ঘন লেনদেন',
      labelEn: 'High Velocity Transactions',
      points: pts,
      severity: 'high',
      detailsBn: 'গত ১৫ মিনিটে একাধিক লেনদেনের চেষ্টা লক্ষ্য করা গেছে।'
    });
  }

  // 5. Device or Location Mismatch
  if (params.isNewDevice) {
    const pts = 15;
    totalScore += pts;
    signals.push({
      rule: 'NEW_DEVICE',
      labelBn: 'নতুন বা অপরিচিত ডিভাইস',
      labelEn: 'Unrecognized Device',
      points: pts,
      severity: 'medium',
      detailsBn: 'বর্তমান ডিভাইসটি থেকে পূর্বে কোনো লেনদেন হয়নি।'
    });
  }

  if (params.isNewLocation) {
    const pts = 10;
    totalScore += pts;
    signals.push({
      rule: 'UNUSUAL_LOCATION',
      labelBn: 'অস্বাভাবিক অবস্থান',
      labelEn: 'Unusual Geographical Location',
      points: pts,
      severity: 'low',
      detailsBn: 'আপনার স্বাভাবিক অবস্থানের বাইরে থেকে রিকোয়েস্ট এসেছে।'
    });
  }

  // 6. Suspicious Keywords in Note
  const combinedText = `${params.note || ''} ${params.recipientName || ''}`.toLowerCase();
  const matchedWords = SUSPICIOUS_NOTE_WORDS.filter(w => combinedText.includes(w.toLowerCase()));
  if (matchedWords.length > 0) {
    const pts = 25;
    totalScore += pts;
    signals.push({
      rule: 'SUSPICIOUS_NOTE_KEYWORDS',
      labelBn: 'ঝুঁকিপূর্ণ শব্দ পাওয়া গেছে',
      labelEn: 'High-risk Keywords in Note',
      points: pts,
      severity: 'high',
      detailsBn: `লেনদেনের নোটে প্রতারণামূলক শব্দ শনাক্ত হয়েছে: ${matchedWords.join(', ')}`
    });
  }

  const finalScore = Math.min(100, Math.max(5, totalScore));
  let level: 'low' | 'medium' | 'high' = 'low';
  if (finalScore >= 70) {
    level = 'high';
  } else if (finalScore >= 35) {
    level = 'medium';
  }

  const coolingPeriodSeconds = level === 'high' ? 15 : 0;
  const suggestSmallTest = isNewRecipient && params.amount > 1000;

  return {
    score: finalScore,
    level,
    signals,
    baselineDiffPct,
    recipientTrustScore,
    suggestSmallTest,
    coolingPeriodSeconds
  };
}

export interface MlEvaluatedRisk {
  score: number;
  level: 'low' | 'medium' | 'high';
  probability: number;
  topFactors: MlRiskResult['topFactors'];
  modelType: 'LightGBM';
  modelVersion: string;
  blocklistVersion: number;
  signals: RiskRuleSignal[];
  baselineDiffPct: number;
  recipientTrustScore: number;
  suggestSmallTest: boolean;
  coolingPeriodSeconds: number;
  features: Record<string, number>;
}

export function evaluateWithMl(params: RiskInputParams): MlEvaluatedRisk {
  const history = params.userRecentTransactions || [];
  const baseline = params.userBaselineAvgAmount || 1200;
  const normalizedPhone = params.recipientPhone.replace(/[\s-]/g, '');

  const now = params.timestamp ? new Date(params.timestamp) : new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const nowMs = now.getTime();

  // Transactions in the last 15 minutes and 1 hour
  const tx15m = history.filter(tx => {
    const diff = nowMs - new Date(tx.timestamp).getTime();
    return diff >= 0 && diff <= 15 * 60 * 1000;
  });
  const cnt15m = tx15m.length;

  const tx1h = history.filter(tx => {
    const diff = nowMs - new Date(tx.timestamp).getTime();
    return diff >= 0 && diff <= 60 * 60 * 1000;
  });
  const cnt1h = tx1h.length;
  const sum1h = tx1h.reduce((acc, t) => acc + (t.amount || 0), 0);
  const sum1hRatio = sum1h / Math.max(baseline, 1);

  // New recipient check
  const newRecipient = !history.some(tx => tx.recipient.replace(/[\s-]/g, '') === normalizedPhone);

  // Suspicious keyword flag
  const combinedText = `${params.note || ''} ${params.recipientName || ''}`.toLowerCase();
  const noteFlag = SUSPICIOUS_NOTE_WORDS.some(w => combinedText.includes(w.toLowerCase()));

  // Governed SHA-256 fraud_blocklist check
  const blocklistCheck = isPhoneHashBlocklisted(normalizedPhone);
  const isBlacklisted = blocklistCheck.listed;
  const recipientReports = isBlacklisted ? 5 : 0;

  const balance = params.userBalance ?? 18450;
  const accountAgeDays = 400;

  const rawFeatures = buildFeatures({
    amount: params.amount,
    baseline,
    hour,
    newRecipient,
    cnt15m,
    cnt1h,
    sum1hRatio,
    balance,
    accountAgeDays,
    recipientReports,
    noteFlag,
  });

  const mlResult = mlRisk(rawFeatures);

  let finalScore = mlResult.score;
  let finalLevel: 'low' | 'medium' | 'high' =
    mlResult.level === 'HIGH' ? 'high' : mlResult.level === 'MEDIUM' ? 'medium' : 'low';

  // Hard override: Blacklisted recipient strictly forces HIGH
  if (isBlacklisted) {
    finalScore = Math.max(finalScore, 90);
    finalLevel = 'high';
  } else if (noteFlag && newRecipient && params.amount >= baseline * 5) {
    // Adversarial injection or scam keyword with high amount anomaly to new recipient
    finalScore = Math.max(finalScore, 75);
    finalLevel = 'high';
  }

  const signals: RiskRuleSignal[] = mlResult.topFactors.map(factor => ({
    rule: factor.feature.toUpperCase(),
    labelBn: factor.labelBn || factor.feature,
    labelEn: factor.feature,
    points: Math.min(40, Math.max(10, Math.round(factor.impact * 15))),
    severity: factor.impact > 1.2 ? 'high' : 'medium',
    detailsBn: `LightGBM প্রভাবক: +${Math.round(factor.impact * 10) / 10}`
  }));

  if (isBlacklisted) {
    signals.unshift({
      rule: 'FLAGGED_RECIPIENT_DATABASE',
      labelBn: 'সন্দেহজনক নম্বর ডাটাবেজ (SHA-256 ব্লকলিস্ট)',
      labelEn: 'Governed Fraud Blocklist (SHA-256)',
      points: 40,
      severity: 'high',
      detailsBn: `এই প্রাপকের অ্যাকাউন্টের SHA-256 হ্যাশ গভর্নড ফ্রড ব্লকলিস্টে (উৎস: ${blocklistCheck.entry?.source || 'analyst_escalation'}, v${blocklistCheck.blocklistVersion}) রেকর্ড আছে।`
    });
  }

  const baselineDiffPct = Math.round(((params.amount - baseline) / Math.max(baseline, 1)) * 100);
  const recipientTrustScore = isBlacklisted ? 5 : newRecipient ? 30 : 85;
  const coolingPeriodSeconds = finalLevel === 'high' ? 15 : 0;
  const suggestSmallTest = newRecipient && params.amount > 1000;

  return {
    score: finalScore,
    level: finalLevel,
    probability: mlResult.probability,
    topFactors: mlResult.topFactors,
    modelType: 'LightGBM',
    modelVersion: 'lgbm-fraud-v1.2.0',
    blocklistVersion: blocklistCheck.blocklistVersion,
    signals,
    baselineDiffPct,
    recipientTrustScore,
    suggestSmallTest,
    coolingPeriodSeconds,
    features: rawFeatures
  };
}
