import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  ZakatAssetsBreakdown,
  VerifiedCharity,
  ChildEidEnvelope
} from '../../types/zakatGiving';
import {
  DEFAULT_SILVER_NISAB_BDT,
  VERIFIED_CHARITIES,
  calculateZakat,
  getEnvelopes,
  createChildEnvelope
} from '../../utils/zakatGivingManager';
import { SalamiReceivedModal } from './SalamiReceivedModal';

export interface ZakatGivingScreenProps {
  initialTab?: 'calculator' | 'charities' | 'eid_envelope';
}

export const ZakatGivingScreen: React.FC<ZakatGivingScreenProps> = ({ initialTab = 'calculator' }) => {
  const { language } = useAppStore();

  const [activeTab, setActiveTab] = useState<'calculator' | 'charities' | 'eid_envelope'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Zakat Calculator State
  const [nisabThreshold, setNisabThreshold] = useState<number>(DEFAULT_SILVER_NISAB_BDT);
  const [assets, setAssets] = useState<ZakatAssetsBreakdown>({
    walletBalance: 75000, // mock annual wallet average
    cashOnHand: 50000,
    goldSilverValue: 120000,
    businessGoodsValue: 0,
    otherSavings: 60000,
    deductibleDebts: 15000
  });

  // Charities State
  const [charities] = useState<VerifiedCharity[]>(VERIFIED_CHARITIES);
  const [donatingTo, setDonatingTo] = useState<VerifiedCharity | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(1000);

  // Eid Envelopes State
  const [envelopes, setEnvelopes] = useState<ChildEidEnvelope[]>([]);
  const [isCreateEnvelopeOpen, setIsCreateEnvelopeOpen] = useState(false);
  const [selectedEnvelopeForView, setSelectedEnvelopeForView] = useState<ChildEidEnvelope | null>(null);

  // New Envelope Form State
  const [childName, setChildName] = useState('');
  const [salamiAmount, setSalamiAmount] = useState<number>(500);
  const [envelopeTheme, setEnvelopeTheme] = useState<'gold' | 'emerald' | 'crimson'>('gold');
  const [greeting, setGreeting] = useState('ঈদ মোবারক প্রিয় সোনামণি! তোমার দিনটি আনন্দময় হোক।');
  const [dailyLimit, setDailyLimit] = useState<number>(200);
  const [requireApproval, setRequireApproval] = useState<boolean>(true);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setEnvelopes(getEnvelopes());
  }, []);

  const zakatResult = calculateZakat(assets, nisabThreshold);

  const handleAssetChange = (field: keyof ZakatAssetsBreakdown, value: number) => {
    setAssets((prev) => ({
      ...prev,
      [field]: Math.max(0, value || 0)
    }));
  };

  const handleSendDonation = () => {
    if (!donatingTo) return;
    setToastMsg(`✓ ${donatingTo.nameBn}-এ সফলভাবে ৳${donationAmount.toLocaleString()} যাকাত/দান সম্পন্ন হয়েছে! ডিজিটাল রসিদ সেভ করা হয়েছে।`);
    setDonatingTo(null);
    setTimeout(() => setToastMsg(null), 5000);
  };

  const handleCreateEnvelopeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) return;

    const newEnv = createChildEnvelope({
      childName: childName.trim(),
      salamiAmount,
      envelopeTheme,
      customGreetingBn: greeting.trim(),
      dailySpendingLimit: dailyLimit,
      requireParentApproval: requireApproval,
      senderName: 'বাবা/মা (অভিভাবক)'
    });

    setEnvelopes(getEnvelopes());
    setIsCreateEnvelopeOpen(false);
    setSelectedEnvelopeForView(newEnv);
    setToastMsg('🎉 ডিজিটাল ঈদ খাম সফলভাবে পাঠানো হয়েছে! চাইল্ড ওয়ালেটে সালামি যুক্ত হয়েছে।');
    setTimeout(() => setToastMsg(null), 4500);

    // Reset form
    setChildName('');
    setSalamiAmount(500);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Top Banner (Min-height 96-110px, unclipped, normal flow) */}
      <div className="w-full min-h-[96px] sm:min-h-[104px] h-auto shrink-0 bg-gradient-to-r from-[#0B4DA2] via-[#08336A] to-[#0B4DA2] text-white px-4 py-5 shadow-md relative">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20 shrink-0">
                🌙
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <h1 className="text-[19px] font-black tracking-tight text-white leading-tight">
                    {language === 'bn' ? 'যাকাত, দান ও ঈদ খাম' : 'Zakat, Giving & Eid Envelopes'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFD600] text-slate-950 text-[10px] font-black uppercase tracking-wide shrink-0">
                    Islamic Aid
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium leading-snug mt-1">
                  {language === 'bn'
                    ? 'শরীয়াহ সম্মত যাকাত গণনা, বিশ্বস্ত দান ও শিশুদের ঈদ সালামি'
                    : 'Shariah Zakat Calculator, Verified Charities & Digital Salami'}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/30 shrink-0">
              ২.৫% নেসাব
            </span>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-black/25 p-1 rounded-2xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className={`py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-white text-[#0B4DA2] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              যাকাত হিসাব
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('charities')}
              className={`py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'charities'
                  ? 'bg-white text-[#0B4DA2] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              যাচাইকৃত দান
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('eid_envelope')}
              className={`py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'eid_envelope'
                  ? 'bg-white text-[#0B4DA2] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              ঈদ খাম 💌
            </button>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 text-center font-bold animate-fade-in shadow-xs">
          {toastMsg}
        </div>
      )}

      {/* Main Body */}
      <div className="px-4 py-4 space-y-4 text-xs">
        {/* ================= TAB 1: ZAKAT CALCULATOR ================= */}
        {activeTab === 'calculator' && (
          <div className="space-y-4">
            {/* Summary Result Card */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    প্রদেয় বার্ষিক যাকাত (২.৫% হারে)
                  </span>
                  <h3 className="font-mono font-black text-2xl text-[#0B4DA2]">
                    ৳{zakatResult.zakatPayable.toLocaleString()}
                  </h3>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    zakatResult.isEligibleForZakat
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {zakatResult.isEligibleForZakat ? 'নেসাব উত্তীর্ণ (যাকাত ফরজ)' : 'নেসাবের নিচে'}
                </span>
              </div>

              {/* CALCULATION STEPS BREAKDOWN (Core Requirement) */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                <span className="font-bold text-slate-800 block text-xs">
                  হিসাবের বিশদ ধাপসমূহ (Calculation Steps):
                </span>
                <div className="flex justify-between text-slate-600">
                  <span>১. মোট যাকাতযোগ্য সম্পদ:</span>
                  <span className="font-mono font-bold">৳{zakatResult.totalWealth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>২. বাদযোগ্য তাৎক্ষণিক দেনা:</span>
                  <span className="font-mono font-bold">-৳{assets.deductibleDebts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1">
                  <span>৩. নিট যাকাতযোগ্য উদ্বৃত্ত:</span>
                  <span className="font-mono">৳{zakatResult.netWealthAboveDebts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-0.5">
                  <span>৪. রূপার নেসাব সীমা:</span>
                  <span className="font-mono">৳{nisabThreshold.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold pt-0.5 border-t border-slate-200">
                  <span>৫. প্রদেয় যাকাত (২.৫%):</span>
                  <span className="font-mono text-xs">৳{zakatResult.zakatPayable.toLocaleString()}</span>
                </div>
              </div>

              {/* SCHOLAR CONFIRMATION NOTE (Core Requirement) */}
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2">
                <span className="text-base leading-none">📌</span>
                <p className="text-[10px] leading-relaxed text-amber-900">
                  <strong>বিশেষ দ্রষ্টব্য:</strong> এটি একটি ডিজিটাল হিসাব সহকারী (২.৫% হারে এক চান্দ্রবছর স্থায়ী সম্পদের উপর)। ব্যবসায়িক যৌথ অংশীদারিত্ব, জটিল ঋণ বা সুনির্দিষ্ট মাসআলার ক্ষেত্রে স্থানীয় নির্ভরযোগ্য আলেমের সাথে পরামর্শ করে নিশ্চিত হওয়ার অনুরোধ করা হলো।
                </p>
              </div>
            </div>

            {/* NISAB ADJUSTMENT & ASSET INPUTS (Core Requirement) */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900 text-xs">
                    নেসাব সীমা ও সম্পদের তালিকা সমন্বয়
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    রূপার বর্তমান বাজারমূল্য ও অন্যান্য সম্পদ এডিট করুন
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {/* Nisab Threshold input */}
                <div className="p-2.5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-indigo-950">নেসাব সীমা (৫২.৫ তোলা রূপা):</span>
                    <span className="text-[10px] text-indigo-700 font-medium">প্রয়োজনে বদলাতে পারেন</span>
                  </div>
                  <input
                    type="number"
                    value={nisabThreshold}
                    onChange={(e) => setNisabThreshold(Number(e.target.value) || 0)}
                    className="w-full p-2 bg-white rounded-xl border border-indigo-200 font-mono font-bold text-xs text-indigo-950 focus:outline-none"
                  />
                </div>

                {/* Annual Wallet Holding */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">
                    উপায় ওয়ালেটের বাৎসরিক গড় ব্যালেন্স (Review Wallet History):
                  </label>
                  <input
                    type="number"
                    value={assets.walletBalance}
                    onChange={(e) => handleAssetChange('walletBalance', Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold text-xs text-slate-900"
                  />
                </div>

                {/* Cash on Hand */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">
                    হাতে বা ব্যাংকে থাকা নগদ অর্থ (৳):
                  </label>
                  <input
                    type="number"
                    value={assets.cashOnHand}
                    onChange={(e) => handleAssetChange('cashOnHand', Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold text-xs text-slate-900"
                  />
                </div>

                {/* Gold & Silver Value */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">
                    স্বর্ণ ও রূপার বর্তমান বাজারমূল্য (৳):
                  </label>
                  <input
                    type="number"
                    value={assets.goldSilverValue}
                    onChange={(e) => handleAssetChange('goldSilverValue', Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold text-xs text-slate-900"
                  />
                </div>

                {/* Other Savings */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">
                    অন্যান্য সঞ্চয় / ডিপিএস / শেয়ার (৳):
                  </label>
                  <input
                    type="number"
                    value={assets.otherSavings}
                    onChange={(e) => handleAssetChange('otherSavings', Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold text-xs text-slate-900"
                  />
                </div>

                {/* Deductible Debts */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-rose-600 block">
                    বাদযোগ্য তাৎক্ষণিক দেনা বা ঋণ (৳):
                  </label>
                  <input
                    type="number"
                    value={assets.deductibleDebts}
                    onChange={(e) => handleAssetChange('deductibleDebts', Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-rose-200 font-mono font-bold text-xs text-rose-900"
                  />
                </div>
              </div>

              {/* Donate Button from Calculation */}
              {zakatResult.zakatPayable > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('charities')}
                  className="w-full py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                >
                  <span>🤝</span>
                  <span>যাচাইকৃত সংস্থায় যাকাত দিন ➔</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: VERIFIED CHARITIES ================= */}
        {activeTab === 'charities' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                  যাচাইকৃত দাতব্য সংস্থা তালিকা
                </h4>
                <p className="text-[10px] text-slate-500">
                  সরাসরি অফিসিয়াল মার্চেন্ট একাউন্টে যাকাত ও দান প্রেরণ করুন
                </p>
              </div>
            </div>

            {charities.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-[#0B4DA2] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shadow-2xs border border-slate-200 shrink-0">
                      {item.avatarIcon}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-bold text-slate-900 text-xs">{item.nameBn}</h5>
                        {item.isVerified && (
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-black text-[9px] flex items-center gap-0.5">
                            <span>✓</span>
                            <span>ভেরিফাইড</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">{item.registrationNumber}</span>
                      <span className="text-[10px] text-blue-700 font-semibold">{item.categoryBn}</span>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    {item.totalDonationsReceivedBn}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-xl">
                  {item.descriptionBn}
                </p>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setDonatingTo(item)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>দান করুন</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= TAB 3: EID ENVELOPES (চাইল্ড ওয়ালেট ও সালামি) ================= */}
        {activeTab === 'eid_envelope' && (
          <div className="space-y-4">
            {/* Header Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-2xs flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">💌</span>
                  <h4 className="font-black text-slate-900 text-xs">
                    ঈদ খাম: শিশুদের ডিজিটাল সালামি
                  </h4>
                </div>
                <p className="text-[10px] text-slate-600">
                  অভিভাবক নিয়ন্ত্রিত চাইল্ড ওয়ালেট ও নিরাপদ খরচ সীমা
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateEnvelopeOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
              >
                + নতুন খাম
              </button>
            </div>

            {/* List of Sent Envelopes */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1 block">
                পাঠানো সালামি খামের তালিকা:
              </span>

              {envelopes.map((env) => (
                <div
                  key={env.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">
                          {env.envelopeTheme === 'emerald'
                            ? '🟢'
                            : env.envelopeTheme === 'crimson'
                            ? '🔴'
                            : '🟡'}
                        </span>
                        <h5 className="font-bold text-slate-900 text-xs">{env.childName}</h5>
                        <span className="text-[9px] font-mono text-slate-400">
                          ({env.receivedAt})
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 italic mt-0.5">
                        "{env.customGreetingBn}"
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-[#0B4DA2] block">
                        ৳{env.salamiAmount.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-emerald-700 font-bold">চাইল্ড ওয়ালেট</span>
                    </div>
                  </div>

                  {/* Parental Controls Overview */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[10px]">
                    <span className="text-slate-600">
                      দৈনিক খরচ সীমা: <strong>৳{env.dailySpendingLimit}</strong>
                    </span>
                    <span className="text-slate-600">
                      অভিভাবক অনুমোদন: <strong>{env.requireParentApproval ? 'আবশ্যক' : 'মুক্ত'}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedEnvelopeForView(env)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] active:scale-95 transition-all cursor-pointer"
                    >
                      সালামি ভিউ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CREATE EID ENVELOPE MODAL */}
      {isCreateEnvelopeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 select-none">
          <div className="w-full max-w-[400px] bg-slate-50 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up border border-slate-200 max-h-[92vh]">
            <div className="px-5 py-3.5 bg-[#0B4DA2] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">💌</span>
                <h3 className="font-black text-sm text-white">নতুন ঈদ সালামি খাম তৈরি</h3>
              </div>
              <button
                onClick={() => setIsCreateEnvelopeOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEnvelopeSubmit} className="p-4 overflow-y-auto space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">সন্তান/শিশুর নাম:</label>
                <input
                  type="text"
                  required
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="যেমন: তাহসিন (৮ বছর)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">সালামির পরিমাণ (৳):</label>
                <div className="flex gap-1 mb-1">
                  {[200, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSalamiAmount(amt)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer ${
                        salamiAmount === amt
                          ? 'bg-[#0B4DA2] text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  value={salamiAmount}
                  onChange={(e) => setSalamiAmount(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">খামের থিম / রঙ:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'gold', label: 'সোনালী খাম' },
                    { id: 'emerald', label: 'সবুজ খাম' },
                    { id: 'crimson', label: 'লাল খাম' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEnvelopeTheme(t.id as any)}
                      className={`py-2 rounded-xl font-bold text-center border cursor-pointer ${
                        envelopeTheme === t.id
                          ? 'bg-amber-100 border-amber-400 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">শুভেচ্ছা বার্তা:</label>
                <textarea
                  rows={2}
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              {/* PARENTAL CONTROLS SECTION */}
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                <span className="font-bold text-indigo-950 block text-[11px]">
                  🛡️ অভিভাবক নিয়ন্ত্রণ সেটিংস (Parental Control):
                </span>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-600">দৈনিক সর্বোচ্চ খরচ সীমা:</span>
                    <span className="font-mono font-bold text-indigo-900">৳{dailyLimit}/দিন</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number(e.target.value))}
                    className="w-full accent-indigo-700"
                  />
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireApproval}
                    onChange={(e) => setRequireApproval(e.target.checked)}
                    className="rounded text-indigo-700"
                  />
                  <span className="text-[10px] text-slate-700 font-medium">
                    যেকোনো কেনাকাটার আগে অভিভাবকের সম্মতি প্রয়োজন
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#FFD600] hover:bg-yellow-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>💌</span>
                <span>সালামি পাঠিয়ে খাম সিল করুন</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QUICK DONATION MODAL */}
      {donatingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 select-none">
          <div className="w-full max-w-[380px] bg-slate-50 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up border border-slate-200">
            <div className="px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🕌</span>
                <h3 className="font-black text-sm text-white">যাকাত ও দান প্রদান</h3>
              </div>
              <button
                onClick={() => setDonatingTo(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block">প্রাপক প্রতিষ্ঠান:</span>
                <h4 className="font-bold text-slate-900 text-sm">{donatingTo.nameBn}</h4>
                <span className="text-[10px] text-emerald-700 font-semibold block">
                  {donatingTo.categoryBn} • {donatingTo.registrationNumber}
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">দানের পরিমাণ (৳):</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[500, 1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonationAmount(amt)}
                      className={`py-1.5 rounded-xl font-bold text-[10px] cursor-pointer ${
                        donationAmount === amt
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSendDonation}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>✓</span>
                <span>৳{donationAmount.toLocaleString()} দান নিশ্চিত করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SALAMI RECEIVED UNBOXING VIEW */}
      {selectedEnvelopeForView && (
        <SalamiReceivedModal
          envelope={selectedEnvelopeForView}
          onClose={() => setSelectedEnvelopeForView(null)}
        />
      )}
    </div>
  );
};
