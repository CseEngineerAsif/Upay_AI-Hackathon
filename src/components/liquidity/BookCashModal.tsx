import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { AgentLiquidityProfile, CashReservation } from '../../types/liquidity';
import { createCashReservation } from '../../utils/liquidityManager';
import { formatCurrency } from '../../utils/formatters';

interface BookCashModalProps {
  agent: AgentLiquidityProfile;
  onClose: () => void;
  onSuccess: (res: CashReservation) => void;
}

export const BookCashModal: React.FC<BookCashModalProps> = ({ agent, onClose, onSuccess }) => {
  const { language } = useAppStore();
  const [amount, setAmount] = useState<number>(10000);
  const [timeSlot, setTimeSlot] = useState<string>('আজ দুপুর ২:০০ - ৩:০০');
  const [confirmedReservation, setConfirmedReservation] = useState<CashReservation | null>(null);

  const timeSlots = [
    'আজ দুপুর ২:০০ - ৩:০০',
    'আজ বিকেল ৪:০০ - ৫:০০',
    'আজ সন্ধ্যা ৬:০০ - ৭:০০',
    'আজ রাত ৮:০০ - ৯:০০'
  ];

  const handleConfirmBooking = () => {
    const reservation = createCashReservation({
      agent,
      amount,
      timeSlot
    });
    setConfirmedReservation(reservation);
    onSuccess(reservation);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 select-none">
      <div className="w-full max-w-[420px] bg-slate-50 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[94vh] animate-scale-up border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0B4DA2] text-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg border border-white/20">
              💵
            </span>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">
                {language === 'bn' ? 'ক্যাশ-আউট স্লট বুকিং' : 'Cash-Out Reservation'}
              </h2>
              <p className="text-[10px] text-blue-200">
                {language === 'bn' ? 'এজেন্টের কাছে ক্যাশ টাকা অগ্রিম রিজার্ভ করুন' : 'Book physical cash in advance'}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs">
          {!confirmedReservation ? (
            <>
              {/* Agent Summary Card */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">{agent.name}</h3>
                    <p className="text-[11px] text-slate-500">{agent.location}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{agent.phone}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
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
                <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                  <span>দূরত্ব: {agent.distanceKm} কিমি</span>
                  <span>সময়: {agent.operatingHours}</span>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">
                    {language === 'bn' ? 'ক্যাশ-আউটের পরিমাণ:' : 'Choose Amount:'}
                  </label>
                  <span className="font-mono font-black text-sm text-[#0B4DA2]">
                    ৳{amount.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[2000, 5000, 10000, 25000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        amount === amt
                          ? 'bg-[#0B4DA2] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ৳{amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  {language === 'bn' ? 'কখন টাকা উত্তোলন করবেন (টাইম স্লট):' : 'Preferred Time Slot:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`p-2.5 rounded-xl text-left font-bold text-xs border transition-all cursor-pointer ${
                        timeSlot === slot
                          ? 'bg-blue-50 border-[#0B4DA2] text-[#0B4DA2] shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-amber-950 font-black flex items-center gap-1.5">
                  <span>💡</span>
                  <span>{language === 'bn' ? 'ক্যাশ গ্যারান্টি নিশ্চয়তা:' : 'Cash Availability Guarantee:'}</span>
                </span>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  বুকিং নিশ্চিত করলে এজেন্ট আপনার জন্য নির্দিষ্ট স্লটে ৳{amount.toLocaleString()} ক্যাশ আলাদা করে রাখবে। কোনো অতিরিক্ত চার্জ ছাড়াই সাধারণ ক্যাশ-আউট চার্জ প্রযোজ্য হবে।
                </p>
              </div>

              {/* Confirm Button */}
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="w-full py-3 rounded-2xl bg-[#FFD600] hover:bg-yellow-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🔒</span>
                <span>{language === 'bn' ? `৳${amount.toLocaleString()} ক্যাশ স্লট বুক করুন` : `Confirm ৳${amount.toLocaleString()} Slot`}</span>
              </button>
            </>
          ) : (
            /* BOOKING CONFIRMATION WITH REFERENCE CODE */
            <div className="space-y-3.5 animate-fade-in text-center p-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
                ✓
              </div>

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  বুকিং সফলভাবে নিশ্চিত হয়েছে
                </span>
                <h3 className="font-black text-slate-900 text-base">
                  {confirmedReservation.agentName}
                </h3>
                <p className="text-xs text-slate-500">
                  {confirmedReservation.agentLocation}
                </p>
              </div>

              {/* Reference Code Card */}
              <div className="p-4 rounded-3xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-md">
                <span className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider block">
                  Booking Reference Code
                </span>
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 font-mono text-lg font-black tracking-widest text-[#FFD600]">
                  {confirmedReservation.referenceCode}
                </div>
                <p className="text-[11px] text-slate-300">
                  এজেন্ট পয়েন্টে গিয়ে এই রেফারেন্স কোডটি দেখালে সাথে সাথে ক্যাশ পাবেন।
                </p>
              </div>

              {/* Details table */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100 text-xs text-left">
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-500">রিজার্ভকৃত ক্যাশ:</span>
                  <span className="font-mono font-black text-[#0B4DA2]">৳{confirmedReservation.amount.toLocaleString()}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-500">টাইম স্লট:</span>
                  <span className="font-bold text-slate-900">{confirmedReservation.timeSlot}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-500">ভ্যালিডিটি:</span>
                  <span className="font-bold text-emerald-700">{confirmedReservation.expiresAt}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-500">এজেন্ট ফোন:</span>
                  <span className="font-mono font-bold text-slate-900">{confirmedReservation.agentPhone}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-[#0B4DA2] text-white font-black text-xs hover:bg-blue-800 transition-colors cursor-pointer"
              >
                সম্পন্ন করুন ➔
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
