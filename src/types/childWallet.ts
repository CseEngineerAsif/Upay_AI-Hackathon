export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  phoneMasked: string;
  balance: number;
  dailySpendingLimit: number;
  perTxLimit: number;
  requireApproval: boolean;
  isLocked: boolean;
  allowedCategories: {
    books: boolean;
    canteen: boolean;
    transport: boolean;
    gaming: boolean;
  };
}

export interface ChildPendingRequest {
  id: string;
  childId: string;
  childName: string;
  merchantName: string;
  category: 'books' | 'canteen' | 'transport' | 'gaming';
  amount: number;
  note: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ChildTransaction {
  id: string;
  childId: string;
  childName: string;
  type: 'allowance' | 'salami' | 'expense';
  merchantOrSender: string;
  amount: number;
  category: 'books' | 'canteen' | 'transport' | 'gaming' | 'allowance' | 'salami';
  timestamp: string;
  status: 'completed' | 'approved' | 'declined';
}
