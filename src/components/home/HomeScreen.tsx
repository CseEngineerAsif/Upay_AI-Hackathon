import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UpayHeader } from '../layout/UpayHeader';

export const HomeScreen: React.FC = () => {
  const { language, setCurrentModal, setActiveTab } = useAppStore();
  const [activeBanner, setActiveBanner] = useState(0);
  const navScrollRef = useRef<HTMLDivElement>(null);

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
      id: 'digital_somiti',
      labelBn: 'ডিজিটাল সমিতি',
      labelEn: 'Digital Somiti',
      iconColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      action: () => setActiveTab('somiti'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      )
    },
    {
      id: 'trustpay',
      labelBn: 'ট্রাস্টপে',
      labelEn: 'TrustPay',
      iconColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      action: () => setActiveTab('trustpay'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'liquidity',
      labelBn: 'লিকুইডিটি',
      labelEn: 'Liquidity',
      iconColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      action: () => setActiveTab('liquidity'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M9 9.5h5.5a2 2 0 010 4H9" />
        </svg>
      )
    },
    {
      id: 'crosswallet',
      labelBn: 'ক্রস-ওয়ালেট',
      labelEn: 'Cross-Wallet',
      iconColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      action: () => setActiveTab('crosswallet'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )
    },
    {
      id: 'climateshield',
      labelBn: 'ক্লাইমেট শিল্ড',
      labelEn: 'Climate Shield',
      iconColor: 'bg-rose-50 text-rose-700 border-rose-200',
      action: () => setActiveTab('climateshield'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M8 11c1-1 3-1 4 0s3 1 4 0" />
          <path d="M8 15c1-1 3-1 4 0s3 1 4 0" />
        </svg>
      )
    },
    {
      id: 'income_passport',
      labelBn: 'ইনকাম পাসপোর্ট',
      labelEn: 'Income Passport',
      iconColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      action: () => setActiveTab('income_passport'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <circle cx="9" cy="10" r="2" />
          <line x1="15" y1="8" x2="17" y2="8" />
          <line x1="15" y1="12" x2="17" y2="12" />
          <line x1="7" y1="16" x2="17" y2="16" />
        </svg>
      )
    },
    {
      id: 'fee_auditor',
      labelBn: 'ফি অডিটর',
      labelEn: 'Fee Auditor',
      iconColor: 'bg-blue-50 text-blue-900 border-blue-200',
      action: () => setActiveTab('fee_auditor'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3v18" />
          <path d="M6 8l6-5 6 5" />
          <path d="M6 13h12" />
          <path d="M3 13l3 7h12l3-7" />
        </svg>
      )
    },
    {
      id: 'bundle_optimizer',
      labelBn: 'বান্ডেল অপ্টিমাইজ',
      labelEn: 'Bundle Optimizer',
      iconColor: 'bg-blue-50 text-blue-800 border-blue-200',
      action: () => setActiveTab('bundle_optimizer'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <circle cx="12" cy="20" r="1" />
        </svg>
      )
    },
    {
      id: 'zakat_giving',
      labelBn: 'যাকাত ও দান',
      labelEn: 'Zakat & Giving',
      iconColor: 'bg-teal-50 text-teal-800 border-teal-200',
      action: () => setActiveTab('zakat_giving'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
          <path d="M12 7v5l3 3" />
          <path d="M16 11l2 2-2 2" />
        </svg>
      )
    },
    {
      id: 'dialect_voice',
      labelBn: 'ভয়েস পে',
      labelEn: 'Voice Pay',
      iconColor: 'bg-blue-50 text-blue-900 border-blue-200',
      action: () => setActiveTab('dialect_voice'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      )
    },
    {
      id: 'mandate_wallet',
      labelBn: 'ম্যান্ডেট পে',
      labelEn: 'Mandate Pay',
      iconColor: 'bg-cyan-50 text-cyan-900 border-cyan-200',
      action: () => setActiveTab('mandate_wallet'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 15h6" />
          <path d="M9 11h6" />
        </svg>
      )
    },
    {
      id: 'payslip_orchestrator',
      labelBn: 'পে-স্লিপ অডিট',
      labelEn: 'Payslip Audit',
      iconColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      action: () => setActiveTab('payslip_orchestrator'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
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

      {/* Horizontal Scrollable Navigation Bar under Header */}
      <div className="relative w-full bg-[#ebebf7] shadow-2xs border-b border-indigo-100 select-none py-2 px-1">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => navScrollRef.current?.scrollBy({ left: -160, behavior: 'smooth' })}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white text-slate-800 border border-slate-300 font-black text-sm flex items-center justify-center shadow-xs hover:bg-slate-50 active:scale-90 transition-transform cursor-pointer"
          aria-label="Scroll left"
        >
          ‹
        </button>

        {/* Scrollable Track */}
        <div
          ref={navScrollRef}
          className="flex items-center gap-2 px-8 overflow-x-auto scroll-smooth no-scrollbar"
        >
          {/* Digital Somiti (New Group Savings Circle) */}
          <button
            type="button"
            onClick={() => setActiveTab('somiti')}
            className="px-3.5 py-1.5 rounded-full bg-[#0B4DA2] hover:bg-blue-900 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>👥</span>
            <span>{language === 'bn' ? 'ডিজিটাল সমিতি' : 'Digital Somiti'}</span>
            <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black">
              AI
            </span>
          </button>

          {/* TrustPay F-Commerce Escrow (New Feature) */}
          <button
            type="button"
            onClick={() => setActiveTab('trustpay')}
            className="px-3.5 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>🤝</span>
            <span>{language === 'bn' ? 'ট্রাস্টপে' : 'TrustPay'}</span>
            <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black">
              ESCROW
            </span>
          </button>

          {/* Liquidity Network (Cash Reservation & Agent Float) */}
          <button
            type="button"
            onClick={() => setActiveTab('liquidity')}
            className="px-3.5 py-1.5 rounded-full bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>⚡</span>
            <span>{language === 'bn' ? 'লিকুইডিটি' : 'Liquidity'}</span>
            <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black">
              CASH
            </span>
          </button>

          {/* Cross-Wallet Federated Risk Exchange */}
          <button
            type="button"
            onClick={() => setActiveTab('crosswallet')}
            className="px-3.5 py-1.5 rounded-full bg-indigo-800 hover:bg-indigo-900 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>🌐</span>
            <span>{language === 'bn' ? 'ক্রস-ওয়ালেট' : 'Cross-Wallet'}</span>
            <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black">
              FEDERATED
            </span>
          </button>

          {/* Climate Shield Mode (Disaster Alert & Relief) */}
          <button
            type="button"
            onClick={() => setActiveTab('climateshield')}
            className="px-3.5 py-1.5 rounded-full bg-rose-700 hover:bg-rose-800 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>🌊</span>
            <span>{language === 'bn' ? 'ক্লাইমেট শিল্ড' : 'Climate Shield'}</span>
            <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black">
              RELIEF
            </span>
          </button>

          {/* Portable Income Passport (New Feature) */}
          <button
            type="button"
            onClick={() => setActiveTab('income_passport')}
            className="px-3.5 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>🛂</span>
            <span>{language === 'bn' ? 'ইনকাম পাসপোর্ট' : 'Income Passport'}</span>
            <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black">
              VERIFIED
            </span>
          </button>

          {/* Fee Auditor & Overcharge Radar */}
          <button
            type="button"
            onClick={() => setActiveTab('fee_auditor')}
            className="px-3.5 py-1.5 rounded-full bg-blue-900 hover:bg-blue-950 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>⚖️</span>
            <span>{language === 'bn' ? 'ফি অডিটর' : 'Fee Auditor'}</span>
            <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black">
              RADAR
            </span>
          </button>

          {/* Bundle Optimizer (AI Mobile Pack Recommendation) */}
          <button
            type="button"
            onClick={() => setActiveTab('bundle_optimizer')}
            className="px-3.5 py-1.5 rounded-full bg-blue-800 hover:bg-blue-900 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>📶</span>
            <span>{language === 'bn' ? 'বান্ডেল অপ্টিমাইজার' : 'Bundle Optimizer'}</span>
            <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black">
              SAVER
            </span>
          </button>

          {/* Zakat & Giving Assistant with Eid Envelopes */}
          <button
            type="button"
            onClick={() => setActiveTab('zakat_giving')}
            className="px-3.5 py-1.5 rounded-full bg-teal-800 hover:bg-teal-900 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>🌙</span>
            <span>{language === 'bn' ? 'যাকাত ও ঈদ খাম' : 'Zakat & Eid'}</span>
            <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black">
              EID
            </span>
          </button>

          {/* Dialect-aware Voice Pay */}
          <button
            type="button"
            onClick={() => setActiveTab('dialect_voice')}
            className="px-3.5 py-1.5 rounded-full bg-blue-900 hover:bg-blue-950 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>🎙️</span>
            <span>{language === 'bn' ? 'ভয়েস পে' : 'Voice Pay'}</span>
            <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black">
              DIALECT
            </span>
          </button>

          {/* Mandate Wallet (AI-Permissioned Payments) */}
          <button
            type="button"
            onClick={() => setActiveTab('mandate_wallet')}
            className="px-3.5 py-1.5 rounded-full bg-cyan-900 hover:bg-cyan-950 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>📜</span>
            <span>{language === 'bn' ? 'ম্যান্ডেট ওয়ালেট' : 'Mandate'}</span>
            <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black">
              AUTO
            </span>
          </button>

          {/* Payslip Auditor & Wage-Day Orchestrator */}
          <button
            type="button"
            onClick={() => setActiveTab('payslip_orchestrator')}
            className="px-3.5 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>👔</span>
            <span>{language === 'bn' ? 'পে-স্লিপ ও বেতন দিন' : 'Payslip & Wage'}</span>
            <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black">
              WAGE
            </span>
          </button>

          {/* 1. Live Voice */}
          <button
            type="button"
            onClick={() => setCurrentModal('voice_conversation')}
            className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            {language === 'bn' ? 'লাইভ ভয়েস' : 'Live Voice'}
          </button>

          {/* 2. AI Chatbot */}
          <button
            type="button"
            onClick={() => setCurrentModal('gemini_chatbot')}
            className="px-3.5 py-1.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            {language === 'bn' ? 'এআই চ্যাটবট' : 'AI Chatbot'}
          </button>

          {/* 3. Search Info */}
          <button
            type="button"
            onClick={() => setCurrentModal('search_grounding')}
            className="px-3.5 py-1.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            {language === 'bn' ? 'সার্চ তথ্য' : 'Search Info'}
          </button>

          {/* 4. Agent Map */}
          <button
            type="button"
            onClick={() => setCurrentModal('maps_grounding')}
            className="px-3.5 py-1.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            {language === 'bn' ? 'এজেন্ট ম্যাপ' : 'Agent Map'}
          </button>

          {/* 5. Transcribe */}
          <button
            type="button"
            onClick={() => setCurrentModal('audio_transcribe')}
            className="px-3.5 py-1.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            {language === 'bn' ? 'ট্রান্সক্রাইব' : 'Transcribe'}
          </button>

          {/* 6. Scam SMS */}
          <button
            type="button"
            onClick={() => setCurrentModal('scam_checker')}
            className="px-3.5 py-1.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            {language === 'bn' ? 'স্ক্যাম SMS' : 'Scam SMS'}
          </button>

          {/* 7. Cashless Flow */}
          <button
            type="button"
            onClick={() => setCurrentModal('cash_flow')}
            className="px-3.5 py-1.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            {language === 'bn' ? 'ক্যাশ-ফ্লো' : 'Cashless Flow'}
          </button>

          {/* 8. Safe Hub */}
          <button
            type="button"
            onClick={() => setCurrentModal('safe_ai_hub')}
            className="px-3.5 py-1.5 rounded-full bg-[#FFD600] text-slate-950 font-black text-xs shadow-2xs hover:brightness-105 active:scale-95 transition-all shrink-0 cursor-pointer border border-amber-300"
          >
            {language === 'bn' ? 'সেফ হাব' : 'Safe Hub'}
          </button>
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => navScrollRef.current?.scrollBy({ left: 160, behavior: 'smooth' })}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white text-slate-800 border border-slate-300 font-black text-sm flex items-center justify-center shadow-xs hover:bg-slate-50 active:scale-90 transition-transform cursor-pointer"
          aria-label="Scroll right"
        >
          ›
        </button>
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
          type="button"
          onClick={() => setCurrentModal('card_demo')}
          className="flex-1 py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-[#FFFBEA] to-amber-50/70 border border-amber-300 flex items-center justify-center gap-2.5 text-slate-900 font-bold text-xs shadow-xs hover:shadow-sm active:scale-95 transition-all hover:bg-amber-100 cursor-pointer group hover:border-amber-400"
        >
          <span className="w-7 h-7 rounded-xl bg-amber-400/25 text-amber-900 flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
            💳
          </span>
          <div className="text-left">
            <span className="block font-black text-slate-900 leading-tight">
              {language === 'bn' ? 'উপায় কার্ড' : 'Upay Card'}
            </span>
            <span className="block text-[9px] text-slate-500 font-semibold">
              {language === 'bn' ? 'ভার্চুয়াল ও ডেবিট' : 'Debit & Virtual'}
            </span>
          </div>
        </button>

        {/* Upay Offer Pill */}
        <button
          type="button"
          onClick={() => setCurrentModal('offers_demo')}
          className="flex-1 py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-[#FFFBEA] to-yellow-50/70 border border-amber-300 flex items-center justify-center gap-2.5 text-slate-900 font-bold text-xs shadow-xs hover:shadow-sm active:scale-95 transition-all hover:bg-amber-100 cursor-pointer group hover:border-amber-400"
        >
          <span className="w-7 h-7 rounded-xl bg-yellow-400/25 text-yellow-900 flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
            🎁
          </span>
          <div className="text-left">
            <span className="block font-black text-slate-900 leading-tight">
              {language === 'bn' ? 'উপায় অফার' : 'Upay Offers'}
            </span>
            <span className="block text-[9px] text-slate-500 font-semibold">
              {language === 'bn' ? 'ক্যাশব্যাক ও ছাড়' : 'Deals & Cashback'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
