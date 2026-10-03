import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TrustPayOrder, TrustPayStatus, SellerTrustInfo } from '../../types/trustPay';
import {
  getTrustPayOrders,
  confirmAndReleaseFunds,
  disputeTrustPayOrder,
  getSellerTrustByInput,
  KNOWN_SELLERS
} from '../../utils/trustPayManager';
import { formatCurrency } from '../../utils/formatters';

interface TrustPayScreenProps {
  onOpenCreate: () => void;
  onSelectOrder: (order: TrustPayOrder) => void;
}

export const TrustPayScreen: React.FC<TrustPayScreenProps> = ({ onOpenCreate, onSelectOrder }) => {
  const { language } = useAppStore();
  const [orders, setOrders] = useState<TrustPayOrder[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'held' | 'delivered' | 'disputed' | 'released'>('all');
  const [sellerCheckInput, setSellerCheckInput] = useState('');
  const [searchedSeller, setSearchedSeller] = useState<SellerTrustInfo | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setOrders(getTrustPayOrders());
  }, []);

  const totalHeldInEscrow = orders
    .filter((o) => o.status === 'payment_held' || o.status === 'delivered')
    .reduce((acc, o) => acc + o.amount, 0);

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'payment_held' || o.status === 'delivered' || o.status === 'disputed'
  ).length;

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'held') return o.status === 'payment_held';
    if (activeFilter === 'delivered') return o.status === 'delivered';
    if (activeFilter === 'disputed') return o.status === 'disputed';
    if (activeFilter === 'released') return o.status === 'released';
    return true;
  });

  const handleQuickRelease = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    const res = confirmAndReleaseFunds(orderId);
    if (res.success && res.updatedOrder) {
      setOrders(getTrustPayOrders());
      setActionSuccessMsg('পণ্য প্রাপ্তি নিশ্চিত হয়েছে এবং টাকা বিক্রেতাকে সফলভাবে ছাড় করা হয়েছে!');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  const handleCheckSeller = () => {
    if (!sellerCheckInput.trim()) return;
    const result = getSellerTrustByInput(sellerCheckInput);
    setSearchedSeller(result);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Top Header Banner (Min-height 96-110px, unclipped, normal flow) */}
      <div className="w-full min-h-[96px] sm:min-h-[104px] h-auto shrink-0 bg-gradient-to-r from-[#0B4DA2] via-[#093C80] to-[#0B4DA2] text-white px-4 py-5 shadow-md relative">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20 shrink-0">
                🤝
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <h1 className="text-[19px] font-black tracking-tight text-white leading-tight">
                    {language === 'bn' ? 'ট্রাস্টপে (TrustPay)' : 'TrustPay Escrow'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFD600] text-slate-950 text-[10px] font-black uppercase tracking-wide shrink-0">
                    F-Commerce
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium leading-snug mt-1">
                  {language === 'bn' ? 'ফেসবুক/ইনস্টাগ্রাম কেনাকাটায় ১০০% এসক্রো সুরক্ষা' : 'Secure Escrow for F-Commerce Purchases'}
                </p>
              </div>
            </div>

            {/* Create Order Button */}
            <button
              onClick={onOpenCreate}
              className="px-3 py-1.5 rounded-xl bg-[#FFD600] hover:bg-yellow-300 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span className="text-sm font-bold">+</span>
              <span>{language === 'bn' ? 'নতুন ট্রাস্টপে' : 'New Order'}</span>
            </button>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-[10px] text-blue-200 font-semibold uppercase block">
                {language === 'bn' ? 'এসক্রোতে সুরক্ষিত তহবিল' : 'Funds in Escrow'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-[#FFD600]">
                  ৳{totalHeldInEscrow.toLocaleString()}
                </span>
                <span className="text-[10px] text-blue-200">
                  {language === 'bn' ? 'হোল্ড আছে' : 'Held'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-[10px] text-blue-200 font-semibold uppercase block">
                {language === 'bn' ? 'সক্রিয় অর্ডার' : 'Active Orders'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-white">{activeOrdersCount}</span>
                <span className="text-[10px] text-blue-200 font-medium">
                  {language === 'bn' ? 'টি পার্সেল' : 'Parcels'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast message */}
      {actionSuccessMsg && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 text-center font-bold animate-fade-in shadow-xs">
          🎉 {actionSuccessMsg}
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Seller Trust Search Checker Card */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <div>
              <h3 className="text-xs font-black text-slate-900">
                {language === 'bn' ? 'পেমেন্টের আগে বিক্রেতার ট্রাস্ট ব্যাজ যাচাই করুন' : 'Verify Seller Trust Badge'}
              </h3>
              <p className="text-[10px] text-slate-500">
                {language === 'bn' ? 'যেকোনো ফেসবুক পেজ বা মার্চেন্ট নম্বর লিখে এআই স্কোর দেখুন' : 'Enter page name or phone number'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={sellerCheckInput}
              onChange={(e) => setSellerCheckInput(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: দারুচিনি বুটিক বা 01711...' : 'e.g. Daruchini Boutique or 01711...'}
              className="flex-1 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B4DA2] focus:bg-white"
            />
            <button
              onClick={handleCheckSeller}
              className="px-4 py-2.5 rounded-xl bg-[#0B4DA2] text-white font-bold text-xs hover:bg-blue-800 active:scale-95 transition-all cursor-pointer"
            >
              {language === 'bn' ? 'যাচাই' : 'Check'}
            </button>
          </div>

          {/* Searched Seller Trust Result Card */}
          {searchedSeller && (
            <div
              className={`p-3.5 rounded-2xl border space-y-2 animate-fade-in text-xs ${
                searchedSeller.trustLevel === 'high'
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : searchedSeller.trustLevel === 'caution'
                  ? 'bg-rose-50 border-rose-300'
                  : 'bg-amber-50 border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900 text-xs">{searchedSeller.sellerName}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">{searchedSeller.sellerPhone}</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    searchedSeller.trustLevel === 'high'
                      ? 'bg-emerald-600 text-white'
                      : searchedSeller.trustLevel === 'caution'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {searchedSeller.badgeTitleBn}
                </span>
              </div>

              <p className="text-[11px] text-slate-700 leading-relaxed bg-white/70 p-2.5 rounded-xl">
                {searchedSeller.explanationBn}
              </p>

              {/* Warning if caution */}
              {searchedSeller.trustLevel === 'caution' && (
                <div className="p-2.5 rounded-xl bg-rose-100/90 text-rose-900 text-[11px] font-bold flex items-center gap-1.5 border border-rose-200">
                  <span>⚠️</span>
                  <span>{searchedSeller.riskWarningBn}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[10px] text-slate-600">
                <span>সফল ডেলিভারি: {searchedSeller.successfulDeliveries}/{searchedSeller.totalOrders}</span>
                <span>অভিযোগ: {searchedSeller.disputeCount} টি</span>
                <span className="font-bold text-[#0B4DA2]">স্কোর: {searchedSeller.trustScore}/১০০</span>
              </div>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'all', bn: 'সকল অর্ডার', en: 'All' },
            { id: 'held', bn: 'টাকা হোল্ড আছে', en: 'Held' },
            { id: 'delivered', bn: 'ডেলিভারড', en: 'Delivered' },
            { id: 'disputed', bn: 'ডিসপ্যুট', en: 'Disputed' },
            { id: 'released', bn: 'সম্পন্ন', en: 'Released' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-white text-[#0B4DA2] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? tab.bn : tab.en}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <span className="text-3xl">📦</span>
              <p className="text-xs font-bold text-slate-500">
                {language === 'bn' ? 'কোনো অর্ডার খুঁজে পাওয়া যায়নি' : 'No orders in this category'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isHeld = order.status === 'payment_held';
              const isDelivered = order.status === 'delivered';
              const isDisputed = order.status === 'disputed';
              const isReleased = order.status === 'released';

              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer active:scale-98 space-y-3 hover:border-[#0B4DA2]/40 group"
                >
                  {/* Top Row: Seller & Trust Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 group-hover:text-[#0B4DA2] transition-colors">
                          {order.sellerName}
                        </span>
                        {/* Trust Badge Pill */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase inline-flex items-center gap-1 ${
                            order.sellerTrust.trustLevel === 'high'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : order.sellerTrust.trustLevel === 'caution'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              order.sellerTrust.trustLevel === 'high'
                                ? 'bg-emerald-600'
                                : order.sellerTrust.trustLevel === 'caution'
                                ? 'bg-rose-600 animate-pulse'
                                : 'bg-amber-600'
                            }`}
                          />
                          <span>
                            {order.sellerTrust.trustLevel === 'high'
                              ? 'উচ্চ বিশ্বস্ত'
                              : order.sellerTrust.trustLevel === 'caution'
                              ? 'সতর্কতা'
                              : 'মধ্যম'}
                          </span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {order.courierService} • {order.trackingNumber}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-[#0B4DA2] block">
                        ৳{order.amount.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold">{order.createdAt}</span>
                    </div>
                  </div>

                  {/* Product Details Box */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-slate-800">{order.itemName}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{order.itemDescription}</p>
                    </div>
                  </div>

                  {/* Clear Status Steps Progress Indicator (Core Requirement) */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <span className={order.status ? 'text-slate-900 font-black' : ''}>১. অর্ডার</span>
                      <span className={isHeld || isDelivered || isReleased || isDisputed ? 'text-[#0B4DA2] font-black' : ''}>
                        ২. টাকা হোল্ড
                      </span>
                      <span className={isDelivered || isReleased ? 'text-emerald-700 font-black' : ''}>
                        ৩. ডেলিভারি
                      </span>
                      <span
                        className={
                          isReleased
                            ? 'text-emerald-700 font-black'
                            : isDisputed
                            ? 'text-rose-700 font-black'
                            : ''
                        }
                      >
                        {isDisputed ? '৪. ডিসপ্যুট ⚠️' : '৪. রিলিজ ✓'}
                      </span>
                    </div>

                    {/* Step Visual Track */}
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isDisputed
                            ? 'bg-rose-500 w-full'
                            : isReleased
                            ? 'bg-emerald-500 w-full'
                            : isDelivered
                            ? 'bg-[#0B4DA2] w-3/4'
                            : 'bg-[#0B4DA2] w-1/2'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Contextual Status Banner & Actions */}
                  {isDelivered && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">📦</span>
                        <span className="text-[11px] font-bold text-amber-900">
                          {language === 'bn' ? 'পণ্য হাতে পেয়েছেন? চেক করে টাকা ছাড়ুন।' : 'Delivered! Confirm receipt.'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleQuickRelease(e, order.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
                      >
                        {language === 'bn' ? 'টাকা ছাড়ুন ➔' : 'Release ➔'}
                      </button>
                    </div>
                  )}

                  {isHeld && (
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-blue-900 font-semibold flex items-center gap-1">
                        <span>🔒</span>
                        <span>{language === 'bn' ? 'টাকা এসক্রোতে নিরাপদ। পার্সেল ট্রানজিটে আছে।' : 'Funds safely escrowed.'}</span>
                      </span>
                      <span className="text-[10px] text-blue-700 font-mono font-bold">In Escrow</span>
                    </div>
                  )}

                  {isDisputed && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-[11px]">
                        <span className="flex items-center gap-1">
                          <span>⚠️</span>
                          <span>বিরোধ তদন্তাধীন (টাকা সম্পূর্ণ ফ্রিজ)</span>
                        </span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 bg-rose-200 text-rose-950 rounded">
                          Disputed
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 line-clamp-1">
                        কারণ: {order.disputeReason}
                      </p>
                    </div>
                  )}

                  {isReleased && (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800">
                      <span className="font-bold flex items-center gap-1">
                        <span>✓</span>
                        <span>লেনদেন সম্পন্ন ও তহবিল হস্তান্তর হয়েছে</span>
                      </span>
                      <span className="font-mono text-[10px]">Released</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Informative Escrow Security Info Card */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-2xs">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span>🛡️</span>
            <span>{language === 'bn' ? 'ট্রাস্টপে এসক্রো কিভাবে আপনাকে সুরক্ষা দেয়?' : 'How TrustPay Escrow Protects You'}</span>
          </h4>
          <div className="space-y-2 text-xs text-slate-600">
            <p>
              • <strong>টাকা সরাসরি বিক্রেতা পায় না:</strong> আপনি অনলাইনে অর্ডার করলে টাকা রিকার্শন পে এসক্রো ভল্টে লক থাকে।
            </p>
            <p>
              • <strong>পণ্য দেখে ছাড়ার ক্ষমতা:</strong> পার্সেল ডেলিভারি হওয়ার পর আপনি সন্তুষ্ট হয়ে কনফার্ম করলেই বিক্রেতা টাকা পায়।
            </p>
            <p>
              • <strong>ডিসপ্যুট বাটন:</strong> ভুল বা ক্ষতিগ্রস্ত পণ্য পেলে বা পার্সেল না আসলে "ডিসপ্যুট" বাটনে ট্যাপ করলে টাকা তাৎক্ষণিক ফ্রিজ হয়ে যায় এবং রিকার্শন পে সেল মধ্যস্থতা করে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
