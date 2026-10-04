import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/formatters';
import { RecursionPayLogo } from '../brand/UpayIcons';

export const UpayHeader: React.FC<{
  onOpenNotifications?: () => void;
  onOpenSmartServices?: () => void;
  onOpenMore?: () => void;
}> = ({ onOpenSmartServices, onOpenMore }) => {
  const { user, language, setMoreDrawerOpen, setSidePanelOpen } = useAppStore();
  const [showBalance, setShowBalance] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleBalance = () => {
    setIsAnimating(true);
    setShowBalance(prev => !prev);
    setTimeout(() => setIsAnimating(false), 250);

    if (!showBalance) {
      setTimeout(() => setShowBalance(false), 5000);
    }
  };

  const balance = user?.balance ?? 0;

  return (
    <header className="w-full bg-gradient-to-r from-[#0A346E] via-[#0B4DA2] to-[#135CB8] px-4 pt-4.5 pb-3.5 sm:pt-5 sm:pb-4 select-none border-b border-blue-400/20 shadow-[0_4px_24px_rgba(11,77,162,0.32)] shrink-0 z-30 text-white transition-all">
      <div className="flex items-center justify-between gap-2.5">
        {/* Left: Circular Modern Glass Logo & User Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => {
              if (onOpenSmartServices) onOpenSmartServices();
              else setSidePanelOpen(true);
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-sm flex items-center justify-center shrink-0 border border-white/80 ring-2 ring-[#00D492]/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={language === 'bn' ? 'স্মার্ট সার্ভিসেস স্লাইডিং মেনু' : 'Smart Services Menu'}
            aria-label="Services Menu"
          >
            <RecursionPayLogo size="sm" showText={false} />
          </button>

          <div className="min-w-0 max-w-[135px] sm:max-w-none">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-[15px] font-extrabold text-white truncate tracking-tight">
                {user?.name || (language === 'bn' ? 'ব্যবহারকারী' : 'User')}
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-sky-200/95 font-mono font-medium truncate flex items-center gap-1 mt-0.5">
              <span>{user?.phone || '01700-000000'}</span>
            </p>
          </div>
        </div>

        {/* Right: Smooth Hide/Show Balance Toggle Button & More Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Smooth Modern Mint Balance Pill */}
          <button
            type="button"
            onClick={toggleBalance}
            className={`h-9 sm:h-9.5 px-3.5 rounded-full bg-gradient-to-r from-[#00D492] via-[#00C787] to-[#00B478] text-slate-950 flex items-center justify-center gap-1.5 active:scale-95 transition-all duration-300 shadow-[0_4px_16px_rgba(0,212,146,0.38)] hover:shadow-[0_6px_20px_rgba(0,212,146,0.48)] border border-white/40 cursor-pointer backdrop-blur-md ${
              isAnimating ? 'scale-95' : 'scale-100'
            }`}
            aria-label="Toggle Balance"
          >
            {showBalance ? (
              <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                <svg className="w-3.5 h-3.5 text-slate-900 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <span className="text-xs sm:text-[13px] font-black tracking-tight text-slate-950 tabular-nums">
                  {formatCurrency(balance, language)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-950 shrink-0 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="text-xs font-black tracking-tight text-slate-950">
                  {language === 'bn' ? 'ব্যালেন্স দেখুন' : 'Tap for Balance'}
                </span>
              </div>
            )}
          </button>

          {/* More (আরো) Button replacing Notification */}
          <button
            type="button"
            onClick={() => {
              if (onOpenMore) onOpenMore();
              else setMoreDrawerOpen(true);
            }}
            className="h-9 sm:h-9.5 px-3.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 text-white border border-white/25 shadow-2xs backdrop-blur-sm cursor-pointer"
            aria-label={language === 'bn' ? 'আরো' : 'More'}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            <span className="text-xs sm:text-[13px] font-bold">{language === 'bn' ? 'আরো' : 'More'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
