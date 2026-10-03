import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UpayLogo, CustomKeypad } from '../brand/UpayIcons';
import { DEFAULT_DEMO_USER } from '../../utils/accountManager';

interface LoginScreenProps {
  onBack?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBack }) => {
  const { language, setLanguage, loginWithPin, loginWithBiometric, user, registeredUsers, switchUser } = useAppStore();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [customPhoneInput, setCustomPhoneInput] = useState('');

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg('');
    }
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const handleSubmit = async () => {
    if (pin.length < 4) {
      setErrorMsg(language === 'bn' ? 'দয়া করে ৪ ডিজিটের পিন লিখুন' : 'Please enter 4 digits PIN');
      return;
    }

    setIsVerifying(true);
    const success = await loginWithPin(pin, user?.phone);
    setIsVerifying(false);

    if (!success) {
      setErrorMsg(
        user?.id === DEFAULT_DEMO_USER.id
          ? (language === 'bn' ? 'সঠিক পিন প্রদান করুন (ডেমো পিন: 1234)' : 'Incorrect PIN (Demo PIN: 1234)')
          : (language === 'bn' ? 'এই অ্যাকাউন্টের পিন সঠিক নয়' : 'Incorrect PIN for this account')
      );
      setPin('');
    }
  };

  const handleBiometric = async () => {
    setIsVerifying(true);
    await loginWithBiometric();
    setIsVerifying(false);
  };

  const quickFillDemoPin = () => {
    if (user?.id === DEFAULT_DEMO_USER.id) {
      setPin('1234');
      setErrorMsg('');
    }
  };

  const handleSelectAccount = (phone: string) => {
    switchUser(phone);
    setPin('');
    setErrorMsg('');
    setShowAccountSwitcher(false);
  };

  const handleCustomPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customPhoneInput.replace(/\D/g, '');
    if (cleaned.length < 11) {
      setErrorMsg(language === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন' : 'Enter valid 11-digit mobile number');
      return;
    }
    const switched = switchUser(cleaned);
    if (!switched) {
      setErrorMsg(language === 'bn' ? 'এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে রেজিস্ট্রেশন করুন।' : 'No account found for this number. Please register.');
    } else {
      setPin('');
      setErrorMsg('');
      setShowAccountSwitcher(false);
      setCustomPhoneInput('');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-white select-none overflow-hidden">
      {/* Top Header */}
      <div className="pt-4 px-5 pb-1 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 -ml-2 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Back"
            >
              <svg className="w-5 h-5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <UpayLogo size="sm" showText={true} />
        </div>

        {/* Language Toggle Pill */}
        <button
          onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
          className="px-4 py-1 rounded-full text-xs font-semibold border border-sky-200 text-[#0B4DA2] bg-sky-50/70 hover:bg-sky-100 transition-colors shadow-2xs"
        >
          {language === 'bn' ? 'English' : 'বাংলা'}
        </button>
      </div>

      {/* Main Body - scrollable if screen is short */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-1 overflow-y-auto no-scrollbar">
        {/* User preview with Switch Account option */}
        <div className="mb-2 text-center">
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            {language === 'bn' ? 'স্বাগতম' : 'Welcome'}
          </p>
          <p className="text-sm sm:text-base font-extrabold text-slate-800">
            {user?.name || (language === 'bn' ? 'ব্যবহারকারী' : 'User')}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="text-xs text-slate-600 font-mono font-semibold">
              {user?.phone || '01XXXXXXXXX'}
            </span>
            {registeredUsers.length > 1 && (
              <button
                type="button"
                onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
                className="text-[10px] text-[#0B4DA2] font-bold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                {language === 'bn' ? 'পরিবর্তন ▾' : 'Switch ▾'}
              </button>
            )}
          </div>
        </div>

        {/* Account Switcher dropdown if requested */}
        {showAccountSwitcher && (
          <div className="w-full max-w-xs mb-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-lg space-y-2 animate-scale-in">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b pb-1">
              <span>{language === 'bn' ? 'অ্যাকাউন্ট নির্বাচন করুন' : 'Select Account'}</span>
              <button
                type="button"
                onClick={() => setShowAccountSwitcher(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 no-scrollbar">
              {registeredUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectAccount(u.phone)}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-colors ${
                    u.id === user?.id
                      ? 'bg-[#FFD600]/30 border border-[#FFD600] font-bold'
                      : 'bg-white hover:bg-slate-100 border border-slate-100'
                  }`}
                >
                  <div className="truncate">
                    <p className="text-xs text-slate-900 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{u.phone}</p>
                  </div>
                  {u.id === user?.id && <span className="text-xs text-emerald-600 font-bold">✓</span>}
                </button>
              ))}
            </div>

            {/* Custom Phone Number Switch */}
            <form onSubmit={handleCustomPhoneSubmit} className="pt-1.5 border-t border-slate-200 flex gap-1.5">
              <input
                type="tel"
                value={customPhoneInput}
                onChange={(e) => setCustomPhoneInput(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#0B4DA2] text-white text-xs font-bold rounded-lg"
              >
                {language === 'bn' ? 'খুঁজুন' : 'Find'}
              </button>
            </form>
          </div>
        )}

        {/* Heading matching screenshot */}
        <h1 className="text-lg sm:text-xl font-black text-slate-900 text-center tracking-tight mb-3">
          {language === 'bn' ? 'আপনার ৪ ডিজিটের পিন প্রদান করুন' : 'Enter your 4-digit PIN'}
        </h1>

        {/* PIN Pill & Arrow Button */}
        <div className="flex items-center justify-center gap-2.5 mb-2.5">
          <div className="w-44 h-11 rounded-full bg-[#E5E9F2] flex items-center justify-evenly px-4 shadow-inner">
            {[0, 1, 2, 3].map((index) => {
              const filled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    filled
                      ? 'bg-[#0B4DA2] scale-110'
                      : 'bg-[#98A8C6]'
                  }`}
                />
              );
            })}
          </div>

          {/* Circular Blue Arrow button */}
          <button
            onClick={handleSubmit}
            disabled={pin.length < 4 || isVerifying}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              pin.length === 4
                ? 'bg-[#0B4DA2] text-white shadow-md active:scale-95'
                : 'bg-[#A3B8D8] text-white/80 cursor-not-allowed'
            }`}
            aria-label="Submit PIN"
          >
            <svg
              className="w-5 h-5 stroke-current"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <p className="text-xs font-semibold text-rose-600 mb-2 animate-shake text-center max-w-xs">
            {errorMsg}
          </p>
        )}

        {/* Biometric Face / Fingerprint Button */}
        <div className="flex items-center justify-center my-1.5">
          <button
            onClick={handleBiometric}
            disabled={isVerifying}
            className="flex flex-col items-center gap-1 text-slate-700 active:scale-95 transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl border-2 border-[#1B5EB8]/60 flex items-center justify-center text-[#0B4DA2] group-hover:bg-sky-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M7 3H5a2 2 0 00-2 2v2m0 10v2a2 2 0 002 2h2m10 0h2a2 2 0 002-2v-2m0-10V5a2 2 0 00-2-2h-2" />
                <path d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                <circle cx="12" cy="12" r="1" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-slate-700">
              {language === 'bn' ? 'ফিঙ্গারপ্রিন্ট' : 'Biometric'}
            </span>
          </button>
        </div>

        {/* Forgot PIN / Demo PIN Link */}
        {user?.id === DEFAULT_DEMO_USER.id ? (
          <button
            onClick={quickFillDemoPin}
            className="mt-2 text-xs font-semibold text-[#0B4DA2] hover:underline"
          >
            {language === 'bn' ? 'পিন ভুলে গিয়েছেন? (ডেমো পিন 1234)' : 'Forgot PIN? (Use demo PIN 1234)'}
          </button>
        ) : (
          <p className="mt-2 text-[11px] text-slate-400">
            {language === 'bn' ? 'আপনার সেট করা ৪ ডিজিটের পিনটি দিন' : 'Enter your 4-digit secret PIN'}
          </p>
        )}
      </div>

      {/* Custom Fixed Numeric Keypad (Pinned to bottom) */}
      <div className="shrink-0 w-full">
        <CustomKeypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onSubmit={handleSubmit}
          submitDisabled={pin.length < 4 || isVerifying}
        />
      </div>
    </div>
  );
};

