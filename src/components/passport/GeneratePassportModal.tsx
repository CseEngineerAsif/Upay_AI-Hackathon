import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PassportPurpose, IncomePassportToken } from '../../types/incomePassport';
import { createPassportToken } from '../../utils/incomePassportManager';

interface GeneratePassportModalProps {
  onClose: () => void;
  onSuccess: (token: IncomePassportToken) => void;
}

export const GeneratePassportModal: React.FC<GeneratePassportModalProps> = ({ onClose, onSuccess }) => {
  const { language } = useAppStore();
  const [purpose, setPurpose] = useState<PassportPurpose>('house_rent');
  const [recipient, setRecipient] = useState('');
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [hasAgreedConsent, setHasAgreedConsent] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAgreedConsent) return;

    const token = createPassportToken({
      purpose,
      recipientEntity: recipient.trim() || 'যাচাইকারী কর্তৃপক্ষ',
      expiryHours
    });

    onSuccess(token);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 select-none">
      <div className="w-full max-w-[420px] bg-slate-50 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[94vh] animate-scale-up border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0B4DA2] text-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg border border-white/20">
              🛂
            </span>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">
                {language === 'bn' ? 'ডিজিটাল ইনকাম পাসপোর্ট তৈরি' : 'Generate Income Passport'}
              </h2>
              <p className="text-[10px] text-blue-200">
                {language === 'bn' ? 'স্টেটমেন্ট ছাড়া শুধু আয়ের নিয়মিততার প্রমাণ' : 'Income proof without sharing statements'}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs">
          {/* Purpose Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">
              {language === 'bn' ? 'কী উদ্দেশ্যে প্রমাণপত্র তৈরি করবেন:' : 'Select Purpose:'}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'house_rent', label: '🏠 বাড়ি ভাড়া চুক্তি', tag: 'বাড়িওয়ালা' },
                { id: 'school_admission', label: '🎓 স্কুল/কলেজ ভর্তি', tag: 'শিক্ষা প্রতিষ্ঠান' },
                { id: 'microloan', label: '💰 ক্ষুদ্রঋণ আবেদন', tag: 'এমএফআই লোন' },
                { id: 'visa_guarantor', label: '💼 ভিসা বা গ্যারান্টি', tag: 'অন্যান্য' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPurpose(item.id as PassportPurpose)}
                  className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    purpose === item.id
                      ? 'bg-blue-50 border-[#0B4DA2] text-[#0B4DA2] shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold block text-xs">{item.label}</span>
                  <span className="text-[10px] text-slate-400">{item.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient / Authority Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              {language === 'bn' ? 'যাচাইকারী বা প্রতিষ্ঠানের নাম (ঐচ্ছিক):' : 'Recipient Name (Optional):'}
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="যেমন: বাড়িওয়ালা (বাশারের বাড়ি) বা স্কুলের নাম..."
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B4DA2]"
            />
          </div>

          {/* Expiry Hours Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">
              {language === 'bn' ? 'কিউআর কোডের মেয়াদ (Validity Duration):' : 'QR Expiry Duration:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { hours: 24, label: '২৪ ঘণ্টা' },
                { hours: 72, label: '৩ দিন' },
                { hours: 168, label: '৭ দিন' }
              ].map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setExpiryHours(opt.hours)}
                  className={`py-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                    expiryHours === opt.hours
                      ? 'bg-[#0B4DA2] text-white border-[#0B4DA2] shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* CRITICAL REQUIREMENT: CONSENT SCREEN LISTING EXACTLY WHAT WILL BE SHARED */}
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2.5">
            <div className="flex items-center gap-1.5 font-black text-xs text-indigo-950">
              <span>📋</span>
              <span>গোপনীয়তা ও সম্মতির শর্তাবলী (Consent Details):</span>
            </div>

            <div className="space-y-1 text-[11px]">
              <span className="font-bold text-emerald-800 block">যা যা কিউআরে দেখা যাবে (Shared):</span>
              <ul className="space-y-0.5 text-slate-700">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>মাসিক আয়ের সামগ্রিক রেঞ্জ (যেমন: ৳৮০,০০০ - ৳৯৫,০০০)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>ধারাবাহিক আয় প্রবাহের মাস সংখ্যা (টানা ২৮ মাস)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>এআই ইনকাম স্ট্যাবিলিটি স্কোর (৯৬/১০০ - A+)</span>
                </li>
              </ul>
            </div>

            <div className="space-y-1 text-[11px] pt-1 border-t border-indigo-200/60">
              <span className="font-bold text-rose-800 block">যা কখনোই প্রকাশ পাবে না (Never Shared):</span>
              <ul className="space-y-0.5 text-slate-700">
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>আপনার অ্যাকাউন্টের বর্তমান ব্যালেন্স</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>কোনো বিস্তারিত ট্রানজেকশন স্টেটমেন্ট বা কেনাকাটার হিসাব</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span>টাকা প্রেরক বা গ্রাহকের ব্যক্তিগত পরিচয়</span>
                </li>
              </ul>
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAgreedConsent}
                onChange={(e) => setHasAgreedConsent(e.target.checked)}
                className="mt-0.5 rounded text-[#0B4DA2] focus:ring-0"
              />
              <span className="text-[10px] text-slate-600 leading-tight font-medium">
                আমি উপরিউক্ত তথ্যগুলো নির্দিষ্ট সময়ের জন্য প্রদর্শনে সম্মতি প্রদান করছি।
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!hasAgreedConsent}
            className={`w-full py-3 rounded-2xl font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
              hasAgreedConsent
                ? 'bg-[#FFD600] hover:bg-yellow-400 text-slate-950 active:scale-95'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>🔒</span>
            <span>ইনকাম পাসপোর্ট কিউআর তৈরি করুন ➔</span>
          </button>
        </form>
      </div>
    </div>
  );
};
