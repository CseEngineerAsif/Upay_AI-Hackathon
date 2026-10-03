import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UpayHeader } from '../layout/UpayHeader';
import { FeatureScrollStrip } from './FeatureScrollStrip';

export const HomeScreen: React.FC = () => {
  const { language, setCurrentModal } = useAppStore();
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

  // Original 11 Core Upay Service Tiles (Row 1: 4, Row 2: 4, Row 3: 3)
  const primaryServices = [
    // Row 1
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

    // Row 2
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

    // Row 3
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

  // Upay Payment Service Tiles (8 tiles)
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
      {/* Upay Yellow Header with balance & notification bell */}
      <UpayHeader />

      {/* Feature Scroll Strip (AI / Services pill nav bar directly beneath header) */}
      <FeatureScrollStrip />

      {/* Primary 4-Column Icon Grid (Core 11 Upay Services) */}
      <div className="px-3 pt-4">
        <div className="grid grid-cols-4 gap-y-3.5 gap-x-1">
          {primaryServices.map((svc) => (
            <button
              key={svc.id}
              onClick={svc.action}
              className="flex flex-col items-center justify-start group active:scale-95 transition-transform cursor-pointer"
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

      {/* Promotional Banner Carousel (Rotating Grameenphone, Banglalink, Robi, Airtel) */}
      <div
        className="mx-4 mt-5 relative group select-none"
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
        {/* Banner Frame with overflow hidden */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-sm select-none">
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

      {/* Section Divider */}
      <div className="h-2 bg-[#F2F2F2] my-4" />

      {/* "উপায় পেমেন্ট" Section (8 tiles) */}
      <div className="px-4">
        <h3 className="text-sm font-black text-slate-900 mb-3 tracking-tight">
          {language === 'bn' ? 'উপায় পেমেন্ট' : 'Upay Payment'}
        </h3>

        <div className="grid grid-cols-4 gap-y-3.5 gap-x-2">
          {paymentServices.map((p) => (
            <button
              key={p.id}
              onClick={() => setCurrentModal(p.id)}
              className="flex flex-col items-center group active:scale-95 transition-transform cursor-pointer"
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

      {/* Floating Pill Buttons (উপায় কার্ড on left, উপায় অফার on right) */}
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
