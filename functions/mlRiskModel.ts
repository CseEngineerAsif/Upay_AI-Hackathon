// functions/mlRiskModel.ts -- inference for the trained LightGBM fraud model
import model from './risk_model.json';

type Node = { v?: number; f?: number; t?: number; l?: Node; r?: Node };
const M = model as any;
const FEATURES: string[] = M.features;

export interface MlFeatureInput {
  amount: number;
  baseline: number;
  hour: number;
  newRecipient: boolean;
  cnt15m: number;
  cnt1h: number;
  sum1hRatio: number;
  balance: number;
  accountAgeDays: number;
  recipientReports: number;
  noteFlag: boolean;
}

export function buildFeatures(i: MlFeatureInput): Record<string, number> {
  return {
    amt_ratio: i.amount / Math.max(i.baseline, 1),
    hour: i.hour,
    odd_hour: i.hour >= 1 && i.hour <= 5.5 ? 1 : 0,
    new_recipient: i.newRecipient ? 1 : 0,
    cnt_15m: i.cnt15m,
    cnt_1h: i.cnt1h,
    sum_1h_ratio: i.sum1hRatio,
    drain_ratio: Math.min(i.amount / Math.max(i.balance, 1), 1.5),
    acct_age: i.accountAgeDays,
    reports: i.recipientReports,
    note_flag: i.noteFlag ? 1 : 0,
  };
}

function walk(n: Node, x: number[]): number {
  let curr = n;
  while (curr.v === undefined) {
    curr = x[curr.f!] <= curr.t! ? curr.l! : curr.r!;
  }
  return curr.v;
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

function rawScore(x: number[]): number {
  let s = 0;
  for (const t of M.trees as Node[]) s += walk(t, x);
  return s;
}

const rawProb = (x: number[]) => sigmoid(rawScore(x));

function calibrate(p: number): number {
  const X: number[] = M.calib_x, Y: number[] = M.calib_y;
  if (p <= X[0]) return Y[0];
  if (p >= X[X.length - 1]) return Y[Y.length - 1];
  let k = 1; while (X[k] < p) k++;
  const w = (p - X[k - 1]) / (X[k] - X[k - 1] || 1);
  return Y[k - 1] + w * (Y[k] - Y[k - 1]);
}

export interface MlRiskResult {
  probability: number;
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  topFactors: { feature: string; value: number; impact: number; labelBn?: string }[];
}

export const FEATURE_LABELS_BN: Record<string, string> = {
  amt_ratio: 'স্বাভাবিকের চেয়ে বড় অঙ্কের লেনদেন',
  hour: 'দিনের অসময়ে লেনদেন',
  odd_hour: 'গভীর রাতের (১-৫ টা) লেনদেন',
  new_recipient: 'সম্পূর্ণ নতুন অচেনা প্রাপক',
  cnt_15m: '১৫ মিনিটে ঘনঘন একাধিক লেনদেন',
  cnt_1h: '১ ঘণ্টায় অস্বাভাবিক ট্রানজ্যাকশন সংখ্যা',
  sum_1h_ratio: '১ ঘণ্টায় বড় অঙ্কের মোট টাকা প্রেরণ',
  drain_ratio: 'ওয়ালেটের মোট ব্যালেন্স সম্পূর্ণ খালি করার ঝুঁকি',
  acct_age: 'অ্যাকাউন্টের বয়স সীমা',
  reports: 'প্রাপকের নম্বরে পূর্বের প্রতারণা রিপোর্ট',
  note_flag: 'সন্দেহজনক নোট/মেসেজ কি-ওয়ার্ড'
};

export function mlRisk(f: Record<string, number>): MlRiskResult {
  const x = FEATURES.map(n => f[n] ?? 0);
  const p = calibrate(rawProb(x));
  const base = rawScore(x);
  const factors = FEATURES.map((n, i) => {
    const y = [...x];
    y[i] = M.feature_medians[n];
    return {
      feature: n,
      value: x[i],
      impact: base - rawScore(y),
      labelBn: FEATURE_LABELS_BN[n] || n
    };
  })
    .filter(a => a.impact > 0)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3);

  const level = p >= M.high_threshold ? 'HIGH' : p >= M.medium_threshold ? 'MEDIUM' : 'LOW';
  return {
    probability: Math.round(p * 1000) / 1000,
    score: Math.round(p * 100),
    level,
    topFactors: factors
  };
}

export const MODEL_METRICS = M.metrics;
