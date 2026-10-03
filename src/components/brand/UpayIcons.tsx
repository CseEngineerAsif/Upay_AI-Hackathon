import React from 'react';

// Exact Upay Logo matching screenshot 4.jpeg & 2.jpeg
export const UpayLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'splash'; showText?: boolean }> = ({
  size = 'md',
  showText = true
}) => {
  const getDims = () => {
    switch (size) {
      case 'sm':
        return { w: 32, h: 32, font: 'text-xs' };
      case 'lg':
        return { w: 56, h: 56, font: 'text-lg' };
      case 'splash':
        return { w: 96, h: 96, font: 'text-3xl' };
      default:
        return { w: 42, h: 42, font: 'text-sm' };
    }
  };

  const dims = getDims();

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <svg
        width={dims.w}
        height={dims.h}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xs"
      >
        {/* Left Yellow Figure (Head & Body curve) */}
        <circle cx="36" cy="28" r="12" fill="#FFD600" />
        <path
          d="M 24 45 C 24 68, 38 80, 50 80 C 44 72, 38 60, 48 45 Z"
          fill="#FFD600"
        />

        {/* Right Blue Figure (Head & Body curve) */}
        <circle cx="64" cy="28" r="12" fill="#0B4DA2" />
        <path
          d="M 76 45 C 76 68, 62 80, 50 80 C 56 72, 62 60, 52 45 Z"
          fill="#0B4DA2"
        />
      </svg>
      {showText && (
        <span
          className={`font-black tracking-tight text-slate-800 ${dims.font} -mt-1`}
          style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
        >
          উপায়
        </span>
      )}
    </div>
  );
};

// Center raised Bangla QR button from screenshot 1.jpeg & 2.jpeg
export const BanglaQRButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Bangla QR Pay"
      className="relative -top-5 flex flex-col items-center justify-center transition-transform active:scale-95 group focus:outline-none"
    >
      <div className="w-16 h-16 rounded-full bg-white p-1 shadow-lg ring-4 ring-slate-100 flex items-center justify-center border-2 border-[#0B4DA2]">
        <div className="w-full h-full rounded-full border border-sky-300 flex flex-col items-center justify-center bg-white">
          <span className="text-[7px] font-extrabold tracking-tighter text-red-600 uppercase">
            BANGLA
          </span>
          {/* Stylized QR icon */}
          <svg className="w-6 h-6 text-[#0B4DA2]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h3v3h-3v-3zm-5 0h3v1h-1v2h-2v-3zm2 4h1v2h-1v-2zm2 0h2v2h-2v-2zm-2-2h2v1h-2v-1z" />
          </svg>
          <span className="text-[7px] font-extrabold tracking-tighter text-[#0B4DA2] uppercase">
            QR
          </span>
        </div>
      </div>
    </button>
  );
};

// On-screen numeric keypad matching Target Image 1 (3x4 grid)
export const CustomKeypad: React.FC<{
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
}> = ({ onKeyPress, onBackspace, onSubmit, submitDisabled }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full bg-[#F4F6F9] px-3.5 py-2.5 sm:px-4 sm:py-3 select-none border-t border-slate-200/80">
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-sm mx-auto">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onKeyPress(k)}
            className="h-[52px] sm:h-14 rounded-[14px] bg-white shadow-xs border border-slate-200/60 flex items-center justify-center text-2xl font-bold text-slate-800 active:bg-slate-100 active:scale-95 transition-all"
          >
            {k}
          </button>
        ))}

        {/* Backspace Key (white with backspace icon) */}
        <button
          type="button"
          onClick={onBackspace}
          className="h-[52px] sm:h-14 rounded-[14px] bg-white shadow-xs border border-slate-200/60 flex items-center justify-center text-slate-800 active:bg-slate-100 active:scale-95 transition-all"
          aria-label="Backspace"
        >
          <svg
            className="w-6 h-6 stroke-slate-800"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>

        {/* 0 Key */}
        <button
          type="button"
          onClick={() => onKeyPress('0')}
          className="h-[52px] sm:h-14 rounded-[14px] bg-white shadow-xs border border-slate-200/60 flex items-center justify-center text-2xl font-bold text-slate-800 active:bg-slate-100 active:scale-95 transition-all"
        >
          0
        </button>

        {/* Yellow Check/Confirm Key (Image 1: #FFD21F with dark checkmark) */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitDisabled}
          className={`h-[52px] sm:h-14 rounded-[14px] flex items-center justify-center transition-all ${
            submitDisabled
              ? 'bg-[#FFE885] opacity-50 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-[#FFD21F] text-slate-950 shadow-md shadow-amber-300/40 active:scale-95 hover:brightness-105 cursor-pointer'
          }`}
          aria-label="Confirm PIN"
        >
          <svg
            className="w-7 h-7 text-slate-950 stroke-current"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
