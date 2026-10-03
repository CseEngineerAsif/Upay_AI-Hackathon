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

      {/* 2. Digital Somiti (New Feature in Main Navigation) */}
      <button
        onClick={() => setActiveTab('somiti')}
        className={`flex flex-col items-center justify-center py-1 flex-1 transition-colors relative ${
          activeTab === 'somiti' ? 'text-[#0B4DA2]' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className="relative">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
          <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-[#FFD600] text-slate-950 text-[8px] font-black rounded-full leading-none">
            AI
          </span>
        </div>
        <span className="text-[11px] font-semibold mt-1">
          {language === 'bn' ? 'সমিতি' : 'Somiti'}
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
