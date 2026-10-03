import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { IncomePassportToken } from '../../types/incomePassport';

interface PassportVerificationModalProps {
  token: IncomePassportToken;
  onClose: () => void;
  onRevoke: (id: string) => void;
}

export const PassportVerificationModal: React.FC<PassportVerificationModalProps> = ({
  token,
  onClose,
  onRevoke
}) => {
  const { language } = useAppStore();
  const isRevoked = token.status === 'revoked';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 select-none">
      <div className="w-full max-w-[400px] bg-slate-50 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[94vh] animate-scale-up border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0B4DA2] text-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg border border-white/20">
              🛂
            </span>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">
                {language === 'bn' ? 'ডিজিটাল ইনকাম পাসপোর্ট ভিউ' : 'Income Passport View'}
              </h2>
              <span className="text-[10px] text-blue-200 font-mono">
                {token.referenceCode}
              </span>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs">
          {/* Status Badge */}
          <div className="text-center space-y-1">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isRevoked
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {isRevoked ? 'অনুমতি প্রত্যাহারকৃত (Revoked)' : 'সক্রিয় ও যাচাইকৃত (Active & Verified)'}
            </span>
            <h3 className="font-bold text-slate-900 text-sm">{token.purposeBn}</h3>
            <p className="text-[11px] text-slate-500">প্রাপক: {token.recipientEntity}</p>
          </div>

          {/* QR Code Container */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 text-center shadow-xs space-y-3">
            {!isRevoked ? (
              <>
                {/* Simulated Scannable QR Graphic */}
                <div className="w-44 h-44 mx-auto p-2 rounded-2xl bg-white border-2 border-slate-900 flex flex-col justify-between shadow-2xs relative">
                  <div className="flex justify-between">
                    <div className="w-10 h-10 border-4 border-slate-900 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-slate-900" />
                    </div>
                    <div className="w-10 h-10 border-4 border-slate-900 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-slate-900" />
                    </div>
                  </div>

                  {/* Center Recursion Pay Shield Icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-xl bg-[#0B4DA2] text-[#FFD600] flex items-center justify-center font-bold text-[10px] shadow-md border border-white">
                      RPAY
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <div className="w-10 h-10 border-4 border-slate-900 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-slate-900" />
                    </div>
                    {/* Small pseudo QR dots */}
                    <div className="grid grid-cols-3 gap-0.5 w-10 h-10 p-1">
                      <div className="bg-slate-900 rounded-xs" />
                      <div className="bg-slate-300 rounded-xs" />
                      <div className="bg-slate-900 rounded-xs" />
                      <div className="bg-slate-900 rounded-xs" />
                      <div className="bg-slate-900 rounded-xs" />
                      <div className="bg-slate-300 rounded-xs" />
                      <div className="bg-slate-300 rounded-xs" />
                      <div className="bg-slate-900 rounded-xs" />
                      <div className="bg-slate-900 rounded-xs" />
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {token.referenceCode}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    মেয়াদ: {token.expiresAt}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-8 space-y-2 text-rose-600">
                <span className="text-4xl block">🚫</span>
                <span className="font-bold text-sm block">এই কিউআরের অনুমতি প্রত্যাহার করা হয়েছে</span>
                <p className="text-[10px] text-slate-500">
                  এখন আর কেউ এই কিউআর স্ক্যান করে আপনার আয়ের প্রমাণ দেখতে পারবে না।
                </p>
              </div>
            )}
          </div>

          {/* VERIFIED INCOME PROOF METRICS (Regularity, not statements) */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100 text-xs">
            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-500">মাসিক গড় আয়ের রেঞ্জ:</span>
              <span className="font-bold text-[#0B4DA2]">{token.averageMonthlyRangeBn}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-500">আয় ধারাবাহিকতা:</span>
              <span className="font-bold text-slate-900">টানা {token.consecutiveMonthsCount} মাস নিয়মিত</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-500">ইনকাম স্থিতিশীলতা স্কোর:</span>
              <span className="font-mono font-black text-emerald-700">
                {token.stabilityScore}/১০০ ({token.stabilityRatingBn})
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-500">ব্যক্তিগত স্টেটমেন্ট:</span>
              <span className="text-[10px] text-emerald-700 font-bold">🔒 সম্পূর্ণ গোপন</span>
            </div>
          </div>

          {/* Revoke Option (Core Requirement) */}
          {!isRevoked ? (
            <button
              type="button"
              onClick={() => onRevoke(token.id)}
              className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>✕</span>
              <span>অনুমতি প্রত্যাহার করুন (Revoke Access)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
            >
              বন্ধ করুন
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
