import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface MoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MoreDrawer: React.FC<MoreDrawerProps> = ({ isOpen, onClose }) => {
  const {
    language,
    setLanguage,
    simpleMode,
    toggleSimpleMode,
    logout,
    setCurrentModal,
    setActiveTab
  } = useAppStore();

  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);

  // Touch swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef<number>(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setIsRendered(false);
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key and Browser back button
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    try {
      window.history.pushState({ drawer: 'more_drawer' }, '');
    } catch {
      // ignore
    }

    const handlePopState = () => {
      handleClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.drawer === 'more_drawer') {
        window.history.back();
      }
    };
  }, [isOpen, handleClose]);

  // Touch swipe to close (swipe right)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartXRef.current;
    if (diff > 0) {
      touchDeltaXRef.current = diff;
      if (drawerRef.current) {
        drawerRef.current.style.transform = `translateX(${diff}px)`;
      }
    }
  };

  const onTouchEnd = () => {
    if (drawerRef.current) {
      drawerRef.current.style.transform = '';
    }
    if (touchDeltaXRef.current > 70) {
      handleClose();
    }
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  };

  const handleAction = (cb: () => void) => {
    handleClose();
    cb();
  };

  const handleLangToggle = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  if (!isRendered) return null;

  return (
    <div
      className="absolute inset-0 z-50 overflow-hidden select-none pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="আরো সেটিংস ও মেনু"
    >
      {/* 1. Dim Backdrop Overlay */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] transition-opacity duration-300 ease-out cursor-pointer ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 2. Slide-In Drawer Panel from Right */}
      <div
        ref={drawerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`absolute right-0 top-0 bottom-0 w-[78%] max-w-[300px] h-full bg-white rounded-l-[28px] shadow-2xl flex flex-col overflow-hidden z-10 transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="w-full bg-[#FFD600] px-3.5 py-2.5 flex items-center justify-between border-b border-amber-300 shadow-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-full bg-slate-900/10 flex items-center justify-center text-slate-950 text-xs font-black shrink-0">
              ⋯
            </span>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-slate-950 leading-tight truncate">
                {language === 'bn' ? 'আরো মেনু' : 'More Menu'}
              </h2>
              <p className="text-[10px] text-slate-800 font-semibold leading-tight truncate">
                {language === 'bn' ? 'সেটিংস ও তথ্য' : 'Settings & Info'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                handleClose();
                logout();
              }}
              className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full hover:bg-rose-100 active:scale-95 transition-all cursor-pointer"
            >
              {language === 'bn' ? 'লগআউট' : 'Logout'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="w-7 h-7 rounded-full bg-slate-950/10 hover:bg-slate-950/20 active:scale-90 transition-all flex items-center justify-center text-slate-950 cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5 text-slate-950"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Panel Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10 divide-y divide-slate-100 text-slate-800">
          {/* Group 1: সেটিংস (Settings) */}
          <div className="w-full">
            <div className="bg-[#F2F2F2] px-3.5 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'সেটিংস' : 'SETTINGS'}
            </div>

            <div className="divide-y divide-slate-100">
              {/* Change PIN */}
              <button
                onClick={() => handleAction(() => setCurrentModal('change_pin'))}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-400 text-white flex items-center justify-center text-xs shadow-2xs shrink-0">
                    🔒
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {language === 'bn' ? 'পিন পরিবর্তন' : 'Change PIN'}
                  </span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Change Language */}
              <button
                onClick={handleLangToggle}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs shadow-2xs shrink-0">
                    💬
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {language === 'bn' ? 'ভাষা পরিবর্তন' : 'Language'}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#0B4DA2] shrink-0 border border-slate-200">
                  {language === 'bn' ? 'বাংলা' : 'English'}
                </span>
              </button>

              {/* Simple Mode */}
              <div className="px-3.5 py-2 flex items-center justify-between bg-sky-50/50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#0B4DA2] text-white flex items-center justify-center text-xs shadow-2xs shrink-0">
                    👓
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {language === 'bn' ? 'সহজ মোড (Simple Mode)' : 'Simple Mode'}
                    </span>
                    <span className="text-[9.5px] text-slate-500 truncate block">
                      {language === 'bn' ? 'বড় ফন্ট ও সহজ ভাষা' : 'Larger text & simplified'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={simpleMode}
                  onChange={toggleSimpleMode}
                  className="w-4 h-4 accent-[#0B4DA2] cursor-pointer shrink-0 ml-2"
                />
              </div>

              {/* Permissions & AI Consent */}
              <button
                onClick={() => handleAction(() => setCurrentModal('permissions_modal'))}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shadow-2xs shrink-0">
                    📱
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {language === 'bn' ? 'অনুমতি ও এআই সম্মতি' : 'Permissions & AI Consent'}
                  </span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Group 2: সেফ এআই ও অ্যাডমিন (Safe AI & Admin) */}
          <div className="w-full">
            <div className="bg-[#F2F2F2] px-3.5 py-1.5 text-[10px] font-black text-[#0B4DA2] uppercase tracking-wider flex items-center gap-1">
              <span>🛡️</span>
              <span>{language === 'bn' ? 'সেফ এআই ইন্টেলিজেন্স' : 'SAFE AI & ADMIN'}</span>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Analyst Dashboard */}
              <button
                onClick={() => handleAction(() => setCurrentModal('analyst_dashboard'))}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shadow-2xs shrink-0">
                    📊
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {language === 'bn' ? 'অ্যানালিস্ট ড্যাশবোর্ড' : 'Analyst Dashboard'}
                    </span>
                    <span className="text-[9.5px] text-slate-500 truncate block">
                      {language === 'bn' ? 'সন্দেহজনক ফ্ল্যাগড লেনদেন' : 'Flagged risk review'}
                    </span>
                  </div>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Admin Monitoring */}
              <button
                onClick={() => handleAction(() => setCurrentModal('admin_monitoring'))}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs shadow-2xs shrink-0">
                    📈
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {language === 'bn' ? 'মডেল মনিটরিং' : 'Model Monitoring'}
                    </span>
                    <span className="text-[9.5px] text-slate-500 truncate block">
                      {language === 'bn' ? 'প্রিসিশন ও ফেয়ারনেস ভিউ' : 'Precision & Fairness view'}
                    </span>
                  </div>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Group 3: রিকার্শন পে সাপোর্ট (Recursion Pay Support) */}
          <div className="w-full">
            <div className="bg-[#F2F2F2] px-3.5 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'রিকার্শন পে সাপোর্ট' : 'RECURSION PAY SUPPORT'}
            </div>

            <div className="divide-y divide-slate-100">
              <button
                onClick={() => handleAction(() => setCurrentModal('support_247'))}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center text-xs shadow-2xs shrink-0">
                    🎧
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {language === 'bn' ? '২৪x৭ সেবা (১৬২৬৮)' : '24x7 Support (16268)'}
                  </span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <button
                onClick={() => handleAction(() => setCurrentModal('faq_modal'))}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs shadow-2xs shrink-0">
                    ❓
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {language === 'bn' ? 'বহুল জিজ্ঞাসিত প্রশ্ন (FAQ)' : 'FAQ'}
                  </span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Group 4: অ্যাকাউন্ট সার্ভিস (Account Service) */}
          <div className="w-full">
            <div className="bg-[#F2F2F2] px-3.5 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'অ্যাকাউন্ট সার্ভিস' : 'ACCOUNT SERVICE'}
            </div>

            <div className="divide-y divide-slate-100">
              <button
                onClick={() => handleAction(() => setCurrentModal('mnp_modal'))}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center text-xs shadow-2xs shrink-0">
                    📶
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {language === 'bn' ? 'MNP তথ্য আপডেট' : 'MNP Info Update'}
                  </span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <button
                onClick={() => handleAction(() => setCurrentModal('wheel_modal'))}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-yellow-400 text-blue-900 flex items-center justify-center text-xs shadow-2xs shrink-0 font-bold">
                    🎡
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {language === 'bn' ? 'রিকার্শন পে চাকা (লাকি হুইল)' : 'Recursion Pay Wheel'}
                  </span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <button
                onClick={() => handleAction(() => setCurrentModal('guardian_invite'))}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#0B4DA2] text-white flex items-center justify-center text-xs shadow-2xs shrink-0">
                    👨‍👩‍👦
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {language === 'bn' ? 'ট্রাস্টেড অভিভাবক' : 'Trusted Guardian'}
                    </span>
                    <span className="text-[9.5px] text-slate-500 truncate block">
                      {language === 'bn' ? 'জরুরি সতর্কতায় পরিবার যুক্ত' : 'Family emergency alert'}
                    </span>
                  </div>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Group 5: নীতিমালা (Policies) */}
          <div className="w-full">
            <div className="bg-[#F2F2F2] px-3.5 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'নীতিমালা' : 'POLICIES'}
            </div>

            <div className="divide-y divide-slate-100">
              <button
                onClick={() => handleAction(() => setCurrentModal('terms_modal'))}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-300 text-amber-900 flex items-center justify-center text-xs shadow-2xs shrink-0">
                    📄
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {language === 'bn' ? 'শর্তাবলী ও গোপনীয়তা' : 'Terms & Privacy Policy'}
                  </span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
