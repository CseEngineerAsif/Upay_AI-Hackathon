import React from 'react';
import { useAppStore } from '../../store/useAppStore';

export const MoreScreen: React.FC = () => {
  const {
    language,
    setLanguage,
    simpleMode,
    toggleSimpleMode,
    logout,
    setCurrentModal,
    setActiveTab
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
          {/* Digital Somiti */}
          <button
            onClick={() => setActiveTab('somiti')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors bg-indigo-50/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-[#0B4DA2] text-white flex items-center justify-center text-sm shadow-2xs">
                👥
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-800">
                    {language === 'bn' ? 'ডিজিটাল সমিতি (Digital Somiti)' : 'Digital Somiti'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 font-black text-[9px] rounded-full">
                    NEW
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'নিরাপদ গ্রুপ ওয়ালেট ও এআই সঞ্চয় সার্কেল' : 'Group Savings Circles & Fair Payout Escrow'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* TrustPay F-Commerce Escrow */}
          <button
            onClick={() => setActiveTab('trustpay')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors bg-emerald-50/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-sm shadow-2xs">
                🤝
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-800">
                    {language === 'bn' ? 'ট্রাস্টপে (TrustPay Escrow)' : 'TrustPay Escrow'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 font-black text-[9px] rounded-full">
                    NEW
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'F-Commerce এসক্রো ও এআই সেলার ট্রাস্ট ব্যাজ' : 'F-Commerce Escrow & AI Seller Trust Badge'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Liquidity Network (Cash Reservation & Float Exchange) */}
          <button
            onClick={() => setActiveTab('liquidity')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors bg-cyan-50/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center text-sm shadow-2xs">
                ⚡
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-800">
                    {language === 'bn' ? 'লিকুইডিটি নেটওয়ার্ক (Liquidity Network)' : 'Liquidity Network'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 font-black text-[9px] rounded-full">
                    NEW
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'ক্যাশ রিজার্ভেশন স্লট ও এজেন্ট ফ্লোট এক্সচেঞ্জ' : 'Cash Slot Reservation & Agent Float Exchange'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Cross-Wallet Federated Risk Exchange */}
          <button
            onClick={() => setActiveTab('crosswallet')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors bg-indigo-50/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-800 text-white flex items-center justify-center text-sm shadow-2xs">
                🌐
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-800">
                    {language === 'bn' ? 'ক্রস-ওয়ালেট রিস্ক এক্সচেঞ্জ' : 'Cross-Wallet Risk Exchange'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 font-black text-[9px] rounded-full">
                    AI FEDERATED
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'বহু-এমএফএস যৌথ ফ্রড রিং ডিটেকশন (গোপনীয়তা অক্ষুণ্ণ)' : 'Joint Multi-MFS Fraud Ring Detection (Federated Learning)'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Climate Shield Mode */}
          <button
            onClick={() => setActiveTab('climateshield')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors bg-rose-50/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-rose-700 text-white flex items-center justify-center text-sm shadow-2xs">
                🌊
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-800">
                    {language === 'bn' ? 'ক্লাইমেট শিল্ড মোড (Climate Shield)' : 'Climate Shield Mode'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 font-black text-[9px] rounded-full">
                    DISASTER RELIEF
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'বন্যা ও ঘূর্ণিঝড় দুর্যোগে জরুরি ওয়ালেট, ফ্লোট ও সরকারি ত্রাণ' : 'Emergency low-bandwidth wallet, float surge & relief panel'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Portable Income Passport */}
          <button
            onClick={() => setActiveTab('income_passport')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors bg-emerald-50/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center text-sm shadow-2xs">
                🛂
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-800">
                    {language === 'bn' ? 'পোর্টেবল ইনকাম পাসপোর্ট' : 'Portable Income Passport'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 font-black text-[9px] rounded-full">
                    NEW
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'স্টেটমেন্ট ছাড়া আয়ের নির্ভরযোগ্যতা ও নিয়মিততার প্রমাণ' : 'Verified Income Regularity Proof for Rent & Microloans'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Fee Auditor & Overcharge Radar */}
          <button
            onClick={() => setActiveTab('fee_auditor')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors bg-blue-50/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center text-sm shadow-2xs">
                ⚖️
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-800">
                    {language === 'bn' ? 'ফি অডিটর ও ওভারচার্জ রাডার' : 'Fee Auditor & Overcharge Radar'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 font-black text-[9px] rounded-full">
                    AUDIT
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'ক্যাশ-আউট ফি অডিট, হটস্পট ম্যাপ ও অতিরিক্ত ফি রিপোর্ট' : 'Cash-out fee audit, hotspot map & agent investigations'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Bundle Optimizer (AI Mobile Pack Recommendation) */}
          <button
            onClick={() => setActiveTab('bundle_optimizer')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors bg-blue-50/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-blue-800 text-white flex items-center justify-center text-sm shadow-2xs">
                📶
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-800">
                    {language === 'bn' ? 'বান্ডেল অপ্টিমাইজার' : 'Bundle Optimizer'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 font-black text-[9px] rounded-full">
                    AI SAVER
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'ব্যবহারের ধরনে সবচেয়ে কম খরচের প্যাক ও মেয়াদ সুরক্ষা' : 'AI mobile bundle optimizer & mid-month burnout protection'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Zakat & Giving Assistant with Eid Envelopes */}
          <button
            onClick={() => setActiveTab('zakat_giving')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors bg-teal-50/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center text-sm shadow-2xs">
                🌙
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-800">
                    {language === 'bn' ? 'যাকাত, দান ও ঈদ খাম' : 'Zakat, Giving & Eid Envelopes'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 font-black text-[9px] rounded-full">
                    EID
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'যাকাত হিসাব, ভেরিফাইড চ্যারিটি ও শিশুদের ডিজিটাল সালামি' : 'Zakat calculator, verified charities & child salami wallets'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Dialect-aware Voice Pay */}
          <button
            onClick={() => setActiveTab('dialect_voice')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors bg-blue-50/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center text-sm shadow-2xs">
                🎙️
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-800">
                    {language === 'bn' ? 'আঞ্চলিক ভাষা ভয়েস পে' : 'Dialect Voice Pay'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 font-black text-[9px] rounded-full">
                    VOICE
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'চাটগাঁইয়া, সিলেটি ও নোয়াখাইল্লা ভাষায় ভয়েস পেমেন্ট' : 'Voice payments in Bangla regional dialects with PIN security'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Mandate Wallet (AI-Permissioned Payments) */}
          <button
            onClick={() => setActiveTab('mandate_wallet')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors bg-cyan-50/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-900 text-white flex items-center justify-center text-sm shadow-2xs">
                📜
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-800">
                    {language === 'bn' ? 'ম্যান্ডেট ওয়ালেট' : 'Mandate Wallet'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 font-black text-[9px] rounded-full">
                    AUTO
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'এআই অনুমোদিত স্বয়ংক্রিয় পেমেন্ট ও রুল ইঞ্জিন' : 'AI-permissioned auto payments & strict rule limits'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Payslip Auditor & Wage-Day Orchestrator */}
          <button
            onClick={() => setActiveTab('payslip_orchestrator')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors bg-emerald-50/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center text-sm shadow-2xs">
                👔
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-800">
                    {language === 'bn' ? 'পে-স্লিপ ও ওয়েজ-ডে' : 'Payslip & Wage-Day'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#FFD600] text-slate-950 font-black text-[9px] rounded-full">
                    WAGE
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {language === 'bn' ? 'শ্রমিকদের পে-স্লিপ অডিট ও ভিড়মুক্ত ক্যাশ-আউট' : 'Worker payslip auditor & staggered wage cashout'}
                </span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

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

      {/* Group 3: রিকার্শন পে সাপোর্ট (Recursion Pay Support) */}
      <div className="w-full">
        <div className="bg-[#F2F2F2] px-5 py-2 text-xs font-bold text-slate-500 tracking-wide">
          {language === 'bn' ? 'রিকার্শন পে সাপোর্ট' : 'RECURSION PAY SUPPORT'}
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
                {language === 'bn' ? 'রিকার্শন পে চাকা (লাকি হুইল)' : 'Recursion Pay Wheel'}
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
