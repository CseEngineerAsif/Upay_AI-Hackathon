import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/formatters';
import { UpayLogo } from '../brand/UpayIcons';

export const UpayHeader: React.FC<{
  onOpenNotifications?: () => void;
  onOpenSmartServices?: () => void;
}> = ({ onOpenNotifications, onOpenSmartServices }) => {
  const { user, language, unreadAlertCount, setCurrentModal, setSidePanelOpen } = useAppStore();
  const [showBalance, setShowBalance] = useState(false);

  const toggleBalance = () => {
    setShowBalance(prev => !prev);
    if (!showBalance) {
      setTimeout(() => setShowBalance(false), 4500);
    }
  };

  const balance = user?.balance ?? 0;

  return (
    <header className="w-full bg-[#FFD600] px-3.5 pt-4 pb-3.5 select-none shadow-xs">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Circular Upay Logo & User Info (Truncated if tight) */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white p-1 shadow-xs flex items-center justify-center shrink-0 border border-amber-300">
            <UpayLogo size="sm" showText={false} />
          </div>

          <div className="min-w-0 max-w-[105px] sm:max-w-none">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate tracking-tight">
              {user?.name || (language === 'bn' ? 'ব্যবহারকারী' : 'User')}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-800 font-mono truncate">
              {user?.phone || ''}
            </p>
          </div>
        </div>

        {/* Right: Balance Pill, Smart Services Button & Notification Bell */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Balance Pill from screenshot 2.jpeg */}
          <button
            onClick={toggleBalance}
            className="h-8 px-2.5 sm:px-3.5 rounded-full bg-[#0B4DA2] text-white flex items-center justify-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer"
            aria-label="Toggle Balance"
          >
            {showBalance ? (
              <span className="text-xs font-bold tracking-wide animate-fade-in">
                {formatCurrency(balance, language)}
              </span>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-yellow-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="text-xs font-semibold">
                  {language === 'bn' ? 'ব্যালেন্স' : 'Balance'}
                </span>
              </>
            )}
          </button>

          {/* New Smart Services Button (Immediately to the LEFT of the Bell icon) */}
          <button
            type="button"
            onClick={() => {
              if (onOpenSmartServices) onOpenSmartServices();
              else setSidePanelOpen(true);
            }}
            aria-label="নতুন সার্ভিস"
            title={language === 'bn' ? 'নতুন সার্ভিস' : 'New Smart Services'}
            className="relative w-8 h-8 rounded-full flex items-center justify-center text-slate-900 bg-black/5 hover:bg-black/10 active:scale-90 transition-all border border-amber-400/80 cursor-pointer"
          >
            {/* Sparkle / Smart Grid icon */}
            <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
            {/* Tiny red "নতুন" dot on top-right corner */}
            <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-rose-600 text-white rounded-full text-[7px] font-black leading-none shadow-xs border border-white">
              {language === 'bn' ? 'নতুন' : 'NEW'}
            </span>
          </button>

          {/* Bell Icon with badge */}
          <button
            onClick={() => {
              if (onOpenNotifications) onOpenNotifications();
              else setCurrentModal('notifications');
            }}
            className="relative w-8 h-8 rounded-full flex items-center justify-center text-slate-900 hover:bg-yellow-400/50 active:scale-90 transition-all cursor-pointer"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
            </svg>
            {unreadAlertCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
