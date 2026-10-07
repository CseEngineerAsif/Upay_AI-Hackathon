import React from 'react';
import { useAppStore } from '../../store/useAppStore';

export const SafeAiHubModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language, setCurrentModal } = useAppStore();

  const features = [
    {
      id: 'voice_conversation',
      titleBn: 'লাইভ ভয়েস কনভারসেশন (Gemini 3.8 Live)',
      titleEn: 'Live Voice Conversation',
      descBn: 'রিয়েলটাইম অডিও স্ট্রিম কথোপকথন — বাংলায় কথা বলে পরামর্শ নিন',
      descEn: 'Real-time two-way voice stream powered by gemini-3.8-live',
      icon: '🎙️',
      color: 'bg-yellow-50 text-amber-700 border-yellow-300',
      action: () => setCurrentModal('voice_conversation')
    },
    {
      id: 'gemini_chatbot',
      titleBn: 'মাল্টি-টার্ন এআই চ্যাটবট (Pro / Flash / Lite)',
      titleEn: 'Multi-Turn Gemini Chatbot',
      descBn: 'হিস্টরি মেমোরি ও কাস্টম রোল সমৃদ্ধ অ্যাডভান্সড চ্যাটবট',
      descEn: 'Multi-turn chat with conversation history and selectable models',
      icon: '🤖',
      color: 'bg-blue-50 text-[#0B4DA2] border-blue-200',
      action: () => setCurrentModal('gemini_chatbot')
    },
    {
      id: 'search_grounding',
      titleBn: 'গুগল সার্চ গ্রাউন্ডিং (লাইভ নিরাপত্তা ডেটা)',
      titleEn: 'Google Search Grounding',
      descBn: 'gemini-3.5-flash ও গুগল সার্চ দিয়ে সর্বশেষ বাংলাদেশ ব্যাংক ও স্ক্যাম তথ্য',
      descEn: 'Up-to-date financial rules and scam alerts via googleSearch tool',
      icon: '🌐',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      action: () => setCurrentModal('search_grounding')
    },
    {
      id: 'maps_grounding',
      titleBn: 'গুগল ম্যাপস গ্রাউন্ডিং (নিকটস্থ এজেন্ট ও বুথ)',
      titleEn: 'Google Maps Grounding',
      descBn: 'gemini-3.5-flash ও গুগল ম্যাপস ডেটা দিয়ে কাছাকাছি রিকার্শন পে এজেন্ট ও এটিএম',
      descEn: 'Locate nearby Recursion Pay cash-out agents and ATMs via googleMaps tool',
      icon: '📍',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      action: () => setCurrentModal('maps_grounding')
    },
    {
      id: 'audio_transcribe',
      titleBn: 'ভয়েস অডিও ট্রান্সক্রিপশন (Gemini 3.5 Transcribe)',
      titleEn: 'Voice Audio Transcription',
      descBn: 'মাইক্রোফোন চেপে মুখে বললে gemini-3.5-transcribe দিয়ে সঠিক বাংলা লেখা',
      descEn: 'Voice-to-text audio transcription using gemini-3.5-transcribe',
      icon: '🗣️',
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      action: () => setCurrentModal('audio_transcribe')
    },
    {
      id: 'pre_tx',
      titleBn: 'প্রাক-লেনদেন নিরাপত্তা পরীক্ষা (Pre-Tx Check)',
      titleEn: 'Pre-Transaction Risk Check',
      descBn: 'টাকা পাঠানোর আগে ০-১০০ রিয়েল-টাইম ফ্রড স্কোর ও এআই সতর্কতা',
      descEn: '0-100 real-time fraud scoring and AI warnings before sending',
      icon: '🛡️',
      color: 'bg-blue-50 text-[#0B4DA2] border-blue-200',
      action: () => setCurrentModal('send_money')
    },
    {
      id: 'scam_checker',
      titleBn: 'স্ক্যাম মেসেজ ও লিংক চেকার',
      titleEn: 'Scam Message & Link Checker',
      descBn: 'সন্দেহজনক SMS বা ওয়েবলিংক পেস্ট করে ঝুঁকি ও কারণ যাচাই করুন',
      descEn: 'Paste suspicious SMS or URL to verify phishing risks',
      icon: '🔍',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      action: () => setCurrentModal('scam_checker')
    },
    {
      id: 'cash_flow',
      titleBn: 'আর্থিক ড্যাশবোর্ড ও ক্যাশ-ফ্লো পূর্বাভাস',
      titleEn: 'Financial Dashboard & Forecast',
      descBn: '৭, ১৪, ৩০ দিনের ব্যালেন্স পূর্বাভাস ও হোয়াট-ইফ সিমুলেটর',
      descEn: '7, 14, 30 day balance forecast and What-If simulator',
      icon: '📊',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      action: () => setCurrentModal('cash_flow')
    },
    {
      id: 'goal_planner',
      titleBn: 'লক্ষ্য প্ল্যানার ও মাইক্রো-সেভিংস রাউন্ড-আপ',
      titleEn: 'Goal Planner & Micro-Savings',
      descBn: '৬ মাসে ৩০,০০০ সেভিংস প্ল্যান এবং কেনাকাটার ভাঙতি স্বয়ংক্রিয় জমা',
      descEn: 'Automated target planning and spare-change round-up',
      icon: '🎯',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      action: () => setCurrentModal('goal_planner')
    },
    {
      id: 'scam_call',
      titleBn: 'স্ক্যাম কল অডিও সিমুলেটর (Bangla TTS)',
      titleEn: 'Scam Call Audio Simulator',
      descBn: 'ভুয়া এজেন্টের ফোন কলের বাস্তবসম্মত অডিও প্রশিক্ষণ ও কি-ওয়ার্ড ডিটেকশন',
      descEn: 'Realistic Bengali voice call simulator with keyword detection',
      icon: '🎙️',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      action: () => setCurrentModal('scam_call')
    },
    {
      id: 'ai_chat',
      titleBn: 'বাংলা ফিন্যান্সিয়াল এআই চ্যাট সহকারী',
      titleEn: 'Bengali AI Financial Chatbot',
      descBn: 'মাসিক খরচ, নিরাপত্তা পরামর্শ ও হিসাব জানতে চ্যাট করুন',
      descEn: 'Chat for monthly expenses, security tips, and financial Q&A',
      icon: '🤖',
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      action: () => setCurrentModal('ai_chat')
    },
    {
      id: 'guardian',
      titleBn: 'ট্রাস্টেড অভিভাবক সংযোগ ও রিয়েলটাইম অ্যালার্ট',
      titleEn: 'Trusted Guardian Network',
      descBn: 'পরিবারের সদস্যকে জরুরি নিরাপত্তা নেটওয়ার্কে যুক্ত করুন',
      descEn: 'Link family members for high-risk payment alerts',
      icon: '👨‍👩‍👦',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      action: () => setCurrentModal('guardian_invite')
    },
    {
      id: 'impact',
      titleBn: 'বিজনেস ও কাস্টমার ইমপ্যাক্ট ড্যাশবোর্ড',
      titleEn: 'Business & Customer Impact Dashboard',
      descBn: 'আর্থিক ক্ষতি প্রতিরোধ, ROI, FPR কার্ভ ও বিভাগভিত্তিক বিশ্লেষণ (SIMULATED)',
      descEn: 'Loss prevented, false-positive cost, ROI & ROC curve metrics',
      icon: '📊',
      color: 'bg-amber-50 text-amber-800 border-amber-300',
      action: () => setCurrentModal('impact_dashboard')
    },
    {
      id: 'analyst',
      titleBn: 'অ্যানালিস্ট ড্যাশবোর্ড (রিস্ক কিউ)',
      titleEn: 'Analyst Queue Dashboard',
      descBn: 'সন্দেহজনক ফ্ল্যাগড ট্রানজাকশন রিভিউ, ডিসমিস বা এসকেলেট',
      descEn: 'Review, dismiss, or escalate suspicious flagged transactions',
      icon: '🕵️‍♂️',
      color: 'bg-slate-100 text-slate-800 border-slate-300',
      action: () => setCurrentModal('analyst_dashboard')
    },
    {
      id: 'admin',
      titleBn: 'মডেল মনিটরিং ও ফেয়ারনেস ভিউ',
      titleEn: 'Model Monitoring & Fairness Audit',
      descBn: 'প্রিসিশন, রিকল, সেভ হওয়া টাকা ও বিভিন্ন জনগোষ্ঠীর মধ্যে সমতা',
      descEn: 'Precision, recall, prevented fraud amount, and demographic parity',
      icon: '📈',
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      action: () => setCurrentModal('admin_monitoring')
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0B4DA2] to-[#1866CD] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <div>
              <h2 className="text-sm font-bold">
                {language === 'bn' ? 'রিকার্শন পে সেফ এআই ইন্টেলিজেন্স হাব' : 'Recursion Pay Safe AI Intelligence Hub'}
              </h2>
              <span className="text-[10px] text-sky-200">
                {language === 'bn' ? 'আর্থিক নিরাপত্তা ও বুদ্ধিমত্তার পূর্ণাঙ্গ স্তর' : 'Next-Gen MFS Safety Suite'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
          >
            ✕
          </button>
        </div>

        {/* Feature List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2.5">
          {features.map((f) => (
            <button
              key={f.id}
              onClick={f.action}
              className="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all flex items-center gap-3.5 group active:scale-98"
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${f.color}`}
              >
                {f.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0B4DA2] transition-colors leading-tight">
                  {language === 'bn' ? f.titleBn : f.titleEn}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {language === 'bn' ? f.descBn : f.descEn}
                </p>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-[#0B4DA2] group-hover:translate-x-0.5 transition-all shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
