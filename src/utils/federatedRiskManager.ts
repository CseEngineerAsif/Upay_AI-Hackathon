import { MfsFederatedNode, FraudRingAlert } from '../types/federatedRisk';

export const MFS_NODES: MfsFederatedNode[] = [
  {
    id: 'upay_node',
    nameBn: 'রিকার্শন পে (Recursion Pay Safe AI নোড)',
    nameEn: 'Recursion Pay MFS Node',
    brandColor: '#0B4DA2',
    localModelVersion: 'Recursion-FedRisk v4.2',
    localSamplesTrained: '৪,৫০,০০০+ ট্রানজেকশন',
    encryptionStatusBn: 'জিরো-নলেজ প্রুফ ও ডিফারেনশিয়াল প্রাইভেসি',
    lastGradientSync: '২ মিনিট আগে'
  },
  {
    id: 'partner_b',
    nameBn: 'এমএফএস পার্টনার-১ (Wallet B নোড)',
    nameEn: 'MFS Partner B Node',
    brandColor: '#D8236E',
    localModelVersion: 'PartnerB-Net v3.9',
    localSamplesTrained: '৮,২০,০০০+ ট্রানজেকশন',
    encryptionStatusBn: 'লোকাল এনক্রিপ্টেড ট্রেনিং (হোমোমর্ফিক)',
    lastGradientSync: '১ মিনিট আগে'
  },
  {
    id: 'partner_n',
    nameBn: 'এমএফএস পার্টনার-২ (Wallet N নোড)',
    nameEn: 'MFS Partner N Node',
    brandColor: '#F7931E',
    localModelVersion: 'PartnerN-Audit v4.0',
    localSamplesTrained: '৬,৫০,০০০+ ট্রানজেকশন',
    encryptionStatusBn: 'অ্যানোনিমাইজড গ্রেডিয়েন্ট সিঙ্ক',
    lastGradientSync: '৩ মিনিট আগে'
  },
  {
    id: 'partner_r',
    nameBn: 'এমএফএস পার্টনার-৩ (Wallet R নোড)',
    nameEn: 'MFS Partner R Node',
    brandColor: '#8C3494',
    localModelVersion: 'PartnerR-Guard v3.8',
    localSamplesTrained: '৩,১০,০০০+ ট্রানজেকশন',
    encryptionStatusBn: 'লোকাল ডেটা ভল্ট সিকিউরড',
    lastGradientSync: '৪ মিনিট আগে'
  }
];

export const FRAUD_RINGS_DATA: FraudRingAlert[] = [
  {
    id: 'ring_1',
    ringCode: 'RING-FD-8921',
    titleBn: 'আন্তঃওয়ালেট র‌্যাপিড স্মার্ফিং ও ক্যাশ-আউট সিন্ডিকেট',
    threatTypeBn: 'মানি লন্ডারিং ও মানি মিউল লেয়ারিং (Smurfing)',
    riskScore: 96,
    walletsInvolvedCount: 7,
    providersInvolvedCount: 4,
    totalVolume: 185000,
    detectedPatternBn:
      'একটি প্রধান উৎস থেকে ছোট ছোট অংশে টাকা ভাগ করে মাত্র ৪ মিনিটের মধ্যে ৪টি ভিন্ন এমএফএস অ্যাকাউন্টে স্থানান্তর এবং প্রত্যন্ত অঞ্চলে ক্যাশ-আউটের অস্বাভাবিক চক্র শনাক্ত হয়েছে।',
    recommendedActionBn:
      'তাৎক্ষণিক সমন্বিত হাই-রিস্ক অ্যালার্ট জারি করুন এবং ক্যাশ-আউট লেনদেনে অতিরিক্ত বায়োমেট্রিক ও ম্যানুয়াল অনুমোদন বাধ্যতামূলক করুন।',
    status: 'active_threat',
    federatedConsensusScore: 98,
    createdAt: 'আজ, দুপুর ১:২৫',
    hops: [
      {
        step: 1,
        walletHash: '0x9f2a7c4...b91e',
        providerNameBn: 'Wallet B (এমএফএস-১)',
        amount: 50000,
        timestamp: 'দুপুর ১:২০',
        suspiciousActionBn: 'অজ্ঞাত ব্যাংক থেকে আকস্মিক ক্যাশ-ইন'
      },
      {
        step: 2,
        walletHash: '0x3d7b81e...a409',
        providerNameBn: 'রিকার্শন পে (Recursion Pay)',
        amount: 49500,
        timestamp: 'দুপুর ১:২২',
        suspiciousActionBn: '১ মিনিট ২০ সেকেন্ডের মধ্যে দ্রুত সেন্ড মানি'
      },
      {
        step: 3,
        walletHash: '0x81c499f...c28d',
        providerNameBn: 'Wallet N (এমএফএস-২)',
        amount: 24800,
        timestamp: 'দুপুর ১:২৩',
        suspiciousActionBn: 'টাকা দুই ভাগে বিভক্ত (Layering Split)'
      },
      {
        step: 4,
        walletHash: '0x5a1e20b...77f1',
        providerNameBn: 'Wallet R (এমএফএস-৩)',
        amount: 24500,
        timestamp: 'দুপুর ১:২৪',
        suspiciousActionBn: 'এজেন্ট পয়েন্টে দ্রুত ক্যাশ-আউট প্রচেষ্টা ⚠️'
      }
    ]
  },
  {
    id: 'ring_2',
    ringCode: 'RING-FD-4410',
    titleBn: 'ফিশিং ও ওটিপি প্রতারণা ফান্ড ট্রান্সফার রিং',
    threatTypeBn: 'সাইবার ফিশিং ও দ্রুত অবৈধ স্থানান্তর',
    riskScore: 88,
    walletsInvolvedCount: 5,
    providersInvolvedCount: 3,
    totalVolume: 95000,
    detectedPatternBn:
      'সন্দেহভাজন ১টি আইপি ও ডিভাইস ফিঙ্গারপ্রিন্ট থেকে ৩টি ভিন্ন এমএফএস প্রোভাইডারে ভুয়া অফার দেখিয়ে গ্রাহকের টাকা হাতিয়ে নেওয়ার পর দ্রুত হাতবদলের চেষ্টা।',
    recommendedActionBn:
      'ভুক্তভোগী অ্যাকাউন্টগুলো সাময়িক ফ্রিজ করুন এবং লেনদেন স্থগিত করে ফান্ড রিকভারি প্রটোকল চালু করুন।',
    status: 'monitoring',
    federatedConsensusScore: 91,
    createdAt: 'আজ, সকাল ১১:৪০',
    hops: [
      {
        step: 1,
        walletHash: '0x77ab12c...ef43',
        providerNameBn: 'Wallet N (এমএফএস-২)',
        amount: 45000,
        timestamp: 'সকাল ১১:৩৫',
        suspiciousActionBn: 'ফিশিং লিংক ক্লিকের পর এককালীন ফান্ড সরানো'
      },
      {
        step: 2,
        walletHash: '0x14de88a...99bb',
        providerNameBn: 'রিকার্শন পে (Recursion Pay)',
        amount: 44000,
        timestamp: 'সকাল ১১:৩৭',
        suspiciousActionBn: 'নতুন অচেনা ডিভাইসে লগইন ও তাৎক্ষণিক ট্রান্সফার'
      },
      {
        step: 3,
        walletHash: '0x9923cc1...dd82',
        providerNameBn: 'Wallet B (এমএফএস-১)',
        amount: 43500,
        timestamp: 'সকাল ১১:৩৮',
        suspiciousActionBn: 'মার্চেন্ট পেমেন্ট ছদ্মবেশে ক্যাশ সংগ্রহের চেষ্টা'
      }
    ]
  },
  {
    id: 'ring_3',
    ringCode: 'RING-FD-1109',
    titleBn: 'লটারি ও অনলাইন জুয়া সিন্ডিকেট ট্রানজেকশন রিং',
    threatTypeBn: 'অবৈধ বেটিং ও মানি মিউল নেটওয়ার্ক',
    riskScore: 79,
    walletsInvolvedCount: 12,
    providersInvolvedCount: 4,
    totalVolume: 320000,
    detectedPatternBn:
      'একাধিক অপ্রাপ্তবয়স্ক বা অব্যবহৃত ওয়ালেটে উচ্চ ফ্রিকোয়েন্সিতে ছোট ছোট লেনদেন (Micro-transactions)।',
    recommendedActionBn:
      'কেওয়াইসি (KYC) রি-ভেরিফিকেশন আহ্বান করুন এবং সর্বোচ্চ দৈনিক লেনদেন লিমিট সীমিত করুন।',
    status: 'mitigated',
    federatedConsensusScore: 85,
    createdAt: 'গতকাল, রাত ৯:১৫',
    hops: [
      {
        step: 1,
        walletHash: '0x88ea312...0149',
        providerNameBn: 'Wallet R (এমএফএস-৩)',
        amount: 80000,
        timestamp: 'রাত ৯:০৫',
        suspiciousActionBn: 'অস্বাভাবিক উচ্চ ফ্রিকোয়েন্সি জমা'
      },
      {
        step: 2,
        walletHash: '0x22bc994...a110',
        providerNameBn: 'রিকার্শন পে (Recursion Pay)',
        amount: 78000,
        timestamp: 'রাত ৯:১০',
        suspiciousActionBn: 'অ্যাকাউন্টে কোনো বিল বা ব্যালেন্স না রেখে সরানো'
      }
    ]
  }
];

export function getFraudRings(): FraudRingAlert[] {
  return FRAUD_RINGS_DATA;
}
