import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  calculateOfficialFee,
  OFFICIAL_CASHOUT_RATE_PCT,
  HOTSPOTS_DATA,
  getInvestigations,
  updateInvestigationStatus,
  submitAnonymousOverchargeReport
} from '../../utils/feeAuditorManager';
import {
  AgentInvestigationItem,
  OverchargeHotspot,
  AdminInvestigationStatus
} from '../../types/feeAuditor';
import { formatCurrency } from '../../utils/formatters';

export const FeeAuditorScreen: React.FC = () => {
  const { language } = useAppStore();

  // Audit Form State
  const [cashOutAmount, setCashOutAmount] = useState<string>('2000');
  const [actualFeeCharged, setActualFeeCharged] = useState<string>('40');
  const [agentName, setAgentName] = useState<string>('হক টেলিকম ও স্টেশনারি');
  const [agentLocation, setAgentLocation] = useState<string>('ফার্মগেট, ঢাকা');

  // Audit Result State
  const [auditResult, setAuditResult] = useState<{
    calculated: boolean;
    officialFee: number;
    actualFee: number;
    difference: number;
    isOvercharged: boolean;
  }>({
    calculated: true,
    officialFee: 28,
    actualFee: 40,
    difference: 12,
    isOvercharged: true
  });

  // Admin & Hotspot State
  const [investigations, setInvestigations] = useState<AgentInvestigationItem[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<OverchargeHotspot>(HOTSPOTS_DATA[0]);
  const [adminFilter, setAdminFilter] = useState<'all' | AdminInvestigationStatus>('all');
  const [reportedSuccess, setReportedSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setInvestigations(getInvestigations());
  }, []);

  const handleAudit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amount = parseFloat(cashOutAmount) || 0;
    const actual = parseFloat(actualFeeCharged) || 0;
    const official = calculateOfficialFee(amount);
    const diff = actual - official;

    setAuditResult({
      calculated: true,
      officialFee: official,
      actualFee: actual,
      difference: diff,
      isOvercharged: diff > 0
    });
    setReportedSuccess(false);
  };

  const handleAnonymousReport = () => {
    submitAnonymousOverchargeReport({
      agentName: agentName.trim() || 'অজ্ঞাত এজেন্ট',
      locationBn: agentLocation.trim() || 'ঢাকা মেট্রো',
      overchargeAmount: Math.max(0, auditResult.difference)
    });
    setInvestigations(getInvestigations());
    setReportedSuccess(true);
    setToastMsg('✓ আপনার বেনামী রিপোর্ট গৃহীত হয়েছে এবং কেন্দ্রীয় তদন্ত তালিকায় যোগ করা হয়েছে!');
    setTimeout(() => setToastMsg(null), 4500);
  };

  const handleStatusChange = (id: string, newStatus: AdminInvestigationStatus) => {
    updateInvestigationStatus(id, newStatus);
    setInvestigations(getInvestigations());
  };

  const filteredInvestigations =
    adminFilter === 'all'
      ? investigations
      : investigations.filter((item) => item.status === adminFilter);

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Top Banner (Min-height 96-110px, unclipped, normal flow) */}
      <div className="w-full min-h-[96px] sm:min-h-[104px] h-auto shrink-0 bg-gradient-to-r from-[#0B4DA2] via-[#082F64] to-[#0B4DA2] text-white px-4 py-5 shadow-md relative">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20 shrink-0">
                ⚖️
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <h1 className="text-[19px] font-black tracking-tight text-white leading-tight">
                    {language === 'bn' ? 'ফি অডিটর ও ওভারচার্জ রাডার' : 'Fee Auditor & Overcharge Radar'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFD600] text-slate-950 text-[10px] font-black uppercase tracking-wide shrink-0">
                    Anti-Overcharge
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium leading-snug mt-1">
                  {language === 'bn'
                    ? 'ক্যাশ-আউট ফির সত্যতা যাচাই ও অতিরিক্ত ফি আদায়কারী এজেন্ট শনাক্তকরণ'
                    : 'Verify Official Cash-out Fee & Expose Overcharging Agents'}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-blue-200 block font-semibold">অফিসিয়াল ক্যাশ-আউট ফি</span>
              <span className="font-mono font-black text-xs text-[#FFD600]">
                ১.৪% (৳১৪/হাজার)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 text-center font-bold animate-fade-in shadow-xs">
          {toastMsg}
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4 text-xs">
        {/* SECTION 1: CASHOUT FEE AUDIT FORM (Core Requirement) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🔍</span>
              <div>
                <h3 className="font-black text-slate-900 text-xs">
                  {language === 'bn' ? 'ক্যাশ-আউট ফি যাচাই করুন' : 'Audit Cash-out Fee'}
                </h3>
                <p className="text-[10px] text-slate-500">
                  লেনদেনের পরিমাণ ও এজেন্ট কত কেটেছে তা লিখুন
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              {[1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setCashOutAmount(amt.toString());
                    setActualFeeCharged((amt === 1000 ? 20 : amt === 2000 ? 40 : 90).toString());
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                >
                  ৳{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAudit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">ক্যাশ-আউট পরিমাণ (৳):</label>
                <input
                  type="number"
                  value={cashOutAmount}
                  onChange={(e) => setCashOutAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-xs text-slate-900 focus:outline-none focus:border-[#0B4DA2]"
                  placeholder="যেমন: ২০০০"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">এজেন্ট মোট কত ফি নিয়েছে (৳):</label>
                <input
                  type="number"
                  value={actualFeeCharged}
                  onChange={(e) => setActualFeeCharged(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-xs text-slate-900 focus:outline-none focus:border-[#0B4DA2]"
                  placeholder="যেমন: ৪০"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">এজেন্টের দোকান/নাম:</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B4DA2]"
                  placeholder="যেমন: হক টেলিকম"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">এলাকা / বাজার:</label>
                <input
                  type="text"
                  value={agentLocation}
                  onChange={(e) => setAgentLocation(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B4DA2]"
                  placeholder="যেমন: ফার্মগেট, ঢাকা"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>⚡</span>
              <span>এক ট্যাপে ফি যাচাই করুন (Audit Fee)</span>
            </button>
          </form>

          {/* AUDIT RESULT CARD (One-tap: সঠিক ফি or অতিরিক্ত নেওয়া হয়েছে) */}
          {auditResult.calculated && (
            <div
              className={`p-3.5 rounded-2xl border space-y-2.5 transition-all ${
                auditResult.isOvercharged
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {auditResult.isOvercharged ? '⚠️' : '✅'}
                  </span>
                  <div>
                    <span
                      className={`font-black text-xs px-2 py-0.5 rounded-full uppercase tracking-wide inline-block ${
                        auditResult.isOvercharged
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {auditResult.isOvercharged ? 'অতিরিক্ত নেওয়া হয়েছে' : 'সঠিক ফি'}
                    </span>
                    <h4 className="font-bold text-xs mt-0.5">
                      {auditResult.isOvercharged
                        ? `আপনার কাছ থেকে ৳${auditResult.difference} অতিরিক্ত নেওয়া হয়েছে!`
                        : 'সরকারি নিয়মানুযায়ী সঠিক ফি কর্তন করা হয়েছে।'}
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">সরকারি নির্ধারিত ফি</span>
                  <span className="font-mono font-black text-xs text-slate-900">
                    ৳{auditResult.officialFee}
                  </span>
                </div>
              </div>

              {auditResult.isOvercharged && (
                <div className="pt-2 border-t border-rose-200 flex items-center justify-between">
                  <div className="text-[10px] text-rose-800">
                    নেওয়া হয়েছে: <strong>৳{auditResult.actualFee}</strong> • হওয়া উচিত ছিল: <strong>৳{auditResult.officialFee}</strong>
                  </div>

                  {/* ONE-TAP ANONYMOUS REPORT BUTTON */}
                  {!reportedSuccess ? (
                    <button
                      type="button"
                      onClick={handleAnonymousReport}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>🚨</span>
                      <span>বেনামে রিপোর্ট করুন</span>
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold text-xs">
                      ✓ বেনামে রিপোর্ট জমা হয়েছে
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: HOTSPOT MAP (Heatmap areas with frequent overcharge reports) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🗺️</span>
              <div>
                <h3 className="font-black text-slate-900 text-xs">
                  {language === 'bn' ? 'ওভারচার্জ হটস্পট রাডার ম্যাপ' : 'Overcharge Hotspot Radar Map'}
                </h3>
                <p className="text-[10px] text-slate-500">
                  যেসব এলাকায় অতিরিক্ত ফি আদায়ের অভিযোগ সবচেয়ে বেশি
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-100 text-rose-800">
              ● লাইভ ডেটা ফিড
            </span>
          </div>

          {/* SIMULATED HEATMAP GRAPHIC */}
          <div className="w-full h-44 rounded-2xl bg-slate-900 relative overflow-hidden p-3 border border-slate-800 flex flex-col justify-between">
            {/* Map Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />

            {/* Glowing Hotspot Pins on Map */}
            <div className="relative z-10 flex justify-between items-start">
              <span className="text-[10px] text-slate-400 font-mono">
                ঢাকা ও চট্টগ্রাম মেট্রোপলিটন এলাকা
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[9px] font-mono border border-rose-500/30">
                ৪টি সক্রিয় ক্লাস্টার
              </span>
            </div>

            {/* Pin 1: Farmgate */}
            <div
              onClick={() => setSelectedHotspot(HOTSPOTS_DATA[0])}
              className="absolute left-[35%] top-[38%] cursor-pointer group flex flex-col items-center"
            >
              <span className="w-6 h-6 rounded-full bg-rose-600/80 animate-ping absolute" />
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-black border-2 border-white shadow-lg relative z-10">
                ৪২
              </span>
              <span className="text-[9px] text-white font-bold bg-black/60 px-1 rounded mt-0.5">ফার্মগেট</span>
            </div>

            {/* Pin 2: Jatrabari */}
            <div
              onClick={() => setSelectedHotspot(HOTSPOTS_DATA[1])}
              className="absolute right-[30%] bottom-[35%] cursor-pointer group flex flex-col items-center"
            >
              <span className="w-5 h-5 rounded-full bg-rose-500/80 animate-ping absolute" />
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-black border-2 border-white shadow-lg relative z-10">
                ৩৮
              </span>
              <span className="text-[9px] text-white font-bold bg-black/60 px-1 rounded mt-0.5">যাত্রাবাড়ী</span>
            </div>

            {/* Pin 3: Mirpur-10 */}
            <div
              onClick={() => setSelectedHotspot(HOTSPOTS_DATA[2])}
              className="absolute left-[20%] top-[20%] cursor-pointer group flex flex-col items-center"
            >
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] font-black border-2 border-white shadow-lg relative z-10">
                ২৬
              </span>
              <span className="text-[9px] text-white font-bold bg-black/60 px-1 rounded mt-0.5">মিরপুর</span>
            </div>

            {/* Pin 4: GEC CTG */}
            <div
              onClick={() => setSelectedHotspot(HOTSPOTS_DATA[3])}
              className="absolute right-[15%] bottom-[15%] cursor-pointer group flex flex-col items-center"
            >
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] font-black border-2 border-white shadow-lg relative z-10">
                ১৯
              </span>
              <span className="text-[9px] text-white font-bold bg-black/60 px-1 rounded mt-0.5">চট্টগ্রাম</span>
            </div>

            {/* Selected Hotspot Bottom Info */}
            <div className="relative z-10 p-2 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between text-[10px]">
              <div>
                <span className="text-white font-bold block">{selectedHotspot.zoneNameBn}</span>
                <span className="text-slate-400">গড় অতিরিক্ত: {selectedHotspot.averageOverchargeBn}</span>
              </div>
              <div className="text-right">
                <span className="text-rose-400 font-black block">{selectedHotspot.totalReportsCount} টি অভিযোগ</span>
                <span className="text-[9px] text-slate-400">{selectedHotspot.flaggedAgentsCount} জন চিহ্নিত এজেন্ট</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: ADMIN INVESTIGATION LIST (Agents ranked by number of reports) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                  {language === 'bn' ? 'অ্যাডমিন তদন্ত তালিকা' : 'Admin Investigation Queue'}
                </h3>
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-mono text-[9px] font-black">
                  অভিযোগের ক্রমানুসারে
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                এজেন্টদের বিরুদ্ধে জমা হওয়া অভিযোগের তদন্ত ও ব্যবস্থা গ্রহণ
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5">
            {[
              { id: 'all', label: 'সকল' },
              { id: 'new', label: 'নতুন (New)' },
              { id: 'under_review', label: 'তদন্তাধীন (Under Review)' },
              { id: 'resolved', label: 'সমাধানকৃত (Resolved)' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setAdminFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer border ${
                  adminFilter === f.id
                    ? 'bg-[#0B4DA2] text-white border-[#0B4DA2] shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Investigation Queue Items */}
          <div className="space-y-2.5">
            {filteredInvestigations.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-xs text-slate-400">
                        #{idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs">{item.agentNameBn}</h4>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase ${
                          item.status === 'new'
                            ? 'bg-rose-100 text-rose-800'
                            : item.status === 'under_review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status === 'new'
                          ? 'নতুন অভিযোগ'
                          : item.status === 'under_review'
                          ? 'তদন্তাধীন'
                          : 'সমাধানকৃত'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {item.outletAddressBn} • {item.phoneMasked}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-xs text-rose-600 block">
                      {item.reportsCount} টি অভিযোগ
                    </span>
                    <span className="text-[9px] text-slate-400">{item.lastReportedTime}</span>
                  </div>
                </div>

                {item.notesBn && (
                  <p className="text-[10px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200 leading-relaxed">
                    📝 <strong>তদন্ত নোট:</strong> {item.notesBn}
                  </p>
                )}

                {/* Status Toggle Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px]">
                  <span className="text-slate-400 font-mono text-[9px]">
                    কোড: {item.agentCode}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {item.status !== 'under_review' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'under_review')}
                        className="px-2 py-0.8 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-[10px] cursor-pointer"
                      >
                        তদন্ত শুরু
                      </button>
                    )}

                    {item.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'resolved')}
                        className="px-2 py-0.8 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[10px] cursor-pointer"
                      >
                        সমাধান
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
