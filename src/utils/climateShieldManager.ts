import { DisasterType, AffectedDistrictDemand, ReliefDisbursementItem } from '../types/climateShield';

const CLIMATE_STORAGE_KEY = 'upay_climate_shield_v1';
const RELIEF_STORAGE_KEY = 'upay_relief_items_v1';

export const FLOOD_AFFECTED_DISTRICTS: AffectedDistrictDemand[] = [
  {
    districtBn: 'ফেনী জেলা',
    districtEn: 'Feni',
    alertLevel: 'danger',
    signalNumberBn: 'মহাবিপদ সংকেত ৮',
    expectedDemandSurgePct: 340,
    recommendedAgentFloatBn: '৳১,৫০,০০০+ প্রতি পয়েন্ট',
    emergencyAgentCount: 142
  },
  {
    districtBn: 'সুনামগঞ্জ জেলা',
    districtEn: 'Sunamganj',
    alertLevel: 'danger',
    signalNumberBn: 'বিপদ সংকেত ৭',
    expectedDemandSurgePct: 390,
    recommendedAgentFloatBn: '৳১,৮০,০০০+ প্রতি পয়েন্ট',
    emergencyAgentCount: 185
  },
  {
    districtBn: 'নোয়াখালী জেলা',
    districtEn: 'Noakhali',
    alertLevel: 'warning',
    signalNumberBn: 'বিপদ সংকেত ৬',
    expectedDemandSurgePct: 280,
    recommendedAgentFloatBn: '৳১,২০,০০০+ প্রতি পয়েন্ট',
    emergencyAgentCount: 210
  },
  {
    districtBn: 'কুমিল্লা (দক্ষিণ)',
    districtEn: 'Cumilla South',
    alertLevel: 'warning',
    signalNumberBn: 'সতর্ক সংকেত ৪',
    expectedDemandSurgePct: 210,
    recommendedAgentFloatBn: '৳১,০০,০০০+ প্রতি পয়েন্ট',
    emergencyAgentCount: 165
  }
];

export const CYCLONE_AFFECTED_DISTRICTS: AffectedDistrictDemand[] = [
  {
    districtBn: 'ভোলা জেলা',
    districtEn: 'Bhola',
    alertLevel: 'danger',
    signalNumberBn: 'মহাবিপদ সংকেত ১০',
    expectedDemandSurgePct: 420,
    recommendedAgentFloatBn: '৳২,০০,০০০+ প্রতি পয়েন্ট',
    emergencyAgentCount: 120
  },
  {
    districtBn: 'পটুয়াখালী জেলা',
    districtEn: 'Patuakhali',
    alertLevel: 'danger',
    signalNumberBn: 'মহাবিপদ সংকেত ৯',
    expectedDemandSurgePct: 380,
    recommendedAgentFloatBn: '৳১,৭০,০০০+ প্রতি পয়েন্ট',
    emergencyAgentCount: 135
  },
  {
    districtBn: 'বাগেরহাট ও মোংলা',
    districtEn: 'Bagerhat',
    alertLevel: 'warning',
    signalNumberBn: 'বিপদ সংকেত ৭',
    expectedDemandSurgePct: 310,
    recommendedAgentFloatBn: '৳১,৪০,০০০+ প্রতি পয়েন্ট',
    emergencyAgentCount: 98
  },
  {
    districtBn: 'কক্সবাজার উপকূল',
    districtEn: 'Coxs Bazar Coast',
    alertLevel: 'warning',
    signalNumberBn: 'বিপদ সংকেত ৬',
    expectedDemandSurgePct: 350,
    recommendedAgentFloatBn: '৳১,৫০,০০০+ প্রতি পয়েন্ট',
    emergencyAgentCount: 180
  }
];

export const INITIAL_RELIEF_ITEMS: ReliefDisbursementItem[] = [
  {
    id: 'rel_1',
    programNameBn: 'জাতীয় দুর্যোগ জরুরি নগদ সহায়তা (G2P)',
    organizationBn: 'দুর্যোগ ব্যবস্থাপনা ও ত্রাণ মন্ত্রণালয়',
    organizationType: 'govt',
    amount: 5000,
    disbursedDate: 'আজ, সকাল ৯:০০',
    status: 'received',
    beneficiaryNidMasked: '১৯৯১********৭৮১২',
    referenceNumber: 'DMR-RELIEF-2026-8819'
  },
  {
    id: 'rel_2',
    programNameBn: 'জরুরি আপদকালীন খাদ্য ও পুষ্টি অনুদান',
    organizationBn: 'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি (BDRCS)',
    organizationType: 'ngo',
    amount: 3500,
    disbursedDate: 'আজ, দুপুর ১:১৫',
    status: 'sent',
    beneficiaryNidMasked: '১৯৯১********৭৮১২',
    referenceNumber: 'RCS-EMRG-7721-BD'
  },
  {
    id: 'rel_3',
    programNameBn: 'ডব্লিউএফপি ক্লাইমেট রেজিলিয়েন্স ক্যাশ গ্রান্ট',
    organizationBn: 'ইউএন ওয়ার্ল্ড ফুড প্রোগ্রাম (WFP)',
    organizationType: 'un',
    amount: 4000,
    disbursedDate: 'প্রক্রিয়াধীন',
    status: 'pending',
    beneficiaryNidMasked: '১৯৯১********৭৮১২',
    referenceNumber: 'WFP-BGD-REL-4402'
  },
  {
    id: 'rel_4',
    programNameBn: 'ব্র্যাক আপদকালীন বন্যা সুরক্ষা অনুদান',
    organizationBn: 'ব্র্যাক দুর্যোগ ব্যবস্থাপনা সেল',
    organizationType: 'ngo',
    amount: 2500,
    disbursedDate: 'গতকাল, সন্ধ্যা ৭:৩০',
    status: 'sent',
    beneficiaryNidMasked: '১৯৯১********৭৮১২',
    referenceNumber: 'BRAC-DISASTER-1109'
  }
];

export function getClimateShieldConfig(): { isActive: boolean; disasterType: DisasterType } {
  try {
    const raw = localStorage.getItem(CLIMATE_STORAGE_KEY);
    if (!raw) return { isActive: false, disasterType: 'none' };
    return JSON.parse(raw);
  } catch (e) {
    return { isActive: false, disasterType: 'none' };
  }
}

export function saveClimateShieldConfig(config: { isActive: boolean; disasterType: DisasterType }): void {
  try {
    localStorage.setItem(CLIMATE_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Climate Shield config:', e);
  }
}

export function getReliefDisbursements(): ReliefDisbursementItem[] {
  try {
    const raw = localStorage.getItem(RELIEF_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RELIEF_STORAGE_KEY, JSON.stringify(INITIAL_RELIEF_ITEMS));
      return INITIAL_RELIEF_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_RELIEF_ITEMS;
  } catch (e) {
    return INITIAL_RELIEF_ITEMS;
  }
}

export function claimReliefFunds(id: string): ReliefDisbursementItem | null {
  const all = getReliefDisbursements();
  const item = all.find((r) => r.id === id);
  if (item) {
    item.status = 'received';
    localStorage.setItem(RELIEF_STORAGE_KEY, JSON.stringify(all));
    return item;
  }
  return null;
}
