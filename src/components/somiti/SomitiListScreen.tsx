import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { DigitalSomiti } from '../../types/somiti';
import { getSomitis } from '../../utils/somitiManager';
import { formatCurrency } from '../../utils/formatters';

interface SomitiListScreenProps {
  onOpenCreate: () => void;
  onSelectSomiti: (somiti: DigitalSomiti) => void;
}

export const SomitiListScreen: React.FC<SomitiListScreenProps> = ({ onOpenCreate, onSelectSomiti }) => {
  const { language } = useAppStore();
  const [somitis, setSomitis] = useState<DigitalSomiti[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    setSomitis(getSomitis());
  }, []);

  const totalPoolManaged = somitis.reduce((acc, s) => acc + s.poolAmountPerCycle, 0);
  const activeCount = somitis.filter((s) => s.status === 'active').length;

  const filteredSomitis = somitis.filter((s) => {
    if (activeFilter === 'all') return true;
    return s.status === activeFilter;
  });

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Top Header Banner (Min-height 96-110px, unclipped, normal flow) */}
      <div className="w-full min-h-[96px] sm:min-h-[104px] h-auto shrink-0 bg-gradient-to-r from-[#0B4DA2] via-[#103D78] to-[#0B4DA2] text-white px-4 py-5 shadow-md relative">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20 shrink-0">
                👥
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <h1 className="text-[19px] font-black tracking-tight text-white leading-tight">
                    {language === 'bn' ? 'ডিজিটাল সমিতি' : 'Digital Somiti'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFD600] text-slate-950 text-[10px] font-black uppercase tracking-wide shrink-0">
                    AI Escrow
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium leading-snug mt-1">
                  {language === 'bn' ? 'বিশ্বস্ত গ্রুপ ওয়ালেট ও সঞ্চয় সার্কেল' : 'Informal Group Savings & ROSCA Circle'}
                </p>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={onOpenCreate}
              className="px-3 py-1.5 rounded-xl bg-[#FFD600] hover:bg-yellow-300 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span className="text-sm font-bold">+</span>
              <span>{language === 'bn' ? 'নতুন সমিতি' : 'New Somiti'}</span>
            </button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-[10px] text-blue-200 font-semibold uppercase block">
                {language === 'bn' ? 'সক্রিয় সমিতি' : 'Active Circles'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-white">{activeCount}</span>
                <span className="text-[10px] text-blue-200 font-medium">{language === 'bn' ? 'টি সার্কেল' : 'Circles'}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-[10px] text-blue-200 font-semibold uppercase block">
                {language === 'bn' ? 'মাসিক মোট ফান্ড' : 'Monthly Pool Volume'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-black text-[#FFD600]">৳{totalPoolManaged.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 py-4 space-y-4">
        {/* Anti-Fraud Security Badge */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 flex items-start gap-3 shadow-2xs">
          <span className="text-xl shrink-0 mt-0.5">🛡️</span>
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-900 leading-tight">
              {language === 'bn' ? 'জিরো অ্যাডমিন ফ্রড প্রোটেকশন' : '100% Anti-Admin Fraud Escrow'}
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {language === 'bn'
                ? 'অ্যাডমিন কোনো টাকা একা তুলতে পারবে না। এআই লটারির নিরপেক্ষ ক্রমানুসারে প্রতি মাসের সম্পূর্ণ তহবিল সরাসরি নির্ধারিত সদস্যের ওয়ালেটে চলে যায়।'
                : 'Escrowed pool cannot be stolen by group admin. Funds disburse strictly via verified AI lottery sequence.'}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'সকল সমিতি' : 'All'}
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'active' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'চলমান' : 'Active'}
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'completed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'সম্পন্ন' : 'Completed'}
            </button>
          </div>

          <span className="text-[11px] font-bold text-slate-500">
            {filteredSomitis.length} {language === 'bn' ? 'টি সমিতি' : 'Groups'}
          </span>
        </div>

        {/* Somiti List Cards */}
        <div className="space-y-3">
          {filteredSomitis.map((somiti) => {
            const hasCriticalWarning = somiti.earlyWarnings.some((ew) => ew.severity === 'critical');
            const hasAnyWarning = somiti.earlyWarnings.length > 0;
            const myMember = somiti.members.find((m) => m.isCurrentUser);
            const progressPercent = Math.min(
              100,
              Math.round((somiti.totalPotCollectedCurrentCycle / somiti.poolAmountPerCycle) * 100)
            );

            return (
              <div
                key={somiti.id}
                onClick={() => onSelectSomiti(somiti)}
                className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer active:scale-98 space-y-3.5 group hover:border-[#0B4DA2]/40"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 leading-tight group-hover:text-[#0B4DA2] transition-colors">
                        {somiti.name}
                      </h3>
                      {somiti.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold shrink-0">
                          {language === 'bn' ? 'চলমান' : 'Active'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold shrink-0">
                          {language === 'bn' ? 'সম্পন্ন' : 'Completed'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {somiti.description}
                    </p>
                  </div>

                  {/* Early warning icon */}
                  {hasCriticalWarning && (
                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs animate-bounce shrink-0" title="লেট কিস্তির ঝুঁকি">
                      ⚠️
                    </span>
                  )}
                </div>

                {/* Pool & Cycle Info */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      {language === 'bn' ? 'মাসিক কিস্তি' : 'Monthly'}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      ৳{somiti.monthlyContribution.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      {language === 'bn' ? 'মোট তহবিল' : 'Cycle Pool'}
                    </span>
                    <span className="text-xs font-black text-[#0B4DA2]">
                      ৳{somiti.poolAmountPerCycle.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      {language === 'bn' ? 'বর্তমান সাইকেল' : 'Cycle'}
                    </span>
                    <span className="text-xs font-black text-emerald-700">
                      {somiti.currentCycle} / {somiti.totalCycles}
                    </span>
                  </div>
                </div>

                {/* Fund Collection Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600 font-medium">
                      {language === 'bn' ? 'সাইকেল ২ এর জমা:' : 'Current Cycle Collection:'}{' '}
                      <span className="font-bold text-slate-900">
                        ৳{somiti.totalPotCollectedCurrentCycle.toLocaleString()}
                      </span>
                    </span>
                    <span className="font-bold text-[#0B4DA2]">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progressPercent >= 100
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-blue-500 to-[#0B4DA2]'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Early Warning Banner if exists */}
                {hasAnyWarning && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs">
                    <span className="text-sm">⚠️</span>
                    <span className="text-[11px] text-amber-900 font-bold leading-tight">
                      {somiti.earlyWarnings[0].messageBn}
                    </span>
                  </div>
                )}

                {/* Footer Meta */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>👥 {somiti.members.length} {language === 'bn' ? 'জন সদস্য' : 'members'}</span>
                    {myMember && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0B4DA2] text-[10px] font-bold">
                        {language === 'bn' ? `আপনার পে-আউট: সাইকেল ${myMember.payoutCycle}` : `Your Turn: Cycle ${myMember.payoutCycle}`}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#0B4DA2] group-hover:underline flex items-center gap-1">
                    <span>{language === 'bn' ? 'বিস্তারিত' : 'View'}</span>
                    <span>➔</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explain Card */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-2xs">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <span>💡</span>
            <span>{language === 'bn' ? 'ডিজিটাল সমিতি কিভাবে কাজ করে?' : 'How Digital Somiti Works'}</span>
          </h4>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B4DA2] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                ১
              </span>
              <p>
                <strong className="text-slate-800">{language === 'bn' ? 'গ্রুপ তৈরি ও সদস্য যোগ:' : 'Group Creation:'}</strong>{' '}
                {language === 'bn'
                  ? 'মাসিক কিস্তির পরিমাণ ও সদস্য সংখ্যা ঠিক করে নতুন সমিতি শুরু করুন।'
                  : 'Set monthly contribution and add trusted members with zero paperwork.'}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B4DA2] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                ২
              </span>
              <p>
                <strong className="text-slate-800">{language === 'bn' ? 'AI নিরপেক্ষ পে-আউট ক্রম:' : 'AI Fair Lottery:'}</strong>{' '}
                {language === 'bn'
                  ? 'কাউকে বাড়তি সুবিধা না দিয়ে এআই স্বয়ংক্রিয়ভাবে নিরপেক্ষ পে-আউট ক্রম ও তার কারণ ব্যাখ্যা করে।'
                  : 'AI transparently orders payout rounds with complete reasoning visible to all.'}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B4DA2] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                ৩
              </span>
              <p>
                <strong className="text-slate-800">{language === 'bn' ? 'স্বচ্ছ লেজার ও আগাম অ্যালার্ট:' : 'Transparent Ledger:'}</strong>{' '}
                {language === 'bn'
                  ? 'প্রতিটি কিস্তি ও উত্তোলনের হিসাব পরিবর্তন-অযোগ্য পাবলিক লেজারে থাকে। কিস্তি দেরির সম্ভাবনা দেখা দিলে এআই সতর্কবার্তা পাঠায়।'
                  : 'Immutable public ledger records all cash flows with automated early warnings.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
