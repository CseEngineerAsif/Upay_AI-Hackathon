import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { BanglaQRButton } from '../brand/UpayIcons';

export const BottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    language,
    setCurrentModal,
    unreadAlertCount,
    isSidePanelOpen,
    setSidePanelOpen
  } = useAppStore();

  return (
    <nav className="relative w-full bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around select-none z-30 shadow-lg">
      {/* 1. Home */}
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center py-1 flex-1 transition-colors ${
          activeTab === 'home' ? 'text-[#0B4DA2]' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        <span className="text-[11px] font-semibold mt-1">
          {language === 'bn' ? 'হোম' : 'Home'}
        </span>
      </button>

      {/* 2. Notifications (Replaces Somiti) */}
      <button
        type="button"
        onClick={() => setCurrentModal('notifications')}
        className="flex flex-col items-center justify-center py-1 flex-1 transition-colors relative cursor-pointer active:scale-95 text-slate-400 hover:text-[#0B4DA2]"
        aria-label={language === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}
      >
        <div className="relative">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
          </svg>
          {unreadAlertCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#00D492] text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
              {unreadAlertCount}
            </span>
          )}
        </div>
        <span className="text-[11px] font-semibold mt-1">
          {language === 'bn' ? 'নোটিফিকেশন' : 'Notification'}
        </span>
      </button>

      {/* 3. Center Raised Bangla QR Button */}
      <div className="flex-1 flex justify-center">
        <BanglaQRButton onClick={() => setCurrentModal('bangla_qr_scan')} />
      </div>

      {/* 4. History */}
      <button
        onClick={() => setActiveTab('history')}
        className={`flex flex-col items-center justify-center py-1 flex-1 transition-colors ${
          activeTab === 'history' ? 'text-[#0B4DA2]' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className="relative">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
          </svg>
        </div>
        <span className="text-[11px] font-semibold mt-1">
          {language === 'bn' ? 'হিস্টরি' : 'History'}
        </span>
      </button>

      {/* 5. Services (সার্ভিসেস) - Opens Left Sliding Drawer */}
      <button
        type="button"
        onClick={() => setSidePanelOpen(true)}
        className={`flex flex-col items-center justify-center py-1 flex-1 transition-colors relative cursor-pointer active:scale-95 ${
          isSidePanelOpen ? 'text-[#0B4DA2]' : 'text-slate-400 hover:text-slate-600'
        }`}
        aria-label={language === 'bn' ? 'সার্ভিসেস' : 'Services'}
      >
        <div className="relative">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <span className="text-[11px] font-semibold mt-1">
          {language === 'bn' ? 'সার্ভিসেস' : 'Services'}
        </span>
      </button>
    </nav>
  );
};
