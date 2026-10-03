import {
  CashOutAuditRecord,
  OverchargeHotspot,
  AgentInvestigationItem,
  AdminInvestigationStatus
} from '../types/feeAuditor';

const INVESTIGATION_STORAGE_KEY = 'upay_overcharge_investigations_v1';
const AUDIT_HISTORY_STORAGE_KEY = 'upay_cashout_audit_history_v1';

// Official Upay Cash-Out Fee: 1.4% (৳14 per ৳1,000)
export const OFFICIAL_CASHOUT_RATE_PCT = 1.4;

export function calculateOfficialFee(amount: number): number {
  return Math.ceil((amount * OFFICIAL_CASHOUT_RATE_PCT) / 100);
}

export const HOTSPOTS_DATA: OverchargeHotspot[] = [
  {
    id: 'spot_1',
    zoneNameBn: 'ফার্মগেট ও তেজগাঁও বাসস্ট্যান্ড মোড়',
    cityBn: 'ঢাকা উত্তর',
    riskLevel: 'high',
    totalReportsCount: 42,
    averageOverchargeBn: '৳১৫ - ৳২৫ প্রতি হাজার',
    coordinatesLabel: '২৩.৭৫৭৭° উ, ৯০.৩৮৮৩° পূ',
    flaggedAgentsCount: 8
  },
  {
    id: 'spot_2',
    zoneNameBn: 'যাত্রাবাড়ী বাস টার্মিনাল ও ফ্লাইওভার চত্বর',
    cityBn: 'ঢাকা দক্ষিণ',
    riskLevel: 'high',
    totalReportsCount: 38,
    averageOverchargeBn: '৳২০ - ৳৩০ প্রতি হাজার',
    coordinatesLabel: '২৩.৭০৯৮° উ, ৯০.৪৩৭৬° পূ',
    flaggedAgentsCount: 6
  },
  {
    id: 'spot_3',
    zoneNameBn: 'মিরপুর-১০ গোলচত্বর ও শাহ আলী প্লাজা',
    cityBn: 'ঢাকা উত্তর',
    riskLevel: 'medium',
    totalReportsCount: 26,
    averageOverchargeBn: '৳১০ - ৳১৫ প্রতি হাজার',
    coordinatesLabel: '২৩.৮০৭২° উ, ৯০.৩৬৯৪° পূ',
    flaggedAgentsCount: 4
  },
  {
    id: 'spot_4',
    zoneNameBn: 'জিইসি মোড় ও বহদ্দারহাট এলাকা',
    cityBn: 'চট্টগ্রাম মেট্রো',
    riskLevel: 'medium',
    totalReportsCount: 19,
    averageOverchargeBn: '৳১০ - ৳২০ প্রতি হাজার',
    coordinatesLabel: '২২.৩৫৮৪° উ, ৯১.৮২২১° পূ',
    flaggedAgentsCount: 3
  }
];

export const INITIAL_INVESTIGATIONS: AgentInvestigationItem[] = [
  {
    id: 'inv_1',
    agentCode: 'AGT-DH-8812',
    agentNameBn: 'হক টেলিকম ও স্টেশনারি',
    phoneMasked: '০১৭১১-****৮৯',
    outletAddressBn: 'ফার্মগেট ইন্দিরা রোড, ঢাকা',
    reportsCount: 18,
    lastReportedTime: 'আজ, দুপুর ১২:৩০',
    status: 'new',
    penaltyWarningIssued: false,
    notesBn: 'গ্রাহকদের কাছ থেকে প্রতি হাজারে ২০ টাকা করে নেওয়ার অভিযোগ।'
  },
  {
    id: 'inv_2',
    agentCode: 'AGT-DH-4419',
    agentNameBn: 'আল-মদিনা এন্টারপ্রাইজ',
    phoneMasked: '০১৯১২-****২৩',
    outletAddressBn: 'যাত্রাবাড়ী বাস টার্মিনাল গেট-২',
    reportsCount: 15,
    lastReportedTime: 'আজ, সকাল ১০:১৫',
    status: 'under_review',
    penaltyWarningIssued: true,
    notesBn: 'অডিট টিম সরেজমিনে পরিদর্শন করছে।'
  },
  {
    id: 'inv_3',
    agentCode: 'AGT-DH-2201',
    agentNameBn: 'জননী টেলিকমিউনিকেশন',
    phoneMasked: '০১৮১৮-****৭৭',
    outletAddressBn: 'মিরপুর-১০ শপিং সেন্টারের সামনে',
    reportsCount: 11,
    lastReportedTime: 'গতকাল, রাত ৮:০০',
    status: 'resolved',
    penaltyWarningIssued: true,
    notesBn: 'শোকজ প্রদান এবং রিফান্ড সমন্বয় করা হয়েছে।'
  },
  {
    id: 'inv_4',
    agentCode: 'AGT-CTG-9034',
    agentNameBn: 'বিসমিল্লাহ ভ্যারাইটিজ স্টোর',
    phoneMasked: '০১৬৭৭-****১২',
    outletAddressBn: 'জিইসি সার্কেল, চট্টগ্রাম',
    reportsCount: 9,
    lastReportedTime: 'গতকাল, বিকেল ৪:২০',
    status: 'under_review',
    penaltyWarningIssued: false,
    notesBn: 'স্থানীয় টেরিটরি ম্যানেজারকে অবহিত করা হয়েছে।'
  },
  {
    id: 'inv_5',
    agentCode: 'AGT-DH-1109',
    agentNameBn: 'বন্ধু টেলিকম ও বিকাশ/উপায় পয়েন্ট',
    phoneMasked: '০১৭৫২-****৪৫',
    outletAddressBn: 'নিউমার্কেট কাঁচাবাজারের গলি, ঢাকা',
    reportsCount: 7,
    lastReportedTime: '২ দিন আগে',
    status: 'new',
    penaltyWarningIssued: false,
    notesBn: 'অতিরিক্ত চার্জের স্ক্রিনশট পাওয়া গেছে।'
  }
];

export function getInvestigations(): AgentInvestigationItem[] {
  try {
    const raw = localStorage.getItem(INVESTIGATION_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INVESTIGATION_STORAGE_KEY, JSON.stringify(INITIAL_INVESTIGATIONS));
      return INITIAL_INVESTIGATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INVESTIGATIONS;
  } catch (e) {
    return INITIAL_INVESTIGATIONS;
  }
}

export function saveInvestigations(items: AgentInvestigationItem[]): void {
  try {
    localStorage.setItem(INVESTIGATION_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save investigations:', e);
  }
}

export function updateInvestigationStatus(id: string, status: AdminInvestigationStatus): void {
  const all = getInvestigations();
  const found = all.find((x) => x.id === id);
  if (found) {
    found.status = status;
    saveInvestigations(all);
  }
}

export function submitAnonymousOverchargeReport(data: {
  agentName: string;
  locationBn: string;
  overchargeAmount: number;
}): void {
  const all = getInvestigations();
  // Check if agent exists or add as new
  const existing = all.find(
    (a) => a.agentNameBn.toLowerCase().includes(data.agentName.toLowerCase()) || a.outletAddressBn.includes(data.locationBn)
  );

  if (existing) {
    existing.reportsCount += 1;
    existing.lastReportedTime = 'এইমাত্র';
    existing.status = 'new';
  } else {
    const newItem: AgentInvestigationItem = {
      id: `inv_${Date.now()}`,
      agentCode: `AGT-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      agentNameBn: data.agentName || 'অজ্ঞাত এজেন্ট পয়েন্ট',
      phoneMasked: '০১***-****০০',
      outletAddressBn: data.locationBn || 'ঢাকা মেট্রো এলাকা',
      reportsCount: 1,
      lastReportedTime: 'এইমাত্র',
      status: 'new',
      penaltyWarningIssued: false,
      notesBn: `গ্রাহক কর্তৃক ৳${data.overchargeAmount} অতিরিক্ত নেওয়ার অভিযোগ দায়ের।`
    };
    all.unshift(newItem);
  }

  saveInvestigations(all);
}
