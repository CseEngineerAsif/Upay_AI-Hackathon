import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TrustPayOrder } from '../../types/trustPay';
import { confirmAndReleaseFunds, disputeTrustPayOrder } from '../../utils/trustPayManager';
import { formatCurrency } from '../../utils/formatters';

interface TrustPayOrderDetailModalProps {
  order: TrustPayOrder;
  onClose: () => void;
  onUpdated: (updated: TrustPayOrder) => void;
}

export const TrustPayOrderDetailModal: React.FC<TrustPayOrderDetailModalProps> = ({
  order: initialOrder,
  onClose,
  onUpdated
}) => {
  const { language } = useAppStore();
  const [order, setOrder] = useState<TrustPayOrder>(initialOrder);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReasonText, setDisputeReasonText] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const isHeld = order.status === 'payment_held';
  const isDelivered = order.status === 'delivered';
  const isDisputed = order.status === 'disputed';
  const isReleased = order.status === 'released';

  const handleRelease = () => {
    const res = confirmAndReleaseFunds(order.id);
    if (res.success && res.updatedOrder) {
      setOrder(res.updatedOrder);
      onUpdated(res.updatedOrder);
      setActionMsg('অভিনন্দন! পণ্য প্রাপ্তি নিশ্চিত হয়েছে এবং ৳' + order.amount.toLocaleString() + ' বিক্রেতার ওয়ালেটে সফলভাবে স্থানান্তর করা হয়েছে।');
      setTimeout(() => setActionMsg(null), 5000);
    }
  };

  const handleFileDispute = () => {
    if (!disputeReasonText.trim()) return;
    const res = disputeTrustPayOrder(order.id, disputeReasonText);
    if (res.success && res.updatedOrder) {
      setOrder(res.updatedOrder);
      onUpdated(res.updatedOrder);
      setShowDisputeForm(false);
      setActionMsg('বিরোধ সফলভাবে দায়ের করা হয়েছে। এসক্রোর টাকা সম্পূর্ণ ফ্রিজ রাখা হয়েছে। উপায় সাপোর্ট টিম দ্রুত মধ্যস্থতা করবে।');
      setTimeout(() => setActionMsg(null), 6000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 select-none">
      <div className="w-full max-w-[430px] bg-slate-50 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[94vh] animate-scale-up border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0B4DA2] text-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg border border-white/20">
              🤝
            </span>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">
                {language === 'bn' ? 'ট্রাস্টপে অর্ডার ট্র্যাকার' : 'TrustPay Escrow Tracker'}
              </h2>
              <p className="text-[10px] text-blue-200 font-mono">
                {order.escrowContractId}
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

        {/* Action feedback */}
        {actionMsg && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 text-center font-bold animate-fade-in shadow-xs">
            {actionMsg}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs">
          {/* Top Status Card */}
          <div
            className={`p-4 rounded-3xl text-white shadow-md space-y-3 ${
              isDisputed
                ? 'bg-gradient-to-br from-rose-700 to-rose-900'
                : isReleased
                ? 'bg-gradient-to-br from-emerald-700 to-emerald-900'
                : 'bg-gradient-to-br from-[#0B4DA2] via-[#0E4185] to-[#082D60]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-white/70 uppercase font-bold block">
                  {language === 'bn' ? 'এসক্রো ফান্ড' : 'Escrow Amount'}
                </span>
                <span className="text-2xl font-black text-[#FFD600]">
                  ৳{order.amount.toLocaleString()}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-black">
                {isHeld && 'টাকা হোল্ড আছে'}
                {isDelivered && 'ডেলিভারি সম্পন্ন'}
                {isDisputed && 'বিরোধ চলছে (টাকা ফ্রিজ)'}
                {isReleased && 'তহবিল ছাড়কৃত ✓'}
              </span>
            </div>

            {/* Product Summary */}
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15 space-y-1">
              <h3 className="font-bold text-white text-xs">{order.itemName}</h3>
              <p className="text-[11px] text-white/80">{order.itemDescription}</p>
              <div className="flex items-center justify-between text-[10px] text-white/60 pt-1 border-t border-white/10">
                <span>কুরিয়ার: {order.courierService}</span>
                <span>ট্র্যাকিং: {order.trackingNumber}</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-1 flex items-center gap-2">
              {/* Release button if delivered or held */}
              {(isDelivered || isHeld) && (
                <button
                  type="button"
                  onClick={handleRelease}
                  className="flex-1 py-2.5 rounded-xl bg-[#FFD600] hover:bg-yellow-300 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>✓</span>
                  <span>{language === 'bn' ? 'পণ্য পেয়েছি — টাকা ছাড়ুন' : 'Confirm Receipt & Release'}</span>
                </button>
              )}

              {/* Dispute button */}
              {(isDelivered || isHeld) && !showDisputeForm && (
                <button
                  type="button"
                  onClick={() => setShowDisputeForm(true)}
                  className="py-2.5 px-3 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  {language === 'bn' ? 'ডিসপ্যুট / অভিযোগ' : 'Dispute'}
                </button>
              )}
            </div>
          </div>

          {/* DISPUTE FORM */}
          {showDisputeForm && (
            <div className="p-4 rounded-3xl bg-rose-50 border border-rose-300 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-rose-950 text-xs flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>{language === 'bn' ? 'বিরোধ দায়ের করুন (Dispute Order)' : 'Open Escrow Dispute'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowDisputeForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-rose-900 leading-relaxed">
                পণ্য না পেলে, ভুল বা ক্ষতিগ্রস্ত পণ্য আসলে ডিসপ্যুট ওপেন করুন। টাকা সম্পূর্ণ ফ্রিজ থাকবে এবং বিক্রেতা টাকা দাবি করতে পারবে না।
              </p>

              <textarea
                value={disputeReasonText}
                onChange={(e) => setDisputeReasonText(e.target.value)}
                rows={3}
                placeholder="সমস্যার কারণ বিস্তারিত লিখুন (যেমন: পার্সেল আসেনি, বা ছেঁড়া কাপড় পাঠানো হয়েছে)..."
                className="w-full p-2.5 rounded-xl bg-white border border-rose-300 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeForm(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleFileDispute}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs"
                >
                  টাকা ফ্রিজ করুন 🔒
                </button>
              </div>
            </div>
          )}

          {/* AI Seller Trust Badge Card */}
          <div
            className={`p-4 rounded-3xl border space-y-2.5 shadow-2xs ${
              order.sellerTrust.trustLevel === 'high'
                ? 'bg-emerald-50/80 border-emerald-300'
                : order.sellerTrust.trustLevel === 'caution'
                ? 'bg-rose-50 border-rose-300'
                : 'bg-amber-50 border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {order.sellerTrust.trustLevel === 'high' ? '🟢' : order.sellerTrust.trustLevel === 'caution' ? '🔴' : '🟡'}
                </span>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    AI Seller Trust Badge
                  </span>
                  <h4 className="font-black text-slate-900 text-xs">
                    {order.sellerName}
                  </h4>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white font-mono font-black text-xs text-[#0B4DA2] shadow-2xs">
                {order.sellerTrust.trustScore} / ১০০
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-black/5">
              {order.sellerTrust.explanationBn}
            </p>

            <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1 border-t border-black/5">
              <span>সফল ডেলিভারি: {order.sellerTrust.successfulDeliveries} টি</span>
              <span>অভিযোগ: {order.sellerTrust.disputeCount} টি</span>
              <span>গড় সময়: {order.sellerTrust.averageDeliveryDays} দিন</span>
            </div>
          </div>

          {/* CLEAR STATUS STEPS PROGRESS (Core Requirement) */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">
              {language === 'bn' ? 'অর্ডার ও এসক্রো ট্র্যাকিং টাইমলাইন' : 'Escrow Flow Status Steps'}
            </h4>

            <div className="space-y-3 relative pl-6 border-l-2 border-slate-200 ml-2">
              {/* Step 1: Order Created */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <h5 className="font-black text-slate-900 text-xs">১. অর্ডার তৈরি (Order Created)</h5>
                <p className="text-[11px] text-slate-500">{order.createdAt} • এসক্রো চুক্তি স্বয়ংক্রিয়ভাবে সক্রিয় হয়েছে</p>
              </div>

              {/* Step 2: Payment Held */}
              <div className="relative">
                <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isHeld || isDelivered || isReleased || isDisputed ? 'bg-emerald-500 text-white' : 'bg-slate-300'
                }`}>
                  ✓
                </div>
                <h5 className="font-black text-slate-900 text-xs">২. টাকা এসক্রোতে হোল্ড (Payment Held)</h5>
                <p className="text-[11px] text-slate-500">৳{order.amount.toLocaleString()} নিরাপদ উপায় এসক্রো ভল্টে লক করা হয়েছে</p>
              </div>

              {/* Step 3: Delivered */}
              <div className="relative">
                <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isDelivered || isReleased ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  {isDelivered || isReleased ? '✓' : '৩'}
                </div>
                <h5 className="font-black text-slate-900 text-xs">৩. ডেলিভারি সম্পন্ন (Delivered)</h5>
                <p className="text-[11px] text-slate-500">
                  {order.courierService} ({order.trackingNumber}) মারফত পার্সেল ডেলিভারি
                </p>
              </div>

              {/* Step 4: Released or Disputed */}
              <div className="relative">
                <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isReleased ? 'bg-emerald-500 text-white' : isDisputed ? 'bg-rose-500 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  {isReleased ? '✓' : isDisputed ? '!' : '৪'}
                </div>
                <h5 className={`font-black text-xs ${isDisputed ? 'text-rose-700' : isReleased ? 'text-emerald-700' : 'text-slate-900'}`}>
                  {isDisputed ? '৪. ডিসপ্যুট ও মধ্যস্থতা (Disputed)' : '৪. বিক্রেতাকে টাকা ছাড় (Released)'}
                </h5>
                <p className="text-[11px] text-slate-500">
                  {isDisputed
                    ? 'টাকা ফ্রিজ রয়েছে। উপায় কাস্টমার প্রটেকশন সেল বিরোধ নিষ্পত্তি করবে।'
                    : isReleased
                    ? 'ক্রেতা সন্তুষ্ট হয়ে কনফার্ম করেছেন এবং টাকা বিক্রেতাকে পৌঁছে গেছে।'
                    : 'ক্রেতার কনফার্মেশনের পর স্বয়ংক্রিয়ভাবে বিক্রেতার একাউন্টে যাবে।'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-medium">
            উপায় ট্রাস্টপে • F-Commerce Escrow
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
