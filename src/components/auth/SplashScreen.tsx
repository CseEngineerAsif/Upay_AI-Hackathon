import React, { useEffect, useRef, useState } from 'react';
import { UpayLogo } from '../brand/UpayIcons';

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState<number>(1400);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    if (pathRef.current) {
      try {
        const total = pathRef.current.getTotalLength();
        if (total > 0) {
          setPathLength(Math.ceil(total));
        }
      } catch (err) {
        // Fallback length is already set to 1400
      }
    }
    setIsMounted(true);

    // Timeout of animation length (~2.0s) + ~0.8s hold time
    const timer = setTimeout(() => {
      onFinish();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="relative w-full h-full min-h-[680px] bg-white flex flex-col items-center cursor-pointer overflow-hidden select-none"
    >
      <style>{`
        @keyframes splashDotAppear {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          70% {
            transform: scale(1.3);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes splashDrawLine {
          0% {
            stroke-dashoffset: var(--dash-len, 1400);
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes splashFadeInContent {
          0% {
            opacity: 0;
            transform: translate(-50%, calc(-50% + 6px));
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>

      {/* SVG Container for Royal Blue Circle & Sweeping Line */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 390 844"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Continuous single SVG path based on video:
            Starts at the left edge of the screen, sweeps across under the logo,
            curves up the right side of the circle, arches over the top to the left,
            curves down the left side, loops under the bottom, crosses, and ends at the dot on the right. */}
        <path
          ref={pathRef}
          d="M -10 520 C 75 515, 155 502, 230 490 C 280 480, 330 425, 330 355 C 330 280, 270 220, 195 220 C 120 220, 60 280, 60 355 C 60 430, 120 490, 195 490 C 270 490, 330 465, 352 432"
          stroke="#0B4EA2"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: isMounted ? 0 : pathLength,
            animation: isMounted
              ? 'splashDrawLine 1.85s cubic-bezier(0.25, 0.1, 0.25, 1) 0.15s forwards'
              : 'none',
            ['--dash-len' as any]: `${pathLength}px`
          }}
        />

        {/* Small terminal dot on the right side - pops in as the pen-drawing reaches the endpoint */}
        <circle
          cx="352"
          cy="432"
          r="3.5"
          fill="#0B4EA2"
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'center',
            opacity: 0,
            animation: isMounted ? 'splashDotAppear 0.25s ease-out 1.95s forwards' : 'none'
          }}
        />
      </svg>

      {/* Upay Logo & Safe AI Protected Pill - perfectly concentric inside the circle */}
      <div
        className="absolute z-10 flex flex-col items-center justify-center select-none pointer-events-none"
        style={{
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0,
          animation: isMounted ? 'splashFadeInContent 0.6s ease-out 0.1s forwards' : 'none'
        }}
      >
        {/* Upay Logo & উপায় Text */}
        <UpayLogo size="splash" showText={true} />

        {/* Safe AI Protected Pill (Exact styling and spacing from Image B) */}
        <div className="mt-6 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50/90 border border-slate-200/90 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-500 font-medium tracking-wide">
            Safe AI Protected
          </span>
        </div>
      </div>

      {/* Footer text from Image B */}
      <div className="absolute bottom-8 text-center text-xs text-slate-400">
        ইউসিবি ফিনটেক কোম্পানি লিমিটেড
      </div>
    </div>
  );
};
