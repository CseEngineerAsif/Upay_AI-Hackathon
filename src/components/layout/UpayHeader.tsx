import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/formatters';
import { RecursionPayLogo } from '../brand/UpayIcons';

export const UpayHeader: React.FC<{
  onOpenNotifications?: () => void;
  onOpenSmartServices?: () => void;
  onOpenMore?: () => void;
}> = ({ onOpenNotifications }) => {
  const { user, language, unreadAlertCount, setCurrentModal } = useAppStore();
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
    <header className="w-full bg-gradient-to-r from-[#0A346E] via-[#0B4DA2] to-[#135CB8] px-3.5 pt-3.5 pb-3 select-none border-b border-blue-400/20 shadow-[0_4px_20px_rgba(11,77,162,0.28)] shrink-0 z-30 text-white">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Circular Modern Glass Logo & User Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/95 backdrop-blur-md p-1 shadow-sm flex items-center justify-center shrink-0 border border-white/80 ring-2 ring-[#00D492]/50">
            <RecursionPayLogo size="sm" showText={false} />
          </div>

          <div className="min-w-0 max-w-[130px] sm:max-w-none">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold text-white truncate tracking-tight">
                {user?.name || (language === 'bn' ? 'ব্যবহারকারী' : 'User')}
              </h2>
            </div>
            <p className="text-[10.5px] sm:text-xs text-sky-200/90 font-mono font-medium truncate flex items-center gap-1">
              <span>{user?.phone || '01700-000000'}</span>
            </p>
          </div>
        </div>

        {/* Right: Smooth Hide/Show Balance Toggle Button & Notification Bell */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Smooth Modern Mint Balance Pill */}
          <button
            type="button"
            onClick={toggleBalance}
            className={`h-8.5 px-3 rounded-full bg-gradient-to-r from-[#00D492] via-[#00C787] to-[#00B478] text-slate-950 flex items-center justify-center gap-1.5 active:scale-95 transition-all duration-300 shadow-[0_4px_16px_rgba(0,212,146,0.38)] hover:shadow-[0_6px_20px_rgba(0,212,146,0.48)] border border-white/40 cursor-pointer backdrop-blur-md ${
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
                <span className="text-xs font-black tracking-tight text-slate-950 tabular-nums">
                  {formatCurrency(balance, language)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-950 shrink-0 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="text-[11.5px] font-black tracking-tight text-slate-950">
                  {language === 'bn' ? 'ব্যালেন্স দেখুন' : 'Tap for Balance'}
                </span>
              </div>
            )}
          </button>

          {/* Notification Bell with Modern Glass Style */}
          <button
            type="button"
            onClick={() => {
              if (onOpenNotifications) onOpenNotifications();
              else setCurrentModal('notifications');
            }}
            className="relative w-8.5 h-8.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 transition-all flex items-center justify-center text-white border border-white/25 shadow-2xs backdrop-blur-sm cursor-pointer"
            aria-label="Notifications"
          >
            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
            </svg>
            {unreadAlertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#00D492] text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-[#0B4DA2] shadow-xs animate-bounce">
                {unreadAlertCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
