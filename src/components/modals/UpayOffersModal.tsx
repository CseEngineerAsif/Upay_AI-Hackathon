import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface UpayOffersModalProps {
  onClose: () => void;
}

export const UpayOffersModal: React.FC<UpayOffersModalProps> = ({ onClose }) => {
  const { language, setCurrentModal } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cashback' | 'recharge' | 'food' | 'shopping' | 'bill'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const categories = [
    { id: 'all', labelBn: 'সব অফার', labelEn: 'All' },
    { id: 'cashback', labelBn: 'ক্যাশব্যাক', labelEn: 'Cashback' },
    { id: 'recharge', labelBn: 'রিচার্জ', labelEn: 'Recharge' },
    { id: 'food', labelBn: 'খাবার', labelEn: 'Food' },
    { id: 'shopping', labelBn: 'শপিং', labelEn: 'Shopping' },
    { id: 'bill', labelBn: 'বিল ছাড়', labelEn: 'Bill Pay' }
  ];

  const offers = [
    {
      id: 'off_1',
      category: 'recharge',
      titleBn: 'রবি ও এয়ারটেল আনলিমিটেড ক্যাশব্যাক',
      titleEn: 'Robi & Airtel Unlimited Cashback',
      descBn: '৭০ জিবি ও ১০০ জিবি ইন্টারনেট প্যাকেজ রিচার্জে ৳৫০ থেকে ৳৭৫ ইনস্ট্যান্ট ক্যাশব্যাক!',
      descEn: 'Instant ৳50 - ৳75 cashback on 70GB & 100GB internet pack recharge.',
      badgeBn: '৳৭৫ ক্যাশব্যাক',
      badgeEn: '৳75 Cashback',
      code: 'ROBI75',
      validityBn: '৩১ অক্টোবর ২০২৬ পর্যন্ত',
      validityEn: 'Valid till 31 Oct 2026',
      icon: '📱',
      brand: 'Robi Axiata',
      actionModal: 'mobile_recharge'
    },
    {
      id: 'off_2',
      category: 'shopping',
      titleBn: 'স্বপ্ন সুপারশপ ১৫% ইনস্ট্যান্ট ক্যাশব্যাক',
      titleEn: 'Shwapno Superhop 15% Cashback',
      descBn: 'যেকোনো গ্রোসারি বা কেনাকাটায় বাংলা কিউআর দিয়ে রিকার্শন পে পেমেন্ট করলেই ১৫% ক্যাশব্যাক (সর্বোচ্চ ৳১৫০)।',
      descEn: 'Pay via Recursion Pay Bangla QR at any Shwapno outlet and get 15% cashback up to ৳150.',
      badgeBn: '১৫% ছাড়',
      badgeEn: '15% Off',
      code: 'RECURSIONSWAPNO',
      validityBn: '১৫ নভেম্বর ২০২৬ পর্যন্ত',
      validityEn: 'Valid till 15 Nov 2026',
      icon: '🛒',
      brand: 'Shwapno',
      actionModal: 'bangla_qr_scan'
    },
    {
      id: 'off_3',
      category: 'food',
      titleBn: 'কেএফসি ও পিৎজা হাট ফিস্ট অফার',
      titleEn: 'KFC & Pizza Hut Feast Offer',
      descBn: 'রিকার্শন পে কার্ড বা পেমেন্টে পাবেন সরাসরি ১০% ক্যাশব্যাক ও স্পেশাল ক্রিস্পি বাকেট অফার।',
      descEn: 'Get 10% instant cashback on minimum ৳800 order at KFC or Pizza Hut.',
      badgeBn: '১০% ক্যাশব্যাক',
      badgeEn: '10% Cashback',
      code: 'RECFOOD',
      validityBn: '৩০ অক্টোবর ২০২৬ পর্যন্ত',
      validityEn: 'Valid till 30 Oct 2026',
      icon: '🍗',
      brand: 'KFC / Pizza Hut',
      actionModal: 'make_payment'
    },
    {
      id: 'off_4',
      category: 'food',
      titleBn: 'পাঠাও রাইড ও ফুড ২০% ডিসকাউন্ট',
      titleEn: 'Pathao Rides & Food 20% Discount',
      descBn: 'রিকার্শন পে ওয়ালেট লিংক করে পাঠাও ফুড ও রাইডে প্রতি সপ্তাহে ৩ বার ২০% ছাড় উপভোগ করুন।',
      descEn: 'Link Recursion Pay wallet on Pathao app and enjoy 20% discount up to ৳70.',
      badgeBn: '২০% ছাড়',
      badgeEn: '20% Off',
      code: 'PATHAOREC',
      validityBn: 'চলমান অফার',
      validityEn: 'Ongoing',
      icon: '🛵',
      brand: 'Pathao',
      actionModal: null
    },
    {
      id: 'off_5',
      category: 'bill',
      titleBn: 'ডেসকো ও পল্লী বিদ্যুৎ প্রথম বিলে ৳৫০ ক্যাশব্যাক',
      titleEn: 'DESCO & PBS Bill Pay ৳50 Cashback',
      descBn: 'প্রথমবার বিদ্যুৎ বিল রিকার্শন পে অ্যাপ দিয়ে পরিশোধ করলে সরাসরি ৳৫০ ক্যাশব্যাক আপনার ওয়ালেটে।',
      descEn: 'Pay your electricity bill for the first time on Recursion Pay and receive ৳50 cashback.',
      badgeBn: '৳৫০ ক্যাশব্যাক',
      badgeEn: '৳50 Cashback',
      code: 'BILL50',
      validityBn: '২৮ অক্টোবর ২০২৬ পর্যন্ত',
      validityEn: 'Valid till 28 Oct 2026',
      icon: '⚡',
      brand: 'Power Utility',
      actionModal: 'pay_bill'
    },
    {
      id: 'off_6',
      category: 'shopping',
      titleBn: 'দারাজ ১০.১০ মেগা শপিং অফার',
      titleEn: 'Daraz 10.10 Mega Shopping Deal',
      descBn: 'রিকার্শন পে কার্ড বা পেমেন্টে দারাজ অ্যাপে কেনাকাটায় অতিরিক্ত ১২% ইনস্ট্যান্ট ডিসকাউন্ট।',
      descEn: 'Extra 12% instant discount on Daraz purchases with Recursion Pay checkout.',
      badgeBn: '১২% ছাড়',
      badgeEn: '12% Off',
      code: 'DARAZREC',
      validityBn: '২০ অক্টোবর ২০২৬ পর্যন্ত',
      validityEn: 'Valid till 20 Oct 2026',
      icon: '🛍️',
      brand: 'Daraz BD',
      actionModal: 'make_payment'
    },
    {
      id: 'off_7',
      category: 'cashback',
      titleBn: 'স্টার সিনেপ্লেক্স বাই ১ গেট ১ মুভি টিকেট',
      titleEn: 'Star Cineplex Buy 1 Get 1 Cashback',
      descBn: 'রিকার্শন পে কার্ড দিয়ে বসুন্ধরা বা সীমান্ত স্কয়ার ব্রাঞ্চে টিকিট কিনলে দ্বিতীয় টিকিটে ১০০% ক্যাশব্যাক।',
      descEn: 'Buy 1 movie ticket with Recursion Pay Card and get 100% cashback on second ticket.',
      badgeBn: 'BOGO ফ্রি',
      badgeEn: 'BOGO Free',
      code: 'CINEREC',
      validityBn: 'প্রতি শুক্রবার ও শনিবার',
      validityEn: 'Fri & Sat only',
      icon: '🎬',
      brand: 'Star Cineplex',
      actionModal: 'make_payment'
    }
  ];

  const filteredOffers = offers.filter((o) => {
    const matchesCategory = selectedCategory === 'all' || o.category === selectedCategory;
    const matchesSearch =
      o.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.descBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAction = (actionModal: string | null) => {
    onClose();
    if (actionModal) {
      setCurrentModal(actionModal);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-slate-50 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-[#FFD600] border-b border-amber-300 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-slate-900 text-yellow-300 flex items-center justify-center text-base shadow-xs">
              🎁
            </span>
            <div>
              <h2 className="text-sm font-black text-slate-950 leading-tight">
                {language === 'bn' ? 'রিকার্শন পে অফার ও ক্যাশব্যাক' : 'Recursion Pay Offers & Cashback'}
              </h2>
              <p className="text-[10px] font-bold text-slate-800">
                {language === 'bn' ? 'এক্সক্লুসিভ ডিসকাউন্ট ও প্রোমো কোড' : 'Exclusive Deals & Promo Codes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-900/10 hover:bg-slate-900/20 flex items-center justify-center text-slate-900 text-xs font-bold transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-white border-b border-slate-200">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'অফার বা ব্র্যান্ডের নাম খুঁজুন...' : 'Search offers or brand name...'}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B4DA2] focus:bg-white transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-[#0B4DA2] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {language === 'bn' ? c.labelBn : c.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Offers List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
          {filteredOffers.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <span className="text-3xl">🔍</span>
              <p className="text-xs font-bold text-slate-600">
                {language === 'bn' ? 'কোনো অফার খুঁজে পাওয়া যায়নি' : 'No offers found'}
              </p>
            </div>
          ) : (
            filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 hover:shadow-xs transition-shadow"
              >
                {/* Top Badge & Merchant */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg">
                      {offer.icon}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        {offer.brand}
                      </span>
                      <h3 className="text-xs font-black text-slate-900 leading-tight">
                        {language === 'bn' ? offer.titleBn : offer.titleEn}
                      </h3>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-black shrink-0">
                    {language === 'bn' ? offer.badgeBn : offer.badgeEn}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'bn' ? offer.descBn : offer.descEn}
                </p>

                {/* Promo Code & Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Promo code badge */}
                  <div className="flex items-center gap-1.5">
                    <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-dashed border-slate-300 font-mono text-[11px] font-black text-slate-800">
                      {offer.code}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(offer.code)}
                      className="text-[10px] font-bold text-[#0B4DA2] hover:underline cursor-pointer"
                    >
                      {copiedCode === offer.code
                        ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!')
                        : (language === 'bn' ? 'কোড কপি' : 'Copy Code')}
                    </button>
                  </div>

                  {/* Claim Button */}
                  <button
                    type="button"
                    onClick={() => handleAction(offer.actionModal)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    {language === 'bn' ? 'অফারটি নিন ➔' : 'Claim Offer ➔'}
                  </button>
                </div>

                {/* Validity */}
                <div className="text-[9px] text-slate-400 font-medium">
                  ⏳ {language === 'bn' ? offer.validityBn : offer.validityEn}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-medium">
            {language === 'bn' ? 'শর্ত প্রযোজ্য • রিকার্শন পে পলিসি' : 'Terms apply • Recursion Pay Policy'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
