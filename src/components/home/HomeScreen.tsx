import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UpayHeader } from '../layout/UpayHeader';

export const HomeScreen: React.FC = () => {
  const { language, setCurrentModal } = useAppStore();
  const [activeBanner, setActiveBanner] = useState(0);

  const primaryServices = [
    {
      id: 'send_money',
      labelBn: 'সেন্ড মানি',
      labelEn: 'Send Money',
      iconColor: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      action: () => setCurrentModal('send_money'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      )
    },
    {
      id: 'mobile_recharge',
      labelBn: 'মোবাইল রিচার্জ',
      labelEn: 'Recharge',
      iconColor: 'bg-sky-50 text-sky-600 border-sky-200',
      action: () => setCurrentModal('mobile_recharge'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
      )
    },
    {
      id: 'cash_out',
      labelBn: 'ক্যাশ আউট',
      labelEn: 'Cash Out',
      iconColor: 'bg-amber-50 text-amber-700 border-amber-200',
      action: () => setCurrentModal('cash_out'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="10" width="18" height="11" rx="2" />
          <path d="M7 10V6a5 5 0 0110 0v4" />
          <path d="M12 14v3" />
        </svg>
      )
    },
    {
      id: 'pay_bill',
      labelBn: 'পে বিল',
      labelEn: 'Pay Bill',
      iconColor: 'bg-blue-50 text-blue-600 border-blue-200',
      action: () => setCurrentModal('pay_bill'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    },
    {
      id: 'add_money',
      labelBn: 'অ্যাড মানি',
      labelEn: 'Add Money',
      iconColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      action: () => setCurrentModal('add_money'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <circle cx="12" cy="15" r="1.5" />
          <line x1="18" y1="3" x2="18" y2="7" />
          <line x1="16" y1="5" x2="20" y2="5" />
        </svg>
      )
    },
    {
      id: 'savings',
      labelBn: 'সঞ্চয়',
      labelEn: 'Savings',
      iconColor: 'bg-yellow-50 text-amber-600 border-yellow-200',
      action: () => setCurrentModal('savings'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M19 5c-1.5 0-2.8 1.2-3 2.6-.7-.4-1.6-.6-2.5-.6-2.8 0-5 2.2-5 5v1H5v2h3.5c.8 2.3 3 4 5.5 4 3.3 0 6-2.7 6-6V9c.5 0 1-.2 1.4-.6l.6-.6-3-2.8z" />
          <circle cx="14" cy="11" r="1" />
        </svg>
      )
    },
    {
      id: 'fund_transfer',
      labelBn: 'ফান্ড ট্রান্সফার',
      labelEn: 'Transfer',
      iconColor: 'bg-teal-50 text-teal-600 border-teal-200',
      action: () => setCurrentModal('fund_transfer'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4" />
        </svg>
      )
    },
    {
      id: 'request_money',
      labelBn: 'রিকোয়েস্ট মানি',
      labelEn: 'Request Money',
      iconColor: 'bg-rose-50 text-rose-600 border-rose-200',
      action: () => setCurrentModal('request_money'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M17 11l-5-5-5 5M12 6v12" />
        </svg>
      )
    },
    {
      id: 'make_payment',
      labelBn: 'মেক পেমেন্ট',
      labelEn: 'Payment',
      iconColor: 'bg-slate-50 text-slate-700 border-slate-200',
      action: () => setCurrentModal('make_payment'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <path d="M14 14h3v3h-3zM18 18h3v3h-3z" />
        </svg>
      )
    },
    {
      id: 'refer_earn',
      labelBn: 'রেফার & আর্ন',
      labelEn: 'Refer & Earn',
      iconColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      action: () => setCurrentModal('guardian_invite'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      )
    },
    {
      id: 'npsb',
      labelBn: 'এনপিএসবি',
      labelEn: 'NPSB',
      iconColor: 'bg-purple-50 text-purple-600 border-purple-200',
      action: () => setCurrentModal('npsb'),
      icon: (
        <span className="text-xs font-black tracking-tighter text-purple-700">
          NPSB
        </span>
      )
    }
  ];

  const paymentServices = [
    { id: 'traffic_fine', labelBn: 'ট্রাফিক ফাইন', labelEn: 'Traffic Fine', icon: '🚦', bg: 'bg-[#E8F8F0]', border: 'border-[#BDE8D3]' },
    { id: 'toll_payment', labelBn: 'টোল পেমেন্ট', labelEn: 'Toll Pay', icon: '🛣️', bg: 'bg-[#EAF5FC]', border: 'border-[#BCE2F7]' },
    { id: 'govt_payment', labelBn: 'সরকারি পেমেন্ট', labelEn: 'Govt Pay', icon: '🏛️', bg: 'bg-[#FEF7E6]', border: 'border-[#FDE5A8]' },
    { id: 'education', labelBn: 'এডুকেশন', labelEn: 'Education', icon: '📚', bg: 'bg-[#EEF4FF]', border: 'border-[#C7DBFF]' },
    { id: 'ngo', labelBn: 'এন জি ও', labelEn: 'NGO', icon: '🤝', bg: 'bg-[#F3EFFD]', border: 'border-[#DACBFB]' },
    { id: 'insurance', labelBn: 'বীমা', labelEn: 'Insurance', icon: '🛡️', bg: 'bg-[#E7F8F7]', border: 'border-[#BCEEEC]' },
    { id: 'donation', labelBn: 'ডোনেশন', labelEn: 'Donation', icon: '🤲', bg: 'bg-[#FDF0F3]', border: 'border-[#FAC6D3]' },
    { id: 'zakat', labelBn: 'যাকাত', labelEn: 'Zakat', icon: '🌙', bg: 'bg-[#EBF7EE]', border: 'border-[#C5E9CD]' }
  ];

  return (
    <div className="w-full flex-1 flex flex-col bg-white overflow-y-auto no-scrollbar pb-24">
      {/* Upay Yellow Header */}
      <UpayHeader />

      {/* Prominent Safe AI Hero Card (AI Intelligence & Safety Layer) */}
      <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#0B4DA2] to-[#1664C0] text-white shadow-md select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <svg className="w-5 h-5 text-yellow-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-yellow-300 uppercase">
                  Upay Safe AI
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white">
                  Active
                </span>
              </div>
              <h3 className="text-sm font-bold leading-tight">
                {language === 'bn' ? 'আর্থিক নিরাপত্তা ও ইনটেলিজেন্স' : 'Financial Safety & Intelligence'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setCurrentModal('safe_ai_hub')}
            className="px-3 py-1.5 rounded-full bg-[#FFD600] text-slate-900 text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1"
          >
            <span>{language === 'bn' ? 'সেফ হাব' : 'Safe Hub'}</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Quick Pills for AI Tools */}
        <div className="mt-3 pt-2.5 border-t border-white/15 grid grid-cols-4 gap-1 text-center">
          <button
            onClick={() => setCurrentModal('voice_conversation')}
            className="p-1 rounded-lg bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 transition-all text-[10px] font-bold"
          >
            🎙️ {language === 'bn' ? 'লাইভ ভয়েস' : 'Live Voice'}
          </button>
          <button
            onClick={() => setCurrentModal('gemini_chatbot')}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-[10px] font-medium"
          >
            🤖 {language === 'bn' ? 'এআই চ্যাটবট' : 'AI Chatbot'}
          </button>
          <button
            onClick={() => setCurrentModal('search_grounding')}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-[10px] font-medium"
          >
            🌐 {language === 'bn' ? 'সার্চ তথ্য' : 'Search Info'}
          </button>
          <button
            onClick={() => setCurrentModal('maps_grounding')}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-[10px] font-medium"
          >
            📍 {language === 'bn' ? 'এজেন্ট ম্যাপ' : 'Agent Map'}
          </button>
        </div>
        <div className="mt-1 pt-1 grid grid-cols-3 gap-1 text-center">
          <button
            onClick={() => setCurrentModal('audio_transcribe')}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-[10px] font-medium"
          >
            🗣️ {language === 'bn' ? 'ট্রান্সক্রাইব' : 'Transcribe'}
          </button>
          <button
            onClick={() => setCurrentModal('scam_checker')}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-[10px] font-medium"
          >
            📱 {language === 'bn' ? 'স্ক্যাম SMS' : 'Scam SMS'}
          </button>
          <button
            onClick={() => setCurrentModal('cash_flow')}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-[10px] font-medium"
          >
            📈 {language === 'bn' ? 'ক্যাশ-ফ্লো' : 'Cash Flow'}
          </button>
        </div>
      </div>

      {/* Primary 4-Column Icon Grid (Matching Screenshot 2.jpeg) */}
      <div className="px-3 pt-4">
        <div className="grid grid-cols-4 gap-y-3.5 gap-x-1">
          {primaryServices.map((svc) => (
            <button
              key={svc.id}
              onClick={svc.action}
              className="flex flex-col items-center justify-start group active:scale-95 transition-transform"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs group-hover:shadow-xs transition-all ${svc.iconColor}`}
              >
                {svc.icon}
              </div>
              <span className="text-[11px] font-medium text-slate-800 text-center mt-1.5 leading-tight px-0.5">
                {language === 'bn' ? svc.labelBn : svc.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Promotional Banner Carousel (Robi unlimited cashback, matching screenshot 2.jpeg) */}
      <div className="mx-4 mt-5">
        <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white shadow-sm p-3.5 select-none">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-white text-red-600 uppercase">
                রবি অফার
              </span>
              <h4 className="text-sm font-extrabold leading-tight">
                {language === 'bn' ? 'আনলিমিটেড ক্যাশব্যাক অফার!' : 'Unlimited Cashback Offer!'}
              </h4>
              <p className="text-[11px] text-white/90">
                {language === 'bn' ? '৳৫০ থেকে ৳৭৫ ক্যাশব্যাক ৭০ জিবি ও ১০০ জিবি' : '৳50 - ৳75 cashback on 70GB & 100GB'}
              </p>
            </div>
            <button
              onClick={() => setCurrentModal('mobile_recharge')}
              className="px-3 py-1 rounded-full bg-white text-red-600 font-bold text-xs shadow-xs hover:bg-slate-50 transition-all shrink-0"
            >
              {language === 'bn' ? 'ক্লিক করুন' : 'Click Here'}
            </button>
          </div>
        </div>

        {/* Carousel Dot Indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setActiveBanner(idx)}
              className={`h-1.5 rounded-full transition-all ${
                activeBanner === idx ? 'w-5 bg-[#0B4DA2]' : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Section Divider */}
      <div className="h-2 bg-[#F2F2F2] my-4" />

      {/* "উপায় পেমেন্ট" Section (Matching Screenshot) */}
      <div className="px-4">
        <h3 className="text-sm font-black text-slate-900 mb-3 tracking-tight">
          {language === 'bn' ? 'উপায় পেমেন্ট' : 'Upay Payment'}
        </h3>

        <div className="grid grid-cols-4 gap-y-3.5 gap-x-2">
          {paymentServices.map((p) => (
            <button
              key={p.id}
              onClick={() => setCurrentModal(p.id)}
              className="flex flex-col items-center group active:scale-95 transition-transform"
            >
              <div
                className={`w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shadow-2xs ${p.bg} ${p.border} border transition-all group-hover:scale-105`}
              >
                <span>{p.icon}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-800 text-center mt-1.5 leading-tight">
                {language === 'bn' ? p.labelBn : p.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Pill Buttons (উপায় কার্ড on left, উপায় অফার on right - matching screenshot 2.jpeg) */}
      <div className="px-4 mt-6 flex items-center justify-between gap-3">
        {/* Upay Card Pill */}
        <button
          onClick={() => setCurrentModal('card_demo')}
          className="flex-1 py-2.5 px-3 rounded-full bg-[#FFFBEA] border border-amber-300 flex items-center justify-center gap-2 text-slate-900 font-bold text-xs shadow-xs active:scale-98 transition-all hover:bg-amber-100"
        >
          <span className="text-base">💳</span>
          <span>{language === 'bn' ? 'উপায় কার্ড' : 'Upay Card'}</span>
        </button>

        {/* Upay Offer Pill */}
        <button
          onClick={() => setCurrentModal('offers_demo')}
          className="flex-1 py-2.5 px-3 rounded-full bg-[#FFFBEA] border border-amber-300 flex items-center justify-center gap-2 text-slate-900 font-bold text-xs shadow-xs active:scale-98 transition-all hover:bg-amber-100"
        >
          <span className="text-base">🎁</span>
          <span>{language === 'bn' ? 'উপায় অফার' : 'Upay Offers'}</span>
        </button>
      </div>
    </div>
  );
};
