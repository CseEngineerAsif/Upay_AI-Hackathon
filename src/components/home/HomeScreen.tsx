import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UpayHeader } from '../layout/UpayHeader';
import { FeatureScrollStrip } from './FeatureScrollStrip';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { OperatorLogo, detectOperator } from '../brand/OperatorConfig';

export const HomeScreen: React.FC = () => {
  const { language, setCurrentModal, setActiveTab, transactions, setSidePanelOpen } = useAppStore();
  const [activeBanner, setActiveBanner] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Telco Promotional Banners (Robi, Grameenphone, Banglalink, Airtel)
  const promoBanners = [
    {
      id: 'robi',
      brandBn: 'রবি স্পেশাল',
      brandEn: 'Robi Special',
      titleBn: 'আনলিমিটেড ক্যাশব্যাক ও বোনাস!',
      titleEn: 'Unlimited Cashback & Bonus!',
      descBn: '৳৫০ থেকে ৳৭৫ ক্যাশব্যাক ৭০ জিবি ও ১০০ জিবি প্যাক',
      descEn: '৳50 - ৳75 cashback on 70GB & 100GB internet',
      btnBn: 'রিচার্জ করুন',
      btnEn: 'Recharge',
      gradient: 'from-[#E30613] via-[#F34235] to-[#FF8A00]',
      tagBg: 'bg-white text-[#E30613]',
      btnBg: 'bg-white text-[#E30613] hover:bg-red-50',
      icon: '📶',
      action: () => setCurrentModal('mobile_recharge')
    },
    {
      id: 'grameenphone',
      brandBn: 'গ্রামীণফোন ধামাকা',
      brandEn: 'Grameenphone GP',
      titleBn: 'GP সুপার ইন্টারনেট ও মিনিট বান্ডেল!',
      titleEn: 'GP Super Internet & Mins Pack!',
      descBn: '৫০ জিবি + ১০০০ মিনিট মাত্র ৳৫৯৮ সাথে ১০০% বোনাস ক্যাশব্যাক',
      descEn: '50GB + 1000 Mins at ৳598 with 100% bonus cashback',
      btnBn: 'অফার নিন',
      btnEn: 'Get Pack',
      gradient: 'from-[#0072CE] via-[#00A3E0] to-[#00C5C8]',
      tagBg: 'bg-white text-[#0072CE]',
      btnBg: 'bg-white text-[#0072CE] hover:bg-sky-50',
      icon: '🌐',
      action: () => setCurrentModal('mobile_recharge')
    },
    {
      id: 'banglalink',
      brandBn: 'বাংলালিংক অফার',
      brandEn: 'Banglalink 4G',
      titleBn: 'BL ডাবল ডাটা ও ভয়েস বোনাস!',
      titleEn: 'BL Double Data & Bonus!',
      descBn: 'যেকোনো আনলিমিটেড মেয়াদ প্যাকে দ্বিগুণ ডাটা ও ৳৪৫ ক্যাশব্যাক',
      descEn: '2X data on unlimited validity packs + ৳45 cashback',
      btnBn: 'ক্লিক করুন',
      btnEn: 'Click Here',
      gradient: 'from-[#FF6A00] via-[#FF8C00] to-[#FFA726]',
      tagBg: 'bg-white text-[#FF6A00]',
      btnBg: 'bg-white text-[#FF6A00] hover:bg-amber-50',
      icon: '🚀',
      action: () => setCurrentModal('mobile_recharge')
    },
    {
      id: 'airtel',
      brandBn: 'এয়ারটেল ফ্রেন্ডজ',
      brandEn: 'Airtel Friends',
      titleBn: 'এয়ারটেল আনলিমিটেড ভয়েস ও ডাটা!',
      titleEn: 'Airtel Unlimited Voice & Data!',
      descBn: '৩০ দিন মেয়াদে ৩০ জিবি + ৭০০ মিনিট মাত্র ৳৩৯৯',
      descEn: '30 days validity 30GB + 700 Mins at ৳399 only',
      btnBn: 'রিচার্জ করুন',
      btnEn: 'Recharge',
      gradient: 'from-[#ED1C24] via-[#FA4D56] to-[#9F1853]',
      tagBg: 'bg-white text-[#ED1C24]',
      btnBg: 'bg-white text-[#ED1C24] hover:bg-rose-50',
      icon: '⚡',
      action: () => setCurrentModal('mobile_recharge')
    }
  ];

  // Auto-rotate carousel every 3.5 seconds when not hovered/touched
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % promoBanners.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, promoBanners.length]);

  // Core 11 Service Tiles in 4-Column Grid
  const primaryServices = [
    // Row 1
    {
      id: 'send_money',
      labelBn: 'সেন্ড মানি',
      labelEn: 'Send Money',
      iconColor: 'bg-cyan-50/90 text-cyan-600 border-cyan-200/80 shadow-cyan-100',
      action: () => setCurrentModal('send_money'),
      icon: (
        <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
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
      iconColor: 'bg-sky-50/90 text-[#0B4DA2] border-sky-200/80 shadow-sky-100',
      action: () => setCurrentModal('mobile_recharge'),
      icon: (
        <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
      )
    },
    {
      id: 'cash_out',
      labelBn: 'ক্যাশ আউট',
      labelEn: 'Cash Out',
      iconColor: 'bg-amber-50/90 text-amber-600 border-amber-200/80 shadow-amber-100',
      action: () => setCurrentModal('cash_out'),
      icon: (
        <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
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
      iconColor: 'bg-blue-50/90 text-blue-600 border-blue-200/80 shadow-blue-100',
      action: () => setCurrentModal('pay_bill'),
      icon: (
        <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    },

    // Row 2
    {
      id: 'add_money',
      labelBn: 'অ্যাড মানি',
      labelEn: 'Add Money',
      iconColor: 'bg-indigo-50/90 text-indigo-600 border-indigo-200/80 shadow-indigo-100',
      action: () => setCurrentModal('add_money'),
      icon: (
        <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
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
      iconColor: 'bg-yellow-50/90 text-amber-700 border-yellow-200/80 shadow-yellow-100',
      action: () => setCurrentModal('savings'),
      icon: (
        <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M19 5c-1.5 0-2.8 1.2-3 2.6-.7-.4-1.6-.6-2.5-.6-2.8 0-5 2.2-5 5v1H5v2h3.5c.8 2.3 3 4 5.5 4 3.3 0 6-2.7 6-6V9c.5 0 1-.2 1.4-.6l.6-.6-3-2.8z" />
          <circle cx="14" cy="11" r="1" />
        </svg>
      )
    },
    {
      id: 'fund_transfer',
      labelBn: 'ফান্ড ট্রান্সফার',
      labelEn: 'Transfer',
      iconColor: 'bg-teal-50/90 text-teal-600 border-teal-200/80 shadow-teal-100',
      action: () => setCurrentModal('fund_transfer'),
      icon: (
        <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4" />
        </svg>
      )
    },
    {
      id: 'request_money',
      labelBn: 'রিকোয়েস্ট মানি',
      labelEn: 'Request Money',
      iconColor: 'bg-rose-50/90 text-rose-600 border-rose-200/80 shadow-rose-100',
      action: () => setCurrentModal('request_money'),
      icon: (
        <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M17 11l-5-5-5 5M12 6v12" />
        </svg>
      )
    },

    // Row 3
    {
      id: 'make_payment',
      labelBn: 'মেক পেমেন্ট',
      labelEn: 'Payment',
      iconColor: 'bg-slate-100/90 text-slate-800 border-slate-200 shadow-slate-100',
      action: () => setCurrentModal('make_payment'),
      icon: (
        <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
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
      iconColor: 'bg-emerald-50/90 text-emerald-600 border-emerald-200/80 shadow-emerald-100',
      action: () => setCurrentModal('guardian_invite'),
      icon: (
        <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
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
      iconColor: 'bg-purple-50/90 text-purple-600 border-purple-200/80 shadow-purple-100',
      action: () => setCurrentModal('npsb'),
      icon: (
        <span className="text-[11px] font-black tracking-tighter text-purple-700">
          NPSB
        </span>
      )
    }
  ];

  // Recursion Pay Payment Service Tiles (8 tiles)
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

  // Recent 4 transactions for dashboard
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50/40 overflow-y-auto no-scrollbar pb-24">
      {/* Modern Glass Header with Energetic Yellow & Royal Blue */}
      <UpayHeader />

      {/* Feature Scroll Strip with colorful compact glass pills */}
      <FeatureScrollStrip />

      {/* Primary 4-Column Icon Grid (Core 11 Recursion Pay Services) */}
      <div className="px-3 pt-3.5">
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {primaryServices.map((svc) => (
            <button
              key={svc.id}
              onClick={svc.action}
              className="flex flex-col items-center justify-between p-2 rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-100/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-200/70 active:scale-95 transition-all duration-200 cursor-pointer group"
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-200 group-hover:scale-105 ${svc.iconColor}`}
              >
                {svc.icon}
              </div>
              <span className="text-[11px] font-semibold text-slate-800 text-center mt-1.5 leading-tight px-0.5 line-clamp-1">
                {language === 'bn' ? svc.labelBn : svc.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Promotional Banner Carousel (Rotating Grameenphone, Banglalink, Robi, Airtel) */}
      <div
        className="mx-3.5 mt-4 relative group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={(e) => {
          setIsPaused(true);
          touchStartXRef.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          setIsPaused(false);
          if (touchStartXRef.current !== null) {
            const diff = e.changedTouches[0].clientX - touchStartXRef.current;
            if (diff > 35) {
              setActiveBanner((prev) => (prev === 0 ? promoBanners.length - 1 : prev - 1));
            } else if (diff < -35) {
              setActiveBanner((prev) => (prev + 1) % promoBanners.length);
            }
          }
          touchStartXRef.current = null;
        }}
      >
        {/* Banner Frame with subtle glass border and soft shadow */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-white/40 select-none">
          {/* Animated Slider Track */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeBanner * 100}%)` }}
          >
            {promoBanners.map((banner) => (
              <div
                key={banner.id}
                className={`w-full shrink-0 bg-gradient-to-r ${banner.gradient} text-white p-3.5 flex items-center justify-between gap-3 relative`}
              >
                {/* Left Content */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{banner.icon}</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shadow-2xs ${banner.tagBg}`}>
                      {language === 'bn' ? banner.brandBn : banner.brandEn}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold leading-tight drop-shadow-xs truncate">
                    {language === 'bn' ? banner.titleBn : banner.titleEn}
                  </h4>
                  <p className="text-[10.5px] text-white/95 leading-snug line-clamp-1">
                    {language === 'bn' ? banner.descBn : banner.descEn}
                  </p>
                </div>

                {/* Right Action Button */}
                <button
                  type="button"
                  onClick={banner.action}
                  className={`px-3 py-1.5 rounded-full font-black text-xs shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer ${banner.btnBg}`}
                >
                  {language === 'bn' ? banner.btnBn : banner.btnEn}
                </button>
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveBanner((prev) => (prev === 0 ? promoBanners.length - 1 : prev - 1));
            }}
            aria-label="Previous Banner"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/25 hover:bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer active:scale-90"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveBanner((prev) => (prev + 1) % promoBanners.length);
            }}
            aria-label="Next Banner"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/25 hover:bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer active:scale-90"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Carousel Dot Indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {promoBanners.map((banner, idx) => (
            <button
              key={banner.id}
              onClick={() => setActiveBanner(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeBanner === idx ? 'w-6 bg-[#0B4DA2]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Floating Modern Glass Cards (রিকার্শন পে কার্ড & রিকার্শন পে অফার) */}
      <div className="px-3.5 mt-4 flex items-center justify-between gap-2.5">
        {/* Recursion Pay Card Pill */}
        <button
          type="button"
          onClick={() => setCurrentModal('card_demo')}
          className="flex-1 py-2.5 px-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-emerald-200/80 hover:border-emerald-300 flex items-center gap-2.5 text-slate-900 shadow-[0_2px_10px_rgba(0,212,146,0.14)] hover:shadow-md active:scale-95 transition-all cursor-pointer group"
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00D492] to-[#00B478] text-slate-950 flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform shrink-0">
            💳
          </span>
          <div className="text-left min-w-0">
            <span className="block font-black text-slate-950 text-xs leading-tight truncate">
              {language === 'bn' ? 'রিকার্শন পে কার্ড' : 'Recursion Pay Card'}
            </span>
            <span className="block text-[9.5px] text-slate-500 font-semibold truncate">
              {language === 'bn' ? 'ভার্চুয়াল ও ডেবিট' : 'Debit & Virtual'}
            </span>
          </div>
        </button>

        {/* Recursion Pay Offer Pill */}
        <button
          type="button"
          onClick={() => setCurrentModal('offers_demo')}
          className="flex-1 py-2.5 px-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-blue-200/80 hover:border-blue-300 flex items-center gap-2.5 text-slate-900 shadow-[0_2px_10px_rgba(11,77,162,0.10)] hover:shadow-md active:scale-95 transition-all cursor-pointer group"
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0B4DA2] to-[#1a65c9] text-white flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform shrink-0">
            🎁
          </span>
          <div className="text-left min-w-0">
            <span className="block font-black text-slate-950 text-xs leading-tight truncate">
              {language === 'bn' ? 'রিকার্শন পে অফার' : 'Recursion Pay Offers'}
            </span>
            <span className="block text-[9.5px] text-slate-500 font-semibold truncate">
              {language === 'bn' ? 'ক্যাশব্যাক ও ছাড়' : 'Deals & Cashback'}
            </span>
          </div>
        </button>
      </div>

      {/* "রিকার্শন পে পেমেন্ট" Section (8 tiles) */}
      <div className="px-3.5 mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 rounded-full bg-[#0B4DA2]" />
            <span>{language === 'bn' ? 'রিকার্শন পে পেমেন্ট' : 'Recursion Pay Payment'}</span>
          </h3>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {paymentServices.map((p) => (
            <button
              key={p.id}
              onClick={() => setCurrentModal(p.id)}
              className="flex flex-col items-center p-2 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-blue-100 active:scale-95 transition-all cursor-pointer group"
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-2xs ${p.bg} ${p.border} border transition-all duration-200 group-hover:scale-105`}
              >
                <span>{p.icon}</span>
              </div>
              <span className="text-[10.5px] font-semibold text-slate-800 text-center mt-1.5 leading-tight truncate w-full">
                {language === 'bn' ? p.labelBn : p.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* সাম্প্রতিক লেনদেন তালিকা (Recent Transactions List) with Modern Glass Cards */}
      <div className="px-3.5 mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 rounded-full bg-[#00D492]" />
            <span>{language === 'bn' ? 'সাম্প্রতিক লেনদেন' : 'Recent Transactions'}</span>
          </h3>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className="text-[11px] font-bold text-[#0B4DA2] hover:text-blue-800 active:scale-95 transition-transform flex items-center gap-0.5 cursor-pointer"
          >
            <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'View All'}</span>
            <span>›</span>
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.length === 0 ? (
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-100 text-center text-xs text-slate-400">
              {language === 'bn' ? 'এখনো কোনো লেনদেন হয়নি।' : 'No recent transactions yet.'}
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const isRecharge =
                tx.category === 'বিল' ||
                tx.note?.includes('রিচার্জ') ||
                tx.recipientName?.includes('রিচার্জ') ||
                tx.recipientName?.includes('Recharge');
              const op = isRecharge ? detectOperator(tx.recipientName || tx.recipient || tx.note) : null;
              const isIncoming = tx.type === 'add_money';

              return (
                <div
                  key={tx.id}
                  onClick={() => setActiveTab('history')}
                  className="p-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-100/90 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-blue-100 flex items-center justify-between transition-all duration-200 active:scale-[0.99] cursor-pointer group"
                >
                  {/* Left: Icon & Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    {op ? (
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform">
                        <OperatorLogo operator={op} size={22} />
                      </div>
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border group-hover:scale-105 transition-transform ${
                          isIncoming
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-sky-50 text-[#0B4DA2] border-sky-200'
                        }`}
                      >
                        {isIncoming ? '↓' : '↑'}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {tx.recipientName || tx.recipient}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                        <span>{formatDate(tx.timestamp, language)}</span>
                        <span>•</span>
                        <span className="text-slate-600">{tx.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-black font-mono tabular-nums ${
                        isIncoming ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncoming ? '+' : '-'}{formatCurrency(tx.amount, language)}
                    </span>
                    <span className="block text-[9px] font-semibold text-slate-400 capitalize">
                      {tx.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
