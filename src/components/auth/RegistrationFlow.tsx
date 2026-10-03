import React, { useState, useEffect, useRef } from 'react';
import { UpayLogo, CustomKeypad } from '../brand/UpayIcons';
import { useAppStore } from '../../store/useAppStore';
import { OperatorSelectionGrid } from '../brand/OperatorConfig';

interface RegistrationFlowProps {
  onBackToWelcome: () => void;
  onCompleteRegistration: () => void;
}

type RegistrationStep =
  | 'intro'
  | 'mobile'
  | 'otp'
  | 'nid_front'
  | 'nid_back'
  | 'profile'
  | 'status_modal'
  | 'pin_setup';

export const RegistrationFlow: React.FC<RegistrationFlowProps> = ({
  onBackToWelcome,
  onCompleteRegistration
}) => {
  const { language, setLanguage } = useAppStore();

  const [step, setStep] = useState<RegistrationStep>('intro');

  // Mobile Step State (Image 6)
  const [mobileNumber, setMobileNumber] = useState('01794809461');
  const [selectedOperator, setSelectedOperator] = useState('gp');
  const [referralCode, setReferralCode] = useState('');

  // OTP Step State (Image 7)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [showSmsBanner, setShowSmsBanner] = useState(false);

  // NID Camera Scan State (Images 8 & 9)
  const [cameraActive, setCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Profile Details State (Images 10 & 11)
  const [selectedProfession, setSelectedProfession] = useState('বিজনেস');
  const [selectedGender, setSelectedGender] = useState('পুরুষ');
  const [email, setEmail] = useState('');

  // Status Modal State (Images 12 & 13)
  const [verificationStatus, setVerificationStatus] = useState<'processing' | 'approved'>('processing');

  // PIN Setup State
  const [newPin, setNewPin] = useState('');


  // Profession list for Images 10 & 11
  const professions = [
    { id: 'biz', name: 'বিজনেস', icon: '👤' },
    { id: 'pvt', name: 'প্রাইভেট সার্ভিস', icon: '💼' },
    { id: 'govt', name: 'সরকারি চাকুরী', icon: '🏛️' },
    { id: 'home', name: 'গৃহিণী', icon: '👩‍👧' },
    { id: 'ngo', name: 'এন জি ও', icon: '🤝' },
    { id: 'farm', name: 'খামারি', icon: '🌾' },
    { id: 'doc', name: 'ডাক্তার', icon: '🩺' },
    { id: 'eng', name: 'ইঞ্জিনিয়ার', icon: '👷' },
    { id: 'law', name: 'আইনজীবী', icon: '⚖️' },
    { id: 'stu', name: 'শিক্ষার্থী', icon: '🎓' }
  ];

  // Trigger simulated OTP in Step 3
  useEffect(() => {
    if (step === 'otp') {
      setOtpDigits(['', '', '', '']);
      setShowSmsBanner(false);

      // Slide in simulated SMS banner
      const t1 = setTimeout(() => {
        setShowSmsBanner(true);
      }, 700);

      // Auto-fill OTP
      const t2 = setTimeout(() => {
        setOtpDigits(['7', '1', '8', '8']);
      }, 1900);

      // Auto-advance to NID front
      const t3 = setTimeout(() => {
        setStep('nid_front');
      }, 3100);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [step]);

  // Handle camera stream setup for NID scan steps
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 'nid_front' || step === 'nid_back') {
      setCameraActive(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' } })
          .then((s) => {
            stream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = s;
            }
          })
          .catch(() => {
            // Camera not allowed or not available, fallback view works gracefully
          });
      }
    } else {
      setCameraActive(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [step]);

  // Handle shutter capture
  const handleShutterCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      if (step === 'nid_front') {
        setStep('nid_back');
      } else if (step === 'nid_back') {
        setStep('profile');
      }
    }, 450);
  };

  // Status bottom sheet simulation
  useEffect(() => {
    if (step === 'status_modal') {
      setVerificationStatus('processing');
      const timer = setTimeout(() => {
        setVerificationStatus('approved');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // PIN keypad press
  const handlePinKey = (digit: string) => {
    if (newPin.length < 4) {
      setNewPin((prev) => prev + digit);
    }
  };

  const handlePinBackspace = () => {
    setNewPin((prev) => prev.slice(0, -1));
  };

  const handlePinSubmit = () => {
    if (newPin.length === 4) {
      onCompleteRegistration();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white select-none overflow-hidden font-sans">
      {/* ============================================================ */}
      {/* 1. STEP: INTRO "অ্যাকাউন্ট তৈরি করুন" (Image 5)              */}
      {/* ============================================================ */}
      {step === 'intro' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="w-full bg-[#FFD21F] px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBackToWelcome}
                className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-slate-900 hover:bg-black/10 transition-colors"
                aria-label="Back"
              >
                <svg className="w-6 h-6 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
              </h2>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 px-5 py-6 flex flex-col items-center justify-center overflow-y-auto no-scrollbar">
            {/* Top Illustration: Boy character with document & green checkmark */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-sky-50 flex items-center justify-center shadow-inner">
                <span className="text-5xl">🧑‍💼</span>
              </div>
              <div className="absolute -top-1 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-black shadow-md border-2 border-white">
                ✓
              </div>
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 text-center mb-6 leading-relaxed">
              {language === 'bn'
                ? '৩টি সহজ ধাপে আপনার রেজিস্ট্রেশন সম্পূর্ণ করুন'
                : 'Complete your registration in 3 simple steps'}
            </h3>

            {/* 3 Step Points (Target Image 5) */}
            <div className="w-full space-y-4 max-w-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1F4FB5] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFD21F]" />
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  {language === 'bn'
                    ? 'আপনার এন আইডি কার্ড এর সামনের এবং পেছন সাইডের ছবি তুলুন।'
                    : 'Take clear photos of the front and back of your NID card.'}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1F4FB5] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFD21F]" />
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  {language === 'bn'
                    ? 'স্ক্রীনে দেয়া নির্দেশনা অনুযায়ী সেলফি তুলুন।'
                    : 'Take a clear selfie following the on-screen instructions.'}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1F4FB5] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFD21F]" />
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  {language === 'bn'
                    ? 'আমরা আপনার তথ্য যাচাই করছি, এর মধ্যে কিছু প্রাথমিক তথ্য প্রদান করুন।'
                    : 'While we verify your details, provide some basic personal information.'}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Button */}
          <div className="p-5 shrink-0 bg-white">
            <button
              type="button"
              onClick={() => setStep('mobile')}
              className="w-full py-3.5 rounded-2xl bg-[#FFD21F] text-slate-950 font-black text-sm shadow-md shadow-amber-300/40 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center cursor-pointer"
            >
              {language === 'bn' ? 'এগিয়ে যান' : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. STEP: MOBILE NUMBER & OPERATOR (Image 6)                  */}
      {/* ============================================================ */}
      {step === 'mobile' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="w-full bg-[#FFD21F] px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('intro')}
                className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-slate-900 hover:bg-black/10 transition-colors"
                aria-label="Back"
              >
                <svg className="w-6 h-6 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="px-3 py-1 rounded-full text-xs font-semibold border border-sky-300 text-[#0B4DA2] bg-white/70 hover:bg-white transition-colors"
            >
              {language === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 px-5 py-4 overflow-y-auto no-scrollbar space-y-4">
            {/* Top brand */}
            <div className="flex items-center gap-2 mb-1">
              <UpayLogo size="sm" showText={false} />
              <h3 className="text-base font-extrabold text-slate-900">
                {language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              {language === 'bn'
                ? 'মোবাইল ব্যাংকিংয়ের সকল সুবিধা পেতে মোবাইল নম্বর দিয়ে উপায় অ্যাকাউন্ট তৈরি করুন'
                : 'Enter your mobile number to create your Upay mobile financial account'}
            </p>

            {/* Mobile Number Field */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
              </label>
              <div className="relative flex items-center">
                <input
                  type="tel"
                  maxLength={11}
                  value={mobileNumber}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setMobileNumber(cleaned);
                  }}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFD21F] text-sm"
                />
                <button
                  type="button"
                  className="absolute right-2.5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700"
                >
                  ➔
                </button>
              </div>
            </div>

            {/* Operator Selection (Target Image) */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-2">
                {language === 'bn' ? 'আপনার অপারেটর সিলেক্ট করুন' : 'Select Your Mobile Operator'}
              </label>

              <OperatorSelectionGrid
                selectedId={selectedOperator}
                onSelect={(op) => setSelectedOperator(op.id)}
              />
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                {language === 'bn' ? 'রেফারেল কোড (ঐচ্ছিক)' : 'Referral Code (Optional)'}
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="XXXXXX"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFD21F] text-sm"
                />
                <button
                  type="button"
                  className="absolute right-2.5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700"
                >
                  ➔
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Button */}
          <div className="p-5 shrink-0 bg-white border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep('otp')}
              className="w-full py-3.5 rounded-2xl bg-[#FFD21F] text-slate-950 font-black text-sm shadow-md shadow-amber-300/40 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center cursor-pointer"
            >
              {language === 'bn' ? 'আপনার নম্বর যাচাই করুন' : 'Verify Your Mobile Number'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. STEP: OTP SCREEN WITH AUTO-FILL (Image 7)                 */}
      {/* ============================================================ */}
      {step === 'otp' && (
        <div className="relative flex-1 flex flex-col justify-between overflow-hidden bg-white animate-fade-in">
          {/* Simulated Floating SMS Notification (matching Image 7 top) */}
          <div
            className={`absolute top-2 inset-x-3 z-30 transition-all duration-500 ease-out transform ${
              showSmsBanner ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'
            }`}
          >
            <div className="w-full bg-[#1F2937] text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFD21F] text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                👤
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Messages • upay • now</span>
                  <span>🔔</span>
                </div>
                <p className="font-semibold text-white mt-0.5">
                  <span className="text-[#FFD21F] font-bold">7188</span> is your One-Time-Password (OTP) for upay. Valid for 60 seconds.
                </p>
              </div>
            </div>
          </div>

          {/* Top Bar */}
          <div className="pt-4 px-5 pb-1 flex items-center justify-between shrink-0">
            <UpayLogo size="sm" showText={true} />
            <button
              type="button"
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="px-3 py-1 rounded-full text-xs font-semibold border border-sky-300 text-[#0B4DA2] bg-white"
            >
              {language === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-8">
            <h2 className="text-2xl font-black text-slate-900 text-center tracking-tight mb-3">
              {language === 'bn' ? 'ওয়ান টাইম পাসওয়ার্ড' : 'One Time Password'}
            </h2>
            <p className="text-xs text-slate-600 text-center max-w-xs mb-8">
              {language === 'bn'
                ? 'অনুগ্রহ করে আপনার ওয়ান টাইম পাসওয়ার্ড (OTP) এর জন্য অপেক্ষা করুন'
                : 'Please wait while your One Time Password (OTP) is processed'}
            </p>

            {/* 4 OTP Digit Boxes */}
            <div className="flex items-center justify-center gap-3 mb-10">
              {otpDigits.map((digit, idx) => (
                <div
                  key={idx}
                  className={`w-14 h-16 rounded-2xl flex items-center justify-center text-2xl font-black transition-all ${
                    digit
                      ? 'bg-blue-50 border-2 border-[#1F4FB5] text-[#1F4FB5] scale-105'
                      : 'bg-[#DDE2EB] border border-slate-200 text-transparent'
                  }`}
                >
                  {digit || '•'}
                </div>
              ))}
            </div>

            {/* Security Note at bottom */}
            <p className="text-[11px] text-slate-500 text-center leading-relaxed max-w-xs">
              <span className="font-bold text-[#1F4FB5]">
                {language === 'bn' ? 'নোট:' : 'Note:'}
              </span>{' '}
              {language === 'bn'
                ? 'একাউন্টের সিকিউরিটির কারনে ওটিপি টাইপ করতে পারবেন না। উপায় সিস্টেম থেকেই ওটিপি ইনপুট দিয়ে দেয়া হবে।'
                : 'For security reasons, OTP cannot be manually typed. The Upay system automatically verifies it.'}
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4 & 5. STEP: NID CAMERA SCAN FRONT & BACK (Images 8 & 9)     */}
      {/* ============================================================ */}
      {(step === 'nid_front' || step === 'nid_back') && (
        <div className="relative flex-1 flex flex-col justify-between bg-black text-white overflow-hidden animate-fade-in">
          {/* Flash Effect on capture */}
          {isCapturing && (
            <div className="absolute inset-0 z-50 bg-white animate-fade-in pointer-events-none" />
          )}

          {/* Top Bar with Note */}
          <div className="pt-4 px-4 flex items-center justify-between z-20">
            <button
              type="button"
              onClick={() => (step === 'nid_front' ? setStep('mobile') : setStep('nid_front'))}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white"
            >
              ←
            </button>
            <div className="text-[10px] bg-black/60 px-3 py-1 rounded-full text-amber-300 font-medium border border-amber-400/30">
              ডেমো মোড: কোনো তথ্য সংরক্ষণ করা হয় না
            </div>
            <div className="w-9" />
          </div>

          {/* Center Viewfinder with Dotted Yellow Frame */}
          <div className="relative flex-1 flex items-center justify-center px-6">
            {/* Live Video stream if supported */}
            {cameraActive && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            )}

            {/* Dotted Yellow Frame (Images 8 & 9) */}
            <div className="relative z-10 w-full aspect-[1.58] rounded-xl border-2 border-dashed border-[#FFD21F] shadow-2xl flex items-center justify-center">
              <div className="text-center text-white/50 text-xs font-semibold px-4 pointer-events-none">
                {step === 'nid_front'
                  ? 'এনআইডি এর সম্মুখভাগ ফ্রেমের মধ্যে রাখুন'
                  : 'এনআইডি এর পিছনের ভাগ ফ্রেমের মধ্যে রাখুন'}
              </div>
            </div>
          </div>

          {/* Bottom Card & Shutter */}
          <div className="relative z-20 p-5 space-y-4">
            {/* Instruction White Card (Images 8 & 9) */}
            <div className="bg-white text-slate-900 p-3.5 rounded-2xl shadow-lg flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  {step === 'nid_front' ? 'ন্যাশনাল আইডি কার্ড ফ্রন্ট পার্ট' : 'ন্যাশনাল আইডি কার্ড ব্যাক পার্ট'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-[200px]">
                  {step === 'nid_front'
                    ? 'ফ্রেমে এনআইডি এর সামনের দিকটি রাখুন এবং পরিষ্কার ছবি তুলুন'
                    : 'ফ্রেমে এনআইডি এর পেছনের দিকটি রাখুন এবং পরিষ্কার ছবি তুলুন'}
                </p>
              </div>

              {/* Sample NID Thumbnail */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-9 rounded bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[10px] font-bold text-emerald-800">
                  {step === 'nid_front' ? '🪪 NID' : '💳 BACK'}
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-0.5">
                  {step === 'nid_front' ? 'সম্মুখভাগ' : 'পিছন ভাগ'}
                </span>
              </div>
            </div>

            {/* Shutter Button & Demo Skip */}
            <div className="flex flex-col items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleShutterCapture}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                aria-label="Capture photo"
              >
                <div className="w-12 h-12 rounded-full bg-white" />
              </button>

              <button
                type="button"
                onClick={handleShutterCapture}
                className="text-[11px] text-[#FFD21F] underline font-semibold mt-1"
              >
                ডেমো ছবি ব্যবহার করুন ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. STEP: PROFILE DETAILS SCREEN (Images 10 & 11)              */}
      {/* ============================================================ */}
      {step === 'profile' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="w-full bg-[#FFD21F] px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('nid_back')}
                className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-slate-900 hover:bg-black/10 transition-colors"
                aria-label="Back"
              >
                <svg className="w-6 h-6 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
              </h2>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 px-4 py-3 overflow-y-auto no-scrollbar space-y-4">
            {/* Section 1: Profession Grid (10 items) */}
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-2">
                {language === 'bn' ? 'আপনার পেশা' : 'Your Profession'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {professions.map((p) => {
                  const isSelected = selectedProfession === p.name;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProfession(p.name)}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-[#FFD21F] border-[#FFD21F] text-slate-950 font-bold shadow-xs ring-2 ring-[#FFD21F]/30'
                          : 'bg-white border-slate-200 text-slate-700 shadow-2xs hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-base shadow-2xs">
                        {p.icon}
                      </div>
                      <span className="text-[11px] font-bold text-center leading-tight">
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Other Profession Pill */}
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs flex items-center justify-between">
                <span>{language === 'bn' ? 'উপরের তালিকায় না থাকলে আপনার পেশা টাই...' : 'Type if not in list...'}</span>
                <span>➔</span>
              </div>
            </div>

            {/* Section 2: Gender Selection */}
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-2">
                {language === 'bn' ? 'আপনার লিঙ্গ' : 'Your Gender'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['পুরুষ', 'নারী', 'অন্যান্য'].map((g) => {
                  const isSelected = selectedGender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGender(g)}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-[#FFD21F] border-[#FFD21F] text-slate-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
                      }`}
                    >
                      <span className="text-lg">{g === 'পুরুষ' ? '👨' : g === 'নারী' ? '👩' : '🧑'}</span>
                      <span className="text-xs font-bold">{g}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Email Address (Optional) */}
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                {language === 'bn' ? 'ইমেইল অ্যাড্রেস (অপশনাল)' : 'Email Address (Optional)'}
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs flex items-center justify-between">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="bg-transparent focus:outline-none w-full text-xs font-medium"
                />
                <span className="text-slate-400">➔</span>
              </div>
            </div>
          </div>

          {/* Bottom Button */}
          <div className="p-4 shrink-0 bg-white border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep('status_modal')}
              className="w-full py-3.5 rounded-2xl bg-[#FFD21F] text-slate-950 font-black text-sm shadow-md shadow-amber-300/40 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center cursor-pointer"
            >
              {language === 'bn' ? 'এগিয়ে যান' : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. STEP: VERIFICATION STATUS BOTTOM SHEET (Images 12 & 13)    */}
      {/* ============================================================ */}
      {step === 'status_modal' && (
        <div className="relative flex-1 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in z-50">
          <div className="w-full bg-white rounded-t-[32px] p-6 shadow-2xl flex flex-col items-center animate-slide-up">
            {/* Title */}
            <h3 className="text-base font-extrabold text-slate-900 text-center pb-3 border-b border-slate-100 w-full">
              {language === 'bn' ? 'অ্যাকাউন্ট ভেরিফিকেশন স্ট্যাটাস' : 'Account Verification Status'}
            </h3>

            {/* Content Body */}
            {verificationStatus === 'processing' ? (
              /* Processing State (Image 13) */
              <div className="py-6 flex flex-col items-center text-center space-y-4 animate-fade-in">
                {/* Illustration with clipboard */}
                <div className="w-20 h-20 rounded-2xl bg-sky-50 flex items-center justify-center border border-sky-200">
                  <span className="text-4xl">📋</span>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-extrabold text-slate-900">
                    {language === 'bn'
                      ? 'আপনার রেজিস্ট্রেশন রিকুয়েস্ট টি প্রক্রিয়াধীন।'
                      : 'Your registration request is being processed.'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {language === 'bn'
                      ? 'আপনাকে ৫ মিনিটের মধ্যে অবহিত করা হবে।'
                      : 'You will be notified within 5 minutes.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onBackToWelcome}
                  className="w-full max-w-xs py-3 rounded-2xl bg-[#B3D1FA] text-[#0B4DA2] font-black text-xs hover:bg-blue-200 transition-colors mt-2"
                >
                  {language === 'bn' ? 'অ্যাপ বন্ধ করুন' : 'Close App'}
                </button>
              </div>
            ) : (
              /* Approved Success State */
              <div className="py-6 flex flex-col items-center text-center space-y-4 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-4xl shadow-sm">
                  ✓
                </div>

                <div className="space-y-1">
                  <p className="text-base font-black text-slate-900">
                    {language === 'bn'
                      ? 'অভিনন্দন! আপনার অ্যাকাউন্ট ভেরিফিকেশন সম্পন্ন হয়েছে।'
                      : 'Congratulations! Your account verification is complete.'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {language === 'bn'
                      ? 'লেনদেন শুরু করতে একটি নতুন ৪ ডিজিটের পিন সেট করুন।'
                      : 'Please set your 4-digit PIN to start using Upay.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('pin_setup')}
                  className="w-full max-w-xs py-3.5 rounded-2xl bg-[#FFD21F] text-slate-950 font-black text-sm shadow-md shadow-amber-300/40 hover:brightness-105 active:scale-98 transition-all"
                >
                  {language === 'bn' ? 'পিন সেট করুন' : 'Set Up PIN'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. STEP: PIN SETUP SCREEN                                    */}
      {/* ============================================================ */}
      {step === 'pin_setup' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="w-full bg-[#FFD21F] px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {language === 'bn' ? 'নতুন পিন সেট করুন' : 'Set New PIN'}
              </h2>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 overflow-y-auto no-scrollbar">
            <h3 className="text-lg font-black text-slate-900 text-center tracking-tight mb-2">
              {language === 'bn' ? 'আপনার ৪ ডিজিটের পিন লিখুন' : 'Enter your new 4-digit PIN'}
            </h3>
            <p className="text-xs text-slate-500 text-center max-w-xs mb-6">
              {language === 'bn'
                ? 'এই পিনটি দিয়ে আপনি পরবর্তীতে উপায় অ্যাপে লগইন করতে পারবেন'
                : 'You will use this PIN to log in to your Upay account'}
            </p>

            {/* 4 PIN Dots */}
            <div className="w-44 h-11 rounded-full bg-[#E5E9F2] flex items-center justify-evenly px-4 shadow-inner mb-6">
              {[0, 1, 2, 3].map((index) => {
                const filled = newPin.length > index;
                return (
                  <div
                    key={index}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                      filled ? 'bg-[#0B4DA2] scale-110' : 'bg-[#98A8C6]'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Keypad */}
          <div className="shrink-0 w-full">
            <CustomKeypad
              onKeyPress={handlePinKey}
              onBackspace={handlePinBackspace}
              onSubmit={handlePinSubmit}
              submitDisabled={newPin.length < 4}
            />
          </div>
        </div>
      )}
    </div>
  );
};
