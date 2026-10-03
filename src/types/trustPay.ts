export type TrustPayStatus =
  | 'order_created'
  | 'payment_held'
  | 'delivered'
  | 'released'
  | 'disputed';

export interface SellerTrustInfo {
  sellerName: string;
  sellerPhone: string;
  fCommercePage?: string;
  trustLevel: 'high' | 'medium' | 'caution';
  trustScore: number; // 0-100
  badgeTitleBn: string;
  badgeTitleEn: string;
  explanationBn: string;
  explanationEn: string;
  totalOrders: number;
  successfulDeliveries: number;
  disputeCount: number;
  averageDeliveryDays: number;
  customerRating: number;
  riskWarningBn?: string;
}

export interface TrustPayStatusHistoryItem {
  status: TrustPayStatus;
  timestamp: string;
  noteBn: string;
  noteEn: string;
}

export interface TrustPayOrder {
  id: string;
  itemName: string;
  itemCategory: string;
  itemDescription?: string;
  amount: number;
  courierService: string;
  trackingNumber: string;
  sellerName: string;
  sellerPhone: string;
  fCommercePage?: string;
  buyerName: string;
  buyerPhone: string;
  status: TrustPayStatus;
  statusHistory: TrustPayStatusHistoryItem[];
  sellerTrust: SellerTrustInfo;
  escrowContractId: string;
  disputeReason?: string;
  createdAt: string;
  estimatedDeliveryDate: string;
}
