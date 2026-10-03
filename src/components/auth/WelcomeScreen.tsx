import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UpayLogo } from '../brand/UpayIcons';
import { useAppStore } from '../../store/useAppStore';

interface WelcomeScreenProps {
  onRegister: () => void;
  onLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onRegister, onLogin }) => {
  const { language, setLanguage, setCurrentModal } = useAppStore();
  
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Direction: 1 for forward (0 -> 1 -> 2 -> 3), -1 for backward (3 -> 2 -> 1 -> 0)
  const directionRef = useRef<1 | -1>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Gesture Tracking Refs
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const isHorizontalDragRef = useRef<boolean | null>(null);

  // Clear timer helper
  const clearAutoSlideTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start fresh 4-second auto-slide timer with ping-pong direction
  const startAutoSlideTimer = useCallback(() => {
    clearAutoSlideTimer();
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => {
        let dir = directionRef.current;
        if (prev <= 0) {
          dir = 1;
        } else if (prev >= 3) {
          dir = -1;
        }
        directionRef.current = dir;
        return prev + dir;
      });
    }, 4000);
  }, [clearAutoSlideTimer]);

  // Manage timer lifecycle based on dragging state
  useEffect(() => {
    if (!isDragging) {
      startAutoSlideTimer();
    } else {
      clearAutoSlideTimer();
    }
    return () => clearAutoSlideTimer();
  }, [isDragging, startAutoSlideTimer, clearAutoSlideTimer]);

  // Jump to specific dot
  const handleDotClick = (index: number) => {
    if (index === currentSlide) return;
    
    // Set direction based on jump
    if (index > currentSlide) {
      directionRef.current = index >= 3 ? -1 : 1;
    } else {
      directionRef.current = index <= 0 ? 1 : -1;
    }

    setCurrentSlide(index);
    setDragOffset(0);
    startAutoSlideTimer();
  };

  // Helper to calculate elastic drag offset
  const getElasticOffset = (deltaX: number, slideIdx: number) => {
    if (slideIdx === 0 && deltaX > 0) {
      // Elastic resistance on first slide swiping right
      return deltaX * 0.25;
    }
    if (slideIdx === 3 && deltaX < 0) {
      // Elastic resistance on last slide swiping left
      return deltaX * 0.25;
    }
    return deltaX;
  };

  // TOUCH GESTURE HANDLERS
  const handleTouchStart = (e: React.TouchEvent) => {
    clearAutoSlideTimer();
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    isHorizontalDragRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null || startYRef.current === null) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startXRef.current;
    const deltaY = currentY - startYRef.current;

    // Detect gesture orientation on initial movement
    if (isHorizontalDragRef.current === null) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        // Vertical scroll - let browser handle scrolling
        isHorizontalDragRef.current = false;
        return;
      }
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
        isHorizontalDragRef.current = true;
        setIsDragging(true);
      }
    }

    if (isHorizontalDragRef.current) {
      const boundedOffset = getElasticOffset(deltaX, currentSlide);
      setDragOffset(boundedOffset);
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalDragRef.current) {
      // Swipe threshold is 50px
      if (dragOffset < -50 && currentSlide < 3) {
        // Next slide
        const next = currentSlide + 1;
        if (next >= 3) directionRef.current = -1;
        setCurrentSlide(next);
      } else if (dragOffset > 50 && currentSlide > 0) {
        // Prev slide
        const prev = currentSlide - 1;
        if (prev <= 0) directionRef.current = 1;
        setCurrentSlide(prev);
      }
      // If threshold not met, elastic snap back occurs because dragOffset resets to 0
    }

    setDragOffset(0);
    setIsDragging(false);
    startXRef.current = null;
    startYRef.current = null;
    isHorizontalDragRef.current = null;
    startAutoSlideTimer();
  };

  // MOUSE GESTURE HANDLERS (for desktop testing & mouse drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    clearAutoSlideTimer();
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startXRef.current === null || !isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    const boundedOffset = getElasticOffset(deltaX, currentSlide);
    setDragOffset(boundedOffset);
  };

  const handleMouseUp = () => {
    if (isDragging && startXRef.current !== null) {
      if (dragOffset < -50 && currentSlide < 3) {
        const next = currentSlide + 1;
        if (next >= 3) directionRef.current = -1;
        setCurrentSlide(next);
      } else if (dragOffset > 50 && currentSlide > 0) {
        const prev = currentSlide - 1;
        if (prev <= 0) directionRef.current = 1;
        setCurrentSlide(prev);
      }
    }

    setDragOffset(0);
    setIsDragging(false);
    startXRef.current = null;
    startYRef.current = null;
    startAutoSlideTimer();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-white select-none overflow-hidden font-sans">
      {/* 1. TOP BAR: Logo and Language Toggle */}
      <div className="pt-4 px-5 pb-1 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2">
          <UpayLogo size="sm" showText={true} />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="px-4 py-1 rounded-full text-xs font-semibold border border-sky-200 text-[#0B4DA2] bg-sky-50/70 hover:bg-sky-100 transition-colors shadow-2xs cursor-pointer"
          >
            {language === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>
      </div>

      {/* 2. CAROUSEL BODY */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 py-1 overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-full max-w-[340px] overflow-hidden">
          {/* Track with responsive transform following finger when dragging & 0.4s ease-out when releasing */}
          <div
            className={`flex ${isDragging ? 'transition-none' : 'transition-transform duration-400 ease-out'}`}
            style={{
              transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`
            }}
          >
            {/* SLIDE 1 (Target Image 1): NID Scan + ৳200 Bonus */}
            <div className="w-full shrink-0 flex flex-col items-center px-1">
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2.5">
                {language === 'bn' ? 'রিকার্শন পে-তে' : 'In Recursion Pay'}
              </h2>

              <div className="relative w-full bg-white rounded-[28px] p-5 shadow-sm flex flex-col items-center overflow-hidden">
                {/* Dotted Border */}
                <div
                  className="absolute inset-0 rounded-[28px] pointer-events-none"
                  style={{
                    border: '3px dotted #FFD21F',
                    boxShadow: 'inset 0 0 0 1px rgba(31,79,181,0.2)'
                  }}
                />

                {/* NID Card & Avatar Illustration */}
                <div className="flex items-center justify-center gap-3 mt-1 mb-2">
                  <div className="w-28 h-18 rounded-lg bg-emerald-50 border border-emerald-300 p-1.5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-emerald-600" />
                      <div className="h-1 bg-slate-300 w-12 rounded-full" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-6 rounded bg-slate-200 flex items-center justify-center text-[10px]">
                        👤
                      </div>
                      <div className="space-y-1">
                        <div className="h-1 bg-slate-400 w-10 rounded-full" />
                        <div className="h-1 bg-slate-300 w-8 rounded-full" />
                        <div className="w-3.5 h-2.5 bg-amber-400 rounded-xs border border-amber-500" />
                      </div>
                    </div>
                  </div>

                  <div className="w-14 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center shadow-xs">
                    <span className="text-3xl">🧑‍💼</span>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-800 text-center mb-2.5">
                  {language === 'bn'
                    ? 'NID স্ক্যান ও চেহারা ভেরিফাই করে'
                    : 'Scan NID & verify face to get'}
                </p>

                <div className="w-full bg-[#0B4DA2] text-white text-center py-2 px-3 rounded-2xl font-black text-sm tracking-wide shadow-xs">
                  {language === 'bn' ? 'অ্যাকাউন্ট খুললেই পাচ্ছেন' : 'Opening Account Gives You'}
                </div>

                <div className="w-full bg-[#FFD21F] rounded-2xl p-2.5 mt-2 text-center shadow-xs">
                  <div className="text-4xl font-black text-[#0B4DA2] tracking-tighter">
                    {language === 'bn' ? '৳ ২০০*' : '৳ 200*'}
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 -mt-0.5">
                    {language === 'bn' ? 'পর্যন্ত' : 'Up to'}
                  </div>
                  <div className="inline-block bg-[#0B4DA2] text-white text-xs font-bold px-4 py-0.5 rounded-full mt-1">
                    {language === 'bn' ? 'বোনাস' : 'Bonus'}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 mt-2 font-medium">
                  {language === 'bn' ? '*শর্ত প্রযোজ্য' : '*Terms & Conditions Apply'}
                </span>
              </div>
            </div>

            {/* SLIDE 2 (Target Image 2): Requirements */}
            <div className="w-full shrink-0 flex flex-col items-center px-1">
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2.5">
                {language === 'bn' ? 'রিকার্শন পে' : 'Recursion Pay'}
              </h2>

              <div className="relative w-full bg-white rounded-[28px] p-5 shadow-sm flex flex-col items-center overflow-hidden">
                <div
                  className="absolute inset-0 rounded-[28px] pointer-events-none"
                  style={{
                    border: '3px dotted #FFD21F',
                    boxShadow: 'inset 0 0 0 1px rgba(31,79,181,0.2)'
                  }}
                />

                <div className="w-full bg-[#0B4DA2] text-white text-center py-2.5 px-3 rounded-2xl font-black text-sm tracking-wide shadow-xs mb-4">
                  {language === 'bn' ? 'অ্যাকাউন্ট খুলতে আপনার যা প্রয়োজন' : 'Requirements to Open Account'}
                </div>

                <div className="w-full space-y-3 px-2 pb-2">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0B4DA2] flex items-center justify-center font-bold text-sm shrink-0">
                      ✓
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-snug">
                      {language === 'bn' ? 'বয়স ১৮ বছর বা তার বেশি হতে হবে' : 'Must be 18 years or older'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0B4DA2] flex items-center justify-center text-base shrink-0">
                      🪪
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-snug">
                      {language === 'bn' ? 'জাতীয় পরিচয়পত্র থাকতে হবে' : 'Must hold valid National ID (NID)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pb-1">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0B4DA2] flex items-center justify-center text-base shrink-0">
                      📱
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-snug">
                      {language === 'bn'
                        ? 'সেলফি তোলার জন্য পর্যাপ্ত আলোযুক্ত স্থানে থাকতে হবে'
                        : 'Must be in a well-lit area for clear selfie verification'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SLIDE 3 (Target Image 3): Services Grid */}
            <div className="w-full shrink-0 flex flex-col items-center px-1">
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2.5">
                {language === 'bn' ? 'রিকার্শন পে আছে পাশে' : 'Recursion Pay Is Here'}
              </h2>

              <div className="relative w-full bg-white rounded-[28px] p-4 shadow-sm flex flex-col items-center overflow-hidden">
                <div
                  className="absolute inset-0 rounded-[28px] pointer-events-none"
                  style={{
                    border: '3px dotted #FFD21F',
                    boxShadow: 'inset 0 0 0 1px rgba(31,79,181,0.2)'
                  }}
                />

                <div className="w-full bg-[#0B4DA2] text-white text-center py-2 px-3 rounded-2xl font-black text-xs sm:text-sm tracking-wide shadow-xs mb-3">
                  {language === 'bn' ? 'সব ধরনের সার্ভিস নিয়ে শুধুমাত্র আপনার জন্য' : 'All MFS Services Crafted For You'}
                </div>

                <div className="w-full grid grid-cols-2 gap-2 p-1">
                  {[
                    { icon: '💳', nameBn: 'অ্যাড মানি', nameEn: 'Add Money' },
                    { icon: '📱', nameBn: 'মোবাইল রিচার্জ', nameEn: 'Mobile Recharge' },
                    { icon: '💳', nameBn: 'রিকার্শন পে কার্ড', nameEn: 'Recursion Pay Card' },
                    { icon: '🧾', nameBn: 'পে বিল', nameEn: 'Pay Bill' },
                    { icon: '💸', nameBn: 'সেন্ড মানি', nameEn: 'Send Money' },
                    { icon: '💰', nameBn: 'ডিপিএস', nameEn: 'DPS Savings' },
                    { icon: '🚦', nameBn: 'ট্রাফিক ফাইন', nameEn: 'Traffic Fine' },
                    { icon: '📲', nameBn: 'মেক পেমেন্ট', nameEn: 'Make Payment' }
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 shadow-2xs"
                    >
                      <span className="text-lg">{s.icon}</span>
                      <span className="text-[11px] font-bold text-slate-800 truncate">
                        {language === 'bn' ? s.nameBn : s.nameEn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SLIDE 4 (Target Image 4): Brand & Contact */}
            <div className="w-full shrink-0 flex flex-col items-center px-1">
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2.5">
                {language === 'bn' ? 'প্রতিদিনের লেনদেনে' : 'Everyday Financial Life'}
              </h2>

              <div className="relative w-full bg-white rounded-[28px] p-5 shadow-sm flex flex-col items-center overflow-hidden">
                <div
                  className="absolute inset-0 rounded-[28px] pointer-events-none"
                  style={{
                    border: '3px dotted #FFD21F',
                    boxShadow: 'inset 0 0 0 1px rgba(31,79,181,0.2)'
                  }}
                />

                <div className="my-2 flex flex-col items-center">
                  <UpayLogo size="lg" showText={true} />
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs font-bold text-slate-600">একটি</span>
                    <span className="text-xs font-black text-slate-900 tracking-wider">UCB</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    <span className="text-xs font-bold text-slate-600">প্রতিষ্ঠান</span>
                  </div>
                </div>

                <div className="w-full mt-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-center">
                  <p className="text-[11px] font-bold text-slate-700 mb-2">
                    {language === 'bn'
                      ? 'রিকার্শন পে সম্পর্কিত যেকোনো তথ্য জানতে'
                      : 'For any information about Recursion Pay'}
                  </p>
                  <div className="flex items-center justify-center rounded-full overflow-hidden border border-slate-200 shadow-2xs">
                    <div className="bg-[#FFD21F] px-4 py-1.5 text-xs font-black text-slate-900 flex items-center gap-1">
                      <span>📞</span> 16268
                    </div>
                    <div className="bg-[#1F4FB5] text-white px-4 py-1.5 text-xs font-bold">
                      www.recursionpay.com
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CAROUSEL DOTS */}
        <div className="flex items-center gap-2 mt-4">
          {[0, 1, 2, 3].map((dot) => (
            <button
              key={dot}
              type="button"
              onClick={() => handleDotClick(dot)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                currentSlide === dot
                  ? 'w-6 h-2 bg-[#0B4DA2]'
                  : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Slide ${dot + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 4. BOTTOM ACTION BUTTONS */}
      <div className="shrink-0 w-full px-5 pb-5 pt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onRegister}
          className="flex-1 py-3.5 rounded-2xl bg-[#0B4DA2] text-white font-extrabold text-sm shadow-md hover:bg-blue-900 active:scale-98 transition-all flex items-center justify-center cursor-pointer"
        >
          {language === 'bn' ? 'রেজিস্ট্রেশন' : 'Registration'}
        </button>

        <button
          type="button"
          onClick={onLogin}
          className="flex-1 py-3.5 rounded-2xl bg-[#FFD21F] text-slate-950 font-extrabold text-sm shadow-md shadow-amber-300/40 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center cursor-pointer"
        >
          {language === 'bn' ? 'লগ ইন' : 'Log In'}
        </button>
      </div>
    </div>
  );
};
