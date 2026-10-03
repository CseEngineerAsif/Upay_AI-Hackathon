import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UpayHeader } from '../layout/UpayHeader';

export const HomeScreen: React.FC = () => {
  const { language, setCurrentModal, setActiveTab, openSection } = useAppStore();
  const [activeBanner, setActiveBanner] = useState(0);
  const navScrollRef = useRef<HTMLDivElement>(null);

  // Strip scrolling, dragging and auto-slide states
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const isPausedRef = useRef(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Pause auto-scroll on user interaction
  const pauseAutoScroll = () => {
    isPausedRef.current = true;
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
  };

  // Resume auto-scroll ~4 seconds after last interaction
  const resumeAutoScrollAfterDelay = () => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, 4000);
  };

  // Update left/right scroll arrow visibility
  const updateScrollArrows = () => {
    const el = navScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  };

  // Auto-scroll loop and event listeners
  useEffect(() => {
    const el = navScrollRef.current;
    if (!el) return;

    updateScrollArrows();
    el.addEventListener('scroll', updateScrollArrows, { passive: true });
    window.addEventListener('resize', updateScrollArrows);

    const ro = new ResizeObserver(updateScrollArrows);
    ro.observe(el);

    // Auto-scroll every ~4s smoothly to next chip or back to start
    const autoScrollInterval = setInterval(() => {
      if (isPausedRef.current || !navScrollRef.current) return;
      const target = navScrollRef.current;
      const maxScroll = target.scrollWidth - target.clientWidth;
      if (target.scrollLeft >= maxScroll - 10) {
        target.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        target.scrollBy({ left: 140, behavior: 'smooth' });
      }
    }, 4000);

    const handleGlobalMouseUp = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        setIsDragging(false);
        setTimeout(() => {
          hasDraggedRef.current = false;
        }, 60);
        resumeAutoScrollAfterDelay();
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      clearInterval(autoScrollInterval);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      el.removeEventListener('scroll', updateScrollArrows);
      window.removeEventListener('resize', updateScrollArrows);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      ro.disconnect();
    };
  }, []);

  const handleArrowScroll = (direction: 'left' | 'right') => {
    if (!navScrollRef.current) return;
    pauseAutoScroll();
    const amount = (navScrollRef.current.clientWidth || 300) * 0.7;
    navScrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth'
    });
    resumeAutoScrollAfterDelay();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!navScrollRef.current) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - navScrollRef.current.offsetLeft;
    scrollLeftStartRef.current = navScrollRef.current.scrollLeft;
    pauseAutoScroll();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !navScrollRef.current) return;
    const x = e.pageX - navScrollRef.current.offsetLeft;
    const distance = x - startXRef.current;
    if (Math.abs(distance) > 5) {
      if (!hasDraggedRef.current) {
        hasDraggedRef.current = true;
        setIsDragging(true);
      }
      navScrollRef.current.scrollLeft = scrollLeftStartRef.current - distance;
    }
  };

  const handleMouseUp = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      setIsDragging(false);
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 60);
      resumeAutoScrollAfterDelay();
    }
  };

  const handleChipClick = (action: () => void) => {
    if (hasDraggedRef.current) return;
    action();
  };

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
    },
    {
      id: 'section_fraud_prevention',
      labelBn: 'প্রতারণা প্রতিরোধ',
      labelEn: 'Anti-Fraud',
      iconColor: 'bg-rose-50 text-rose-700 border-rose-200',
      action: () => openSection('fraud_prevention'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'section_agent_cash',
      labelBn: 'এজেন্ট ও ক্যাশ',
      labelEn: 'Agent & Cash',
      iconColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      action: () => openSection('agent_cash'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="7" y1="15" x2="11" y2="15" />
          <line x1="15" y1="15" x2="17" y2="15" />
        </svg>
      )
    },
    {
      id: 'section_savings_somiti',
      labelBn: 'সঞ্চয় ও সমিতি',
      labelEn: 'Savings & Somiti',
      iconColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      action: () => openSection('savings_somiti'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      )
    },
    {
      id: 'section_zakat_giving',
      labelBn: 'যাকাত ও দান',
      labelEn: 'Zakat & Giving',
      iconColor: 'bg-amber-50 text-amber-700 border-amber-200',
      action: () => openSection('zakat_giving'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )
    },
    {
      id: 'section_eid_envelopes',
      labelBn: 'ঈদ খাম',
      labelEn: 'Eid Envelopes',
      iconColor: 'bg-pink-50 text-pink-700 border-pink-200',
      action: () => openSection('eid_envelopes'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      )
    },
    {
      id: 'section_smart_payment',
      labelBn: 'স্মার্ট পেমেন্ট',
      labelEn: 'Smart Pay',
      iconColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      action: () => openSection('smart_payment'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )
    },
    {
      id: 'section_income_workers',
      labelBn: 'আয় ও কর্মজীবী',
      labelEn: 'Income & Workers',
      iconColor: 'bg-teal-50 text-teal-700 border-teal-200',
      action: () => openSection('income_workers'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    },
    {
      id: 'section_disaster_support',
      labelBn: 'দুর্যোগ সহায়তা',
      labelEn: 'Disaster Relief',
      iconColor: 'bg-sky-50 text-sky-700 border-sky-200',
      action: () => openSection('disaster_support'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          <line x1="8" y1="19" x2="6" y2="22" strokeLinecap="round" />
          <line x1="12" y1="19" x2="10" y2="22" strokeLinecap="round" />
          <line x1="16" y1="19" x2="14" y2="22" strokeLinecap="round" />
        </svg>
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
      <div
        className="relative w-full bg-[#ebebf7] shadow-2xs border-b border-indigo-100 select-none py-2 px-1 shrink-0"
        style={{ minHeight: '52px', height: 'auto', flexShrink: 0 }}
        onMouseEnter={pauseAutoScroll}
        onMouseLeave={() => {
          if (!isMouseDownRef.current) {
            resumeAutoScrollAfterDelay();
          }
        }}
        onTouchStart={pauseAutoScroll}
        onTouchEnd={resumeAutoScrollAfterDelay}
        onTouchCancel={resumeAutoScrollAfterDelay}
      >
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => handleArrowScroll('left')}
          className={`absolute left-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/95 text-slate-800 border border-slate-300/80 font-black text-sm flex items-center justify-center shadow-md hover:bg-white active:scale-90 transition-all cursor-pointer ${
            canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ width: '28px', height: '28px', flexShrink: 0 }}
          aria-label="Scroll left"
        >
          ‹
        </button>

        {/* Scrollable Track */}
        <div
          ref={navScrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`w-full flex items-center gap-2 px-8 overflow-x-auto overflow-y-hidden scroll-smooth no-scrollbar flex-nowrap ${
            isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
          style={{
            minHeight: '40px',
            height: 'auto',
            flexShrink: 0,
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x',
            scrollSnapType: 'x proximity',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* Digital Somiti (New Group Savings Circle) */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setActiveTab('somiti'))}
            className="h-9 px-3.5 rounded-full bg-[#0B4DA2] hover:bg-blue-900 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            <span>👥</span>
            <span>{language === 'bn' ? 'ডিজিটাল সমিতি' : 'Digital Somiti'}</span>
            <span className="px-1.5 py-0.5 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black leading-none shrink-0 inline-flex items-center justify-center">
              AI
            </span>
          </button>

          {/* TrustPay F-Commerce Escrow (New Feature) */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setActiveTab('trustpay'))}
            className="h-9 px-3.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            <span>🤝</span>
            <span>{language === 'bn' ? 'ট্রাস্টপে' : 'TrustPay'}</span>
            <span className="px-1.5 py-0.5 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black leading-none shrink-0 inline-flex items-center justify-center">
              ESCROW
            </span>
          </button>

          {/* Liquidity Network (Cash Reservation & Agent Float) */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setActiveTab('liquidity'))}
            className="h-9 px-3.5 rounded-full bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            <span>⚡</span>
            <span>{language === 'bn' ? 'লিকুইডিটি' : 'Liquidity'}</span>
            <span className="px-1.5 py-0.5 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black leading-none shrink-0 inline-flex items-center justify-center">
              CASH
            </span>
          </button>

          {/* Cross-Wallet Federated Risk Exchange */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setActiveTab('crosswallet'))}
            className="h-9 px-3.5 rounded-full bg-indigo-800 hover:bg-indigo-900 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            <span>🌐</span>
            <span>{language === 'bn' ? 'ক্রস-ওয়ালেট' : 'Cross-Wallet'}</span>
            <span className="px-1.5 py-0.5 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black leading-none shrink-0 inline-flex items-center justify-center">
              FEDERATED
            </span>
          </button>

          {/* Climate Shield Mode (Disaster Alert & Relief) */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setActiveTab('climateshield'))}
            className="h-9 px-3.5 rounded-full bg-rose-700 hover:bg-rose-800 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            <span>🌊</span>
            <span>{language === 'bn' ? 'ক্লাইমেট শিল্ড' : 'Climate Shield'}</span>
            <span className="px-1.5 py-0.5 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black leading-none shrink-0 inline-flex items-center justify-center">
              RELIEF
            </span>
          </button>

          {/* Portable Income Passport (New Feature) */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setActiveTab('income_passport'))}
            className="h-9 px-3.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            <span>🛂</span>
            <span>{language === 'bn' ? 'ইনকাম পাসপোর্ট' : 'Income Passport'}</span>
            <span className="px-1.5 py-0.5 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black leading-none shrink-0 inline-flex items-center justify-center">
              VERIFIED
            </span>
          </button>

          {/* Fee Auditor & Overcharge Radar */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setActiveTab('fee_auditor'))}
            className="h-9 px-3.5 rounded-full bg-blue-900 hover:bg-blue-950 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            <span>⚖️</span>
            <span>{language === 'bn' ? 'ফি অডিটর' : 'Fee Auditor'}</span>
            <span className="px-1.5 py-0.5 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black leading-none shrink-0 inline-flex items-center justify-center">
              RADAR
            </span>
          </button>

          {/* Bundle Optimizer (AI Mobile Pack Recommendation) */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setActiveTab('bundle_optimizer'))}
            className="h-9 px-3.5 rounded-full bg-blue-800 hover:bg-blue-900 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            <span>📶</span>
            <span>{language === 'bn' ? 'বান্ডেল অপ্টিমাইজার' : 'Bundle Optimizer'}</span>
            <span className="px-1.5 py-0.5 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black leading-none shrink-0 inline-flex items-center justify-center">
              SAVER
            </span>
          </button>

          {/* Zakat & Giving Assistant with Eid Envelopes */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setActiveTab('zakat_giving'))}
            className="h-9 px-3.5 rounded-full bg-teal-800 hover:bg-teal-900 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            <span>🌙</span>
            <span>{language === 'bn' ? 'যাকাত ও ঈদ খাম' : 'Zakat & Eid'}</span>
            <span className="px-1.5 py-0.5 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black leading-none shrink-0 inline-flex items-center justify-center">
              EID
            </span>
          </button>

          {/* Dialect-aware Voice Pay */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setActiveTab('dialect_voice'))}
            className="h-9 px-3.5 rounded-full bg-blue-900 hover:bg-blue-950 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            <span>🎙️</span>
            <span>{language === 'bn' ? 'ভয়েস পে' : 'Voice Pay'}</span>
            <span className="px-1.5 py-0.5 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black leading-none shrink-0 inline-flex items-center justify-center">
              DIALECT
            </span>
          </button>

          {/* Mandate Wallet (AI-Permissioned Payments) */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setActiveTab('mandate_wallet'))}
            className="h-9 px-3.5 rounded-full bg-cyan-900 hover:bg-cyan-950 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            <span>📜</span>
            <span>{language === 'bn' ? 'ম্যান্ডেট ওয়ালেট' : 'Mandate'}</span>
            <span className="px-1.5 py-0.5 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black leading-none shrink-0 inline-flex items-center justify-center">
              AUTO
            </span>
          </button>

          {/* Payslip Auditor & Wage-Day Orchestrator */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setActiveTab('payslip_orchestrator'))}
            className="h-9 px-3.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            <span>👔</span>
            <span>{language === 'bn' ? 'পে-স্লিপ ও বেতন দিন' : 'Payslip & Wage'}</span>
            <span className="px-1.5 py-0.5 bg-[#FFD600] text-slate-950 rounded-full text-[8px] font-black leading-none shrink-0 inline-flex items-center justify-center">
              WAGE
            </span>
          </button>

          {/* 1. Live Voice */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setCurrentModal('voice_conversation'))}
            className="h-9 px-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            {language === 'bn' ? 'লাইভ ভয়েস' : 'Live Voice'}
          </button>

          {/* 2. AI Chatbot */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setCurrentModal('gemini_chatbot'))}
            className="h-9 px-3.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            {language === 'bn' ? 'এআই চ্যাটবট' : 'AI Chatbot'}
          </button>

          {/* 3. Search Info */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setCurrentModal('search_grounding'))}
            className="h-9 px-3.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            {language === 'bn' ? 'সার্চ তথ্য' : 'Search Info'}
          </button>

          {/* 4. Agent Map */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setCurrentModal('maps_grounding'))}
            className="h-9 px-3.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            {language === 'bn' ? 'এজেন্ট ম্যাপ' : 'Agent Map'}
          </button>

          {/* 5. Transcribe */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setCurrentModal('audio_transcribe'))}
            className="h-9 px-3.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            {language === 'bn' ? 'ট্রান্সক্রাইব' : 'Transcribe'}
          </button>

          {/* 6. Scam SMS */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setCurrentModal('scam_checker'))}
            className="h-9 px-3.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            {language === 'bn' ? 'স্ক্যাম SMS' : 'Scam SMS'}
          </button>

          {/* 7. Cashless Flow */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setCurrentModal('cash_flow'))}
            className="h-9 px-3.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            {language === 'bn' ? 'ক্যাশ-ফ্লো' : 'Cashless Flow'}
          </button>

          {/* 8. Safe Hub */}
          <button
            type="button"
            onClick={() => handleChipClick(() => setCurrentModal('safe_ai_hub'))}
            className="h-9 px-3.5 rounded-full bg-[#FFD600] text-slate-950 font-black text-xs shadow-2xs hover:brightness-105 active:scale-95 transition-all shrink-0 snap-start cursor-pointer border border-amber-300 inline-flex items-center justify-center whitespace-nowrap"
            style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
          >
            {language === 'bn' ? 'সেফ হাব' : 'Safe Hub'}
          </button>
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => handleArrowScroll('right')}
          className={`absolute right-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/95 text-slate-800 border border-slate-300/80 font-black text-sm flex items-center justify-center shadow-md hover:bg-white active:scale-90 transition-all cursor-pointer ${
            canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ width: '28px', height: '28px', flexShrink: 0 }}
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
