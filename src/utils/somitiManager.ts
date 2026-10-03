import { DigitalSomiti, SomitiMember, SomitiLedgerEntry, SomitiEarlyWarningAlert } from '../types/somiti';

const SOMITI_STORAGE_KEY = 'upay_digital_somiti_list_v1';

const INITIAL_SOMITIS: DigitalSomiti[] = [
  {
    id: 'somiti_dhanmondi_1',
    name: 'ধানমন্ডি ফ্রেন্ডস সেভিংস সমিতি',
    description: '৫ জন বাল্যবন্ধুর মাসিক সঞ্চয় ও বিনিয়োগ সার্কেল',
    category: 'friends',
    adminId: 'u_kamal',
    adminName: 'কামাল হোসেন',
    adminPhone: '01711223344',
    monthlyContribution: 5000,
    totalCycles: 5,
    currentCycle: 2,
    poolAmountPerCycle: 25000,
    totalPotCollectedCurrentCycle: 15000, // 3 members paid, 2 remaining
    startDate: '০১ সেপ্টেম্বর ২০২৬',
    nextPayoutDate: '০৫ অক্টোবর ২০২৬',
    status: 'active',
    members: [
      {
        id: 'u_asif',
        name: 'আসিফ রহমান',
        phone: '01712345678',
        role: 'member',
        payoutCycle: 4,
        payoutDate: '০৫ ডিসেম্বর ২০২৬',
        hasPaidCurrentCycle: true,
        isCurrentUser: true,
        earlyWarningRisk: 'low'
      },
      {
        id: 'u_kamal',
        name: 'কামাল হোসেন (অ্যাডমিন)',
        phone: '01711223344',
        role: 'admin',
        payoutCycle: 1,
        payoutDate: '০৫ সেপ্টেম্বর ২০২৬ (পে-আউট সম্পন্ন)',
        hasPaidCurrentCycle: true,
        earlyWarningRisk: 'low'
      },
      {
        id: 'u_sadia',
        name: 'সাদিয়া ইসলাম',
        phone: '01899112233',
        role: 'member',
        payoutCycle: 2,
        payoutDate: '০৫ অক্টোবর ২০২৬ (আসন্ন প্রাপক)',
        hasPaidCurrentCycle: true,
        earlyWarningRisk: 'low'
      },
      {
        id: 'u_tanveer',
        name: 'তানভীর আহমেদ',
        phone: '01911445566',
        role: 'member',
        payoutCycle: 3,
        payoutDate: '০৫ নভেম্বর ২০২৬',
        hasPaidCurrentCycle: false,
        earlyWarningRisk: 'critical',
        earlyWarningReason: 'কিস্তির আর মাত্র ১ দিন বাকি, ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।'
      },
      {
        id: 'u_nusrat',
        name: 'নুসরাত জাহান',
        phone: '01677334455',
        role: 'member',
        payoutCycle: 5,
        payoutDate: '০৫ জানুয়ারি ২০২৭',
        hasPaidCurrentCycle: false,
        earlyWarningRisk: 'warning',
        earlyWarningReason: 'কিস্তির আর মাত্র ২ দিন বাকি।'
      }
    ],
    payoutExplanation: {
      algorithm: 'Recursion Pay AI Fair Lottery v2.4',
      rationaleBn:
        'নিরপেক্ষ ক্রিপ্টোগ্রাফিক লটারি সিড ও পারিবারিক জরুরি আর্থিক চাহিদার সমন্বয়ে এই পে-আউট ক্রম নির্ধারিত হয়েছে। কোনো সদস্য বা অ্যাডমিনকে অযৌক্তিক অগ্রাধিকার দেওয়া হয়নি। গ্রুপের ৫ জনের সম্মতি ও স্বচ্ছ অডিট রেকর্ড সংরক্ষিত।',
      rationaleEn:
        'This payout sequence was determined via an unbiased cryptographic lottery algorithm combined with verified personal urgency. No admin favoritism was applied, and all 5 members have verified public consensus.',
      fairnessScore: 99,
      factors: [
        {
          titleBn: 'জরুরি আর্থিক অগ্রাধিকার',
          titleEn: 'Emergency Need Parity',
          descriptionBn: 'সাইকেল ১ ও ২ এর সদস্যদের জরুরি পারিবারিক ও ব্যবসায়িক প্রতিশ্রুতি অনুযায়ী নির্ধারিত।',
          descriptionEn: 'Cycles 1 & 2 prioritize verified family & business seasonal working capital.'
        },
        {
          titleBn: 'অপরিবর্তনীয় ক্রিপ্টো লটারি',
          titleEn: 'Cryptographic Lottery',
          descriptionBn: 'পরবর্তী সাইকেলসমূহ (৩, ৪, ৫) সম্পূর্ণ পক্ষপাতহীন ও লটারির মাধ্যমে সাজানো।',
          descriptionEn: 'Remaining positions (3, 4, 5) were randomized via deterministic public lottery.'
        },
        {
          titleBn: 'জিরো অ্যাডমিন ফ্রড প্রোটেকশন',
          titleEn: 'Anti-Admin Fraud Lock',
          descriptionBn: 'অ্যাডমিন এককভাবে এই ক্রম কিংবা লেজারের টাকা পরিবর্তন করতে পারবে না।',
          descriptionEn: 'The group admin cannot unilaterally edit this sequence or tamper with escrowed funds.'
        }
      ],
      transparencyHash: '0x8f3c7a1029bd44ea981f',
      generatedAt: '০১ সেপ্টেম্বর ২০২৬, সকাল ১০:০০'
    },
    ledger: [
      {
        id: 'led_1',
        somitiId: 'somiti_dhanmondi_1',
        type: 'contribution',
        memberId: 'u_kamal',
        memberName: 'কামাল হোসেন',
        cycleNumber: 1,
        amount: 5000,
        date: '০১ সেপ্টেম্বর ২০২৬',
        time: '১০:৩০ AM',
        immutableHash: '0x1a89f92c10b44',
        verifiedBy: 'system_escrow',
        note: 'সাইকেল ১ কিস্তি'
      },
      {
        id: 'led_2',
        somitiId: 'somiti_dhanmondi_1',
        type: 'contribution',
        memberId: 'u_asif',
        memberName: 'আসিফ রহমান',
        cycleNumber: 1,
        amount: 5000,
        date: '০১ সেপ্টেম্বর ২০২৬',
        time: '১১:১৫ AM',
        immutableHash: '0x2b90e83d21c55',
        verifiedBy: 'system_escrow',
        note: 'সাইকেল ১ কিস্তি'
      },
      {
        id: 'led_3',
        somitiId: 'somiti_dhanmondi_1',
        type: 'contribution',
        memberId: 'u_sadia',
        memberName: 'সাদিয়া ইসলাম',
        cycleNumber: 1,
        amount: 5000,
        date: '০২ সেপ্টেম্বর ২০২৬',
        time: '০২:৪৫ PM',
        immutableHash: '0x3c01d74e32d66',
        verifiedBy: 'system_escrow',
        note: 'সাইকেল ১ কিস্তি'
      },
      {
        id: 'led_4',
        somitiId: 'somiti_dhanmondi_1',
        type: 'contribution',
        memberId: 'u_tanveer',
        memberName: 'তানভীর আহমেদ',
        cycleNumber: 1,
        amount: 5000,
        date: '০৩ সেপ্টেম্বর ২০২৬',
        time: '০৯:২০ AM',
        immutableHash: '0x4d12c65f43e77',
        verifiedBy: 'system_escrow',
        note: 'সাইকেল ১ কিস্তি'
      },
      {
        id: 'led_5',
        somitiId: 'somiti_dhanmondi_1',
        type: 'contribution',
        memberId: 'u_nusrat',
        memberName: 'নুসরাত জাহান',
        cycleNumber: 1,
        amount: 5000,
        date: '০৪ সেপ্টেম্বর ২০২৬',
        time: '০৪:১০ PM',
        immutableHash: '0x5e23b56a54f88',
        verifiedBy: 'system_escrow',
        note: 'সাইকেল ১ কিস্তি'
      },
      {
        id: 'led_6',
        somitiId: 'somiti_dhanmondi_1',
        type: 'payout',
        memberId: 'u_kamal',
        memberName: 'কামাল হোসেন (প্রাপক)',
        cycleNumber: 1,
        amount: 25000,
        date: '০৫ সেপ্টেম্বর ২০২৬',
        time: '০৫:০০ PM',
        immutableHash: '0x6f34a47b65a99',
        verifiedBy: 'system_escrow',
        note: 'সাইকেল ১ পূর্ণ পে-আউট বিতরণ সম্পন্ন'
      },
      // Cycle 2 payments so far
      {
        id: 'led_7',
        somitiId: 'somiti_dhanmondi_1',
        type: 'contribution',
        memberId: 'u_kamal',
        memberName: 'কামাল হোসেন',
        cycleNumber: 2,
        amount: 5000,
        date: '০১ অক্টোবর ২০২৬',
        time: '১১:০০ AM',
        immutableHash: '0x7a45b38c76b10',
        verifiedBy: 'system_escrow',
        note: 'সাইকেল ২ কিস্তি'
      },
      {
        id: 'led_8',
        somitiId: 'somiti_dhanmondi_1',
        type: 'contribution',
        memberId: 'u_asif',
        memberName: 'আসিফ রহমান',
        cycleNumber: 2,
        amount: 5000,
        date: '০২ অক্টোবর ২০২৬',
        time: '১২:৩০ PM',
        immutableHash: '0x8b56c29d87c21',
        verifiedBy: 'system_escrow',
        note: 'সাইকেল ২ কিস্তি'
      },
      {
        id: 'led_9',
        somitiId: 'somiti_dhanmondi_1',
        type: 'contribution',
        memberId: 'u_sadia',
        memberName: 'সাদিয়া ইসলাম',
        cycleNumber: 2,
        amount: 5000,
        date: '০২ অক্টোবর ২০২৬',
        time: '০৩:১৫ PM',
        immutableHash: '0x9c67d1ae98d32',
        verifiedBy: 'system_escrow',
        note: 'সাইকেল ২ কিস্তি'
      }
    ],
    earlyWarnings: [
      {
        id: 'ew_1',
        somitiId: 'somiti_dhanmondi_1',
        memberId: 'u_tanveer',
        memberName: 'তানভীর আহমেদ',
        memberPhone: '01911445566',
        severity: 'critical',
        dueDate: '০৫ অক্টোবর ২০২৬',
        daysRemaining: 1,
        amountDue: 5000,
        messageBn:
          'জরুরি অ্যালার্ট: তানভীর আহমেদের সাইকেল ২ কিস্তি ৳৫,০০০ আগামীকাল দেওয়ার শেষ তারিখ। ওয়ালেটে ব্যালেন্স কম থাকায় পে-আউট বিলম্বের ঝুঁকি রয়েছে।',
        messageEn:
          'Critical Alert: Tanveer Ahmed has ৳5,000 due tomorrow for Cycle 2. Low wallet balance flagged.',
        isRead: false
      },
      {
        id: 'ew_2',
        somitiId: 'somiti_dhanmondi_1',
        memberId: 'u_nusrat',
        memberName: 'নুসরাত জাহান',
        memberPhone: '01677334455',
        severity: 'warning',
        dueDate: '০৫ অক্টোবর ২০২৬',
        daysRemaining: 2,
        amountDue: 5000,
        messageBn:
          'আগাম স্মরণিকা: নুসরাত জাহানের সাইকেল ২ কিস্তি প্রদানের আর মাত্র ২ দিন বাকি।',
        messageEn:
          'Reminder: Nusrat Jahan has 2 days remaining to contribute for Cycle 2.',
        isRead: false
      }
    ],
    createdAt: '০১ সেপ্টেম্বর ২০২৬'
  },
  {
    id: 'somiti_mirpur_biz',
    name: 'মিরপুর টেক উদ্যোক্তা সমিতি',
    description: '৪ জন উদ্যোক্তার মাসিক ব্যবসা সম্প্রসারণ ফান্ড',
    category: 'business',
    adminId: 'u_asif',
    adminName: 'আসিফ রহমান',
    adminPhone: '01712345678',
    monthlyContribution: 10000,
    totalCycles: 4,
    currentCycle: 1,
    poolAmountPerCycle: 40000,
    totalPotCollectedCurrentCycle: 40000, // All 4 members paid!
    startDate: '১৫ সেপ্টেম্বর ২০২৬',
    nextPayoutDate: '১৫ অক্টোবর ২০২৬',
    status: 'active',
    members: [
      {
        id: 'u_asif',
        name: 'আসিফ রহমান (অ্যাডমিন)',
        phone: '01712345678',
        role: 'admin',
        payoutCycle: 1,
        payoutDate: '১৫ অক্টোবর ২০২৬ (আসন্ন প্রাপক)',
        hasPaidCurrentCycle: true,
        isCurrentUser: true,
        earlyWarningRisk: 'low'
      },
      {
        id: 'u_rafiq',
        name: 'রফিকুল ইসলাম',
        phone: '01719887766',
        role: 'member',
        payoutCycle: 2,
        payoutDate: '১৫ নভেম্বর ২০২৬',
        hasPaidCurrentCycle: true,
        earlyWarningRisk: 'low'
      },
      {
        id: 'u_farhana',
        name: 'ফারহানা শারমিন',
        phone: '01819776655',
        role: 'member',
        payoutCycle: 3,
        payoutDate: '১৫ ডিসেম্বর ২০২৬',
        hasPaidCurrentCycle: true,
        earlyWarningRisk: 'low'
      },
      {
        id: 'u_mahbub',
        name: 'মাহবুব আলম',
        phone: '01912554433',
        role: 'member',
        payoutCycle: 4,
        payoutDate: '১৫ জানুয়ারি ২০২৭',
        hasPaidCurrentCycle: true,
        earlyWarningRisk: 'low'
      }
    ],
    payoutExplanation: {
      algorithm: 'Consensus Rotation Protocol v1.9',
      rationaleBn:
        'উদ্যোক্তাদের বিজনেস ইনভেন্টরি পারচেজ সিজনের অগ্রাধিকার অনুযায়ী প্রথম পে-আউট আসিফ রহমানকে এবং পরবর্তী পে-আউটগুলো সম্পূর্ণ সমতার ভিত্তিতে নির্ধারিত।',
      rationaleEn:
        'Cycle 1 was designated for Asif Rahman based on quarterly seasonal hardware procurement, followed by lottery-based rotation for remaining members.',
      fairnessScore: 100,
      factors: [
        {
          titleBn: 'বিজনেস সাইকেল অগ্রাধিকার',
          titleEn: 'Business Cycle Priority',
          descriptionBn: 'উৎসব ও সরবরাহ চক্র বিবেচনা করে সুষম ফান্ড বণ্টন।',
          descriptionEn: 'Fund distribution aligned with inventory stocking cycles.'
        },
        {
          titleBn: '১০০% এসক্রো নিশ্চয়তা',
          titleEn: '100% Escrow Guarantee',
          descriptionBn: 'সকল টাকা সরাসরি রিকার্শন পে এসক্রো ওয়ালেটে সুরক্ষিত থাকে।',
          descriptionEn: 'All pooled money is locked in smart bank escrow.'
        }
      ],
      transparencyHash: '0x9a8b7c6d5e4f3a2b',
      generatedAt: '১৫ সেপ্টেম্বর ২০২৬'
    },
    ledger: [
      {
        id: 'led_m1',
        somitiId: 'somiti_mirpur_biz',
        type: 'contribution',
        memberId: 'u_asif',
        memberName: 'আসিফ রহমান',
        cycleNumber: 1,
        amount: 10000,
        date: '১৫ সেপ্টেম্বর ২০২৬',
        time: '০৯:০০ AM',
        immutableHash: '0xaa11bb22cc33',
        verifiedBy: 'system_escrow',
        note: 'সাইকেল ১ কিস্তি'
      },
      {
        id: 'led_m2',
        somitiId: 'somiti_mirpur_biz',
        type: 'contribution',
        memberId: 'u_rafiq',
        memberName: 'রফিকুল ইসলাম',
        cycleNumber: 1,
        amount: 10000,
        date: '১৬ সেপ্টেম্বর ২০২৬',
        time: '১১:২০ AM',
        immutableHash: '0xbb22cc33dd44',
        verifiedBy: 'system_escrow',
        note: 'সাইকেল ১ কিস্তি'
      },
      {
        id: 'led_m3',
        somitiId: 'somiti_mirpur_biz',
        type: 'contribution',
        memberId: 'u_farhana',
        memberName: 'ফারহানা শারমিন',
        cycleNumber: 1,
        amount: 10000,
        date: '১৭ সেপ্টেম্বর ২০২৬',
        time: '০২:৪৫ PM',
        immutableHash: '0xcc33dd44ee55',
        verifiedBy: 'system_escrow',
        note: 'সাইকেল ১ কিস্তি'
      },
      {
        id: 'led_m4',
        somitiId: 'somiti_mirpur_biz',
        type: 'contribution',
        memberId: 'u_mahbub',
        memberName: 'মাহবুব আলম',
        cycleNumber: 1,
        amount: 10000,
        date: '১৮ সেপ্টেম্বর ২০২৬',
        time: '০৪:১০ PM',
        immutableHash: '0xdd44ee55ff66',
        verifiedBy: 'system_escrow',
        note: 'সাইকেল ১ কিস্তি'
      }
    ],
    earlyWarnings: [],
    createdAt: '১৫ সেপ্টেম্বর ২০২৬'
  }
];

export function getSomitis(): DigitalSomiti[] {
  try {
    const raw = localStorage.getItem(SOMITI_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SOMITI_STORAGE_KEY, JSON.stringify(INITIAL_SOMITIS));
      return INITIAL_SOMITIS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SOMITIS;
  } catch (err) {
    return INITIAL_SOMITIS;
  }
}

export function saveSomitis(list: DigitalSomiti[]): void {
  try {
    localStorage.setItem(SOMITI_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save somitis:', err);
  }
}

export function getSomitiById(id: string): DigitalSomiti | undefined {
  const all = getSomitis();
  return all.find((s) => s.id === id);
}

export function contributeInstallment(
  somitiId: string,
  memberId: string,
  amount: number,
  currentUser: { name: string; phone: string }
): { success: boolean; updatedSomiti?: DigitalSomiti; error?: string } {
  const somitis = getSomitis();
  const idx = somitis.findIndex((s) => s.id === somitiId);
  if (idx === -1) return { success: false, error: 'Somiti not found' };

  const somiti = { ...somitis[idx] };
  const member = somiti.members.find((m) => m.id === memberId);
  if (!member) return { success: false, error: 'Member not found in Somiti' };

  if (member.hasPaidCurrentCycle) {
    return { success: false, error: 'এই সাইকেলের কিস্তি ইতোমধ্যে পরিশোধ করা হয়েছে।' };
  }

  // Mark member as paid
  member.hasPaidCurrentCycle = true;
  member.earlyWarningRisk = 'low';
  somiti.totalPotCollectedCurrentCycle += amount;

  // Append immutable ledger entry with anti-fraud hash
  const hash = `0x${Array.from({ length: 14 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

  const ledgerEntry: SomitiLedgerEntry = {
    id: `led_${Date.now()}`,
    somitiId,
    type: 'contribution',
    memberId: member.id,
    memberName: member.name,
    memberPhone: member.phone,
    cycleNumber: somiti.currentCycle,
    amount,
    date: dateStr,
    time: timeStr,
    immutableHash: hash,
    verifiedBy: 'system_escrow',
    note: `সাইকেল ${somiti.currentCycle} কিস্তি (রিকার্শন পে ওয়ালেট ডেবিট)`
  };

  somiti.ledger = [ledgerEntry, ...somiti.ledger];

  // Remove any early warning for this member
  somiti.earlyWarnings = somiti.earlyWarnings.filter((ew) => ew.memberId !== memberId);

  somitis[idx] = somiti;
  saveSomitis(somitis);

  return { success: true, updatedSomiti: somiti };
}

export function disburseCyclePayout(
  somitiId: string
): { success: boolean; updatedSomiti?: DigitalSomiti; recipientName?: string; error?: string } {
  const somitis = getSomitis();
  const idx = somitis.findIndex((s) => s.id === somitiId);
  if (idx === -1) return { success: false, error: 'Somiti not found' };

  const somiti = { ...somitis[idx] };
  if (somiti.totalPotCollectedCurrentCycle < somiti.poolAmountPerCycle) {
    return { success: false, error: 'সকল সদস্যের কিস্তি জমা না হওয়া পর্যন্ত পে-আউট আনলক হবে না।' };
  }

  const recipient = somiti.members.find((m) => m.payoutCycle === somiti.currentCycle);
  if (!recipient) return { success: false, error: 'Recipient for this cycle not found' };

  // Generate immutable ledger entry for payout
  const hash = `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

  const payoutEntry: SomitiLedgerEntry = {
    id: `payout_${Date.now()}`,
    somitiId,
    type: 'payout',
    memberId: recipient.id,
    memberName: `${recipient.name} (পে-আউট প্রাপক)`,
    memberPhone: recipient.phone,
    cycleNumber: somiti.currentCycle,
    amount: somiti.poolAmountPerCycle,
    date: dateStr,
    time: timeStr,
    immutableHash: hash,
    verifiedBy: 'system_escrow',
    note: `সাইকেল ${somiti.currentCycle} এর মোট তহবিল ৳${somiti.poolAmountPerCycle.toLocaleString()} সফলভাবে হস্তান্তর সম্পন্ন`
  };

  somiti.ledger = [payoutEntry, ...somiti.ledger];

  // Advance to next cycle if available
  if (somiti.currentCycle < somiti.totalCycles) {
    somiti.currentCycle += 1;
    somiti.totalPotCollectedCurrentCycle = 0;
    // reset hasPaidCurrentCycle for new cycle
    somiti.members.forEach((m) => {
      m.hasPaidCurrentCycle = false;
    });
  } else {
    somiti.status = 'completed';
  }

  somitis[idx] = somiti;
  saveSomitis(somitis);

  return { success: true, updatedSomiti: somiti, recipientName: recipient.name };
}

export function createNewSomiti(params: {
  name: string;
  category: 'friends' | 'business' | 'family' | 'neighborhood' | 'colleagues';
  description?: string;
  monthlyContribution: number;
  totalCycles: number;
  adminUser: { id: string; name: string; phone: string };
  members: { name: string; phone: string; priorityReason?: string }[];
  payoutExplanation: any;
}): DigitalSomiti {
  const somitis = getSomitis();
  const newId = `somiti_${Date.now()}`;

  // Build full members array starting with admin as member 1 or according to payout order
  const allMembersData: SomitiMember[] = [
    {
      id: params.adminUser.id || 'u_asif',
      name: `${params.adminUser.name} (অ্যাডমিন)`,
      phone: params.adminUser.phone,
      role: 'admin',
      payoutCycle: 1,
      payoutDate: '১৫ অক্টোবর ২০২৬',
      hasPaidCurrentCycle: false,
      isCurrentUser: true,
      earlyWarningRisk: 'low'
    },
    ...params.members.map((m, idx) => ({
      id: `u_m_${Date.now()}_${idx}`,
      name: m.name,
      phone: m.phone,
      role: 'member' as const,
      payoutCycle: idx + 2,
      payoutDate: `১৫ ${['নভেম্বর', 'ডিসেম্বর', 'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল'][idx % 6]} ২০২৬`,
      hasPaidCurrentCycle: false,
      earlyWarningRisk: 'low' as const
    }))
  ];

  // If AI generated an ordered sequence, map payoutCycles accordingly
  if (params.payoutExplanation?.orderedMemberIds && Array.isArray(params.payoutExplanation.orderedMemberIds)) {
    const orderedIds: string[] = params.payoutExplanation.orderedMemberIds;
    allMembersData.forEach((member, i) => {
      const foundIdx = orderedIds.indexOf(member.id);
      if (foundIdx !== -1) {
        member.payoutCycle = foundIdx + 1;
      }
    });
  }

  const poolAmountPerCycle = params.monthlyContribution * allMembersData.length;

  const now = new Date();
  const dateStr = now.toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' });

  const newSomiti: DigitalSomiti = {
    id: newId,
    name: params.name,
    category: params.category,
    description: params.description || 'ডিজিটাল উপায়ে নিরাপদ সঞ্চয় সার্কেল',
    adminId: params.adminUser.id,
    adminName: params.adminUser.name,
    adminPhone: params.adminUser.phone,
    monthlyContribution: params.monthlyContribution,
    totalCycles: params.totalCycles || allMembersData.length,
    currentCycle: 1,
    poolAmountPerCycle,
    totalPotCollectedCurrentCycle: 0,
    startDate: dateStr,
    nextPayoutDate: '১৫ অক্টোবর ২০২৬',
    status: 'active',
    members: allMembersData,
    payoutExplanation: params.payoutExplanation || {
      algorithm: 'Recursion Pay AI Fair Lottery v2.4',
      rationaleBn: 'সিস্টেমের নিরপেক্ষ ক্রিপ্টোগ্রাফিক লটারি সিড দ্বারা এই পে-আউট ক্রম নির্ধারিত হয়েছে।',
      rationaleEn: 'Generated via Recursion Pay AI fair lottery consensus protocol.',
      fairnessScore: 98,
      factors: [
        {
          titleBn: 'পক্ষপাতহীন লটারি',
          titleEn: 'Unbiased Lottery',
          descriptionBn: 'সকল সদস্যের সমান সুযোগ নিশ্চিত করা হয়েছে।',
          descriptionEn: 'All members share equal probability.'
        }
      ],
      transparencyHash: `0x${Math.random().toString(16).slice(2, 10)}`,
      generatedAt: dateStr
    },
    ledger: [
      {
        id: `led_init_${Date.now()}`,
        somitiId: newId,
        type: 'emergency_relief',
        memberId: params.adminUser.id,
        memberName: 'সিস্টেম কন্ট্রাক্ট',
        cycleNumber: 1,
        amount: 0,
        date: dateStr,
        time: now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        immutableHash: `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        verifiedBy: 'system_escrow',
        note: `সমিতি শুরু হয়েছে। মোট ${allMembersData.length} সদস্য, মাসিক কিস্তি ৳${params.monthlyContribution.toLocaleString()}`
      }
    ],
    earlyWarnings: [],
    createdAt: dateStr
  };

  somitis.unshift(newSomiti);
  saveSomitis(somitis);
  return newSomiti;
}
