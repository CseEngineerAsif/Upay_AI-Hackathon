import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SectionId, SECTIONS_DATA, FeatureTab } from '../../types/sections';

interface SectionHubScreenProps {
  sectionId: SectionId;
  onBack: () => void;
  onSelectFeature: (tab: FeatureTab) => void;
}

export const SectionHubScreen: React.FC<SectionHubScreenProps> = ({
  sectionId,
  onBack,
  onSelectFeature
}) => {
  const { language } = useAppStore();
  const section = SECTIONS_DATA[sectionId] || SECTIONS_DATA.fraud_prevention;

  return (
    <div className="w-full flex-1 flex flex-col bg-[#F4F5F7] overflow-y-auto no-scrollbar pb-24 select-none">
      {/* 1. Yellow/Gold Header with Back Arrow and Section Title */}
      <header className="w-full bg-[#FFD600] px-4 pt-4 pb-4 select-none shadow-xs border-b border-amber-300 sticky top-0 z-20">
        <div className="flex items-center justify-between gap-3">
          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-xs active:scale-90 transition-transform cursor-pointer shrink-0 border border-amber-300"
            aria-label="Back to Home"
          >
            <svg
              className="w-5 h-5 text-slate-900"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Title & Badge */}
          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-base font-black text-slate-950 truncate tracking-tight flex items-center justify-center gap-1.5">
              <span>{section.iconBadge}</span>
              <span>{language === 'bn' ? section.titleBn : section.titleEn}</span>
            </h1>
            <p className="text-[11px] text-slate-800 font-semibold truncate">
              {language === 'bn' ? 'উপায় প্ল্যাটফর্ম সেবা' : 'Upay Platform Service'}
            </p>
          </div>

          {/* Quick Home action */}
          <button
            type="button"
            onClick={onBack}
            className="px-2.5 py-1 rounded-full bg-slate-900/10 hover:bg-slate-900/15 text-slate-950 font-bold text-xs shrink-0 cursor-pointer active:scale-95 transition-all"
          >
            {language === 'bn' ? 'হোম' : 'Home'}
          </button>
        </div>
      </header>

      {/* 2. Full Blue Hero Banner (Min-height 96-110px, unclipped, normal flow) */}
      <div className="w-full min-h-[100px] h-auto shrink-0 bg-gradient-to-r from-[#0B4DA2] via-[#0D3872] to-[#1F4FB5] text-white px-4 py-5 shadow-md relative">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl border border-white/20 shrink-0">
            {section.iconBadge}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <h1 className="text-[19px] font-black text-white tracking-tight leading-tight">
                {language === 'bn' ? section.titleBn : section.titleEn}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#FFD600] text-slate-950 text-[10px] font-black uppercase tracking-wide shrink-0">
                UPAY SUITE
              </span>
            </div>
            <p className="text-xs text-blue-100 font-medium leading-snug mt-1">
              {language === 'bn' ? section.subtitleBn : section.subtitleEn}
            </p>
            {(section.taglineBn || section.taglineEn) && (
              <p className="text-xs text-yellow-300 font-bold tracking-wide mt-1.5">
                {language === 'bn' ? section.taglineBn : section.taglineEn}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Section Feature Cards List */}
      <div className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {language === 'bn' ? 'উপলব্ধ ফিচারসমূহ' : 'Available Features'}
          </span>
          <span className="text-[11px] font-bold text-slate-400">
            {section.features.length} {language === 'bn' ? 'টি ফিচার' : 'features'}
          </span>
        </div>

        {section.features.map((feature) => (
          <div
            key={feature.id}
            onClick={() => onSelectFeature(feature.tab)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectFeature(feature.tab);
              }
            }}
            className="w-full bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/90 flex items-center justify-between gap-3.5 hover:border-[#1F4FB5]/50 hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer group text-left"
          >
            {/* Feature Icon */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-2xs shrink-0 group-hover:scale-105 transition-transform ${feature.iconBg}`}
            >
              <span>{feature.icon}</span>
            </div>

            {/* Title & Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-black text-slate-900 tracking-tight group-hover:text-[#1F4FB5] transition-colors">
                  {language === 'bn' ? feature.titleBn : feature.titleEn}
                </h3>
                {feature.badgeBn && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-[#1F4FB5] border border-blue-200/70 text-[9px] font-black uppercase">
                    {language === 'bn' ? feature.badgeBn : feature.badgeEn}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium leading-snug mt-1 line-clamp-2">
                {language === 'bn' ? feature.descBn : feature.descEn}
              </p>
            </div>

            {/* Royal Blue (#1F4FB5) Primary Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectFeature(feature.tab);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#1F4FB5] hover:bg-[#183f94] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>{language === 'bn' ? 'প্রবেশ' : 'Open'}</span>
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* 4. Safety & Help Footer Note */}
      <div className="px-6 pt-4 text-center">
        <p className="text-[11px] text-slate-400 font-medium">
          {language === 'bn'
            ? 'উপায় নিরাপদ লেনদেন ও সার্বিক সহায়তায় সবসময় আপনার পাশে'
            : 'Upay is always by your side for secure payments and total protection'}
        </p>
      </div>
    </div>
  );
};
