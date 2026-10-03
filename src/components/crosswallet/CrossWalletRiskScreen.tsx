import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MFS_NODES, getFraudRings } from '../../utils/federatedRiskManager';
import { FraudRingAlert } from '../../types/federatedRisk';
import { formatCurrency } from '../../utils/formatters';

export const CrossWalletRiskScreen: React.FC = () => {
  const { language } = useAppStore();
  const rings = getFraudRings();
  const [selectedRing, setSelectedRing] = useState<FraudRingAlert>(rings[0]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const handleRunFederatedSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncToast('সফল! ৪টি এমএফএস নোড থেকে গোপনীয়তা অক্ষুণ্ণ রেখে এনক্রিপ্টেড মডেল ওয়েট সিন্ডিকেশন সম্পন্ন হয়েছে।');
      setTimeout(() => setSyncToast(null), 4500);
    }, 1200);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Top Banner (Min-height 96-110px, unclipped, normal flow) */}
      <div className="w-full min-h-[96px] sm:min-h-[104px] h-auto shrink-0 bg-gradient-to-r from-[#0B4DA2] via-[#082C5E] to-[#0B4DA2] text-white px-4 py-5 shadow-md relative">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20 shrink-0">
                🌐
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <h1 className="text-[19px] font-black tracking-tight text-white leading-tight">
                    {language === 'bn' ? 'ক্রস-ওয়ালেট রিস্ক এক্সচেঞ্জ' : 'Cross-Wallet Risk Exchange'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFD600] text-slate-950 text-[10px] font-black uppercase tracking-wide shrink-0">
                    Federated AI
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium leading-snug mt-1">
                  {language === 'bn'
                    ? 'আন্তঃএমএফএস সমন্বিত জালিয়াতি ও মানি মিউল প্রতিরোধ ড্যাশবোর্ড'
                    : 'Joint Multi-MFS Fraud Ring Detection without Sharing Raw Data'}
                </p>
              </div>
            </div>

            <button
              onClick={handleRunFederatedSync}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-[10px] active:scale-95 transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
              <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'মডেল সিঙ্ক'}</span>
            </button>
          </div>

          {/* CRITICAL REQUIREMENT: Prominent Privacy Notice on Screen */}
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 flex items-start gap-2.5 shadow-xs">
            <span className="text-lg shrink-0">🛡️</span>
            <div className="space-y-0.5">
              <span className="font-black text-xs text-emerald-300 block uppercase tracking-wide">
                🔒 কোনো ব্যক্তিগত তথ্য শেয়ার করা হয় না (Zero Raw Data Shared)
              </span>
              <p className="text-[10px] text-emerald-100/90 leading-relaxed">
                ফেডারেটেড লার্নিং (Federated Learning) প্রযুক্তিতে কোনো গ্রাহকের নাম, ফোন নম্বর বা ব্যালেন্স কোনো প্রোভাইডারের বাইরে যায় না। প্রতিটি এমএফএস নিজস্ব সুরক্ষিত সার্ভারে লোকাল মডেল ট্রেন করে এবং শুধুমাত্র এনক্রিপ্টেড অ্যানোনিমাইজড রিস্ক প্যাটার্ন ও মডেল ওয়েট আদান-প্রদান করে।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sync toast */}
      {syncToast && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2 text-center font-bold animate-fade-in shadow-xs">
          ✓ {syncToast}
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4 text-xs">
        {/* SECTION 1: 4 MFS PROVIDER NODES (Federated Learning Architecture) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🤝</span>
              <div>
                <h3 className="font-black text-slate-900 text-xs">
                  {language === 'bn' ? 'অংশগ্রহণকারী এমএফএস নোড ও লোকাল মডেল' : 'Participating MFS Local Nodes'}
                </h3>
                <p className="text-[10px] text-slate-500">
                  {language === 'bn' ? '৪টি এমএফএস স্বাধীনভাবে তাদের নিজস্ব ডেটাতে স্থানীয় মডেল প্রশিক্ষণ দিচ্ছে' : 'Each trains locally and shares only gradient weights'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ● ৪/৪ নোড কানেক্টেড
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {MFS_NODES.map((node) => (
              <div
                key={node.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-[#0B4DA2] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: node.brandColor }}
                  />
                  <h4 className="font-bold text-slate-900 text-[11px] truncate">
                    {node.nameBn.split('(')[0]}
                  </h4>
                </div>
                <div className="text-[9px] text-slate-500 space-y-0.5">
                  <div className="font-mono text-slate-700 font-bold">{node.localModelVersion}</div>
                  <div>লোকাল ডেটা: {node.localSamplesTrained}</div>
                  <div className="text-emerald-700 font-semibold">{node.encryptionStatusBn}</div>
                  <div className="text-[8px] text-slate-400">আপডেট: {node.lastGradientSync}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Federated Pipeline explanation */}
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 text-[10px] space-y-1">
            <span className="font-bold text-slate-900 block">💡 ফেডারেটেড লার্নিং কিভাবে প্রতারণা ঠেকায়?</span>
            <p className="leading-relaxed">
              যখন একজন প্রতারক একটি ওয়ালেট থেকে টাকা সরিয়ে আরেকটি এমএফএস ওয়ালেটে নিয়ে যায়, সাধারণ একক সিস্টেমে তা ধরা পড়ে না। কিন্তু ফেডারেটেড লার্নিংয়ের মাধ্যমে প্রতিটি এমএফএস গ্রাহকের গোপনীয়তা সম্পূর্ণ বজায় রেখে যৌথভাবে সন্দেহভাজন মানি লন্ডারিং প্যাটার্ন চিনে ফেলে।
            </p>
          </div>
        </div>

        {/* SECTION 2: SUSPECTED FRAUD RING SELECTOR & DETAILS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
              {language === 'bn' ? 'শনাক্তকৃত সক্রিয় ফ্রড রিং ও সতর্কতা' : 'Detected Fraud Rings & Alerts'}
            </h3>
            <span className="text-[10px] text-slate-500">৩টি সক্রিয় থ্রেট</span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {rings.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRing(r)}
                className={`px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                  selectedRing.id === r.id
                    ? 'bg-[#0B4DA2] text-white border-[#0B4DA2] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${r.riskScore >= 90 ? 'bg-rose-500' : 'bg-amber-400'}`} />
                  <span>{r.ringCode}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 3: VISUAL OF SUSPECTED FRAUD RING / MONEY LAUNDERING CHAIN (Core Requirement) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xs text-[#0B4DA2]">
                  {selectedRing.ringCode}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-[9px] font-black uppercase">
                  রিস্ক স্কোর: {selectedRing.riskScore}/১০০
                </span>
              </div>
              <h4 className="font-black text-slate-900 text-sm mt-0.5">{selectedRing.titleBn}</h4>
              <span className="text-[10px] text-slate-500">{selectedRing.threatTypeBn}</span>
            </div>

            <span className="text-right">
              <span className="text-[10px] text-slate-400 block font-semibold">মোট ঝুঁকিপূর্ণ ফান্ড</span>
              <span className="font-mono font-black text-sm text-rose-600">
                ৳{selectedRing.totalVolume.toLocaleString()}
              </span>
            </span>
          </div>

          {/* Pattern summary box */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
            <span className="font-black block text-[11px]">⚠️ শনাক্তকৃত আচরণগত প্যাটার্ন:</span>
            <p className="text-[11px] leading-relaxed text-amber-900">{selectedRing.detectedPatternBn}</p>
          </div>

          {/* VISUAL HOP DIAGRAM / CHAIN FLOW (Hashed Anonymized IDs Only) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                আন্তঃওয়ালেট লেনদেন চেইন (Anonymized Hashed Wallets)
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Zero PII • Cryptographic Hash</span>
            </div>

            <div className="space-y-2 relative pl-4 border-l-2 border-indigo-200 ml-2">
              {selectedRing.hops.map((hop, idx) => (
                <div
                  key={hop.step}
                  className="relative p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  {/* Step Dot */}
                  <div className="absolute -left-[23px] top-3.5 w-4 h-4 rounded-full bg-[#0B4DA2] text-white flex items-center justify-center font-bold text-[9px]">
                    {hop.step}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#0B4DA2]">
                        {hop.providerNameBn}
                      </span>
                      {/* Anonymized SHA Hash */}
                      <div className="font-mono font-black text-xs text-slate-800 tracking-wider">
                        {hop.walletHash}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-xs text-rose-600 block">
                        ৳{hop.amount.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400">{hop.timestamp}</span>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-100 text-[10px] text-rose-900 flex items-center gap-1 font-medium">
                    <span>⚡</span>
                    <span>{hop.suspiciousActionBn}</span>
                  </div>

                  {idx < selectedRing.hops.length - 1 && (
                    <div className="text-center text-slate-400 text-xs py-0.5">
                      ↓ দ্রুত ফান্ড স্থানান্তর
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Action Card (Core Requirement) */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-1">
            <span className="font-black text-blue-950 block text-[11px]">
              🚨 সুপারিশকৃত পদক্ষেপ (Recommended Action):
            </span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {selectedRing.recommendedActionBn}
            </p>
          </div>
        </div>

        {/* SECTION 4: RISK ALERT LIST (All detected rings in summary table) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">
            {language === 'bn' ? 'সতর্কতা তালিকা ও সারসংক্ষেপ' : 'Risk Alert Summary List'}
          </h4>

          <div className="divide-y divide-slate-100">
            {rings.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRing(r)}
                className={`py-2.5 flex items-center justify-between cursor-pointer rounded-xl px-2 transition-colors ${
                  selectedRing.id === r.id ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-slate-900">{r.ringCode}</span>
                    <span className="text-[10px] text-slate-500">
                      ({r.walletsInvolvedCount} টি ওয়ালেট • {r.providersInvolvedCount} টি এমএফএস)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 block line-clamp-1">{r.titleBn}</span>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-mono font-black text-xs px-2 py-0.5 rounded-full ${
                      r.riskScore >= 90
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {r.riskScore}/১০০
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{r.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
