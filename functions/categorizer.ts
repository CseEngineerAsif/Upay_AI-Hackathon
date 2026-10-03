import { TransactionCategory } from '../src/types';

interface CategoryRule {
  category: TransactionCategory;
  categoryEn: string;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'খাবার',
    categoryEn: 'Food & Dining',
    keywords: [
      'চা', 'নাস্তা', 'মিষ্টি', 'বিরিয়ানি', 'বিরিয়ানি', 'রেস্টুরেন্ট', 'হোটেল', 'খাবার',
      'ফুডপান্ডা', 'ফুড', 'ডিনার', 'লাঞ্চ', 'কাচ্চি', 'বার্গার', 'কফি', 'পিঠা',
      'food', 'snack', 'tea', 'cafe', 'restaurant', 'burger', 'kacchi', 'sweet', 'bakery'
    ]
  },
  {
    category: 'ট্রান্সপোর্ট',
    categoryEn: 'Transport',
    keywords: [
      'রিকশা', 'রিকশা ভাড়া', 'উবার', 'পাঠাও', 'বাস', 'সিএনজি', 'ট্রেন', 'লঞ্চ',
      'পেট্রোল', 'ভাড়া', 'ভাড়া', 'টোল', 'মেট্রোরেল', 'যাতায়াত',
      'rickshaw', 'uber', 'pathao', 'cng', 'bus', 'train', 'metro', 'fare', 'ride', 'fuel'
    ]
  },
  {
    category: 'বিল',
    categoryEn: 'Utility & Bills',
    keywords: [
      'ডেসকো', 'ডিপিডিসি', 'পল্লি বিদ্যুৎ', 'পল্লী বিদ্যুৎ', 'গ্যাস', 'ওয়াসা', 'ওয়াসা',
      'পানি', 'ইন্টারনেট', 'কারেন্ট', 'বিদ্যুৎ', 'বিল', 'টিটাশ', 'কর্ণফুলী', 'লিঙ্ক৩',
      'desco', 'dpdc', 'wasa', 'gas', 'electric', 'bill', 'wifi', 'internet', 'recharge'
    ]
  },
  {
    category: 'ক্যাশ-আউট',
    categoryEn: 'Cash Out',
    keywords: [
      'ক্যাশ আউট', 'এজেন্ট', 'উত্তোলন', 'ক্যাশআউট', 'টাকা তোলা',
      'cash out', 'cashout', 'agent', 'withdraw', 'atm'
    ]
  },
  {
    category: 'শপিং',
    categoryEn: 'Shopping & Groceries',
    keywords: [
      'দারাজ', 'চালডাল', 'আড়ং', 'আড়ং', 'কেনাকাটা', 'শপ', 'বাজার', 'চাল', 'মুদি',
      'জামাকাপড়', 'কাপড়', 'সুপারশপ', 'স্বপ্ন', 'মীনা বাজার', 'মুদির দোকান',
      'daraz', 'chaldal', 'aarong', 'shop', 'store', 'market', 'bazar', 'grocery', 'cloth'
    ]
  }
];

export function categorizeTransaction(note?: string, recipientName?: string, type?: string): { category: TransactionCategory; categoryEn: string } {
  if (type === 'cash_out') {
    return { category: 'ক্যাশ-আউট', categoryEn: 'Cash Out' };
  }
  if (type === 'pay_bill') {
    return { category: 'বিল', categoryEn: 'Utility & Bills' };
  }
  if (type === 'mobile_recharge') {
    return { category: 'বিল', categoryEn: 'Mobile Recharge' };
  }

  const textToAnalyze = `${note || ''} ${recipientName || ''}`.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (textToAnalyze.includes(kw.toLowerCase())) {
        return { category: rule.category, categoryEn: rule.categoryEn };
      }
    }
  }

  return { category: 'অন্যান্য', categoryEn: 'Others' };
}
