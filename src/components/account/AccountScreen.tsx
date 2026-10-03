import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/formatters';

export const AccountScreen: React.FC = () => {
  const { user, language, setCurrentModal } = useAppStore();

  return (
    <div className="w-full flex-1 flex flex-col bg-white overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Top Header */}
      <div className="px-5 pt-6 pb-3 border-b border-slate-100 flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#0B4DA2] tracking-tight">
          {language === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}
        </h1>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
          ✓ NID Verified
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* User Profile Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0B4DA2] text-white flex items-center gap-3.5 shadow-md">
          <div className="w-14 h-14 rounded-full bg-amber-400 p-0.5 shrink-0 flex items-center justify-center text-2xl font-bold text-slate-900 shadow-inner">
            👤
          </div>
          <div>
            <h2 className="text-base font-black leading-tight">
              {user?.name || 'MD. AL-MAYNUL HASAN'}
            </h2>
            <p className="text-xs text-sky-200 font-mono mt-0.5">
              {user?.phone || '01794809461'}
            </p>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
              {user?.accountTier || 'Verified Plus (Tier-2)'}
            </span>
          </div>
        </div>

        {/* Upay Virtual Debit Card Preview */}
        <div className="relative w-full h-44 rounded-2xl p-4 bg-gradient-to-br from-[#0B4DA2] via-[#1E40AF] to-slate-900 text-white shadow-xl flex flex-col justify-between overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
          
          <div className="flex justify-between items-center z-10">
            <span className="text-xs font-black tracking-widest text-[#FFD600] uppercase">
              UPAY SAFE CARD
            </span>
            <span className="text-lg">💳</span>
          </div>

          <div className="z-10 space-y-1">
            <span className="text-sm font-mono tracking-widest block text-slate-200">
              •••• •••• •••• 9461
            </span>
            <div className="flex justify-between items-end text-[10px] text-slate-300">
              <span>{user?.name || 'MD. AL-MAYNUL HASAN'}</span>
              <span>EXP: 10/28</span>
            </div>
          </div>
        </div>

        {/* Account Balance & Daily Limits */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">মূল ব্যালেন্স:</span>
            <span className="font-extrabold text-[#0B4DA2] text-sm">
              {formatCurrency(user?.balance || 18450, language)}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-2 space-y-2 text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-600">দৈনিক লেনদেন লিমিট (বাকি আছে):</span>
              <span className="font-bold text-slate-900">৳৩৫,০০০ / ৳৫০,০০০</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div className="w-[70%] h-full bg-[#0B4DA2]" />
            </div>

            <div className="flex justify-between text-[11px] pt-1">
              <span className="text-slate-600">মাসিক লিমিট:</span>
              <span className="font-bold text-slate-900">৳২,৪৫,০০০ / ৳৩,০০,০০০</span>
            </div>
          </div>
        </div>

        {/* Security & Guardian Status */}
        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🛡️</span>
            <div>
              <span className="font-bold text-[#0B4DA2] block">
                {language === 'bn' ? 'সেফ এআই শিল্ড সক্রিয়' : 'Safe AI Shield Active'}
              </span>
              <span className="text-[11px] text-slate-600">
                অভিভাবক: {user?.guardianName || 'সংযুক্ত'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setCurrentModal('guardian_invite')}
            className="px-2.5 py-1 rounded-lg bg-white border border-sky-300 text-[#0B4DA2] font-bold text-[11px] shadow-2xs hover:bg-sky-100"
          >
            পরিচালনা
          </button>
        </div>
      </div>
    </div>
  );
};
