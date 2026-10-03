import React, { useState } from 'react';

interface UiDesignShowcaseModalProps {
  onClose: () => void;
}

export const UiDesignShowcaseModal: React.FC<UiDesignShowcaseModalProps> = ({ onClose }) => {
  const [selectedDesign, setSelectedDesign] = useState<'glass' | 'ai' | 'minimal'>('glass');

  const designs = [
    {
      id: 'glass' as const,
      titleBn: '১. মডার্ন গ্লাস ও ফিনটেক ড্যাশবোর্ড',
      titleEn: '1. Modern Glass & Clean Dashboard',
      subtitleBn: 'উপায়ের মূল কালার থিম (#0B4DA2 এবং #FFD600) সহ আধুনিক গ্লাস ও কার্ড স্টাইল',
      imageSrc: '/src/assets/images/upay_glass_fintech_1791051563207.jpg',
      badge: 'POPULAR',
      badgeColor: 'bg-blue-600 text-white',
      highlights: [
        'ব্যালেন্স হাইড/শো করার প্রিমিয়াম কার্ড ডিজাইন',
        'অনুভূমিক স্মার্ট ফিচার পিল নেভিগেশন',
        '৪-কলাম সুবিন্যস্ত কোর সার্ভিস গ্রিড',
        'বাংলা ও ইংরেজি স্পষ্ট টাইপোগ্রাফি ও রিয়েল-টাইম হিস্টরি'
      ]
    },
    {
      id: 'ai' as const,
      titleBn: '২. এআই ফাইন্যান্স কো-পাইলট (ডার্ক মোড)',
      titleEn: '2. AI Financial Copilot (Dark Mode)',
      subtitleBn: 'মিডনাইট নেভি ও গ্লোয়িং অ্যাকসেন্টে আধুনিক এআই অ্যানালিটিক্স ও অ্যাসিস্ট্যান্ট',
      imageSrc: '/src/assets/images/upay_ai_copilot_1791051577393.jpg',
      badge: 'AI FUTURISTIC',
      badgeColor: 'bg-purple-600 text-white',
      highlights: [
        'স্মার্ট বাজেট পূর্বাভাস ও ইন্টারঅ্যাক্টিভ গ্রাফ',
        'এআই প্রম্পট সাজেশন ও ভয়েস অ্যাসিস্ট্যান্ট বার',
        'রিস্ক মনিটর ও বায়োমেট্রিক অথেনটিকেশন ফোকাস',
        'টেক-স্যাভি ব্যবহারকারীদের জন্য আধুনিক ডার্ক থিম'
      ]
    },
    {
      id: 'minimal' as const,
      titleBn: '৩. আল্ট্রা-মিনিমালিস্ট ওয়ালেট',
      titleEn: '3. Ultra-Minimalist Wallet',
      subtitleBn: 'খোলামেলা, বড় টাইপোগ্রাফি এবং ওয়ান-ট্যাপ বাংলা কিউআর পেমেন্ট ফোকাস',
      imageSrc: '/src/assets/images/upay_minimal_wallet_1791051589813.jpg',
      badge: 'MINIMAL',
      badgeColor: 'bg-emerald-600 text-white',
      highlights: [
        'বড় ও বোল্ড ফন্টে ব্যালেন্স ডিসপ্লে',
        'দ্রুত টাকা পাঠানোর কনট্যাক্ট ক্যারোসেল',
        'ভাসমান বাংলা কিউআর (Bangla QR) অ্যাকশন বাটন',
        'সহজ ও বিভ্রান্তিমুক্ত ওয়ান-হ্যান্ডেড নেভিগেশন'
      ]
    }
  ];

  const current = designs.find((d) => d.id === selectedDesign) || designs[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in select-none">
      <div className="bg-white w-full max-w-md max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-scale-in">
        {/* Modal Top Header */}
        <div className="bg-[#FFD600] px-4 py-3 flex items-center justify-between border-b border-amber-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <div>
              <h2 className="text-sm font-black text-slate-950">রিকার্শন পে মোবাইল UI ডিজাইন কনসেপ্ট</h2>
              <p className="text-[10px] text-slate-800 font-semibold">ভিজ্যুয়াল প্রোটোটাইপ শোকেস</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-slate-900 font-bold active:scale-95 transition-all cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex gap-1.5 shrink-0">
          {designs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedDesign(item.id)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer truncate ${
                selectedDesign === item.id
                  ? 'bg-white text-[#0B4DA2] shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {item.id === 'glass' ? 'মডার্ন গ্লাস' : item.id === 'ai' ? 'এআই ডার্ক' : 'মিনিমাল'}
            </button>
          ))}
        </div>

        {/* Content Area with Visual Image */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Active Title & Badge */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-900">{current.titleBn}</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{current.subtitleBn}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${current.badgeColor}`}>
              {current.badge}
            </span>
          </div>

          {/* Visual UI Mockup Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-950 flex items-center justify-center group">
            <img
              src={current.imageSrc}
              alt={current.titleBn}
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[460px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>

          {/* Key Feature Highlights */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>✨</span>
              <span>ডিজাইন হাইলাইটস:</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {current.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B4DA2] shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Thumbnail Gallery Row */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 mb-2">অন্যান্য ডিজাইন দেখুন:</p>
            <div className="grid grid-cols-3 gap-2">
              {designs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedDesign(item.id)}
                  className={`flex flex-col items-center p-1 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                    selectedDesign === item.id
                      ? 'border-[#0B4DA2] ring-2 ring-blue-400 bg-blue-50/50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <img
                    src={item.imageSrc}
                    alt={item.titleBn}
                    referrerPolicy="no-referrer"
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <span className="text-[10px] font-bold text-slate-800 mt-1 truncate w-full text-center">
                    {item.id === 'glass' ? 'মডার্ন গ্লাস' : item.id === 'ai' ? 'এআই ডার্ক' : 'মিনিমাল'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500">আপনার মতামত জানান</p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#0B4DA2] hover:bg-blue-800 active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
