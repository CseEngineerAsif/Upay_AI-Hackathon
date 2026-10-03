import React from 'react';
import { useAppStore } from '../../store/useAppStore';

export const MoreScreen: React.FC = () => {
  const {
    language,
    setLanguage,
    simpleMode,
    toggleSimpleMode,
    logout,
    setCurrentModal
  } = useAppStore();

  const handleLangToggle = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-white overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Top Header matching screenshot 1.jpeg */}
      <div className="px-5 pt-6 pb-3 border-b border-slate-100 flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#0B4DA2] tracking-tight">
          {language === 'bn' ? 'আরো' : 'More'}
        </h1>
        <button
          onClick={logout}
          className="text-xs font-semibold text-rose-600 px-3 py-1 rounded-full border border-rose-200 hover:bg-rose-50 transition-colors"
        >
          {language === 'bn' ? 'লগআউট' : 'Logout'}
        </button>
      </div>

      {/* Group 1: সেটিংস (Settings) */}
      <div className="w-full">
        <div className="bg-[#F2F2F2] px-5 py-2 text-xs font-bold text-slate-500 tracking-wide">
          {language === 'bn' ? 'সেটিংস' : 'SETTINGS'}
        </div>

        <div className="divide-y divide-slate-100">
          {/* Change PIN */}
          <button
            onClick={() => setCurrentModal('change_pin')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-white flex items-center justify-center text-sm shadow-2xs">
                🔒
              </div>
              <span className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'পিন পরিবর্তন' : 'Change PIN'}
              </span>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Change Language */}
          <button
            onClick={handleLangToggle}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-sm shadow-2xs">
                💬
              </div>
              <span className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'ভাষা পরিবর্তন (বাংলা / English)' : 'Change Language (বাংলা / English)'}
              </span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#0B4DA2]">
              {language === 'bn' ? 'বাংলা' : 'English'}
            </span>
          </button>

          {/* Simple Mode (Accessibility for elderly/vulnerable) */}
          <div className="px-5 py-3 flex items-center justify-between bg-sky-50/50">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-[#0B4DA2] text-white flex items-center justify-center text-sm shadow-2xs">
                👓
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">
                  {language === 'bn' ? 'সহজ মোড (Simple Mode)' : 'Simple Mode (High Contrast)'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'বড় ফন্ট ও সহজ ভাষা' : 'Larger text & simplified copy'}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={simpleMode}
              onChange={toggleSimpleMode}
              className="w-5 h-5 accent-[#0B4DA2] cursor-pointer"
            />
          </div>

          {/* Permissions */}
          <button
            onClick={() => setCurrentModal('permissions_modal')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm shadow-2xs">
                📱
              </div>
              <span className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'অনুমতি পরিবর্তন ও এআই সম্মতি' : 'Permissions & AI Consent'}
              </span>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Group 2: সেফ এআই অ্যাডভান্সড ড্যাশবোর্ড (Safe AI Advanced) */}
      <div className="w-full">
        <div className="bg-[#F2F2F2] px-5 py-2 text-xs font-bold text-[#0B4DA2] tracking-wide flex items-center gap-1.5">
          <span>🛡️</span>
          <span>{language === 'bn' ? 'সেফ এআই ইন্টেলিজেন্স ও অ্যাডমিন' : 'SAFE AI & ADMIN'}</span>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Analyst Dashboard */}
          <button
            onClick={() => setCurrentModal('analyst_dashboard')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm shadow-2xs">
                📊
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">
                  {language === 'bn' ? 'অ্যানালিস্ট ড্যাশবোর্ড (রিস্ক কিউ)' : 'Analyst Queue Dashboard'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'সন্দেহজনক ফ্ল্যাগড লেনদেন পর্যালোচনা' : 'Review & Escalate flagged transactions'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Admin Monitoring & Fairness */}
          <button
            onClick={() => setCurrentModal('admin_monitoring')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm shadow-2xs">
                📈
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">
                  {language === 'bn' ? 'মডেল মনিটরিং ও ফেয়ারনেস ভিউ' : 'Model Monitoring & Fairness'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'প্রিসিশন, রিকল, সেভ হওয়া ৳ ও লেটেন্সি' : 'Precision, Recall, ৳ Saved & Fairness'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Group 3: উপায় সাপোর্ট (Upay Support) */}
      <div className="w-full">
        <div className="bg-[#F2F2F2] px-5 py-2 text-xs font-bold text-slate-500 tracking-wide">
          {language === 'bn' ? 'উপায় সাপোর্ট' : 'UPAY SUPPORT'}
        </div>

        <div className="divide-y divide-slate-100">
          <button
            onClick={() => setCurrentModal('support_247')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center text-sm shadow-2xs">
                🎧
              </div>
              <span className="text-sm font-bold text-slate-800">
                {language === 'bn' ? '২৪x৭ সেবা (১৬২৬৮)' : '24x7 Support (16268)'}
              </span>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentModal('faq_modal')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm shadow-2xs">
                ❓
              </div>
              <span className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'বহুল জিজ্ঞাসিত প্রশ্ন' : 'Frequently Asked Questions'}
              </span>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Group 4: অ্যাকাউন্ট সার্ভিস (Account Service) */}
      <div className="w-full">
        <div className="bg-[#F2F2F2] px-5 py-2 text-xs font-bold text-slate-500 tracking-wide">
          {language === 'bn' ? 'অ্যাকাউন্ট সার্ভিস' : 'ACCOUNT SERVICE'}
        </div>

        <div className="divide-y divide-slate-100">
          <button
            onClick={() => setCurrentModal('mnp_modal')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center text-sm shadow-2xs">
                📶
              </div>
              <span className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'MNP তথ্য আপডেট' : 'MNP Info Update'}
              </span>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentModal('wheel_modal')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-yellow-400 text-blue-900 flex items-center justify-center text-sm shadow-2xs">
                🎡
              </div>
              <span className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'উপায় চাকা (লাকি হুইল)' : 'Upay Wheel'}
              </span>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentModal('guardian_invite')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-[#0B4DA2] text-white flex items-center justify-center text-sm shadow-2xs">
                👨‍👩‍👦
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">
                  {language === 'bn' ? 'ট্রাস্টেড অভিভাবক (Trusted Guardian)' : 'Trusted Guardian'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'পরিবারের সদস্যকে জরুরি সতর্কতায় যুক্ত করুন' : 'Invite family for high-risk alert verification'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Group 5: নীতিমালা (Policies) */}
      <div className="w-full">
        <div className="bg-[#F2F2F2] px-5 py-2 text-xs font-bold text-slate-500 tracking-wide">
          {language === 'bn' ? 'নীতিমালা' : 'POLICIES'}
        </div>

        <div className="divide-y divide-slate-100">
          <button
            onClick={() => setCurrentModal('terms_modal')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-300 text-amber-900 flex items-center justify-center text-sm shadow-2xs">
                📄
              </div>
              <span className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'শর্তাবলী ও গোপনীয়তা' : 'Terms & Privacy Policy'}
              </span>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
