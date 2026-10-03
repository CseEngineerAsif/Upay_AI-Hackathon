export type CashAvailabilityLevel = 'high' | 'medium' | 'low';

export interface AgentLiquidityProfile {
  id: string;
  name: string;
  phone: string;
  location: string;
  area: string;
  distanceKm: number;
  cashAvailability: CashAvailabilityLevel;
  availableCashRangeBn: string;
  cashInHand: number;
  eFloatBalance: number;
  operatingHours: string;
  rating: number;
  verified: boolean;
  avatarIcon?: string;
}

export interface CashReservation {
  id: string;
  referenceCode: string; // e.g. UPAY-CASH-7892-DH
  agentId: string;
  agentName: string;
  agentPhone: string;
  agentLocation: string;
  amount: number;
  timeSlot: string;
  reservedAt: string;
  expiresAt: string;
  status: 'active' | 'completed' | 'cancelled';
  qrCodePayload: string;
}

export interface FloatExchangeRequest {
  id: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  toAgentLocation: string;
  toAgentPhone: string;
  distanceKm: number;
  amount: number;
  direction: 'give_efloat_take_cash' | 'give_cash_take_efloat';
  matchReasonBn: string;
  status: 'suggested' | 'requested' | 'accepted' | 'completed';
  createdAt: string;
  verificationPin?: string;
}
