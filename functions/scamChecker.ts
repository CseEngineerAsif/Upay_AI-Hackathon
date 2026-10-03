import { ScamCheckResult } from '../src/types';

interface ScamPattern {
  id: string;
  category: string;
  weight: number;
  keywords: string[];
  explanationBn: string;
}

const SCAM_PATTERNS: ScamPattern[] = [
  {
    id: 'credential_theft',
    category: 'পিন বা ওটিপি চাওয়া',
    weight: 45,
    keywords: [
      'পিন দিন', 'পিন বলুন', 'পিন কোড', 'otp', 'ওটিপি', 'pin দিন', 'pin বলুন',
      'পাসওয়ার্ড দিন', 'সিক্রেট কোড', 'গোপন নম্বর'
    ],
    explanationBn: 'বার্তাটিতে পিন (PIN) অথবা ওটিপি (OTP) চাওয়া হয়েছে। উপায় বা কোনো ব্যাংক কখনোই পিন বা ওটিপি চায় না।'
  },
  {
    id: 'urgent_account_freeze',
    category: 'অ্যাকাউন্ট বন্ধের ভুয়া ভীতি',
    weight: 35,
    keywords: [
      'অ্যাকাউন্ট বন্ধ', 'অ্যাকাউন্ট ব্লক', 'সাময়িক স্থগিত', 'স্থগিত করা হবে',
      'ভেরিফাই না করলে', '২৪ ঘণ্টার মধ্যে যোগাযোগ', 'আইডি সাসপেন্ড', 'account suspended', 'account blocked'
    ],
    explanationBn: 'জরুরি অ্যাকাউন্ট বাতিলের ভয় দেখিয়ে দ্রুত ক্লিক বা তথ্য দিতে প্ররোচিত করা হচ্ছে।'
  },
  {
    id: 'lottery_gift_prize',
    category: 'ভুয়া লটারি বা পুরস্কার',
    weight: 35,
    keywords: [
      'লটারি জিতেছেন', 'পুরস্কার', '২৫ লাখ', '১০ লাখ', '৫০ হাজার টাকা বিজয়ী',
      'ট্যাক্স ফি জমা দিন', 'রেজিস্ট্রেশন ফি', 'ফ্রি রিচার্জ', 'উপহার পেতে ক্লিক', 'lottery winner', 'cash prize'
    ],
    explanationBn: 'লটারি বা পুরস্কারের লোভ দেখিয়ে অগ্রিম ফি দাবি করা বাংলাদেশের অন্যতম পরিচিত প্রতারণা।'
  },
  {
    id: 'fake_authority',
    category: 'উপায় বা অফিশিয়াল সেজে বার্তা',
    weight: 25,
    keywords: [
      'উপায় প্রধান কার্যালয়', 'কাস্টমার কেয়ার হেড', 'হেড অফিস', 'বাংলাদেশ ব্যাংক সিকিউরিটি',
      'উপায় অফার বিভাগ', 'সরাসরি হেড অফিস'
    ],
    explanationBn: 'উপায় হেড অফিস বা অফিশিয়াল কর্মকর্তা সাজিয়ে মিথ্যা বিশ্বাস তৈরির চেষ্টা।'
  },
  {
    id: 'phishing_link_intent',
    category: 'সন্দেহজনক লিঙ্ক বা APK',
    weight: 30,
    keywords: [
      'ক্লিক করুন', 'ক্লিক করে আপডেট', 'ফর্ম পূরণ', 'apk ডাউনলোড', 'অ্যাপ ইনস্টল করুন', 'লিংকে যান',
      'bit.ly', 'tinyurl', '.xyz', '.top', '.club', '.online', '.site'
    ],
    explanationBn: 'অপরিচিত ওয়েবলিংক বা থার্ড-পার্টি অ্যাপ ইনস্টল করার ক্ষতিকর নির্দেশনা রয়েছে।'
  }
];

// Heuristic URL scanner
function analyzeUrls(text: string): { suspiciousUrls: string[]; urlRiskScore: number } {
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(xyz|top|site|club|online|buzz|click|info)[^\s]*)/gi;
  const matches = text.match(urlRegex) || [];
  let urlRiskScore = 0;
  const suspiciousUrls: string[] = [];

  for (const url of matches) {
    const lower = url.toLowerCase();
    let isSuspicious = false;

    // Check for spoofed brands
    if ((lower.includes('upay') || lower.includes('bkash') || lower.includes('nagad')) &&
        !lower.includes('upaybd.com') && !lower.includes('ucb.com.bd')) {
      isSuspicious = true;
      urlRiskScore += 35;
    }

    // Check for high-risk TLDs
    if (/\.(xyz|top|site|club|online|buzz|click|fun|app)\b/i.test(lower)) {
      isSuspicious = true;
      urlRiskScore += 25;
    }

    // Check for URL shorteners
    if (lower.includes('bit.ly') || lower.includes('tinyurl.com') || lower.includes('t.co') || lower.includes('cutt.ly')) {
      isSuspicious = true;
      urlRiskScore += 20;
    }

    // Check for non-https
    if (lower.startsWith('http://')) {
      isSuspicious = true;
      urlRiskScore += 15;
    }

    if (isSuspicious) {
      suspiciousUrls.push(url);
    }
  }

  return { suspiciousUrls, urlRiskScore };
}

export function analyzeScamMessage(text: string): ScamCheckResult {
  const normalized = text.toLowerCase().trim();
  const detectedTriggers: string[] = [];
  const matchedKeywords: string[] = [];
  let score = 0;

  // 1. Keyword pattern matching with TF-IDF style weighting
  for (const pattern of SCAM_PATTERNS) {
    const hits: string[] = [];
    for (const kw of pattern.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        hits.push(kw);
      }
    }

    if (hits.length > 0) {
      score += pattern.weight;
      matchedKeywords.push(...hits);
      detectedTriggers.push(`${pattern.category}: ${pattern.explanationBn}`);
    }
  }

  // 2. URL analysis
  const { suspiciousUrls, urlRiskScore } = analyzeUrls(text);
  score += urlRiskScore;
  if (suspiciousUrls.length > 0) {
    detectedTriggers.push(`ক্ষতিকর বা সন্দেহজনক ওয়েবলিংক: ${suspiciousUrls.join(', ')}`);
  }

  // Clamp 0-100
  const finalScore = Math.min(100, Math.max(0, score));

  let riskLevel: 'safe' | 'suspicious' | 'danger' = 'safe';
  let verdictBn = 'বার্তাটি নিরাপদ মনে হচ্ছে';
  let verdictEn = 'Message appears safe';
  let explanationBn = 'এই বার্তায় কোনো পরিচিত প্রতারণামূলক শব্দ বা সন্দেহজনক লিঙ্ক পাওয়া যায়নি। তবে অপরিচিত যেকোনো লিংকে ক্লিক করার আগে সতর্কতা অবলম্বন করুন।';
  let recommendedActionBn = 'কোনো ঝুঁকি নেই। তবুও ব্যক্তিগত পিন কাউকে জানাবেন না।';

  if (finalScore >= 60) {
    riskLevel = 'danger';
    verdictBn = 'উচ্চ ঝুঁকির স্ক্যাম / প্রতারণা বার্তা!';
    verdictEn = 'High-Risk Scam Message Detected!';
    explanationBn = 'এই বার্তাটি প্রতারণামূলক উদ্দেশ্যে পাঠানো হয়েছে। পিন/ওটিপি চুরি বা ভুয়া লোভ দেখিয়ে অর্থ হাতিয়ে নেওয়ার স্পষ্ট লক্ষণ রয়েছে।';
    recommendedActionBn = 'কখনোই লিংকে ক্লিক করবেন না বা কাউকে পিন/ওটিপি বলবেন না। অবিলম্বে নম্বরটি ব্লক করুন এবং উপায় হেল্পলাইনে (16268) রিপোর্ট করুন।';
  } else if (finalScore >= 25) {
    riskLevel = 'suspicious';
    verdictBn = 'সন্দেহজনক বার্তা — সতর্ক থাকুন';
    verdictEn = 'Suspicious Message — Exercise Caution';
    explanationBn = 'বার্তাটিতে কিছু সতর্কতামূলক লক্ষণ দেখা যাচ্ছে। এটি অননুমোদিত প্রচারণা বা প্ররোচনামূলক হতে পারে।';
    recommendedActionBn = 'প্রেরকের পরিচয় যাচাই না করে কোনো তথ্য প্রদান করবেন না।';
  }

  return {
    riskScore: finalScore,
    riskLevel,
    verdictBn,
    verdictEn,
    explanationBn,
    detectedTriggers,
    matchedKeywords: Array.from(new Set(matchedKeywords)),
    suspiciousUrls,
    recommendedActionBn
  };
}
