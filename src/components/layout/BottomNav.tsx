import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { BanglaQRButton } from '../brand/UpayIcons';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, language, setCurrentModal } = useAppStore();

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

      {/* 2. Account */}
      <button
        onClick={() => setActiveTab('account')}
        className={`flex flex-col items-center justify-center py-1 flex-1 transition-colors ${
          activeTab === 'account' ? 'text-[#0B4DA2]' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 4h16V6H4v2zm0 10h16v-6H4v6z" />
        </svg>
        <span className="text-[11px] font-semibold mt-1">
          {language === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}
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

      {/* 5. More (আরো) */}
      <button
        onClick={() => setActiveTab('more')}
        className={`flex flex-col items-center justify-center py-1 flex-1 transition-colors ${
          activeTab === 'more' ? 'text-[#0B4DA2]' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className="flex items-center gap-0.5 justify-center h-5">
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        </div>
        <span className="text-[11px] font-semibold mt-1">
          {language === 'bn' ? 'আরো' : 'More'}
        </span>
      </button>
    </nav>
  );
};
