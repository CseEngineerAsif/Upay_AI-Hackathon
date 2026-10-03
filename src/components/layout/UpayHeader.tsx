import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency } from '../../utils/formatters';
import { UpayLogo } from '../brand/UpayIcons';

export const UpayHeader: React.FC<{
  onOpenNotifications?: () => void;
  onOpenSmartServices?: () => void;
  onOpenMore?: () => void;
}> = ({ onOpenNotifications, onOpenMore }) => {
  const { user, language, unreadAlertCount, setCurrentModal, isMoreDrawerOpen, setMoreDrawerOpen } = useAppStore();
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

        {/* Right: Balance Pill & More Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Balance Pill */}
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

          {/* More (আরো) Button in Header (Opens Sliding Bar) */}
          <button
            type="button"
            onClick={() => {
              if (onOpenMore) onOpenMore();
              else setMoreDrawerOpen(!isMoreDrawerOpen);
            }}
            aria-label={language === 'bn' ? 'আরো' : 'More'}
            title={language === 'bn' ? 'আরো' : 'More'}
            className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
              isMoreDrawerOpen
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-900 bg-black/5 hover:bg-black/10 border border-amber-400/80'
            }`}
          >
            <div className="flex items-center gap-0.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
