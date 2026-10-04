import { ChildProfile, ChildPendingRequest, ChildTransaction } from '../types/childWallet';

const STORAGE_KEY_CHILDREN = 'upay_child_profiles_v1';
const STORAGE_KEY_REQUESTS = 'upay_child_requests_v1';
const STORAGE_KEY_TXS = 'upay_child_txs_v1';

export const INITIAL_CHILDREN: ChildProfile[] = [
  {
    id: 'child_1',
    name: 'তাহসিন রহমান',
    age: 9,
    avatar: '👦',
    phoneMasked: '০১৭**-***৪৮২',
    balance: 1450,
    dailySpendingLimit: 250,
    perTxLimit: 150,
    requireApproval: true,
    isLocked: false,
    allowedCategories: {
      books: true,
      canteen: true,
      transport: true,
      gaming: false
    }
  },
  {
    id: 'child_2',
    name: 'নুসরাত জাহান',
    age: 13,
    avatar: '👧',
    phoneMasked: '০১৮**-***৩১৯',
    balance: 2100,
    dailySpendingLimit: 400,
    perTxLimit: 250,
    requireApproval: true,
    isLocked: false,
    allowedCategories: {
      books: true,
      canteen: true,
      transport: true,
      gaming: false
    }
  }
];

export const INITIAL_REQUESTS: ChildPendingRequest[] = [
  {
    id: 'req_1',
    childId: 'child_1',
    childName: 'তাহসিন রহমান',
    merchantName: 'রকমারি বুকশপ (সায়েন্স প্রজেক্ট)',
    category: 'books',
    amount: 180,
    note: 'বিজ্ঞান মেলা প্রজেক্টের কালার পেপার ও বই',
    requestedAt: 'আজ, দুপুর ১:১৫',
    status: 'pending'
  }
];

export const INITIAL_TXS: ChildTransaction[] = [
  {
    id: 'ctx_1',
    childId: 'child_1',
    childName: 'তাহসিন রহমান',
    type: 'expense',
    merchantOrSender: 'আইডিয়াল স্কুল ক্যান্টিন',
    amount: 60,
    category: 'canteen',
    timestamp: 'আজ, সকাল ১১:৩০',
    status: 'completed'
  },
  {
    id: 'ctx_2',
    childId: 'child_1',
    childName: 'তাহসিন রহমান',
    type: 'salami',
    merchantOrSender: 'মামা (নাসির উদ্দিন) থেকে ঈদ সালামি',
    amount: 500,
    category: 'salami',
    timestamp: 'গতকাল, বিকাল ৫:১০',
    status: 'completed'
  },
  {
    id: 'ctx_3',
    childId: 'child_2',
    childName: 'নুসরাত জাহান',
    type: 'expense',
    merchantOrSender: 'অনলাইন লাইব্রেরি - গণিত অলিম্পিয়াড',
    amount: 150,
    category: 'books',
    timestamp: 'গতকাল, দুপুর ২:২০',
    status: 'completed'
  },
  {
    id: 'ctx_4',
    childId: 'child_2',
    childName: 'নুসরাত জাহান',
    type: 'allowance',
    merchantOrSender: 'অভিভাবক কর্তৃক সাপ্তাহিক পকেটমানি',
    amount: 500,
    category: 'allowance',
    timestamp: '২ দিন আগে',
    status: 'completed'
  }
];

export function getChildrenProfiles(): ChildProfile[] {
  if (typeof window === 'undefined') return INITIAL_CHILDREN;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHILDREN);
    return raw ? JSON.parse(raw) : INITIAL_CHILDREN;
  } catch {
    return INITIAL_CHILDREN;
  }
}

export function saveChildrenProfiles(profiles: ChildProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CHILDREN, JSON.stringify(profiles));
  } catch (err) {
    console.warn('Failed to save child profiles:', err);
  }
}

export function getPendingRequests(): ChildPendingRequest[] {
  if (typeof window === 'undefined') return INITIAL_REQUESTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUESTS);
    return raw ? JSON.parse(raw) : INITIAL_REQUESTS;
  } catch {
    return INITIAL_REQUESTS;
  }
}

export function savePendingRequests(requests: ChildPendingRequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
  } catch (err) {
    console.warn('Failed to save child requests:', err);
  }
}

export function getChildTransactions(): ChildTransaction[] {
  if (typeof window === 'undefined') return INITIAL_TXS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TXS);
    return raw ? JSON.parse(raw) : INITIAL_TXS;
  } catch {
    return INITIAL_TXS;
  }
}

export function saveChildTransactions(txs: ChildTransaction[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(txs));
  } catch (err) {
    console.warn('Failed to save child transactions:', err);
  }
}

export function updateChildControls(
  childId: string,
  updates: Partial<ChildProfile>
): ChildProfile[] {
  const children = getChildrenProfiles();
  const updated = children.map((c) => (c.id === childId ? { ...c, ...updates } : c));
  saveChildrenProfiles(updated);
  return updated;
}

export function handleRequestAction(
  requestId: string,
  action: 'approved' | 'rejected'
): { updatedRequests: ChildPendingRequest[]; updatedChildren: ChildProfile[] } {
  const requests = getPendingRequests();
  const children = getChildrenProfiles();
  const targetReq = requests.find((r) => r.id === requestId);

  let updatedChildren = children;

  if (targetReq && action === 'approved') {
    // Deduct amount from child balance if sufficient
    updatedChildren = children.map((c) => {
      if (c.id === targetReq.childId) {
        return {
          ...c,
          balance: Math.max(0, c.balance - targetReq.amount)
        };
      }
      return c;
    });
    saveChildrenProfiles(updatedChildren);

    // Add to transaction log
    const newTx: ChildTransaction = {
      id: `ctx_${Date.now()}`,
      childId: targetReq.childId,
      childName: targetReq.childName,
      type: 'expense',
      merchantOrSender: targetReq.merchantName,
      amount: targetReq.amount,
      category: targetReq.category,
      timestamp: 'এখনই অনুমোদিত',
      status: 'approved'
    };
    const txs = [newTx, ...getChildTransactions()];
    saveChildTransactions(txs);
  }

  const updatedRequests = requests.map((r) =>
    r.id === requestId ? { ...r, status: action } : r
  );
  savePendingRequests(updatedRequests);

  return { updatedRequests, updatedChildren };
}

export function sendAllowanceToChild(
  childId: string,
  amount: number,
  note?: string
): { updatedChildren: ChildProfile[]; newTx: ChildTransaction } {
  const children = getChildrenProfiles();
  let targetChild = children.find((c) => c.id === childId);

  const updatedChildren = children.map((c) =>
    c.id === childId ? { ...c, balance: c.balance + amount } : c
  );
  saveChildrenProfiles(updatedChildren);

  const newTx: ChildTransaction = {
    id: `ctx_${Date.now()}`,
    childId: childId,
    childName: targetChild?.name || 'সন্তান',
    type: 'allowance',
    merchantOrSender: note ? `পকেটমানি: ${note}` : 'অভিভাবক কর্তৃক পকেটমানি রিচার্জ',
    amount: amount,
    category: 'allowance',
    timestamp: 'এখনই যুক্ত হয়েছে',
    status: 'completed'
  };

  const currentTxs = getChildTransactions();
  saveChildTransactions([newTx, ...currentTxs]);

  return { updatedChildren, newTx };
}
