import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TrustPayOrder, SellerTrustInfo } from '../../types/trustPay';
import { createTrustPayOrder, getSellerTrustByInput, KNOWN_SELLERS } from '../../utils/trustPayManager';
import { formatCurrency } from '../../utils/formatters';

interface CreateTrustPayOrderModalProps {
  onClose: () => void;
  onCreated: (order: TrustPayOrder) => void;
}

export const CreateTrustPayOrderModal: React.FC<CreateTrustPayOrderModalProps> = ({ onClose, onCreated }) => {
  const { user, language } = useAppStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Seller info
  const [sellerInput, setSellerInput] = useState('দারুচিনি বুটিক');
  const [sellerPhone, setSellerPhone] = useState('01711998877');
  const [fCommercePage, setFCommercePage] = useState('facebook.com/daruchini.boutique.bd');
  const [sellerTrust, setSellerTrust] = useState<SellerTrustInfo>(KNOWN_SELLERS[0]);
  const [isVerifyingSeller, setIsVerifyingSeller] = useState(false);

  // Order Details
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('fashion');
  const [itemDescription, setItemDescription] = useState('');
  const [amount, setAmount] = useState<number>(2500);
  const [courierService, setCourierService] = useState('রেডএক্স এক্সপ্রেস (RedX)');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Seller quick selection
  const handleSelectQuickSeller = (seller: SellerTrustInfo) => {
    setSellerInput(seller.sellerName);
    setSellerPhone(seller.sellerPhone);
    setFCommercePage(seller.fCommercePage || '');
    setSellerTrust(seller);
  };

  const handleVerifySeller = async (query: string) => {
    setIsVerifyingSeller(true);
    try {
      const response = await fetch('/api/trustpay/seller-trust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerName: query || 'অনলাইন বিক্রেতা',
          sellerPhone,
          fCommercePage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSellerTrust({
          ...sellerTrust,
          ...data,
          sellerName: query,
          sellerPhone
        });
      } else {
        throw new Error('Fallback');
      }
    } catch (e) {
      setSellerTrust(getSellerTrustByInput(query));
    } finally {
      setIsVerifyingSeller(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!itemName.trim() || amount <= 0) return;
    setStep(3);
  };

  const handleConfirmAndHoldFunds = () => {
    const newOrder = createTrustPayOrder({
      itemName: itemName || 'অনলাইন পণ্য',
      itemCategory,
      itemDescription,
      amount,
      courierService,
      trackingNumber: trackingNumber || `TRACK-${Math.floor(10000 + Math.random() * 90000)}`,
      sellerName: sellerInput || 'অনলাইন বিক্রেতা',
      sellerPhone,
      fCommercePage,
      buyerName: user?.name || 'আসিফ রহমান',
      buyerPhone: user?.phone || '01712345678',
      sellerTrust
    });

    onCreated(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 select-none">
      <div className="w-full max-w-[430px] bg-slate-50 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[94vh] animate-scale-up border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0B4DA2] text-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg border border-white/20">
              🛡️
            </span>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">
                {language === 'bn' ? 'ট্রাস্টপে এসক্রো অর্ডার' : 'New TrustPay Order'}
              </h2>
              <p className="text-[10px] text-blue-200">
                {step === 1 && (language === 'bn' ? 'ধাপ ১/৩: বিক্রেতা ও এআই ট্রাস্ট ব্যাজ' : 'Step 1: Seller Trust Badge')}
                {step === 2 && (language === 'bn' ? 'ধাপ ২/৩: পণ্যের বিবরণ ও কুরিয়ার' : 'Step 2: Item & Courier')}
                {step === 3 && (language === 'bn' ? 'ধাপ ৩/৩: এসক্রো পেমেন্ট ও হোল্ড' : 'Step 3: Escrow Payment')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 h-1.5 flex">
          <div
            className="bg-[#FFD600] h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs">
          {/* STEP 1: Seller Trust Badge Check */}
          {step === 1 && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  {language === 'bn' ? 'বিক্রেতার নাম বা পেজ লিংক:' : 'Seller Page Name or Link:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sellerInput}
                    onChange={(e) => setSellerInput(e.target.value)}
                    placeholder="যেমন: দারুচিনি বুটিক"
                    className="flex-1 p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#0B4DA2]"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifySeller(sellerInput)}
                    className="px-3.5 py-2.5 rounded-xl bg-[#0B4DA2] text-white font-bold text-xs shrink-0 cursor-pointer"
                  >
                    {isVerifyingSeller ? 'যাচাই...' : 'যাচাই'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  {language === 'bn' ? 'বিক্রেতার উপায় ওয়ালেট নম্বর:' : 'Seller Upay Number:'}
                </label>
                <input
                  type="tel"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#0B4DA2]"
                />
              </div>

              {/* Sample Sellers for quick testing */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  {language === 'bn' ? 'ডেমো পেজ থেকে নির্বাচন করুন:' : 'Or pick a demo seller:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {KNOWN_SELLERS.map((s) => (
                    <button
                      key={s.sellerPhone}
                      type="button"
                      onClick={() => handleSelectQuickSeller(s)}
                      className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        sellerPhone === s.sellerPhone
                          ? 'bg-blue-50 border-[#0B4DA2] text-[#0B4DA2]'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {s.sellerName.split('(')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* CRITICAL REQUIREMENT: AI Seller Trust Badge Shown Before Paying */}
              <div
                className={`p-4 rounded-3xl border shadow-2xs space-y-2.5 ${
                  sellerTrust.trustLevel === 'high'
                    ? 'bg-emerald-50/80 border-emerald-300'
                    : sellerTrust.trustLevel === 'caution'
                    ? 'bg-rose-50 border-rose-300'
                    : 'bg-amber-50 border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {sellerTrust.trustLevel === 'high' ? '🟢' : sellerTrust.trustLevel === 'caution' ? '🔴' : '🟡'}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        AI Seller Trust Badge
                      </span>
                      <h4 className="font-black text-slate-900 text-xs">
                        {sellerTrust.badgeTitleBn}
                      </h4>
                    </div>
                  </div>
                  <span className="font-mono font-black text-sm text-[#0B4DA2]">
                    {sellerTrust.trustScore} / ১০০
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-black/5">
                  {sellerTrust.explanationBn}
                </p>

                {/* Warning if caution / low trust */}
                {sellerTrust.trustLevel === 'caution' && (
                  <div className="p-3 rounded-2xl bg-rose-100 text-rose-950 font-bold text-xs space-y-1 border border-rose-300">
                    <div className="flex items-center gap-1.5 text-rose-800 font-black">
                      <span>⚠️</span>
                      <span>উচ্চ ঝুঁকি সতর্কতা (Advance Payment Risk)</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      এই বিক্রেতার ডেলিভারি ব্যর্থতা ও বিরোধের হার বেশি। কোনোভাবেই অগ্রিম টাকা দেবেন না। ট্রাস্টপে এসক্রো ছাড়া টাকা লেনদেন করবেন না।
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-center font-bold text-slate-600">
                  <div className="p-1.5 bg-white/80 rounded-lg">
                    <span className="block text-[9px] text-slate-400">সফল ডেলিভারি</span>
                    <span>{sellerTrust.successfulDeliveries} টি</span>
                  </div>
                  <div className="p-1.5 bg-white/80 rounded-lg">
                    <span className="block text-[9px] text-slate-400">অভিযোগ</span>
                    <span className={sellerTrust.disputeCount > 2 ? 'text-rose-600' : ''}>
                      {sellerTrust.disputeCount} টি
                    </span>
                  </div>
                  <div className="p-1.5 bg-white/80 rounded-lg">
                    <span className="block text-[9px] text-slate-400">গড় ডেলিভারি</span>
                    <span>{sellerTrust.averageDeliveryDays} দিন</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Item Details & Courier */}
          {step === 2 && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  {language === 'bn' ? 'পণ্যের নাম:' : 'Product Name:'}
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="যেমন: কাতান জামদানি শাড়ি বা ব্লুটুথ ইয়ারবাডস"
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#0B4DA2]"
                />
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">
                    {language === 'bn' ? 'পণ্যের মোট মূল্য (এসক্রো তহবিল):' : 'Price (Escrow Hold Amount):'}
                  </label>
                  <span className="font-mono font-black text-sm text-[#0B4DA2]">
                    ৳{amount.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1000, 2500, 3850, 5000].map((pr) => (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => setAmount(pr)}
                      className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        amount === pr
                          ? 'bg-[#0B4DA2] text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      ৳{pr.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Courier Service */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  {language === 'bn' ? 'ডেলিভারি কুরিয়ার সার্ভিস:' : 'Courier Service:'}
                </label>
                <select
                  value={courierService}
                  onChange={(e) => setCourierService(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold focus:outline-none focus:border-[#0B4DA2]"
                >
                  <option value="রেডএক্স এক্সপ্রেস (RedX)">রেডএক্স এক্সপ্রেস (RedX)</option>
                  <option value="পাঠাও কুরিয়ার (Pathao)">পাঠাও কুরিয়ার (Pathao)</option>
                  <option value="স্টেডফাস্ট কুরিয়ার (Steadfast)">স্টেডফাস্ট কুরিয়ার (Steadfast)</option>
                  <option value="পেপারফ্লাই (Paperfly)">পেপারফ্লাই (Paperfly)</option>
                  <option value="সুন্দরবন কুরিয়ার (Sundarban)">সুন্দরবন কুরিয়ার (Sundarban)</option>
                </select>
              </div>

              {/* Tracking number (optional) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  {language === 'bn' ? 'কুরিয়ার ট্র্যাকিং নম্বর (ঐচ্ছিক):' : 'Tracking ID (Optional):'}
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="যেমন: REDX-89210-BD"
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-mono text-xs text-slate-800"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  {language === 'bn' ? 'অর্ডারের বিবরণ বা শর্ত:' : 'Order Notes / Color / Size:'}
                </label>
                <input
                  type="text"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="যেমন: কালার ব্লু, সাইজ XL, সাথে মানি রিসিপ্ট থাকতে হবে"
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Escrow Payment & Hold Review */}
          {step === 3 && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                  {language === 'bn' ? 'ট্রাস্টপে এসক্রো চুক্তি পর্যালোচনা' : 'Escrow Agreement Review'}
                </h4>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500">পণ্য:</span>
                    <span className="font-bold text-slate-900">{itemName}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500">বিক্রেতা:</span>
                    <span className="font-bold text-slate-900">{sellerInput}</span>
                  </div>
                  <div className="py-1.5 flex justify-between items-center">
                    <span className="text-slate-500">বিক্রেতার ট্রাস্ট ব্যাজ:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {sellerTrust.badgeTitleBn}
                    </span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500">কুরিয়ার:</span>
                    <span className="font-bold text-slate-900">{courierService}</span>
                  </div>
                  <div className="py-2 flex justify-between items-center text-sm border-t border-slate-200">
                    <span className="font-bold text-slate-800">মোট এসক্রো হোল্ড:</span>
                    <span className="font-mono font-black text-base text-[#0B4DA2]">
                      ৳{amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Escrow Guarantee Notice */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 space-y-1 text-xs">
                <span className="font-black text-blue-950 block">🔒 টাকা সুরক্ষার ১০০% গ্যারান্টি:</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  টাকা সরাসরি বিক্রেতার কাছে যাবে না। আপনার পার্সেল ডেলিভারি হওয়ার পর আপনি সন্তুষ্ট হয়ে "পণ্য পেয়েছি" বাটনে চাপলে তবেই বিক্রেতা টাকা পাবে। কোনো সমস্যা থাকলে এক ট্যাপেই ডিসপ্যুট করে টাকা ফেরত নিতে পারবেন।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              পূর্ববর্তী
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              বাতিল
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black transition-colors cursor-pointer"
            >
              পরবর্তী (পণ্যের বিবরণ) ➔
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleProceedToPayment}
              className="px-5 py-2 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black transition-colors cursor-pointer"
            >
              এসক্রো চুক্তি পর্যালোচনা ➔
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleConfirmAndHoldFunds}
              className="px-5 py-2 rounded-xl bg-[#FFD600] hover:bg-yellow-400 text-slate-950 font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              টাকা হোল্ড করুন ও অর্ডার নিশ্চিত 🔒
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
