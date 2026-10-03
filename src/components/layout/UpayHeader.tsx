import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/formatters';
import { UpayLogo } from '../brand/UpayIcons';

export const UpayHeader: React.FC<{ onOpenNotifications?: () => void }> = ({ onOpenNotifications }) => {
  const { user, language, unreadAlertCount, setCurrentModal } = useAppStore();
  const [showBalance, setShowBalance] = useState(false);

  const toggleBalance = () => {
    setShowBalance(prev => !prev);
    if (!showBalance) {
      setTimeout(() => setShowBalance(false), 4500);
    }
  };

  const balance = user?.balance ?? 0;

  return (
    <header className="w-full bg-[#FFD600] px-4 pt-4 pb-4 select-none shadow-xs">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Circular Upay Logo & User Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-white p-1 shadow-xs flex items-center justify-center shrink-0 border border-amber-300">
            <UpayLogo size="sm" showText={false} />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 truncate tracking-tight">
              {user?.name || (language === 'bn' ? 'ব্যবহারকারী' : 'User')}
            </h2>
            <p className="text-xs text-slate-800 font-mono">
              {user?.phone || ''}
            </p>
          </div>
        </div>

        {/* Right: Balance Pill & Notification Bell */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Balance Pill from screenshot 2.jpeg */}
          <button
            onClick={toggleBalance}
            className="h-8 px-3.5 rounded-full bg-[#0B4DA2] text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
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

          {/* Bell Icon with badge */}
          <button
            onClick={() => {
              if (onOpenNotifications) onOpenNotifications();
              else setCurrentModal('notifications');
            }}
            className="relative w-8 h-8 rounded-full flex items-center justify-center text-slate-900 hover:bg-yellow-400/50 active:scale-90 transition-all"
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
