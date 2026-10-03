import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/formatters';

interface UpayCardModalProps {
  onClose: () => void;
}

export const UpayCardModal: React.FC<UpayCardModalProps> = ({ onClose }) => {
  const { user, language, setCurrentModal } = useAppStore();
  const [isFrozen, setIsFrozen] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [intlEnabled, setIntlEnabled] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(25000);
  const [copied, setCopied] = useState(false);
  const [orderedSuccess, setOrderedSuccess] = useState(false);

  const cardNumberFull = '5421 8904 3312 8842';
  const cardNumberMasked = '5421 •••• •••• 8842';
  const expiryDate = '08/29';
  const cvv = '419';

  const cardTransactions = [
    { id: 'ctx_1', merchant: 'Shwapno Superhop POS', date: 'আজ, দুপুর ১:২০', amount: 1450, icon: '🛒', status: 'সফল' },
    { id: 'ctx_2', merchant: 'Daraz Bangladesh Online', date: 'গতকাল, রাত ৯:১৫', amount: 890, icon: '🛍️', status: 'সফল' },
    { id: 'ctx_3', merchant: 'Star Cineplex Tickets', date: '২৮ সেপ্টেম্বর', amount: 900, icon: '🎬', status: 'সফল' },
    { id: 'ctx_4', merchant: 'Pathao Food Delivery', date: '২৫ সেপ্টেম্বর', amount: 380, icon: '🍔', status: 'সফল' }
  ];

  const handleCopyCard = () => {
    navigator.clipboard?.writeText(cardNumberFull.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOrderPhysical = () => {
    setOrderedSuccess(true);
    setTimeout(() => setOrderedSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-slate-900 text-slate-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up border border-slate-800">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-amber-400/20 text-yellow-400 flex items-center justify-center text-sm">
              💳
            </span>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">
                {language === 'bn' ? 'রিকার্শন পে ভার্চুয়াল ও ডেবিট কার্ড' : 'Recursion Pay Virtual & Debit Card'}
              </h2>
              <p className="text-[10px] text-slate-400">
                {language === 'bn' ? 'মাস্টারকার্ড ও বাংলা কিউআর সাপোর্টেড' : 'Mastercard & Bangla QR Supported'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 text-xs transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Virtual Card Graphic */}
          <div className={`relative w-full rounded-2xl p-5 select-none transition-all duration-300 shadow-xl overflow-hidden ${
            isFrozen 
              ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 opacity-80 border border-slate-600'
              : 'bg-gradient-to-br from-[#0B4DA2] via-[#103D78] to-[#062450] text-white border border-blue-400/30'
          }`}>
            {/* Background watermarks */}
            <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute right-4 top-4 flex items-center gap-1.5 opacity-90">
              <span className="text-[10px] font-black uppercase tracking-wider text-yellow-300">recursion pay</span>
              <div className="w-6 h-6 rounded-full bg-yellow-400/90 flex items-center justify-center text-[10px] font-black text-slate-950">
                R
              </div>
            </div>

            {/* Chip & Contactless */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 to-yellow-500 border border-yellow-200/50 shadow-inner flex items-center justify-center">
                <div className="w-6 h-4 border border-black/30 rounded-xs grid grid-cols-2" />
              </div>
              <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8.5 16.5a5 5 0 010-9" />
                <path d="M12 19a9 9 0 000-14" />
                <path d="M15.5 21.5a13 13 0 000-19" />
              </svg>
            </div>

            {/* Card Number */}
            <div className="space-y-1 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-bold tracking-widest text-white/95">
                  {showCardNumber ? cardNumberFull : cardNumberMasked}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCardNumber(!showCardNumber)}
                  className="text-xs text-yellow-300 hover:text-yellow-200 font-semibold underline underline-offset-2 cursor-pointer"
                >
                  {showCardNumber ? (language === 'bn' ? 'লুকান' : 'Hide') : (language === 'bn' ? 'দেখুন' : 'Show')}
                </button>
              </div>
              <p className="text-[10px] text-white/60">
                {language === 'bn' ? 'রিকার্শন পে ওয়ালেটের সাথে লিংকড' : 'Linked to Recursion Pay Main Balance'}
              </p>
            </div>

            {/* Cardholder & Expiry */}
            <div className="flex items-end justify-between pt-2 border-t border-white/10">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-white/60 block">Cardholder</span>
                <span className="text-xs font-black tracking-wide text-white uppercase">
                  {user?.name || 'MD. ASIF RAHMAN'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/60 block">Expires</span>
                  <span className="text-xs font-mono font-bold text-white">{expiryDate}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/60 block">CVV</span>
                  <span className="text-xs font-mono font-bold text-yellow-300">
                    {showCardNumber ? cvv : '•••'}
                  </span>
                </div>
              </div>
            </div>

            {/* Frozen Overlay Badge */}
            {isFrozen && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-2xs flex flex-col items-center justify-center text-center p-4">
                <span className="text-2xl mb-1">❄️</span>
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  {language === 'bn' ? 'কার্ড সাময়িকভাবে ফ্রিজ আছে' : 'Card is Temporarily Frozen'}
                </span>
                <span className="text-[10px] text-slate-300 mt-0.5">
                  {language === 'bn' ? 'আনফ্রিজ করতে নিচের সুইচে ট্যাপ করুন' : 'Tap switch below to unfreeze'}
                </span>
              </div>
            )}
          </div>

          {/* Quick Balance & Copy Row */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">
                {language === 'bn' ? 'কার্ডের ব্যালেন্স (ওয়ালেট):' : 'Available Balance:'}
              </span>
              <span className="text-base font-black text-yellow-400">
                {formatCurrency(user?.balance || 24500)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCard}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>📋</span>
                <span>{copied ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'কার্ড কপি' : 'Copy')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setCurrentModal('add_money');
                }}
                className="px-3 py-1.5 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                + {language === 'bn' ? 'অ্যাড মানি' : 'Add Money'}
              </button>
            </div>
          </div>

          {/* Card Security Controls */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
              {language === 'bn' ? 'কার্ড সিকিউরিটি ও নিয়ন্ত্রণ' : 'Card Security & Controls'}
            </h3>

            {/* Freeze Toggle */}
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">❄️</span>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {language === 'bn' ? 'ইনস্ট্যান্ট কার্ড ফ্রিজ' : 'Instant Freeze Card'}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'সন্দেহ হলে এক ট্যাপেই লেনদেন বন্ধ করুন' : 'Lock card instantly if lost or suspicious'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFrozen(!isFrozen)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isFrozen ? 'bg-rose-500' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-md ${
                    isFrozen ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Online Transactions */}
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🌐</span>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {language === 'bn' ? 'অনলাইন ও ই-কমার্স পেমেন্ট' : 'Online & E-commerce Payments'}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'দারাজ, ফুডপান্ডা ও অনলাইন শপিং' : 'Daraz, Foodpanda & Web stores'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOnlineEnabled(!onlineEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  onlineEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-md ${
                    onlineEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Dual Currency / International */}
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">✈️</span>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {language === 'bn' ? 'আন্তর্জাতিক / ডুয়াল কারেন্সি' : 'International / Dual Currency'}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'পাসপোর্ট এনডোর্সমেন্ট সহ বৈদেশিক পেমেন্ট' : 'Foreign payments with passport endorsement'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIntlEnabled(!intlEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  intlEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-md ${
                    intlEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Daily Spending Limit */}
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">
                  {language === 'bn' ? 'দৈনিক খরচের সীমা (Daily Limit)' : 'Daily Limit:'}
                </span>
                <span className="font-mono font-bold text-yellow-400">৳{dailyLimit.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[5000, 10000, 25000, 50000].map((lim) => (
                  <button
                    key={lim}
                    type="button"
                    onClick={() => setDailyLimit(lim)}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      dailyLimit === lim
                        ? 'bg-[#0B4DA2] text-white shadow-xs'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    ৳{lim >= 1000 ? `${lim / 1000}k` : lim}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Physical Card Order Promotion */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-blue-500/20 border border-yellow-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-yellow-300 uppercase block">
                {language === 'bn' ? 'ফিজিক্যাল প্লাস্টিক কার্ড' : 'Physical Plastic Card'}
              </span>
              <h4 className="text-xs font-bold text-white">
                {language === 'bn' ? 'হোম ডেলিভারিতে পান আসল কার্ড' : 'Order Physical Recursion Pay Debit Card'}
              </h4>
              <p className="text-[10px] text-slate-400">
                {language === 'bn' ? 'যেকোনো বুথ ও এটিএম থেকে ক্যাশ উত্তোলন' : 'ATM withdrawal & POS tap support'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOrderPhysical}
              className="px-3 py-1.5 rounded-xl bg-[#FFD600] hover:bg-yellow-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              {language === 'bn' ? 'অর্ডার করুন' : 'Order'}
            </button>
          </div>

          {orderedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold animate-fade-in">
              🎉 {language === 'bn' ? 'ফিজিক্যাল কার্ডের আবেদন সফল! ৩-৫ কার্যদিবসে ডেলিভারি হবে।' : 'Physical card order placed! Delivery in 3-5 business days.'}
            </div>
          )}

          {/* Recent Card Transactions */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
              {language === 'bn' ? 'সাম্প্রতিক কার্ড লেনদেন' : 'Recent Card Activity'}
            </h3>
            <div className="space-y-1.5">
              {cardTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-sm">
                      {tx.icon}
                    </span>
                    <div>
                      <h5 className="font-bold text-white">{tx.merchant}</h5>
                      <span className="text-[10px] text-slate-400">{tx.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white block">
                      -৳{tx.amount.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-semibold">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
