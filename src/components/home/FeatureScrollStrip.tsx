import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const FeatureScrollStrip: React.FC = () => {
  const { language, setCurrentModal, setActiveTab } = useAppStore();
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

  return (
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
        {/* Digital Somiti */}
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

        {/* TrustPay F-Commerce Escrow */}
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

        {/* Liquidity Network */}
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

        {/* Climate Shield Mode */}
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

        {/* Portable Income Passport */}
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

        {/* Bundle Optimizer */}
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

        {/* Mandate Wallet */}
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

        {/* Payslip Auditor & Wage-Day */}
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

        {/* Live Voice */}
        <button
          type="button"
          onClick={() => handleChipClick(() => setCurrentModal('voice_conversation'))}
          className="h-9 px-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
          style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
        >
          {language === 'bn' ? 'লাইভ ভয়েস' : 'Live Voice'}
        </button>

        {/* AI Chatbot */}
        <button
          type="button"
          onClick={() => handleChipClick(() => setCurrentModal('gemini_chatbot'))}
          className="h-9 px-3.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
          style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
        >
          {language === 'bn' ? 'এআই চ্যাটবট' : 'AI Chatbot'}
        </button>

        {/* Search Info */}
        <button
          type="button"
          onClick={() => handleChipClick(() => setCurrentModal('search_grounding'))}
          className="h-9 px-3.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
          style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
        >
          {language === 'bn' ? 'সার্চ তথ্য' : 'Search Info'}
        </button>

        {/* Agent Map */}
        <button
          type="button"
          onClick={() => handleChipClick(() => setCurrentModal('maps_grounding'))}
          className="h-9 px-3.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
          style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
        >
          {language === 'bn' ? 'এজেন্ট ম্যাপ' : 'Agent Map'}
        </button>

        {/* Transcribe */}
        <button
          type="button"
          onClick={() => handleChipClick(() => setCurrentModal('audio_transcribe'))}
          className="h-9 px-3.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
          style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
        >
          {language === 'bn' ? 'ট্রান্সক্রাইব' : 'Transcribe'}
        </button>

        {/* Scam SMS */}
        <button
          type="button"
          onClick={() => handleChipClick(() => setCurrentModal('scam_checker'))}
          className="h-9 px-3.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
          style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
        >
          {language === 'bn' ? 'স্ক্যাম SMS' : 'Scam SMS'}
        </button>

        {/* Cashless Flow */}
        <button
          type="button"
          onClick={() => handleChipClick(() => setCurrentModal('cash_flow'))}
          className="h-9 px-3.5 rounded-full bg-white text-[#0B4DA2] border border-slate-200/90 hover:bg-blue-50 text-xs font-black shadow-2xs active:scale-95 transition-all shrink-0 snap-start cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
          style={{ minHeight: '36px', height: '36px', scrollSnapAlign: 'start', flexShrink: 0 }}
        >
          {language === 'bn' ? 'ক্যাশ-ফ্লো' : 'Cashless Flow'}
        </button>

        {/* Safe Hub */}
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
  );
};
