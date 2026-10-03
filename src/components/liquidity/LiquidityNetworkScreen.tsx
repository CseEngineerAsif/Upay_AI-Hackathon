import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  AgentLiquidityProfile,
  CashReservation,
  FloatExchangeRequest
} from '../../types/liquidity';
import {
  NEARBY_AGENTS,
  CURRENT_AGENT_FLOAT,
  getCashReservations,
  cancelCashReservation,
  getFloatExchanges,
  sendExchangeRequest,
  completeExchangeRequest
} from '../../utils/liquidityManager';
import { BookCashModal } from './BookCashModal';
import { formatCurrency } from '../../utils/formatters';

export const LiquidityNetworkScreen: React.FC = () => {
  const { language } = useAppStore();
  const [activeNetworkTab, setActiveNetworkTab] = useState<'customer_cash' | 'agent_float'>('customer_cash');

  // Customer Part A state
  const [agents, setAgents] = useState<AgentLiquidityProfile[]>(NEARBY_AGENTS);
  const [selectedAgentForBooking, setSelectedAgentForBooking] = useState<AgentLiquidityProfile | null>(null);
  const [reservations, setReservations] = useState<CashReservation[]>([]);
  const [cashFilter, setCashFilter] = useState<'all' | 'high_cash' | 'nearby'>('all');
  const [searchArea, setSearchArea] = useState('');

  // Agent Part B state
  const [agentFloat, setAgentFloat] = useState(CURRENT_AGENT_FLOAT);
  const [exchanges, setExchanges] = useState<FloatExchangeRequest[]>([]);
  const [aiForecast, setAiForecast] = useState<any>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setReservations(getCashReservations());
    setExchanges(getFloatExchanges());
    fetchAiLiquidityForecast();
  }, []);

  const fetchAiLiquidityForecast = async () => {
    setIsLoadingForecast(true);
    try {
      const response = await fetch('/api/liquidity/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: agentFloat.agentName,
          location: agentFloat.location,
          eFloatBalance: agentFloat.eFloatBalance,
          cashInHand: agentFloat.cashInHand,
          timeOfDay: 'সন্ধ্যা ৭:৩০ (পিক আওয়ার)',
          dayOfWeek: 'বৃহস্পতিবার',
          recentCashOutVolume: agentFloat.recentCashOutVolume,
          recentCashInVolume: agentFloat.recentCashInVolume
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiForecast(data);
      } else {
        throw new Error('Fallback');
      }
    } catch (e) {
      setAiForecast({
        predictedStatus: 'cash_shortage_risk',
        urgencyLevel: 'high',
        forecastSummaryBn:
          'পিক আওয়ারে সন্ধ্যা ৭:০০ - ১০:০০ টার মধ্যে ফার্মগেট-পান্থপথ এলাকায় ক্যাশ-আউটের চাহিদা ৫০% বৃদ্ধি পায়। আপনার বর্তমান ফিজিক্যাল ক্যাশ (৳১৬,২০০) আগামী ২ ঘণ্টায় শেষ হওয়ার ৮৫% ঝুঁকি রয়েছে।',
        forecastSummaryEn: 'High cash shortage risk predicted due to peak evening withdrawal surge.',
        predictedDemandNext3Hours: 45000,
        recommendedActionBn:
          'নিকটবর্তী অতিরিক্ত ক্যাশ থাকা এজেন্টের সাথে ৳৩৫,০০০ ই-ফ্লোট সোয়াপ করে ব্যালেন্স সুরক্ষিত করুন।',
        recommendedActionEn: 'Initiate float exchange with cash-surplus nearby agents.',
        confidenceScore: 92,
        factors: [
          'বৃহস্পতিবার সন্ধ্যা পিক আওয়ার ক্যাশ-আউট বৃদ্ধি (+৪০%)',
          'ই-ফ্লোট উদ্বৃত্ত (৳১,৩৮,৫০০) বনাম ক্যাশ সংকট (৳১৬,২০০)',
          'ফার্মগেট রুটের গড় ক্যাশ লেনদেন বৃদ্ধি'
        ]
      });
    } finally {
      setIsLoadingForecast(false);
    }
  };

  const filteredAgents = agents.filter((ag) => {
    if (searchArea.trim()) {
      const matchesSearch =
        ag.name.toLowerCase().includes(searchArea.toLowerCase()) ||
        ag.area.toLowerCase().includes(searchArea.toLowerCase()) ||
        ag.location.toLowerCase().includes(searchArea.toLowerCase());
      if (!matchesSearch) return false;
    }
    if (cashFilter === 'high_cash') return ag.cashAvailability === 'high';
    if (cashFilter === 'nearby') return ag.distanceKm <= 1.0;
    return true;
  });

  const handleCancelBooking = (resId: string) => {
    cancelCashReservation(resId);
    setReservations(getCashReservations());
    setToastMsg('ক্যাশ রিজার্ভেশন সফলভাবে বাতিল করা হয়েছে।');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSendExchange = (exId: string) => {
    const updated = sendExchangeRequest(exId);
    if (updated) {
      setExchanges(getFloatExchanges());
      setToastMsg(`"${updated.toAgentName}" কে ৳${updated.amount.toLocaleString()} এক্সচেঞ্জ অনুরোধ পাঠানো হয়েছে! ওটিপি/পিন তৈরি হয়েছে।`);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const handleCompleteExchange = (exId: string) => {
    const updated = completeExchangeRequest(exId);
    if (updated) {
      setExchanges(getFloatExchanges());
      // Rebalance mock float
      setAgentFloat((prev) => ({
        ...prev,
        eFloatBalance: prev.eFloatBalance - updated.amount,
        cashInHand: prev.cashInHand + updated.amount
      }));
      setToastMsg(`🎉 সফল! ৳${updated.amount.toLocaleString()} ই-ফ্লোট দিয়ে নগদ ক্যাশ গ্রহণ সম্পন্ন হয়েছে।`);
      setTimeout(() => setToastMsg(null), 5000);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Top Banner (Min-height 96-110px, unclipped, normal flow) */}
      <div className="w-full min-h-[96px] sm:min-h-[104px] h-auto shrink-0 bg-gradient-to-r from-[#0B4DA2] via-[#0E3E7A] to-[#0B4DA2] text-white px-4 py-5 shadow-md relative">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20 shrink-0">
                ⚡
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <h1 className="text-[19px] font-black tracking-tight text-white leading-tight">
                    {language === 'bn' ? 'লিকুইডিটি নেটওয়ার্ক' : 'Liquidity Network'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFD600] text-slate-950 text-[10px] font-black uppercase tracking-wide shrink-0">
                    Smart Cash
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium leading-snug mt-1">
                  {language === 'bn'
                    ? 'ক্যাশ রিজার্ভেশন ও এজেন্ট ফ্লোট এক্সচেঞ্জ হাব'
                    : 'Cash Reservation & Agent Float Rebalancing'}
                </p>
              </div>
            </div>
          </div>

          {/* Toggle between Part A & Part B */}
          <div className="grid grid-cols-2 gap-1.5 bg-black/25 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveNetworkTab('customer_cash')}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeNetworkTab === 'customer_cash'
                  ? 'bg-[#FFD600] text-slate-950 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>💵</span>
              <span>{language === 'bn' ? 'ক্যাশ রিজার্ভেশন (গ্রাহক)' : 'Cash Reservation'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNetworkTab('agent_float')}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeNetworkTab === 'agent_float'
                  ? 'bg-[#FFD600] text-slate-950 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>🔄</span>
              <span>{language === 'bn' ? 'ফ্লোট এক্সচেঞ্জ (এজেন্ট)' : 'Float Exchange'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2 text-center font-bold animate-fade-in shadow-xs">
          {toastMsg}
        </div>
      )}

      {/* PART A: CUSTOMER CASH RESERVATION */}
      {activeNetworkTab === 'customer_cash' && (
        <div className="px-4 py-4 space-y-4 animate-fade-in">
          {/* Active Reservations Card (if any) */}
          {reservations.filter((r) => r.status === 'active').length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{language === 'bn' ? 'আপনার সক্রিয় ক্যাশ বুকিং' : 'Active Cash Reservations'}</span>
              </h3>

              {reservations
                .filter((r) => r.status === 'active')
                .map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-300 shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          রেফারেন্স কোড (এজেন্টকে দেখান)
                        </span>
                        <span className="font-mono font-black text-sm text-[#0B4DA2] tracking-wider">
                          {res.referenceCode}
                        </span>
                      </div>
                      <span className="font-mono font-black text-base text-emerald-800">
                        ৳{res.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-0.5">
                      <p className="font-bold">{res.agentName}</p>
                      <p className="text-[11px] text-slate-500">{res.agentLocation}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[10px]">
                      <span className="text-emerald-700 font-bold">
                        স্লট: {res.timeSlot} • {res.expiresAt}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(res.id)}
                        className="text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        বাতিল করুন
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Search & Filter Nearby Agents */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                placeholder="এলাকা বা এজেন্টের নাম লিখুন (যেমন: ফার্মগেট, ধানমন্ডি)..."
                className="flex-1 p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B4DA2]"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'সকল এজেন্ট' },
                { id: 'high_cash', label: 'পর্যাপ্ত ক্যাশ আছে (🟢 ৳৫০k+)' },
                { id: 'nearby', label: 'নিকটবর্তী (< ১ কিমি)' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCashFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    cashFilter === f.id
                      ? 'bg-[#0B4DA2] text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Agents List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500 px-1">
              <span>{filteredAgents.length} টি নিকটবর্তী এজেন্ট পয়েন্ট</span>
              <span className="text-[10px]">রিয়েল-টাইম ক্যাশ স্ট্যাটাস</span>
            </div>

            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
              >
                {/* Agent header & cash badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-base shrink-0">
                      {agent.avatarIcon || '🏪'}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-xs">{agent.name}</h4>
                        {agent.verified && (
                          <span className="text-blue-600 text-xs" title="ভেরিফাইড এজেন্ট">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{agent.location}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{agent.phone}</span>
                    </div>
                  </div>

                  {/* Cash Availability Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase shrink-0 text-center ${
                      agent.cashAvailability === 'high'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : agent.cashAvailability === 'medium'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {agent.availableCashRangeBn}
                  </span>
                </div>

                {/* Meta details & Book button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <span>📍 {agent.distanceKm} কিমি দূরে • ⏰ {agent.operatingHours}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedAgentForBooking(agent)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>ক্যাশ বুক করুন</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PART B: AGENT FLOAT EXCHANGE */}
      {activeNetworkTab === 'agent_float' && (
        <div className="px-4 py-4 space-y-4 animate-fade-in text-xs">
          {/* Agent Balance Overview Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-md space-y-3 border border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  এজেন্ট ড্যাশবোর্ড
                </span>
                <h3 className="font-bold text-white text-xs">{agentFloat.agentName}</h3>
                <span className="text-[10px] text-slate-400">{agentFloat.location}</span>
              </div>
              <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 rounded-full text-[9px] font-bold">
                Agent Active
              </span>
            </div>

            {/* E-float vs Cash Split */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-0.5">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  ই-ফ্লোট ব্যালেন্স (ডিজিটাল)
                </span>
                <span className="text-base font-black text-[#FFD600] font-mono">
                  ৳{agentFloat.eFloatBalance.toLocaleString()}
                </span>
                <span className="text-[9px] text-emerald-400 font-bold block">
                  উদ্বৃত্ত (+৳৬০k)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-0.5">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  ফিজিক্যাল ক্যাশ ইন হ্যান্ড
                </span>
                <span className="text-base font-black text-rose-400 font-mono">
                  ৳{agentFloat.cashInHand.toLocaleString()}
                </span>
                <span className="text-[9px] text-rose-400 font-bold block">
                  ক্যাশ ঘাটতি ঝুঁকি ⚠️
                </span>
              </div>
            </div>
          </div>

          {/* AI FORECAST CARD (Core Requirement) */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 uppercase block">
                    AI Liquidity & Demand Forecast
                  </span>
                  <h4 className="font-black text-indigo-950 text-xs">
                    {aiForecast?.urgencyLevel === 'high' ? 'জরুরি ক্যাশ ঘাটতির পূর্বাভাস' : 'ফ্লোট পূর্বাভাস'}
                  </h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[9px] font-black uppercase animate-pulse">
                High Risk
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-2xl border border-indigo-100">
              {aiForecast?.forecastSummaryBn}
            </p>

            {/* Recommended Action */}
            <div className="p-2.5 rounded-xl bg-indigo-100/70 text-indigo-950 space-y-1">
              <span className="font-black block text-[11px]">💡 এআই সুপারিশ:</span>
              <p className="text-[11px] leading-relaxed">{aiForecast?.recommendedActionBn}</p>
            </div>

            {/* Factors */}
            <div className="text-[10px] text-slate-500 pt-1 border-t border-indigo-100 space-y-0.5">
              <span>প্রত্যাশিত ক্যাশ চাহিদা (আগামী ৩ ঘণ্টা): <strong>৳{aiForecast?.predictedDemandNext3Hours?.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* SUGGESTED AGENT FLOAT EXCHANGES (Core Requirement) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                ম্যাচিং ফ্লোট এক্সচেঞ্জ পার্টনার (Matching Agents)
              </h4>
              <span className="text-[10px] text-slate-500">পারস্পরিক ক্যাশ সোয়াপ</span>
            </div>

            <div className="space-y-3">
              {exchanges.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">{ex.toAgentName}</h5>
                      <p className="text-[11px] text-slate-500">{ex.toAgentLocation}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{ex.toAgentPhone}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-[#0B4DA2] block">
                        ৳{ex.amount.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-emerald-700 font-bold">ক্যাশ পাবেন</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl">
                    {ex.matchReasonBn}
                  </p>

                  {/* Actions based on state */}
                  {ex.status === 'suggested' && (
                    <button
                      type="button"
                      onClick={() => handleSendExchange(ex.id)}
                      className="w-full py-2 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>🔄</span>
                      <span>৳{ex.amount.toLocaleString()} এক্সচেঞ্জ অনুরোধ পাঠান</span>
                    </button>
                  )}

                  {ex.status === 'requested' && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-amber-900 font-bold">অনুরোধ পাঠানো হয়েছে • পিন: {ex.verificationPin}</span>
                        <span className="text-slate-500 text-[10px] font-mono">{ex.createdAt}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCompleteExchange(ex.id)}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer"
                      >
                        সোয়াপ নিশ্চিত করুন (ক্যাশ গ্রহণ ও ফ্লোট ট্রান্সফার) ✓
                      </button>
                    </div>
                  )}

                  {ex.status === 'completed' && (
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 text-center font-bold text-[11px] border border-emerald-200">
                      ✓ ফ্লোট সোয়াপ সফলভাবে সম্পন্ন হয়েছে
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Book Cash Modal */}
      {selectedAgentForBooking && (
        <BookCashModal
          agent={selectedAgentForBooking}
          onClose={() => setSelectedAgentForBooking(null)}
          onSuccess={() => {
            setReservations(getCashReservations());
          }}
        />
      )}
    </div>
  );
};
