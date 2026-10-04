import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FeatureTab } from '../../types/sections';

interface SmartServicesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DrawerFeatureItem {
  id: string;
  tab: FeatureTab;
  titleBn: string;
  titleEn: string;
  badgeBn: string;
  badgeEn: string;
  descBn: string;
  descEn: string;
  icon: string;
  iconBg: string;
}

interface DrawerSection {
  id: string;
  titleBn: string;
  titleEn: string;
  icon: string;
  features: DrawerFeatureItem[];
}

const SMART_SECTIONS: DrawerSection[] = [
  {
    id: 'fraud_prevention',
    titleBn: 'প্রতারণা প্রতিরোধ',
    titleEn: 'Fraud Prevention',
    icon: '🛡️',
    features: [
      {
        id: 'crosswallet',
        tab: 'crosswallet',
        titleBn: 'ক্রস-ওয়ালেট',
        titleEn: 'Cross-Wallet',
        badgeBn: 'রিস্ক এক্সচেঞ্জ',
        badgeEn: 'Risk Exchange',
        descBn: 'ক্রস-ওয়ালেট রিস্ক এক্সচেঞ্জ',
        descEn: 'Cross-wallet federated risk exchange',
        icon: '🌐',
        iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      },
      {
        id: 'trustpay',
        tab: 'trustpay',
        titleBn: 'ট্রাস্টপে',
        titleEn: 'TrustPay',
        badgeBn: 'এসক্রো',
        badgeEn: 'Escrow',
        descBn: 'এসক্রো + সেলার ট্রাস্ট ব্যাজ',
        descEn: 'Escrow + Seller trust badges',
        icon: '🤝',
        iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }
    ]
  },
  {
    id: 'agent_cash',
    titleBn: 'এজেন্ট ও ক্যাশ',
    titleEn: 'Agent & Cash',
    icon: '🏧',
    features: [
      {
        id: 'liquidity',
        tab: 'liquidity',
        titleBn: 'লিকুইডিটি',
        titleEn: 'Liquidity',
        badgeBn: 'ক্যাশ স্লট',
        badgeEn: 'Cash Slot',
        descBn: 'ক্যাশ স্লট বুকিং + এজেন্ট ফ্লোট এক্সচেঞ্জ',
        descEn: 'Cash slot booking + agent float exchange',
        icon: '⚡',
        iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      },
      {
        id: 'fee_auditor',
        tab: 'fee_auditor',
        titleBn: 'ফি অডিটর',
        titleEn: 'Fee Auditor',
        badgeBn: 'ওভারচার্জ রাডার',
        badgeEn: 'Radar',
        descBn: 'এজেন্ট ওভারচার্জ রাডার',
        descEn: 'Agent overcharge detection radar',
        icon: '⚖️',
        iconBg: 'bg-blue-50 text-blue-700 border-blue-200'
      }
    ]
  },
  {
    id: 'savings_somiti',
    titleBn: 'সঞ্চয় ও সমিতি',
    titleEn: 'Savings & Somiti',
    icon: '👥',
    features: [
      {
        id: 'somiti',
        tab: 'somiti',
        titleBn: 'ডিজিটাল সমিতি',
        titleEn: 'Digital Somiti',
        badgeBn: 'AI সমিতি',
        badgeEn: 'AI Somiti',
        descBn: 'বিশ্বস্ত গ্রুপ ওয়ালেট ও ডিজিটাল সমিতি',
        descEn: 'Collaborative ROSCA savings circle',
        icon: '👥',
        iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      }
    ]
  },
  {
    id: 'zakat_giving',
    titleBn: 'যাকাত ও দান',
    titleEn: 'Zakat & Giving',
    icon: '🌙',
    features: [
      {
        id: 'zakat_calculator',
        tab: 'zakat_calculator',
        titleBn: 'যাকাত ক্যালকুলেটর',
        titleEn: 'Zakat Calculator',
        badgeBn: '২.৫% নেসাব',
        badgeEn: '2.5% Nisab',
        descBn: 'সঠিক হিসাব ও নেসাব নির্দেশিকা',
        descEn: 'Accurate Shariah Zakat calculation',
        icon: '🌙',
        iconBg: 'bg-amber-50 text-amber-700 border-amber-200'
      },
      {
        id: 'zakat_charities',
        tab: 'zakat_charities',
        titleBn: 'দান (যাচাইকৃত প্রতিষ্ঠান)',
        titleEn: 'Charity Giving',
        badgeBn: 'যাচাইকৃত',
        badgeEn: 'Verified',
        descBn: 'যাচাইকৃত প্রতিষ্ঠানে সরাসরি দান',
        descEn: 'Donate directly to verified charities',
        icon: '🤲',
        iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }
    ]
  },
  {
    id: 'eid_envelopes',
    titleBn: 'ঈদ খাম',
    titleEn: 'Eid Envelopes',
    icon: '🎁',
    features: [
      {
        id: 'eid_envelope',
        tab: 'eid_envelope',
        titleBn: 'ডিজিটাল সালামি / ঈদ খাম',
        titleEn: 'Digital Salami / Eid Gift',
        badgeBn: 'ঈদ সালামি',
        badgeEn: 'Eid Salami',
        descBn: 'ডিজিটাল ঈদ খাম ও সালামি বিতরণ',
        descEn: 'Send digital Eid envelopes with greetings',
        icon: '💌',
        iconBg: 'bg-rose-50 text-rose-700 border-rose-200'
      },
      {
        id: 'child_wallet',
        tab: 'child_wallet',
        titleBn: 'শিশুদের ওয়ালেট (অভিভাবকের নিয়ন্ত্রণে)',
        titleEn: 'Child Wallet Controls',
        badgeBn: 'প্যারেন্টাল কন্ট্রোল',
        badgeEn: 'Parental',
        descBn: 'অভিভাবক নিয়ন্ত্রিত খরচ সীমা ও লেনদেন',
        descEn: 'Parental controls & spending limits',
        icon: '🧒',
        iconBg: 'bg-teal-50 text-teal-700 border-teal-200'
      }
    ]
  },
  {
    id: 'smart_payment',
    titleBn: 'স্মার্ট পেমেন্ট',
    titleEn: 'Smart Payment',
    icon: '⚡',
    features: [
      {
        id: 'mandate_wallet',
        tab: 'mandate_wallet',
        titleBn: 'ম্যান্ডেট পে (অটো বিল পেমেন্ট)',
        titleEn: 'Mandate Pay (Auto Bill)',
        badgeBn: 'অটো বিল',
        badgeEn: 'Auto Bill',
        descBn: 'শর্তযুক্ত স্বয়ংক্রিয় বিল পেমেন্ট',
        descEn: 'AI conditional automatic payments',
        icon: '📜',
        iconBg: 'bg-cyan-50 text-cyan-800 border-cyan-200'
      },
      {
        id: 'dialect_voice',
        tab: 'dialect_voice',
        titleBn: 'ভয়েস পে (আঞ্চলিক ভাষা-সচেতন)',
        titleEn: 'Voice Pay (Dialect-aware)',
        badgeBn: 'আঞ্চলিক ভাষা',
        badgeEn: 'Dialect',
        descBn: 'চাটগাঁইয়া, সিলেটি ও অন্যান্য উপভাষায় পেমেন্ট',
        descEn: 'Natural regional Bangla voice transactions',
        icon: '🎙️',
        iconBg: 'bg-blue-50 text-blue-900 border-blue-200'
      },
      {
        id: 'bundle_optimizer',
        tab: 'bundle_optimizer',
        titleBn: 'বান্ডেল অপটিমাইজার',
        titleEn: 'Bundle Optimizer',
        badgeBn: 'টেলকো প্যাক',
        badgeEn: 'Telco Pack',
        descBn: 'ব্যবহারের ধরনে সবচেয়ে কম খরচের প্যাক',
        descEn: 'AI mobile recharge bundle optimization',
        icon: '📶',
        iconBg: 'bg-indigo-50 text-indigo-800 border-indigo-200'
      }
    ]
  },
  {
    id: 'income_workers',
    titleBn: 'আয় ও কর্মজীবী',
    titleEn: 'Income & Workers',
    icon: '👷',
    features: [
      {
        id: 'payslip_orchestrator',
        tab: 'payslip_orchestrator',
        titleBn: 'পে-স্লিপ ওয়েজ (দৈনিক হাজিরা ও মজুরি)',
        titleEn: 'Payslip Wage (Daily Attendance)',
        badgeBn: 'মজুরি অডিট',
        badgeEn: 'Wage Audit',
        descBn: 'দৈনিক হাজিরা ও মজুরি, বেতন দিনে ক্যাশ-আউট',
        descEn: 'Daily worker attendance, wage audit & staggered cashout',
        icon: '👔',
        iconBg: 'bg-emerald-50 text-emerald-900 border-emerald-200'
      },
      {
        id: 'income_passport',
        tab: 'income_passport',
        titleBn: 'ইনকাম পাসপোর্ট (ক্রেডিট ও উপার্জনের প্রমাণ)',
        titleEn: 'Income Passport (Credit Proof)',
        badgeBn: 'ইনকাম প্রমাণ',
        badgeEn: 'Income Proof',
        descBn: 'স্টেটমেন্ট ছাড়া আয়ের নির্ভরযোগ্য প্রমাণ',
        descEn: 'Zero-statement portable income verification',
        icon: '🛂',
        iconBg: 'bg-teal-50 text-teal-800 border-teal-200'
      }
    ]
  },
  {
    id: 'disaster_support',
    titleBn: 'দুর্যোগ সহায়তা',
    titleEn: 'Disaster Support',
    icon: '🌦️',
    features: [
      {
        id: 'climateshield',
        tab: 'climateshield',
        titleBn: 'ক্লাইমেট শিল্ড (প্যারামেট্রিক বন্যা/ঝড় সুরক্ষা)',
        titleEn: 'Climate Shield (Parametric Relief)',
        badgeBn: 'জরুরি ত্রাণ',
        badgeEn: 'Disaster Relief',
        descBn: 'বন্যা ও ঝড়ে জরুরি ওয়ালেট ও ত্রাণ বিতরণ',
        descEn: 'Parametric flood & storm disaster relief',
        icon: '🌊',
        iconBg: 'bg-rose-50 text-rose-700 border-rose-200'
      }
    ]
  }
];

export const SmartServicesDrawer: React.FC<SmartServicesDrawerProps> = ({ isOpen, onClose }) => {
  const { language, setActiveTab } = useAppStore();
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
      // Small timeout to trigger transition
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key and Android/Browser back button
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Push a state for back-button trap
    try {
      window.history.pushState({ drawer: 'smart_services' }, '');
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
      if (window.history.state?.drawer === 'smart_services') {
        window.history.back();
      }
    };
  }, [isOpen, handleClose]);

  // Touch swipe to close (swipe right for a right drawer)
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
    if (touchDeltaXRef.current > 60) {
      handleClose();
    }
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  };

  const handleSelectFeature = (tab: FeatureTab) => {
    handleClose();
    setActiveTab(tab);
  };

  if (!isRendered) return null;

  return (
    <div
      className="absolute inset-0 z-50 overflow-hidden select-none pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="রিকার্শন পে স্মার্ট সার্ভিস"
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
        className={`absolute right-0 top-0 bottom-0 w-[80%] max-w-[310px] h-full bg-slate-50 rounded-l-[28px] shadow-2xl flex flex-col overflow-hidden z-10 transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="w-full bg-gradient-to-r from-[#00D492] to-[#00B478] px-3.5 py-2.5 flex items-center justify-between border-b border-emerald-400 shadow-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-full bg-slate-900/10 flex items-center justify-center text-slate-950 text-xs font-black shrink-0">
              ⚡
            </span>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-slate-950 leading-tight truncate">
                {language === 'bn' ? 'রিকার্শন পে স্মার্ট সার্ভিস' : 'Recursion Pay Smart Services'}
              </h2>
              <p className="text-[10px] text-slate-800 font-semibold leading-tight truncate">
                {language === 'bn' ? 'নতুন ফিচারসমূহ (১৫টি)' : 'New Features (15 total)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-slate-950/10 hover:bg-slate-950/20 active:scale-90 transition-all flex items-center justify-center text-slate-950 cursor-pointer shrink-0 ml-1"
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

        {/* Panel Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3.5">
          {SMART_SECTIONS.map((sec) => (
            <div key={sec.id} className="space-y-2">
              {/* Section Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{sec.icon}</span>
                  <span className="text-xs font-black text-slate-800">
                    {language === 'bn' ? sec.titleBn : sec.titleEn}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                  {language === 'bn' ? `${sec.features.length}টি` : `${sec.features.length}`}
                </span>
              </div>

              {/* Feature Cards under this Section */}
              <div className="space-y-1.5">
                {sec.features.map((feat) => (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => handleSelectFeature(feat.tab)}
                    className="w-full bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-200 active:scale-[0.98] transition-all flex items-center justify-between gap-2.5 cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Pastel Rounded Square Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border text-base shadow-2xs ${feat.iconBg}`}
                      >
                        {feat.icon}
                      </div>

                      {/* Info & Badge */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-black text-slate-900 group-hover:text-[#0B4DA2] transition-colors leading-tight">
                            {language === 'bn' ? feat.titleBn : feat.titleEn}
                          </h4>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 leading-none">
                            {language === 'bn' ? feat.badgeBn : feat.badgeEn}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-snug line-clamp-1 mt-0.5">
                          {language === 'bn' ? feat.descBn : feat.descEn}
                        </p>
                      </div>
                    </div>

                    {/* Chevron Icon */}
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 group-hover:text-[#0B4DA2] group-hover:translate-x-0.5 transition-all shrink-0">
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Panel Footer */}
        <div className="p-3 bg-slate-100/90 border-t border-slate-200 text-center shrink-0">
          <p className="text-[10px] text-slate-600 font-medium leading-tight">
            {language === 'bn'
              ? 'রিকার্শন পে নিরাপদ লেনদেন ও সার্বিক সহায়তায় সবসময় আপনার পাশে'
              : 'Recursion Pay is always by your side for safe & smart transactions'}
          </p>
        </div>
      </div>
    </div>
  );
};
