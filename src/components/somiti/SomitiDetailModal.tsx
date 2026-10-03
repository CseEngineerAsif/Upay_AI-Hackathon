import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { DigitalSomiti, SomitiMember } from '../../types/somiti';
import { contributeInstallment, disburseCyclePayout } from '../../utils/somitiManager';
import { formatCurrency } from '../../utils/formatters';

interface SomitiDetailModalProps {
  somiti: DigitalSomiti;
  onClose: () => void;
  onUpdated: (updated: DigitalSomiti) => void;
}

export const SomitiDetailModal: React.FC<SomitiDetailModalProps> = ({ somiti: initialSomiti, onClose, onUpdated }) => {
  const { user, language } = useAppStore();
  const [somiti, setSomiti] = useState<DigitalSomiti>(initialSomiti);
  const [activeTab, setActiveTab] = useState<'members' | 'payout_order' | 'ledger' | 'escrow'>('members');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentUserMember = somiti.members.find((m) => m.isCurrentUser || m.phone === user?.phone);
  const isAdmin = somiti.adminId === user?.id || somiti.adminPhone === user?.phone;

  const currentRecipient = somiti.members.find((m) => m.payoutCycle === somiti.currentCycle);
  const isCycleFullyFunded = somiti.totalPotCollectedCurrentCycle >= somiti.poolAmountPerCycle;
  const progressPercent = Math.min(
    100,
    Math.round((somiti.totalPotCollectedCurrentCycle / somiti.poolAmountPerCycle) * 100)
  );

  // Handle member paying their installment
  const handlePayInstallment = () => {
    if (!currentUserMember) return;
    setIsProcessing(true);

    setTimeout(() => {
      const res = contributeInstallment(
        somiti.id,
        currentUserMember.id,
        somiti.monthlyContribution,
        { name: user?.name || 'আসিফ রহমান', phone: user?.phone || '01712345678' }
      );

      setIsProcessing(false);
      if (res.success && res.updatedSomiti) {
        setSomiti(res.updatedSomiti);
        onUpdated(res.updatedSomiti);
        setPaymentSuccessMsg(
          language === 'bn'
            ? `৳${somiti.monthlyContribution.toLocaleString()} কিস্তি সফলভাবে এসক্রো অ্যাকাউন্টে জমা হয়েছে!`
            : `Installment of ৳${somiti.monthlyContribution.toLocaleString()} deposited to escrow!`
        );
        setTimeout(() => setPaymentSuccessMsg(null), 4000);
      }
    }, 600);
  };

  // Handle cycle payout disbursement
  const handleDisbursePayout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = disburseCyclePayout(somiti.id);
      setIsProcessing(false);
      if (res.success && res.updatedSomiti) {
        setSomiti(res.updatedSomiti);
        onUpdated(res.updatedSomiti);
        setPaymentSuccessMsg(
          language === 'bn'
            ? `অভিনন্দন! সাইকেল ${somiti.currentCycle} এর মোট তহবিল ৳${somiti.poolAmountPerCycle.toLocaleString()} প্রাপক "${res.recipientName}" এর ওয়ালেটে পৌঁছেছে!`
            : `Cycle ${somiti.currentCycle} pool of ৳${somiti.poolAmountPerCycle.toLocaleString()} disbursed to ${res.recipientName}!`
        );
        setTimeout(() => setPaymentSuccessMsg(null), 5000);
      }
    }, 800);
  };

  // Handle sending polite reminder
  const handleSendReminder = (memberName: string, phone: string) => {
    setReminderToast(
      language === 'bn'
        ? `"${memberName}" (${phone}) কে বিনম্র কিস্তি স্মরণিকা এসএমএস পাঠানো হয়েছে!`
        : `Gentle installment reminder sent to ${memberName}!`
    );
    setTimeout(() => setReminderToast(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 select-none">
      <div className="w-full max-w-[430px] bg-slate-50 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[94vh] animate-scale-up border border-slate-200">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#0B4DA2] text-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg border border-white/20">
              👥
            </span>
            <div>
              <h2 className="text-sm font-black text-white leading-tight flex items-center gap-1.5">
                <span>{somiti.name}</span>
              </h2>
              <p className="text-[10px] text-blue-200 font-medium">
                {language === 'bn' ? `অ্যাডমিন: ${somiti.adminName}` : `Admin: ${somiti.adminName}`} • {somiti.members.length} {language === 'bn' ? 'সদস্য' : 'members'}
              </p>
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

        {/* Success / Toast Notification */}
        {paymentSuccessMsg && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 text-center font-bold animate-fade-in flex items-center justify-center gap-1.5 shadow-xs">
            <span>🎉</span>
            <span>{paymentSuccessMsg}</span>
          </div>
        )}

        {reminderToast && (
          <div className="bg-blue-600 text-white text-xs px-4 py-2 text-center font-bold animate-fade-in flex items-center justify-center gap-1.5 shadow-xs">
            <span>📨</span>
            <span>{reminderToast}</span>
          </div>
        )}

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Cycle & Fund Status Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0B4DA2] via-[#0E4185] to-[#082D60] text-white shadow-md relative overflow-hidden space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-blue-200 font-bold block">
                  {language === 'bn' ? 'বর্তমান সাইকেল তহবিল' : 'Cycle Pool Amount'}
                </span>
                <span className="text-2xl font-black text-[#FFD600]">
                  ৳{somiti.poolAmountPerCycle.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-black text-white inline-block">
                  {language === 'bn' ? `সাইকেল ${somiti.currentCycle} / ${somiti.totalCycles}` : `Cycle ${somiti.currentCycle} of ${somiti.totalCycles}`}
                </span>
              </div>
            </div>

            {/* Current Recipient Info */}
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <div>
                  <span className="text-[10px] text-blue-200 block">
                    {language === 'bn' ? 'সাইকেল ২ এর প্রাপক:' : 'Scheduled Recipient:'}
                  </span>
                  <span className="font-bold text-white">
                    {currentRecipient?.name || 'নির্ধারিত সদস্য'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-blue-200 block">
                  {language === 'bn' ? 'পে-আউট তারিখ:' : 'Payout Date:'}
                </span>
                <span className="font-bold text-[#FFD600]">
                  {somiti.nextPayoutDate}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-blue-100 font-medium">
                <span>
                  {language === 'bn' ? 'সংগৃহীত:' : 'Collected:'}{' '}
                  <strong className="text-white">৳{somiti.totalPotCollectedCurrentCycle.toLocaleString()}</strong>
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressPercent >= 100 ? 'bg-emerald-400' : 'bg-[#FFD600]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Actions inside Card */}
            <div className="pt-1 flex items-center gap-2">
              {/* If user hasn't paid, show Pay button */}
              {currentUserMember && !currentUserMember.hasPaidCurrentCycle && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePayInstallment}
                  className="flex-1 py-2.5 rounded-xl bg-[#FFD600] hover:bg-yellow-300 active:scale-95 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>💸</span>
                  <span>
                    {language === 'bn'
                      ? `কিস্তি জমা দিন (৳${somiti.monthlyContribution.toLocaleString()})`
                      : `Pay Installment (৳${somiti.monthlyContribution.toLocaleString()})`}
                  </span>
                </button>
              )}

              {/* If user has already paid */}
              {currentUserMember && currentUserMember.hasPaidCurrentCycle && (
                <div className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                  <span>✓</span>
                  <span>{language === 'bn' ? 'আপনার কিস্তি পরিশোধিত' : 'Your Installment Paid'}</span>
                </div>
              )}

              {/* If 100% funded and admin wants to disburse */}
              {isCycleFullyFunded && somiti.status === 'active' && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleDisbursePayout}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>🎁</span>
                  <span>{language === 'bn' ? 'পে-আউট ছাড়ুন' : 'Disburse Pool'}</span>
                </button>
              )}
            </div>
          </div>

          {/* EARLY WARNING ALERTS SECTION (Core Requirement) */}
          {somiti.earlyWarnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{language === 'bn' ? 'এআই আগাম সতর্কতা (Early Warning Alerts)' : 'AI Early Warning Alerts'}</span>
              </h4>

              {somiti.earlyWarnings.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">⚠️</span>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-rose-700 uppercase block">
                          {language === 'bn' ? 'কিস্তি বিলম্বের ঝুঁকি' : 'Late Installment Risk'}
                        </span>
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          {language === 'bn' ? alert.messageBn : alert.messageEn}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-rose-100 text-xs">
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {language === 'bn' ? `বাকি: ${alert.daysRemaining} দিন • বকেয়া: ৳${alert.amountDue.toLocaleString()}` : `${alert.daysRemaining} days left • Due: ৳${alert.amountDue.toLocaleString()}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSendReminder(alert.memberName, alert.memberPhone)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>📨</span>
                      <span>{language === 'bn' ? 'তাগাদা পাঠান' : 'Send Reminder'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/90 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'members' ? 'bg-white text-[#0B4DA2] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'সদস্য তালিকা' : 'Members'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payout_order')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'payout_order' ? 'bg-white text-[#0B4DA2] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'AI ক্রম' : 'AI Order'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ledger')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ledger' ? 'bg-white text-[#0B4DA2] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'লেজার' : 'Ledger'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('escrow')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'escrow' ? 'bg-white text-[#0B4DA2] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'নিরাপত্তা' : 'Security'}
            </button>
          </div>

          {/* TAB 1: MEMBERS LIST */}
          {activeTab === 'members' && (
            <div className="space-y-2.5 animate-fade-in">
              <div className="flex justify-between items-center text-xs px-1">
                <span className="font-bold text-slate-600">
                  {somiti.members.length} {language === 'bn' ? 'জন সদস্যের কিস্তির স্ট্যাটাস' : 'Members Status'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {language === 'bn' ? `সাইকেল ${somiti.currentCycle} কিস্তি: ৳${somiti.monthlyContribution.toLocaleString()}` : `Cycle ${somiti.currentCycle} Due`}
                </span>
              </div>

              <div className="space-y-2">
                {somiti.members.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-black text-slate-700">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{member.name}</span>
                          {member.role === 'admin' && (
                            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-black rounded">
                              Admin
                            </span>
                          )}
                          {member.isCurrentUser && (
                            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-900 text-[9px] font-bold rounded">
                              {language === 'bn' ? 'আপনি' : 'You'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {member.phone} • {language === 'bn' ? `পে-আউট সাইকেল: ${member.payoutCycle}` : `Payout: Cycle ${member.payoutCycle}`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {member.hasPaidCurrentCycle ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] inline-flex items-center gap-1">
                          <span>✓</span>
                          <span>{language === 'bn' ? 'পরিশোধিত' : 'Paid'}</span>
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] block">
                            {language === 'bn' ? 'বকেয়া' : 'Pending'}
                          </span>
                          {isAdmin && !member.isCurrentUser && (
                            <button
                              type="button"
                              onClick={() => handleSendReminder(member.name, member.phone)}
                              className="text-[9px] text-[#0B4DA2] hover:underline font-bold block cursor-pointer"
                            >
                              {language === 'bn' ? 'তাগাদা দিন' : 'Remind'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: AI FAIR PAYOUT ORDER (Core Requirement) */}
          {activeTab === 'payout_order' && (
            <div className="space-y-3 animate-fade-in">
              {/* Explain Why This Order Card */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <div>
                      <h4 className="text-xs font-black text-indigo-950">
                        {language === 'bn' ? 'AI নিরপেক্ষ পে-আউট অডিট' : 'AI Fairness & Payout Audit'}
                      </h4>
                      <span className="text-[10px] text-indigo-700 font-medium block">
                        {somiti.payoutExplanation.algorithm}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-black">
                    {somiti.payoutExplanation.fairnessScore}% {language === 'bn' ? 'ন্যায্যতা' : 'Fairness'}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-white/70 p-3 rounded-2xl border border-indigo-100">
                  {language === 'bn' ? somiti.payoutExplanation.rationaleBn : somiti.payoutExplanation.rationaleEn}
                </p>

                {/* Audit Factors */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black text-indigo-900 uppercase block">
                    {language === 'bn' ? 'যেসব বিষয়ের ভিত্তিতে নির্ধারিত:' : 'Consensus Audit Factors:'}
                  </span>
                  {somiti.payoutExplanation.factors.map((f, i) => (
                    <div key={i} className="p-2 rounded-xl bg-white border border-indigo-100 text-xs space-y-0.5">
                      <span className="font-bold text-indigo-950 block">
                        • {language === 'bn' ? f.titleBn : f.titleEn}
                      </span>
                      <p className="text-[11px] text-slate-600">
                        {language === 'bn' ? f.descriptionBn : f.descriptionEn}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Transparency Hash */}
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Audit Hash: {somiti.payoutExplanation.transparencyHash}</span>
                  <span>{somiti.payoutExplanation.generatedAt}</span>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700 px-1">
                  {language === 'bn' ? 'সকল সাইকেলের পে-আউট সিকোয়েন্স:' : 'Scheduled Payout Rounds:'}
                </h5>

                <div className="space-y-2">
                  {somiti.members
                    .slice()
                    .sort((a, b) => a.payoutCycle - b.payoutCycle)
                    .map((m) => {
                      const isPast = m.payoutCycle < somiti.currentCycle;
                      const isCurrent = m.payoutCycle === somiti.currentCycle;

                      return (
                        <div
                          key={m.id}
                          className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                            isCurrent
                              ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                              : isPast
                              ? 'bg-slate-100/60 border-slate-200 opacity-75'
                              : 'bg-white border-slate-200/90 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                                isCurrent
                                  ? 'bg-[#FFD600] text-slate-950'
                                  : isPast
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {m.payoutCycle}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{m.name}</span>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 text-[9px] font-black">
                                    {language === 'bn' ? 'চলতি প্রাপক' : 'Current'}
                                  </span>
                                )}
                                {isPast && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                    {language === 'bn' ? 'পে-আউট সম্পন্ন' : 'Received'}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block">{m.payoutDate}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-[#0B4DA2] block">
                              ৳{somiti.poolAmountPerCycle.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {language === 'bn' ? `সাইকেল ${m.payoutCycle}` : `Round ${m.payoutCycle}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSPARENT PUBLIC LEDGER (Core Requirement) */}
          {activeTab === 'ledger' && (
            <div className="space-y-3 animate-fade-in">
              {/* Anti-tamper Ledger Banner */}
              <div className="p-3 rounded-2xl bg-slate-900 text-white space-y-1 shadow-xs border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-yellow-400">
                    <span>🔒</span>
                    <span>{language === 'bn' ? 'অপরিবর্তনীয় পাবলিক লেজার' : 'Immutable Public Ledger'}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">
                    Tamper-Proof
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {language === 'bn'
                    ? 'গ্রুপ অ্যাডমিন কিংবা কোনো সদস্য এই লেজারের তথ্য এডিট বা ডিলিট করতে পারবে না। প্রতিটি জমা ও খরচে ক্রিপ্টোগ্রাফিক হ্যাশ প্রমাণ যুক্ত রয়েছে।'
                    : 'Admin fraud prevention: Ledger entries cannot be modified or deleted once logged.'}
                </p>
              </div>

              {/* Ledger list */}
              <div className="space-y-2">
                {somiti.ledger.map((entry) => {
                  const isPayout = entry.type === 'payout';

                  return (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-2xl border shadow-2xs space-y-1.5 text-xs ${
                        isPayout ? 'bg-amber-50/80 border-amber-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={isPayout ? 'text-base text-amber-600' : 'text-base text-emerald-600'}>
                              {isPayout ? '🎁' : '📥'}
                            </span>
                            <span className="font-bold text-slate-900">{entry.memberName}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                isPayout ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isPayout
                                ? language === 'bn'
                                  ? 'পে-আউট'
                                  : 'Payout'
                                : language === 'bn'
                                ? 'কিস্তি জমা'
                                : 'Contribution'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {entry.note || `সাইকেল ${entry.cycleNumber}`} • {entry.date}, {entry.time}
                          </span>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-mono font-black text-sm block ${
                              isPayout ? 'text-amber-800' : 'text-emerald-700'
                            }`}
                          >
                            {isPayout ? '-' : '+'}৳{entry.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Cryptographic Hash */}
                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span>Hash: {entry.immutableHash}</span>
                        <span className="text-emerald-600 font-bold">✓ Verified by Escrow</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ESCROW & SECURITY RULES */}
          {activeTab === 'escrow' && (
            <div className="space-y-3 animate-fade-in text-xs text-slate-700">
              <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span>🏛️</span>
                  <span>{language === 'bn' ? 'রিকার্শন পে ব্যাংক এসক্রো নিশ্চয়তা' : 'Recursion Pay Bank Escrow Contract'}</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'bn'
                    ? 'সমিতির টাকা কারও ব্যক্তিগত অ্যাকাউন্টে জমে থাকে না। প্রতিটি কিস্তি সরাসরি রিকার্শন পে বাংলাদেশ ব্যাংক নির্দেশিত এসক্রো ভল্টে জমা হয়।'
                    : 'Funds are securely escrowed per Bangladesh Bank regulations and auto-routed to recipients.'}
                </p>

                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
                    <span className="text-slate-500">{language === 'bn' ? 'এসক্রো চুক্তি আইডি:' : 'Escrow ID:'}</span>
                    <span className="font-mono font-bold text-slate-800">REC-SOMITI-2026-DH</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
                    <span className="text-slate-500">{language === 'bn' ? 'অটো পে-আউট শর্ত:' : 'Payout Condition:'}</span>
                    <span className="font-bold text-emerald-700">১০০% তহবিল সংগ্রহ সাপেক্ষে</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
                    <span className="text-slate-500">{language === 'bn' ? 'বিলম্বিত কিস্তি জরিমানা:' : 'Late Penalty:'}</span>
                    <span className="font-bold text-slate-800">০% (সৌহার্দ্যপূর্ণ এআই তাগাদা)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-medium">
            {language === 'bn' ? 'নিরাপদ ডিজিটাল সমিতি • রিকার্শন পে সেফ' : 'Digital Somiti • Recursion Pay Safe'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-150 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
