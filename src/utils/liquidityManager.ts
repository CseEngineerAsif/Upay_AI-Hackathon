import {
  AgentLiquidityProfile,
  CashReservation,
  FloatExchangeRequest
} from '../types/liquidity';

const RESERVATIONS_STORAGE_KEY = 'upay_cash_reservations_v1';
const FLOAT_EXCHANGE_STORAGE_KEY = 'upay_float_exchanges_v1';

export const NEARBY_AGENTS: AgentLiquidityProfile[] = [
  {
    id: 'ag_1',
    name: 'বিসমিল্লাহ টেলিকম (ফার্মগেট)',
    phone: '01712998811',
    location: 'ফার্মগেট ফুটওভার ব্রিজের নিচে, ঢাকা',
    area: 'ফার্মগেট',
    distanceKm: 0.3,
    cashAvailability: 'high',
    availableCashRangeBn: 'পর্যাপ্ত ক্যাশ আছে (৳৫০,০০০+)',
    cashInHand: 85000,
    eFloatBalance: 25000,
    operatingHours: 'সকাল ৮:০০ - রাত ১১:০০',
    rating: 4.9,
    verified: true,
    avatarIcon: '🏪'
  },
  {
    id: 'ag_2',
    name: 'ধানমন্ডি ডিজিটাল পয়েন্ট (২৭ নম্বর)',
    phone: '01819223344',
    location: 'সোবহানবাগ মসজিদের বিপরীত পাশে, ধানমন্ডি',
    area: 'ধানমন্ডি',
    distanceKm: 0.8,
    cashAvailability: 'high',
    availableCashRangeBn: 'পর্যাপ্ত ক্যাশ আছে (৳৫০,০০০+)',
    cashInHand: 65000,
    eFloatBalance: 42000,
    operatingHours: 'সকাল ৮:৩০ - রাত ১০:৩০',
    rating: 4.8,
    verified: true,
    avatarIcon: '🏢'
  },
  {
    id: 'ag_3',
    name: 'মিরপুর ১০ ফ্রেন্ডস ভ্যারাইটিজ',
    phone: '01912445566',
    location: 'ফলপট্টি মোড়, মিরপুর ১০ গোলচত্বর',
    area: 'মিরপুর',
    distanceKm: 1.2,
    cashAvailability: 'medium',
    availableCashRangeBn: 'সীমিত ক্যাশ (৳১০,০০০ - ৳২০,০০০)',
    cashInHand: 18000,
    eFloatBalance: 98000,
    operatingHours: 'সকাল ৯:০০ - রাত ১০:০০',
    rating: 4.5,
    verified: true,
    avatarIcon: '🏬'
  },
  {
    id: 'ag_4',
    name: 'গুলশান ১ উপায় এক্সপ্রেস হাব',
    phone: '01677889900',
    location: 'গুলশান শপিং সেন্টার নিচতলা, ঢাকা',
    area: 'গুলশান',
    distanceKm: 1.6,
    cashAvailability: 'high',
    availableCashRangeBn: 'পর্যাপ্ত ক্যাশ আছে (৳১,০০,০০০+)',
    cashInHand: 130000,
    eFloatBalance: 35000,
    operatingHours: 'সকাল ৯:৩০ - রাত ১১:৩০',
    rating: 4.95,
    verified: true,
    avatarIcon: '💎'
  },
  {
    id: 'ag_5',
    name: 'মতিঝিল সেন্ট্রাল বাণিজ্যালয়',
    phone: '01555112233',
    location: 'দিলকুশা বাণিজ্যিক এলাকা, ঢাকা',
    area: 'মতিঝিল',
    distanceKm: 2.2,
    cashAvailability: 'low',
    availableCashRangeBn: 'ক্যাশ স্বল্পতা (বুকিং আবশ্যক)',
    cashInHand: 7500,
    eFloatBalance: 145000,
    operatingHours: 'সকাল ৯:০০ - রাত ৮:০০',
    rating: 4.3,
    verified: false,
    avatarIcon: '🏛️'
  }
];

// Current Agent Mock Profile (For Part B Float Exchange)
export const CURRENT_AGENT_FLOAT = {
  agentId: 'ag_current',
  agentName: 'আমার শপ: নিউ ঢাকা টেলিকম',
  agentPhone: '01712345678',
  location: 'গ্রিন রোড, পান্থপথ মোড়, ঢাকা',
  eFloatBalance: 138500, // Large surplus e-float
  cashInHand: 16200,     // Low physical cash
  recentCashOutVolume: 42000,
  recentCashInVolume: 6500,
  dailyTarget: 150000
};

// Initial Exchange Suggestions
export const INITIAL_EXCHANGES: FloatExchangeRequest[] = [
  {
    id: 'fe_1',
    fromAgentId: 'ag_current',
    fromAgentName: 'নিউ ঢাকা টেলিকম (আপনি)',
    toAgentId: 'ag_match_1',
    toAgentName: 'মা টেলিকম (তেজগাঁও মোড়)',
    toAgentLocation: 'তেজগাঁও লিংক রোড, ঢাকা (০.৫ কিমি দূরে)',
    toAgentPhone: '01799887766',
    distanceKm: 0.5,
    amount: 35000,
    direction: 'give_efloat_take_cash',
    matchReasonBn:
      'এই এজেন্টের কাছে ৳৯০,০০০ ক্যাশ উদ্বৃত্ত আছে কিন্তু ই-ফ্লোট কম। আপনার অতিরিক্ত ই-ফ্লোট দিয়ে ক্যাশ নেওয়ার জন্য শতভাগ পারফেক্ট ম্যাচ!',
    status: 'suggested',
    createdAt: 'আজ, দুপুর ১:৩০'
  },
  {
    id: 'fe_2',
    fromAgentId: 'ag_current',
    fromAgentName: 'নিউ ঢাকা টেলিকম (আপনি)',
    toAgentId: 'ag_match_2',
    toAgentName: 'গুলশান ১ এক্সপ্রেস পয়েন্ট',
    toAgentLocation: 'গুলশান ১ মোড় (১.১ কিমি দূরে)',
    toAgentPhone: '01888223344',
    distanceKm: 1.1,
    amount: 50000,
    direction: 'give_efloat_take_cash',
    matchReasonBn:
      'বিকালের পিক আওয়ারের জন্য বড় অঙ্কের ক্যাশ রিজার্ভ রয়েছে। পারস্পরিক সোয়াপ সুবিধা প্রস্তুত।',
    status: 'suggested',
    createdAt: 'আজ, সকাল ১১:১৫'
  }
];

const INITIAL_RESERVATIONS: CashReservation[] = [
  {
    id: 'res_101',
    referenceCode: 'UPAY-CASH-8821-DH',
    agentId: 'ag_1',
    agentName: 'বিসমিল্লাহ টেলিকম (ফার্মগেট)',
    agentPhone: '01712998811',
    agentLocation: 'ফার্মগেট ফুটওভার ব্রিজের নিচে, ঢাকা',
    amount: 10000,
    timeSlot: 'আজ দুপুর ২:০০ - ৩:০০',
    reservedAt: 'আজ, দুপুর ১:৪৫',
    expiresAt: 'আজ, দুপুর ৩:০০',
    status: 'active',
    qrCodePayload: 'UPAY-RESERVE:8821:10000:AG1'
  }
];

export function getCashReservations(): CashReservation[] {
  try {
    const raw = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(INITIAL_RESERVATIONS));
      return INITIAL_RESERVATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_RESERVATIONS;
  } catch (e) {
    return INITIAL_RESERVATIONS;
  }
}

export function saveCashReservations(list: CashReservation[]): void {
  try {
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save reservations:', e);
  }
}

export function createCashReservation(params: {
  agent: AgentLiquidityProfile;
  amount: number;
  timeSlot: string;
}): CashReservation {
  const all = getCashReservations();
  const randCode = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const ref = `UPAY-CASH-${randCode}-${params.agent.area.slice(0, 2).toUpperCase()}`;

  const newReservation: CashReservation = {
    id: `res_${Date.now()}`,
    referenceCode: ref,
    agentId: params.agent.id,
    agentName: params.agent.name,
    agentPhone: params.agent.phone,
    agentLocation: params.agent.location,
    amount: params.amount,
    timeSlot: params.timeSlot,
    reservedAt: now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    expiresAt: '৪৫ মিনিট ভ্যালিডিটি',
    status: 'active',
    qrCodePayload: `UPAY-RESERVE:${ref}:${params.amount}`
  };

  all.unshift(newReservation);
  saveCashReservations(all);
  return newReservation;
}

export function cancelCashReservation(resId: string): boolean {
  const all = getCashReservations();
  const idx = all.findIndex((r) => r.id === resId);
  if (idx !== -1) {
    all[idx].status = 'cancelled';
    saveCashReservations(all);
    return true;
  }
  return false;
}

// Float Exchanges (Part B)
export function getFloatExchanges(): FloatExchangeRequest[] {
  try {
    const raw = localStorage.getItem(FLOAT_EXCHANGE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FLOAT_EXCHANGE_STORAGE_KEY, JSON.stringify(INITIAL_EXCHANGES));
      return INITIAL_EXCHANGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_EXCHANGES;
  } catch (e) {
    return INITIAL_EXCHANGES;
  }
}

export function saveFloatExchanges(list: FloatExchangeRequest[]): void {
  try {
    localStorage.setItem(FLOAT_EXCHANGE_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save exchanges:', e);
  }
}

export function sendExchangeRequest(requestId: string): FloatExchangeRequest | null {
  const all = getFloatExchanges();
  const item = all.find((x) => x.id === requestId);
  if (item) {
    item.status = 'requested';
    item.verificationPin = `${Math.floor(1000 + Math.random() * 9000)}`;
    saveFloatExchanges(all);
    return item;
  }
  return null;
}

export function completeExchangeRequest(requestId: string): FloatExchangeRequest | null {
  const all = getFloatExchanges();
  const item = all.find((x) => x.id === requestId);
  if (item) {
    item.status = 'completed';
    saveFloatExchanges(all);
    return item;
  }
  return null;
}
