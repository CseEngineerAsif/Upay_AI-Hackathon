import React, { useEffect, useState, useRef } from 'react';

interface AIVerificationLoadingProps {
  isRiskCheckComplete: boolean;
  onFinish: () => void;
  language?: 'bn' | 'en';
}

const VERIFICATION_STEPS = [
  { id: 1, textBn: 'প্রাপকের তথ্য যাচাই', textEn: 'Verifying recipient details' },
  { id: 2, textBn: 'লেনদেনের ধরন ও পরিমাণ বিশ্লেষণ', textEn: 'Analyzing transaction type & amount' },
  { id: 3, textBn: 'ডিভাইস ও সময় পরীক্ষা', textEn: 'Checking device & time telemetry' },
  { id: 4, textBn: 'ঝুঁকি স্কোর তৈরি', textEn: 'Generating AI risk score' }
];

export const AIVerificationLoading: React.FC<AIVerificationLoadingProps> = ({
  isRiskCheckComplete,
  onFinish,
  language = 'bn'
}) => {
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [hasTriggeredFinish, setHasTriggeredFinish] = useState<boolean>(false);
  const finishCallbackRef = useRef(onFinish);
  finishCallbackRef.current = onFinish;

  // Step 1 ticks at 500ms
  // Step 2 ticks at 1000ms
  // Step 3 ticks at 1500ms
  // Step 4 ticks at 2000ms (if real risk check complete, or when it completes)
  useEffect(() => {
    const t1 = setTimeout(() => {
      setCompletedSteps((prev) => Math.max(prev, 1));
    }, 500);

    const t2 = setTimeout(() => {
      setCompletedSteps((prev) => Math.max(prev, 2));
    }, 1000);

    const t3 = setTimeout(() => {
      setCompletedSteps((prev) => Math.max(prev, 3));
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Check Step 4 completion (requires minimum 2000ms AND isRiskCheckComplete to be true)
  useEffect(() => {
    if (completedSteps < 3) return;

    // Minimum 2000ms timer
    const t4 = setTimeout(() => {
      if (isRiskCheckComplete && !hasTriggeredFinish) {
        setCompletedSteps(4);
        setHasTriggeredFinish(true);
        // Small delay to allow user to see the 4th green checkmark
        setTimeout(() => {
          finishCallbackRef.current();
        }, 300);
      }
    }, 500); // 1500ms + 500ms = 2000ms total

    return () => clearTimeout(t4);
  }, [completedSteps, isRiskCheckComplete, hasTriggeredFinish]);

  // When isRiskCheckComplete becomes true after 2000ms
  useEffect(() => {
    if (completedSteps >= 3 && isRiskCheckComplete && !hasTriggeredFinish) {
      setCompletedSteps(4);
      setHasTriggeredFinish(true);
      setTimeout(() => {
        finishCallbackRef.current();
      }, 300);
    }
  }, [isRiskCheckComplete, completedSteps, hasTriggeredFinish]);

  // Active step is the next incomplete step
  const activeStep = Math.min(completedSteps + 1, 4);

  // Smooth progress calculation
  const getProgressPct = () => {
    switch (completedSteps) {
      case 0: return 15;
      case 1: return 40;
      case 2: return 65;
      case 3: return isRiskCheckComplete ? 95 : 85;
      case 4: return 100;
      default: return 15;
    }
  };

  return (
    <div className="py-10 px-4 flex flex-col items-center justify-center min-h-[460px] animate-fade-in select-none">
      {/* 1. Shield Icon with Glowing Concentric Rings and Scanning Arc */}
      <div className="relative flex items-center justify-center w-36 h-36 mb-2">
        {/* Outward pulsing royal blue ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[#1F4FB5]/20 animate-ping opacity-60" style={{ animationDuration: '2.4s' }} />

        {/* Concentric subtle yellow ring */}
        <div className="absolute inset-3 rounded-full border border-[#FFD21F]/60 animate-pulse" />

        {/* Rotating Scanning Arc */}
        <svg
          className="absolute inset-1 w-[136px] h-[136px] animate-spin pointer-events-none"
          style={{ animationDuration: '2.5s' }}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#1F4FB5"
            strokeWidth="3"
            strokeDasharray="55 235"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#FFD21F"
            strokeWidth="2.5"
            strokeDasharray="25 265"
            strokeDashoffset="-80"
            strokeLinecap="round"
          />
        </svg>

        {/* Center glowing circle */}
        <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 via-white to-blue-100/70 border border-blue-200/60 shadow-sm flex items-center justify-center">
          {/* Royal blue Shield with checkmark */}
          <svg className="w-10 h-10 text-[#1F4FB5] drop-shadow-xs" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* 2. Bold Bangla Title and Subtitle */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight text-center">
        {language === 'bn' ? 'সেফ এআই যাচাই করছে...' : 'Safe AI Verifying...'}
      </h3>
      <p className="text-xs text-slate-500 mt-1 text-center max-w-xs">
        {language === 'bn'
          ? 'আপনার লেনদেনটি নিরাপদ কিনা পরীক্ষা করা হচ্ছে'
          : 'Checking whether your transaction is secure'}
      </p>

      {/* 3. 4-Step Checklist Card */}
      <div className="w-full max-w-xs bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 mt-5 space-y-3">
        {VERIFICATION_STEPS.map((step) => {
          const isDone = completedSteps >= step.id;
          const isActive = activeStep === step.id && !isDone;

          return (
            <div key={step.id} className="flex items-center gap-3 text-xs">
              {isDone ? (
                /* Completed green check */
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs scale-100 transition-transform animate-scale-up">
                  ✓
                </div>
              ) : isActive ? (
                /* Active spinning loader */
                <div className="w-5 h-5 rounded-full border-2 border-[#1F4FB5] border-t-transparent animate-spin shrink-0" />
              ) : (
                /* Inactive pending circle */
                <div className="w-5 h-5 rounded-full border border-slate-200 shrink-0" />
              )}

              <span
                className={`transition-colors text-xs ${
                  isDone
                    ? 'font-semibold text-slate-800'
                    : isActive
                    ? 'font-bold text-[#1F4FB5]'
                    : 'text-slate-400'
                }`}
              >
                {language === 'bn' ? step.textBn : step.textEn}
              </span>
            </div>
          );
        })}

        {/* Thin blue progress bar at the bottom of the card */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-gradient-to-r from-[#1F4FB5] to-[#2563EB] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${getProgressPct()}%` }}
          />
        </div>
      </div>

      {/* 4. Small grey secure text at the bottom */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-5">
        <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
            clipRule="evenodd"
          />
        </svg>
        <span>
          {language === 'bn' ? 'আপনার তথ্য সুরক্ষিত আছে' : 'Your information is secured'}
        </span>
      </div>
    </div>
  );
};
