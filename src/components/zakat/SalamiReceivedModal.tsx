import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ChildEidEnvelope } from '../../types/zakatGiving';

interface SalamiReceivedModalProps {
  envelope: ChildEidEnvelope;
  onClose: () => void;
}

export const SalamiReceivedModal: React.FC<SalamiReceivedModalProps> = ({ envelope, onClose }) => {
  useEffect(() => {
    // Fire festive Eid confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const themeBg =
    envelope.envelopeTheme === 'emerald'
      ? 'from-emerald-700 via-teal-800 to-emerald-950'
      : envelope.envelopeTheme === 'crimson'
      ? 'from-rose-700 via-red-800 to-rose-950'
      : 'from-amber-600 via-yellow-700 to-amber-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 select-none">
      <div className="w-full max-w-[380px] bg-slate-50 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up border border-slate-200">
        {/* Festive Envelope Top */}
        <div className={`p-6 text-white text-center bg-gradient-to-br ${themeBg} relative overflow-hidden`}>
          <div className="text-3xl mb-1">🌙✨</div>
          <span className="text-[11px] font-bold text-amber-200 uppercase tracking-widest block">
            ঈদ মোবারক!
          </span>
          <h2 className="text-lg font-black text-white mt-0.5">ডিজিটাল ঈদ সালামি খাম</h2>
          <p className="text-xs text-white/80 mt-1">প্রাপক: {envelope.childName}</p>
        </div>

        {/* Envelope Body */}
        <div className="p-5 space-y-4 text-center">
          {/* Salami Amount Display */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
            <span className="text-xs text-amber-800 font-bold block">সালামির পরিমাণ:</span>
            <span className="font-mono font-black text-3xl text-amber-950 block">
              ৳{envelope.salamiAmount.toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-700">রিকার্শন পে চাইল্ড ওয়ালেটে জমা হয়েছে</span>
          </div>

          {/* Sender Message */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">
              শুভেচ্ছা বার্তা ({envelope.senderName}):
            </span>
            <p className="text-xs italic text-slate-700 leading-relaxed font-serif">
              "{envelope.customGreetingBn}"
            </p>
          </div>

          {/* Parental Control Highlights (Core Requirement) */}
          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-left space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-black text-indigo-950 text-[11px]">
              <span>🛡️</span>
              <span>অভিভাবক নিয়ন্ত্রণ ও খরচের নীতিমালা:</span>
            </div>
            <div className="space-y-1 text-[11px] text-indigo-900">
              <div className="flex justify-between">
                <span>দৈনিক সর্বোচ্চ খরচ সীমা:</span>
                <span className="font-bold font-mono">৳{envelope.dailySpendingLimit}/দিন</span>
              </div>
              <div className="flex justify-between">
                <span>অভিভাবকের অনুমোদন:</span>
                <span className="font-bold text-emerald-700">
                  {envelope.requireParentApproval ? 'সক্রিয় (অনুমোদন লাগবে)' : 'মুক্ত'}
                </span>
              </div>
            </div>
          </div>

          {/* Close / Enjoy Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            ধন্যবাদ! খাম বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
