import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { DisasterType, AffectedDistrictDemand, ReliefDisbursementItem } from '../../types/climateShield';
import {
  FLOOD_AFFECTED_DISTRICTS,
  CYCLONE_AFFECTED_DISTRICTS,
  getClimateShieldConfig,
  saveClimateShieldConfig,
  getReliefDisbursements,
  claimReliefFunds
} from '../../utils/climateShieldManager';
import { formatCurrency } from '../../utils/formatters';

export const ClimateShieldScreen: React.FC = () => {
  const { user, language, setCurrentModal, depositRelief } = useAppStore();
  const [isActive, setIsActive] = useState(false);
  const [disasterType, setDisasterType] = useState<DisasterType>('flood');
  const [reliefList, setReliefList] = useState<ReliefDisbursementItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isLowBandwidth, setIsLowBandwidth] = useState(true);

  const currentBalance = user?.balance ?? 12500;

  useEffect(() => {
    const config = getClimateShieldConfig();
    setIsActive(config.isActive);
    if (config.disasterType !== 'none') {
      setDisasterType(config.disasterType);
    }
    setReliefList(getReliefDisbursements());
  }, []);

  const handleToggleMode = (enable: boolean, type?: DisasterType) => {
    const newActive = enable;
    const newType = type || disasterType;
    setIsActive(newActive);
    if (type) setDisasterType(type);
    saveClimateShieldConfig({ isActive: newActive, disasterType: newType });

    setToastMsg(
      newActive
        ? `ক্লাইমেট শিল্ড মোড সক্রিয় হয়েছে: ${newType === 'flood' ? 'বন্যা জরুরি সতর্কতা' : 'ঘূর্ণিঝড় জরুরি সতর্কতা'}`
        : 'ক্লাইমেট শিল্ড মোড নিষ্ক্রিয় হয়েছে। সাধারণ মোডে ফিরে আসা হয়েছে।'
    );
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleClaimRelief = (relief: ReliefDisbursementItem) => {
    const claimed = claimReliefFunds(relief.id);
    if (claimed) {
      setReliefList(getReliefDisbursements());
      // Add relief amount to wallet balance
      depositRelief(relief.amount);
      setToastMsg(`🎉 ৳${relief.amount.toLocaleString()} ত্রাণ সহায়তা সফলভাবে আপনার ওয়ালেটে জমা হয়েছে!`);
      setTimeout(() => setToastMsg(null), 5000);
    }
  };

  const affectedDistricts = disasterType === 'flood' ? FLOOD_AFFECTED_DISTRICTS : CYCLONE_AFFECTED_DISTRICTS;

  return (
    <div className={`w-full flex-1 flex flex-col overflow-y-auto no-scrollbar pb-24 select-none ${
      isActive ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* High-Contrast Disaster Emergency Header */}
      <div className={`w-full px-4 pt-5 pb-5 shadow-md relative overflow-hidden transition-colors ${
        isActive
          ? 'bg-rose-950 text-white border-b-2 border-rose-500'
          : 'bg-gradient-to-r from-[#0B4DA2] via-[#093974] to-[#0B4DA2] text-white'
      }`}>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xl border ${
                isActive ? 'bg-rose-900/80 border-rose-400 text-rose-300' : 'bg-white/10 border-white/20'
              }`}>
                {isActive ? (disasterType === 'flood' ? '🌊' : '🌪️') : '🛡️'}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-black tracking-tight text-white">
                    {language === 'bn' ? 'ক্লাইমেট শিল্ড মোড' : 'Climate Shield Mode'}
                  </h1>
                  {isActive && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black uppercase animate-pulse">
                      EMERGENCY ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-blue-100 font-medium">
                  {language === 'bn'
                    ? 'বন্যা ও ঘূর্ণিঝড় দুর্যোগে জরুরি ওয়ালেট ও ত্রাণ বিতরণ'
                    : 'Emergency Disaster Wallet & Relief Disbursement'}
                </p>
              </div>
            </div>

            {/* Mode Switcher Toggle */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleToggleMode(!isActive)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {isActive ? 'বন্ধ করুন ✕' : 'মোড চালু করুন'}
              </button>
            </div>
          </div>

          {/* SIMULATED DISASTER SCENARIO SELECTOR */}
          <div className="p-2 rounded-2xl bg-black/30 border border-white/15 space-y-1.5">
            <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">
              দুর্যোগ পরিস্থিতি নির্বাচন (Simulated Trigger):
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleToggleMode(true, 'flood')}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                  isActive && disasterType === 'flood'
                    ? 'bg-blue-600 text-white border-blue-300 shadow-md'
                    : 'bg-white/10 text-white/90 border-white/10 hover:bg-white/20'
                }`}
              >
                <span>🌊</span>
                <span>বন্যা সতর্কতা (Flood)</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleMode(true, 'cyclone')}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                  isActive && disasterType === 'cyclone'
                    ? 'bg-rose-600 text-white border-rose-300 shadow-md'
                    : 'bg-white/10 text-white/90 border-white/10 hover:bg-white/20'
                }`}
              >
                <span>🌪️</span>
                <span>ঘূর্ণিঝড় (Cyclone)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 text-center font-bold animate-fade-in shadow-xs">
          {toastMsg}
        </div>
      )}

      {/* Main Body */}
      <div className="px-4 py-4 space-y-4 text-xs">
        {/* REQUIREMENT 1: LOW-BANDWIDTH ESSENTIAL ACTIONS ONLY */}
        <div className={`p-4 rounded-3xl border shadow-2xs space-y-3 ${
          isActive
            ? 'bg-slate-800/90 border-slate-700 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="font-black text-xs">
                {language === 'bn' ? 'কম ব্যান্ডউইথ মোড (Low-Bandwidth Essential Mode)' : 'Low-Bandwidth Mode'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              2G / Offline Ready
            </span>
          </div>

          <p className={`text-[11px] leading-relaxed ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
            দুর্যোগপূর্ণ আবহাওয়ায় বিদ্যুৎ বিচ্ছিন্নতা ও দুর্বল ইন্টারনেট নেটওয়ার্কে দ্রুত কাজ করার জন্য শুধুমাত্র ৪টি অপরিহার্য সেবা চালু রাখা হয়েছে।
          </p>

          {/* 4 Essential Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            {/* 1. Send Money */}
            <button
              type="button"
              onClick={() => setCurrentModal('send_money')}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all active:scale-95 cursor-pointer font-bold ${
                isActive
                  ? 'bg-slate-700/80 hover:bg-slate-700 border-slate-600 text-white'
                  : 'bg-blue-50/80 hover:bg-blue-100 border-blue-200 text-blue-950'
              }`}
            >
              <span className="text-xl">📤</span>
              <div className="text-left">
                <span className="block text-xs font-black">সেন্ড মানি</span>
                <span className="text-[10px] text-slate-400 font-normal">জরুরি টাকা পাঠান</span>
              </div>
            </button>

            {/* 2. Cash-Out */}
            <button
              type="button"
              onClick={() => setCurrentModal('cash_out')}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all active:scale-95 cursor-pointer font-bold ${
                isActive
                  ? 'bg-slate-700/80 hover:bg-slate-700 border-slate-600 text-white'
                  : 'bg-emerald-50/80 hover:bg-emerald-100 border-emerald-200 text-emerald-950'
              }`}
            >
              <span className="text-xl">🏧</span>
              <div className="text-left">
                <span className="block text-xs font-black">ক্যাশ-আউট</span>
                <span className="text-[10px] text-slate-400 font-normal">এজেন্ট থেকে উত্তোলন</span>
              </div>
            </button>

            {/* 3. Check Balance */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${
              isActive
                ? 'bg-slate-700/80 border-slate-600 text-white'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">💳</span>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">বর্তমান ব্যালেন্স</span>
                  <span className="font-mono font-black text-sm text-[#FFD600]">
                    ৳{currentBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Offline USSD helper */}
            <div className={`p-3 rounded-2xl border flex items-center gap-2 ${
              isActive
                ? 'bg-slate-700/80 border-slate-600 text-white'
                : 'bg-purple-50/80 border-purple-200 text-purple-950'
            }`}>
              <span className="text-xl">📶</span>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">ইন্টারনেট না থাকলে</span>
                <span className="font-mono font-bold text-xs">ডায়াল: *২৬৮#</span>
              </div>
            </div>
          </div>
        </div>

        {/* REQUIREMENT 2: CASH DEMAND FORECAST & AGENT FLOAT PROMPT */}
        <div className={`p-4 rounded-3xl border shadow-2xs space-y-3 ${
          isActive
            ? 'bg-slate-800/90 border-slate-700 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <div>
                <h3 className="font-black text-xs">
                  {language === 'bn' ? 'আক্রান্ত এলাকায় ক্যাশ চাহিদার পূর্বাভাস' : 'Cash Demand Forecast in Affected Areas'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {disasterType === 'flood' ? 'সিলেট, ফেনী ও নোয়াখালী প্লাবন অঞ্চল' : 'উপকূলীয় ভোলা, পটুয়াখালী ও বরগুনা অঞ্চল'}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
              Surge Alert
            </span>
          </div>

          {/* Affected Districts Grid */}
          <div className="grid grid-cols-2 gap-2">
            {affectedDistricts.map((item) => (
              <div
                key={item.districtBn}
                className={`p-2.5 rounded-2xl border space-y-1 ${
                  isActive ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs">{item.districtBn}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-600 text-white">
                    {item.signalNumberBn}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-0.5">
                  <span className="text-[10px] text-slate-400">ক্যাশ চাহিদা:</span>
                  <span className="font-mono font-black text-rose-400 text-xs">
                    +{item.expectedDemandSurgePct}%
                  </span>
                </div>
                <div className="text-[9px] text-slate-400 truncate">
                  সুপারিশ: {item.recommendedAgentFloatBn}
                </div>
              </div>
            ))}
          </div>

          {/* CRITICAL REQUIREMENT: Prompt for Agents to Prepare Extra Float */}
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-black text-xs text-amber-300">
              <span>📢</span>
              <span>এজেন্টদের জন্য জরুরি নোটিশ (Prepare Extra Float):</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-100/90">
              ঘূর্ণিঝড় ও বন্যার কারণে বিদ্যুৎ ও ব্যাংকের এটিএম বুথ সাময়িক বন্ধ থাকার সম্ভাবনা রয়েছে। সাধারণ মানুষের খাদ্য ও আশ্রয়ের প্রয়োজনে নগদ টাকার সংকট হতে পারে। প্লাবিত ও উপকূলীয় অঞ্চলের সকল উপায় এজেন্টকে <strong>নগদ ক্যাশ ড্রয়ারে অতিরিক্ত ৫০,০০০ - ১,৫০,০০০ টাকা ফ্লোট</strong> প্রস্তুত রাখার জন্য কেন্দ্রীয়ভাবে নির্দেশ দেওয়া হচ্ছে।
            </p>
          </div>
        </div>

        {/* REQUIREMENT 3: RELIEF ALLOCATION PANEL (ত্রাণ ও অনুদান বিতরণ তালিকা) */}
        <div className={`p-4 rounded-3xl border shadow-2xs space-y-3 ${
          isActive
            ? 'bg-slate-800/90 border-slate-700 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤲</span>
              <div>
                <h3 className="font-black text-xs">
                  {language === 'bn' ? 'ত্রাণ ও নগদ অনুদান প্যানেল' : 'Relief Allocation Panel'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  সরকারি ও এনজিও জরুরি অনুদান বণ্টন তালিকা
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              জাতীয় পরিচয়পত্র ভেরিফাইড ✓
            </span>
          </div>

          {/* Relief Items */}
          <div className="space-y-2.5">
            {reliefList.map((rel) => {
              const isReceived = rel.status === 'received';
              const isSent = rel.status === 'sent';
              const isPending = rel.status === 'pending';

              return (
                <div
                  key={rel.id}
                  className={`p-3 rounded-2xl border space-y-2 ${
                    isActive ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                          rel.organizationType === 'govt'
                            ? 'bg-emerald-600 text-white'
                            : rel.organizationType === 'un'
                            ? 'bg-blue-600 text-white'
                            : 'bg-purple-600 text-white'
                        }`}>
                          {rel.organizationType.toUpperCase()}
                        </span>
                        <h4 className="font-bold text-xs">{rel.programNameBn}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{rel.organizationBn}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-[#FFD600] block">
                        ৳{rel.amount.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{rel.referenceNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                    <span className="text-slate-400">
                      তারিখ: {rel.disbursedDate}
                    </span>

                    {/* Status badges & Claim button */}
                    <div className="flex items-center gap-1.5">
                      {isReceived && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          গৃহীত (Received) ✓
                        </span>
                      )}

                      {isPending && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                          অপেক্ষারত (Pending)
                        </span>
                      )}

                      {isSent && (
                        <button
                          type="button"
                          onClick={() => handleClaimRelief(rel)}
                          className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>টাকা গ্রহণ করুন ➔</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
