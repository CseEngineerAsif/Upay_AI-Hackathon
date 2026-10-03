import { TrustPayOrder, SellerTrustInfo, TrustPayStatus } from '../types/trustPay';

const TRUSTPAY_STORAGE_KEY = 'upay_trustpay_orders_v1';

export const KNOWN_SELLERS: SellerTrustInfo[] = [
  {
    sellerName: 'দারুচিনি বুটিক (Daruchini Boutique)',
    sellerPhone: '01711998877',
    fCommercePage: 'facebook.com/daruchini.boutique.bd',
    trustLevel: 'high',
    trustScore: 97,
    badgeTitleBn: 'সবুজ ভেরিফাইড (উচ্চ বিশ্বস্ত)',
    badgeTitleEn: 'High Trust Seller',
    explanationBn:
      'এই পেজের ৪৮০টি অর্ডারের মধ্যে ৯৮.৩% সফল ডেলিভারি হয়েছে। কোনো অনিষ্পন্ন বিরোধ নেই এবং গড় ডেলিভারি সময় ১.৯ দিন। নিরাপদ কেনাকাটার জন্য অত্যন্ত বিশ্বস্ত।',
    explanationEn: 'Verified top-tier F-commerce seller with 98.3% fulfillment and zero open disputes.',
    totalOrders: 480,
    successfulDeliveries: 472,
    disputeCount: 1,
    averageDeliveryDays: 1.9,
    customerRating: 4.9
  },
  {
    sellerName: 'গ্যাজেট বাজ বিডি (Gadget Buzz BD)',
    sellerPhone: '01822334455',
    fCommercePage: 'facebook.com/gadgetbuzz.official',
    trustLevel: 'medium',
    trustScore: 78,
    badgeTitleBn: 'হলুদ ব্যাজ (মধ্যম বিশ্বস্ত)',
    badgeTitleEn: 'Moderate Trust Seller',
    explanationBn:
      'বিক্রেতা গত ৬ মাস সক্রিয় এবং ৪৮টি অর্ডার সম্পন্ন করেছেন। কিছু কুরিয়ার বিলম্ব ছাড়া সামগ্রিক রেকর্ড সন্তোষজনক। পার্সেল চেক করে টাকা ছাড়ার পরামর্শ দেওয়া হচ্ছে।',
    explanationEn: 'Moderate history with occasional courier delay. Recommend checking package before release.',
    totalOrders: 48,
    successfulDeliveries: 44,
    disputeCount: 2,
    averageDeliveryDays: 2.8,
    customerRating: 4.2
  },
  {
    sellerName: 'অনলাইন শু ফ্যাশন ২৪ (Online Shoe Fashion 24)',
    sellerPhone: '01933445566',
    fCommercePage: 'facebook.com/shoefashion24.bd',
    trustLevel: 'caution',
    trustScore: 38,
    badgeTitleBn: 'লাল সতর্কতা (উচ্চ ঝুঁকি)',
    badgeTitleEn: 'Caution / High Risk',
    explanationBn:
      'সতর্কতা: এই বিক্রেতার বিরুদ্ধে ১৮টি অর্ডারের মধ্যে ৬টি ডেলিভারি না দেওয়া বা ভুল পণ্য পাঠানোর অভিযোগ রয়েছে। কোনো অবস্থাতেই অগ্রিম পুরো টাকা ছাড়বেন না। ট্রাস্টপে এসক্রো ব্যবহার করুন।',
    explanationEn: 'High dispute rate (33%). Do not send advance payment without Recursion Pay TrustPay escrow.',
    riskWarningBn: 'ভুয়া পেজ বা অগ্রিম টাকা নিয়ে ব্লক করার ঝুঁকি রয়েছে। পণ্য বুঝে পাওয়ার পরই কেবল টাকা ছাড়ুন।',
    totalOrders: 18,
    successfulDeliveries: 11,
    disputeCount: 6,
    averageDeliveryDays: 6.5,
    customerRating: 2.4
  }
];

const INITIAL_ORDERS: TrustPayOrder[] = [
  {
    id: 'tp_ord_101',
    itemName: 'কাতান জামদানি শাড়ি (রয়েল ব্লু)',
    itemCategory: 'fashion',
    itemDescription: 'অরজিনাল টাঙ্গাইল হাফ সিল্ক কাতান জামদানি শাড়ি, সাথে ব্লাউজ পিস।',
    amount: 3850,
    courierService: 'রেডএক্স এক্সপ্রেস (RedX)',
    trackingNumber: 'REDX-89210-BD',
    sellerName: 'দারুচিনি বুটিক (Daruchini Boutique)',
    sellerPhone: '01711998877',
    fCommercePage: 'facebook.com/daruchini.boutique.bd',
    buyerName: 'আসিফ রহমান',
    buyerPhone: '01712345678',
    status: 'payment_held',
    statusHistory: [
      {
        status: 'order_created',
        timestamp: '০২ অক্টোবর ২০২৬, সকাল ১০:১৫',
        noteBn: 'অর্ডার তৈরি হয়েছে এবং ট্রাস্টপে এসক্রো চালু করা হয়েছে।',
        noteEn: 'Order created with TrustPay escrow.'
      },
      {
        status: 'payment_held',
        timestamp: '০২ অক্টোবর ২০২৬, সকাল ১০:১৮',
        noteBn: 'ক্রেতার ওয়ালেট থেকে ৳৩,৮৫০ নিরাপদে এসক্রো ভল্টে আটকে রাখা হয়েছে।',
        noteEn: '৳3,850 safely held in Recursion Pay Escrow.'
      }
    ],
    sellerTrust: KNOWN_SELLERS[0],
    escrowContractId: 'REC-TP-ESCROW-8841-A',
    createdAt: '০২ অক্টোবর ২০২৬',
    estimatedDeliveryDate: '০৪ অক্টোবর ২০২৬'
  },
  {
    id: 'tp_ord_102',
    itemName: 'ব্লুটুথ নয়েজ ক্যানসেলিং ইয়ারবাডস',
    itemCategory: 'gadget',
    itemDescription: 'TWS Wireless ANC Gaming Earbuds with Type-C Fast Charging.',
    amount: 1650,
    courierService: 'পাঠাও কুরিয়ার (Pathao)',
    trackingNumber: 'PTH-44129-DHK',
    sellerName: 'গ্যাজেট বাজ বিডি (Gadget Buzz BD)',
    sellerPhone: '01822334455',
    fCommercePage: 'facebook.com/gadgetbuzz.official',
    buyerName: 'আসিফ রহমান',
    buyerPhone: '01712345678',
    status: 'delivered',
    statusHistory: [
      {
        status: 'order_created',
        timestamp: '২৯ সেপ্টেম্বর ২০২৬, দুপুর ২:০০',
        noteBn: 'অর্ডার তৈরি হয়েছে।',
        noteEn: 'Order created.'
      },
      {
        status: 'payment_held',
        timestamp: '২৯ সেপ্টেম্বর ২০২৬, দুপুর ২:০৫',
        noteBn: '৳১,৬৫০ এসক্রো ভল্টে হোল্ড করা হয়েছে।',
        noteEn: 'Payment held in escrow.'
      },
      {
        status: 'delivered',
        timestamp: 'আজ, সকাল ১১:৩০',
        noteBn: 'কুরিয়ার মারফত পণ্য ডেলিভারি সম্পন্ন হয়েছে। ক্রেতার কনফার্মেশনের অপেক্ষায়।',
        noteEn: 'Package delivered by courier. Awaiting buyer confirmation to release funds.'
      }
    ],
    sellerTrust: KNOWN_SELLERS[1],
    escrowContractId: 'RPAY-TP-ESCROW-6629-B',
    createdAt: '২৯ সেপ্টেম্বর ২০২৬',
    estimatedDeliveryDate: '০২ অক্টোবর ২০২৬'
  },
  {
    id: 'tp_ord_103',
    itemName: 'লেদার লোফার ক্যাজুয়াল শু',
    itemCategory: 'fashion',
    itemDescription: 'পিওর লেদার লোফার জুতা (সাইজ ৪২, চকলেট কালার)।',
    amount: 2200,
    courierService: 'স্টেডফাস্ট (Steadfast)',
    trackingNumber: 'STF-99120-BD',
    sellerName: 'অনলাইন শু ফ্যাশন ২৪ (Online Shoe Fashion 24)',
    sellerPhone: '01933445566',
    fCommercePage: 'facebook.com/shoefashion24.bd',
    buyerName: 'আসিফ রহমান',
    buyerPhone: '01712345678',
    status: 'disputed',
    statusHistory: [
      {
        status: 'order_created',
        timestamp: '২৫ সেপ্টেম্বর ২০২৬',
        noteBn: 'অর্ডার তৈরি হয়েছে।',
        noteEn: 'Order created.'
      },
      {
        status: 'payment_held',
        timestamp: '২৫ সেপ্টেম্বর ২০২৬',
        noteBn: 'টাকা এসক্রোতে জমা রাখা হয়েছে।',
        noteEn: 'Payment held in escrow.'
      },
      {
        status: 'disputed',
        timestamp: '২৮ সেপ্টেম্বর ২০২৬',
        noteBn: 'ক্রেতা অভিযোগ করেছেন: বাক্সের ভিতর ভুল সাইজ ও ক্ষতিগ্রস্ত পণ্য পাওয়া গেছে। টাকা আটকে রাখা হয়েছে।',
        noteEn: 'Dispute opened: Damaged / Wrong item delivered. Escrow frozen.'
      }
    ],
    sellerTrust: KNOWN_SELLERS[2],
    escrowContractId: 'RPAY-TP-ESCROW-1102-C',
    disputeReason: 'বিজ্ঞাপনের সাথে পণ্যের কোনো মিল নেই, চামড়ার বদলে নিম্নমানের রেক্সিনের জুতা পাঠানো হয়েছে।',
    createdAt: '২৫ সেপ্টেম্বর ২০২৬',
    estimatedDeliveryDate: '২৮ সেপ্টেম্বর ২০২৬'
  },
  {
    id: 'tp_ord_104',
    itemName: 'হ্যান্ডক্রাফটেড হোম ডেকোর সেট',
    itemCategory: 'lifestyle',
    itemDescription: 'হাতে তৈরি মাটির ও সিরামিকের ৩ পিস টেবিল ভাস ডেকোর।',
    amount: 1400,
    courierService: 'ই-কুরিয়ার (eCourier)',
    trackingNumber: 'ECR-33214-BD',
    sellerName: 'দারুচিনি বুটিক (Daruchini Boutique)',
    sellerPhone: '01711998877',
    fCommercePage: 'facebook.com/daruchini.boutique.bd',
    buyerName: 'আসিফ রহমান',
    buyerPhone: '01712345678',
    status: 'released',
    statusHistory: [
      {
        status: 'order_created',
        timestamp: '২০ সেপ্টেম্বর ২০২৬',
        noteBn: 'অর্ডার তৈরি হয়েছে।',
        noteEn: 'Order created.'
      },
      {
        status: 'payment_held',
        timestamp: '২০ সেপ্টেম্বর ২০২৬',
        noteBn: 'টাকা এসক্রোতে জমা রাখা হয়েছে।',
        noteEn: 'Payment held in escrow.'
      },
      {
        status: 'delivered',
        timestamp: '২২ সেপ্টেম্বর ২০২৬',
        noteBn: 'পণ্য ক্রেতার ঠিকানায় ডেলিভারি হয়েছে।',
        noteEn: 'Delivered.'
      },
      {
        status: 'released',
        timestamp: '২২ সেপ্টেম্বর ২০২৬, সন্ধ্যা ৭:১০',
        noteBn: 'ক্রেতা পণ্য বুঝে পেয়ে কনফার্ম করেছেন। ৳১,৪০০ বিক্রেতার ওয়ালেটে সফলভাবে স্থানান্তর করা হয়েছে।',
        noteEn: 'Buyer confirmed receipt. Funds released to seller.'
      }
    ],
    sellerTrust: KNOWN_SELLERS[0],
    escrowContractId: 'RPAY-TP-ESCROW-9932-D',
    createdAt: '২০ সেপ্টেম্বর ২০২৬',
    estimatedDeliveryDate: '২২ সেপ্টেম্বর ২০২৬'
  }
];

export function getTrustPayOrders(): TrustPayOrder[] {
  try {
    const raw = localStorage.getItem(TRUSTPAY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TRUSTPAY_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ORDERS;
  } catch (err) {
    return INITIAL_ORDERS;
  }
}

export function saveTrustPayOrders(list: TrustPayOrder[]): void {
  try {
    localStorage.setItem(TRUSTPAY_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save TrustPay orders:', err);
  }
}

export function getSellerTrustByInput(query: string): SellerTrustInfo {
  const clean = query.trim().toLowerCase();
  const matched = KNOWN_SELLERS.find(
    (s) =>
      s.sellerPhone.includes(clean) ||
      s.sellerName.toLowerCase().includes(clean) ||
      (s.fCommercePage && s.fCommercePage.toLowerCase().includes(clean))
  );

  if (matched) return matched;

  // If unknown, generate a safe moderate profile
  return {
    sellerName: query || 'নতুন অনলাইন বিক্রেতা',
    sellerPhone: clean.startsWith('01') ? clean : '01700000000',
    trustLevel: 'medium',
    trustScore: 72,
    badgeTitleBn: 'নতুন ভেরিফাইড পেজ',
    badgeTitleEn: 'New Verified Seller',
    explanationBn:
      'এই বিক্রেতার ট্রাস্টপেতে সাম্প্রতিক লেনদেন সংখ্যা কম। কোনো অগ্রিম সম্পূর্ণ পেমেন্ট না করে ট্রাস্টপে এসক্রোতে টাকা আটকে রাখুন।',
    explanationEn: 'New seller on TrustPay. Funds will remain safely held in escrow until product delivery.',
    totalOrders: 12,
    successfulDeliveries: 11,
    disputeCount: 0,
    averageDeliveryDays: 3.2,
    customerRating: 4.4
  };
}

export function createTrustPayOrder(params: {
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
  sellerTrust: SellerTrustInfo;
}): TrustPayOrder {
  const orders = getTrustPayOrders();
  const newId = `tp_ord_${Date.now()}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

  const newOrder: TrustPayOrder = {
    id: newId,
    itemName: params.itemName,
    itemCategory: params.itemCategory || 'general',
    itemDescription: params.itemDescription || '',
    amount: params.amount,
    courierService: params.courierService || 'রেডএক্স এক্সপ্রেস',
    trackingNumber: params.trackingNumber || `TRACK-${Math.floor(10000 + Math.random() * 90000)}`,
    sellerName: params.sellerName,
    sellerPhone: params.sellerPhone,
    fCommercePage: params.fCommercePage,
    buyerName: params.buyerName,
    buyerPhone: params.buyerPhone,
    status: 'payment_held',
    statusHistory: [
      {
        status: 'order_created',
        timestamp: `${dateStr}, ${timeStr}`,
        noteBn: 'অর্ডার তৈরি হয়েছে।',
        noteEn: 'Order created.'
      },
      {
        status: 'payment_held',
        timestamp: `${dateStr}, ${timeStr}`,
        noteBn: `৳${params.amount.toLocaleString()} রিকার্শন পে এসক্রো ভল্টে নিরাপদে আটকে রাখা হয়েছে।`,
        noteEn: `৳${params.amount.toLocaleString()} securely held in Recursion Pay Escrow.`
      }
    ],
    sellerTrust: params.sellerTrust,
    escrowContractId: `REC-TP-ESCROW-${Math.floor(1000 + Math.random() * 9000)}-Z`,
    createdAt: dateStr,
    estimatedDeliveryDate: '৩-৫ কার্যদিবস'
  };

  orders.unshift(newOrder);
  saveTrustPayOrders(orders);
  return newOrder;
}

export function confirmAndReleaseFunds(orderId: string): { success: boolean; updatedOrder?: TrustPayOrder } {
  const orders = getTrustPayOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return { success: false };

  const order = { ...orders[idx] };
  const now = new Date();
  const dateStr = now.toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

  order.status = 'released';
  order.statusHistory.push({
    status: 'released',
    timestamp: `${dateStr}, ${timeStr}`,
    noteBn: `ক্রেতা পণ্য প্রাপ্তি নিশ্চিত করেছেন। ৳${order.amount.toLocaleString()} বিক্রেতা "${order.sellerName}" এর ওয়ালেটে ছাড় করা হয়েছে।`,
    noteEn: `Buyer confirmed receipt. ৳${order.amount.toLocaleString()} released to seller.`
  });

  orders[idx] = order;
  saveTrustPayOrders(orders);
  return { success: true, updatedOrder: order };
}

export function disputeTrustPayOrder(
  orderId: string,
  reason: string
): { success: boolean; updatedOrder?: TrustPayOrder } {
  const orders = getTrustPayOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return { success: false };

  const order = { ...orders[idx] };
  const now = new Date();
  const dateStr = now.toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

  order.status = 'disputed';
  order.disputeReason = reason;
  order.statusHistory.push({
    status: 'disputed',
    timestamp: `${dateStr}, ${timeStr}`,
    noteBn: `ক্রেতা বিরোধ দায়ের করেছেন: "${reason}"। এসক্রো টাকা ফ্রিজ করা হয়েছে। রিকার্শন পে সাপোর্ট ও মধ্যস্থতা সেল খতিয়ে দেখছে।`,
    noteEn: `Dispute filed: "${reason}". Escrow frozen pending mediation.`
  });

  orders[idx] = order;
  saveTrustPayOrders(orders);
  return { success: true, updatedOrder: order };
}
