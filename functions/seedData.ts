import { Transaction, AnalystQueueItem, SavingsGoal, UserProfile } from '../src/types';

export interface SyntheticBenchmarkCase {
  id: string;
  amount: number;
  isActualFraud: boolean;
  predictedRiskScore: number;
  predictedLevel: 'low' | 'medium' | 'high';
  region: 'Dhaka' | 'Chittagong' | 'Sylhet' | 'Rajshahi' | 'Khulna' | 'Barisal';
  ageGroup: '18-25' | '26-40' | '41-60' | '60+';
  userTenure: 'new' | 'established';
  latencyMs: number;
  triggerSignals: string[];
}

export function generateSeedData() {
  const primaryUser: UserProfile = {
    id: 'user_main_maynul',
    name: 'MD. AL-MAYNUL HASAN',
    phone: '01794809461',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
    balance: 18450,
    pin: '1234',
    isBiometricEnabled: true,
    role: 'user',
    guardianPhone: '01819234567',
    guardianName: 'রেহানা পারভীন (মা)',
    guardianStatus: 'connected',
    language: 'bn',
    simpleMode: false,
    aiConsentGiven: true,
    accountTier: 'Verified Plus (NID)',
    joinedDate: '2023-04-12'
  };

  const now = new Date();
  const daysAgo = (days: number, hour = 14, min = 30) => {
    const d = new Date(now.getTime() - days * 24 * 3600 * 1000);
    d.setHours(hour, min, 0, 0);
    return d.toISOString();
  };

  const transactions: Transaction[] = [
    {
      id: 'tx_01',
      userId: primaryUser.id,
      type: 'send_money',
      recipient: '01711223344',
      recipientName: 'তানভীর আহমেদ (বন্ধু)',
      amount: 450,
      fee: 0,
      total: 450,
      note: 'চা-নাস্তা ও আড্ডা',
      category: 'খাবার',
      categoryEn: 'Food & Dining',
      roundUpAmount: 50,
      timestamp: daysAgo(0, 11, 20),
      status: 'completed',
      riskScore: 12,
      riskLevel: 'low',
      riskSignals: ['ESTABLISHED_RECIPIENT']
    },
    {
      id: 'tx_02',
      userId: primaryUser.id,
      type: 'send_money',
      recipient: '01855667788',
      recipientName: 'করিম রিকশাওয়ালা',
      amount: 75,
      fee: 0,
      total: 75,
      note: 'রিকশা ভাড়া ধানমন্ডি',
      category: 'ট্রান্সপোর্ট',
      categoryEn: 'Transport',
      roundUpAmount: 25,
      timestamp: daysAgo(1, 9, 45),
      status: 'completed',
      riskScore: 8,
      riskLevel: 'low',
      riskSignals: ['TYPICAL_AMOUNT']
    },
    {
      id: 'tx_03',
      userId: primaryUser.id,
      type: 'pay_bill',
      recipient: 'DESCO_PREPAID_109',
      recipientName: 'ডেসকো প্রিপেইড মিটার',
      amount: 1450,
      fee: 0,
      total: 1450,
      note: 'বিদ্যুৎ বিল সেপ্টেম্বর',
      category: 'বিল',
      categoryEn: 'Utility & Bills',
      roundUpAmount: 50,
      timestamp: daysAgo(2, 16, 10),
      status: 'completed',
      riskScore: 5,
      riskLevel: 'low',
      riskSignals: ['VERIFIED_UTILITY_BILLER']
    },
    {
      id: 'tx_04',
      userId: primaryUser.id,
      type: 'send_money',
      recipient: '01912987654',
      recipientName: 'কাচ্চি ভাই বনানী',
      amount: 980,
      fee: 0,
      total: 980,
      note: 'কাচ্চি বিরিয়ানি লাঞ্চ',
      category: 'খাবার',
      categoryEn: 'Food & Dining',
      roundUpAmount: 20,
      timestamp: daysAgo(3, 14, 15),
      status: 'completed',
      riskScore: 10,
      riskLevel: 'low',
      riskSignals: ['MERCHANT_VERIFIED']
    },
    {
      id: 'tx_05',
      userId: primaryUser.id,
      type: 'mobile_recharge',
      recipient: '01794809461',
      recipientName: 'আমার গ্রামীণফোন নম্বর',
      amount: 299,
      fee: 0,
      total: 299,
      note: 'ইন্টারনেট প্যাক ৪০ জিবি',
      category: 'বিল',
      categoryEn: 'Utility & Bills',
      roundUpAmount: 1,
      timestamp: daysAgo(4, 18, 0),
      status: 'completed',
      riskScore: 5,
      riskLevel: 'low',
      riskSignals: ['OWN_NUMBER']
    },
    {
      id: 'tx_06',
      userId: primaryUser.id,
      type: 'cash_out',
      recipient: '01720112233',
      recipientName: 'উপায় এজেন্ট ফার্মগেট',
      amount: 2000,
      fee: 28,
      total: 2028,
      note: 'ক্যাশ আউট বাজার খরচ',
      category: 'ক্যাশ-আউট',
      categoryEn: 'Cash Out',
      roundUpAmount: 0,
      timestamp: daysAgo(6, 17, 30),
      status: 'completed',
      riskScore: 18,
      riskLevel: 'low',
      riskSignals: ['AGENT_LOCATION_FREQUENT']
    },
    {
      id: 'tx_07',
      userId: primaryUser.id,
      type: 'send_money',
      recipient: '01819234567',
      recipientName: 'রেহানা পারভীন (মা)',
      amount: 5000,
      fee: 0,
      total: 5000,
      note: 'মায়ের মাসিক হাতখরচ',
      category: 'অন্যান্য',
      categoryEn: 'Others',
      roundUpAmount: 0,
      timestamp: daysAgo(8, 10, 0),
      status: 'completed',
      riskScore: 6,
      riskLevel: 'low',
      riskSignals: ['GUARDIAN_TRUSTED']
    },
    {
      id: 'tx_08',
      userId: primaryUser.id,
      type: 'send_money',
      recipient: '01777889900',
      recipientName: 'স্বপ্ন সুপারশপ',
      amount: 2340,
      fee: 0,
      total: 2340,
      note: 'মাসিক মুদির বাজার চাল ডাল',
      category: 'শপিং',
      categoryEn: 'Shopping & Groceries',
      roundUpAmount: 60,
      timestamp: daysAgo(10, 20, 15),
      status: 'completed',
      riskScore: 11,
      riskLevel: 'low',
      riskSignals: ['REGULAR_GROCERY']
    },
    {
      id: 'tx_09',
      userId: primaryUser.id,
      type: 'send_money',
      recipient: '01311002233',
      recipientName: 'পাঠাও রাইড',
      amount: 190,
      fee: 0,
      total: 190,
      note: 'উত্তরা থেকে গুলশান রাইড',
      category: 'ট্রান্সপোর্ট',
      categoryEn: 'Transport',
      roundUpAmount: 10,
      timestamp: daysAgo(12, 19, 40),
      status: 'completed',
      riskScore: 9,
      riskLevel: 'low',
      riskSignals: ['RIDE_SHARING']
    },
    {
      id: 'tx_10',
      userId: primaryUser.id,
      type: 'pay_bill',
      recipient: 'WASA_BILL_882',
      recipientName: 'ঢাকা ওয়াসা বিল',
      amount: 620,
      fee: 0,
      total: 620,
      note: 'পানি সাপ্লাই বিল',
      category: 'বিল',
      categoryEn: 'Utility & Bills',
      roundUpAmount: 30,
      timestamp: daysAgo(15, 12, 10),
      status: 'completed',
      riskScore: 5,
      riskLevel: 'low',
      riskSignals: ['UTILITY_NORMAL']
    },
    {
      id: 'tx_11',
      userId: primaryUser.id,
      type: 'send_money',
      recipient: '01700000000',
      recipientName: 'অজানা লটারি এজেন্ট',
      amount: 12000,
      fee: 0,
      total: 12000,
      note: 'লটারি ট্যাক্স ফি প্রদান',
      category: 'অন্যান্য',
      categoryEn: 'Others',
      roundUpAmount: 0,
      timestamp: daysAgo(18, 2, 45), // Odd hour!
      status: 'flagged',
      riskScore: 88,
      riskLevel: 'high',
      riskSignals: ['FLAGGED_RECIPIENT_DATABASE', 'SEVERE_AMOUNT_ANOMALY', 'ODD_HOURS_ACTIVITY', 'SUSPICIOUS_NOTE_KEYWORDS'],
      feedbackGiven: 'helpful',
      isScamConfirmed: true
    }
  ];

  const goals: SavingsGoal[] = [
    {
      id: 'goal_01',
      userId: primaryUser.id,
      title: '৬ মাসে ৩০,০০০ ইমার্জেন্সি ফান্ড',
      targetAmount: 30000,
      currentAmount: 14250,
      durationMonths: 6,
      monthlySavings: 5000,
      roundUpActive: true,
      category: 'ইমার্জেন্সি'
    },
    {
      id: 'goal_02',
      userId: primaryUser.id,
      title: 'নতুন ল্যাপটপ কেনার স্বপ্ন',
      targetAmount: 65000,
      currentAmount: 22000,
      durationMonths: 10,
      monthlySavings: 6500,
      roundUpActive: true,
      category: 'গ্যাজেট'
    }
  ];

  const analystQueue: AnalystQueueItem[] = [
    {
      id: 'queue_item_1',
      transactionId: 'tx_flagged_901',
      userName: 'Md. Kamrul Hasan',
      userPhone: '01899112233',
      recipientPhone: '01700000000',
      recipientName: 'উপহার বিভাগ সাপোর্ট',
      amount: 25000,
      riskScore: 92,
      riskLevel: 'high',
      signals: ['অপরিচিত নতুন প্রাপক', 'স্বাভাবিক গড়ের চেয়ে ৮ গুণ বেশি', 'রাত ২:৩০ লেনদেন', 'কালো তালিকাভুক্ত প্রতারক নম্বর'],
      status: 'pending',
      timestamp: daysAgo(0, 11, 45)
    },
    {
      id: 'queue_item_2',
      transactionId: 'tx_flagged_902',
      userName: 'Nusrat Jahan',
      userPhone: '01755443322',
      recipientPhone: '01999999999',
      recipientName: 'টেলিগ্রাম ইনভেস্ট বট',
      amount: 15000,
      riskScore: 84,
      riskLevel: 'high',
      signals: ['নতুন ডিভাইস থেকে লগইন', 'উচ্চ ভেলোসিটি (১০ মিনিটে ৩য় চেষ্টা)', 'সন্দেহজনক ইনভেস্টমেন্ট কি-ওয়ার্ড'],
      status: 'pending',
      timestamp: daysAgo(0, 8, 30)
    },
    {
      id: 'queue_item_3',
      transactionId: 'tx_flagged_903',
      userName: 'MD. AL-MAYNUL HASAN',
      userPhone: '01794809461',
      recipientPhone: '01700000000',
      recipientName: 'অজানা লটারি এজেন্ট',
      amount: 12000,
      riskScore: 88,
      riskLevel: 'high',
      signals: ['লটারি ট্যাক্স ফি প্রদান', 'রাত ২:৪৫ লেনদেন', 'সন্দেহজনক নম্বর ডাটাবেজ'],
      status: 'reviewed',
      analystNotes: 'গ্রাহককে সতর্কবার্তা সফলভাবে প্রদর্শিত হয়েছে। গ্রাহক পিন এন্ট্রি বাতিল করেছেন।',
      timestamp: daysAgo(18, 2, 45),
      userFeedback: 'helpful',
      isScamConfirmed: true
    },
    {
      id: 'queue_item_4',
      transactionId: 'tx_flagged_904',
      userName: 'Rafiqul Alam (Elderly)',
      userPhone: '01511223344',
      recipientPhone: '01812345678',
      recipientName: 'ভুয়া পুলিশ কর্মকর্তা',
      amount: 40000,
      riskScore: 96,
      riskLevel: 'high',
      signals: ['চরম অর্থ অসঙ্গতি (১৫ গুণ)', 'অভিভাবক সতর্কতা পাঠানো হয়েছে', 'পরিচিত extortion প্যাটার্ন'],
      status: 'escalated',
      analystNotes: 'অভিভাবক ফোনে কথা বলে টাকা পাঠানো রোধ করেছেন। নম্বরটি সেন্ট্রাল MFS ব্লকলিস্টে পাঠানো হয়েছে।',
      timestamp: daysAgo(1, 15, 20),
      isScamConfirmed: true
    }
  ];

  // 120 synthetic cases for Admin Monitoring and Model Fairness Evaluation
  const benchmarkCases: SyntheticBenchmarkCase[] = [];
  const regions: SyntheticBenchmarkCase['region'][] = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal'];
  const ageGroups: SyntheticBenchmarkCase['ageGroup'][] = ['18-25', '26-40', '41-60', '60+'];
  
  for (let i = 1; i <= 120; i++) {
    const isActualFraud = i % 5 === 0; // 24 fraud cases out of 120
    const region = regions[i % regions.length];
    const ageGroup = ageGroups[i % ageGroups.length];
    const userTenure = i % 3 === 0 ? 'new' : 'established';
    
    // Simulate score with high fidelity
    let predictedScore = 0;
    if (isActualFraud) {
      predictedScore = 65 + Math.floor(Math.sin(i) * 15) + Math.floor(Math.random() * 15);
      predictedScore = Math.min(98, Math.max(68, predictedScore));
    } else {
      // Normal transactions, with a few false alarms
      const falseAlarm = i % 17 === 0;
      if (falseAlarm) {
        predictedScore = 72; // False positive
      } else {
        predictedScore = 8 + Math.floor(Math.random() * 25);
      }
    }

    const predictedLevel = predictedScore >= 70 ? 'high' : predictedScore >= 35 ? 'medium' : 'low';
    const latencyMs = 85 + Math.floor(Math.random() * 110);
    const amount = isActualFraud ? (15000 + (i * 700) % 35000) : (150 + (i * 240) % 4500);

    benchmarkCases.push({
      id: `bench_${i}`,
      amount,
      isActualFraud,
      predictedRiskScore: predictedScore,
      predictedLevel,
      region,
      ageGroup,
      userTenure,
      latencyMs,
      triggerSignals: isActualFraud ? ['AMOUNT_ANOMALY', 'NEW_RECIPIENT', 'HIGH_VELOCITY'] : ['BASELINE_NORMAL']
    });
  }

  return {
    primaryUser,
    transactions,
    goals,
    analystQueue,
    benchmarkCases
  };
}
