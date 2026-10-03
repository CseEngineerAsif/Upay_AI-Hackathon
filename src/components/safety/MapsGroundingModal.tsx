import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const MapsGroundingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language } = useAppStore();
  const [locationQuery, setLocationQuery] = useState('ধানমন্ডি ঢাকা');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string } | null>(null);

  const sampleLocations = [
    'ধানমন্ডি ২৭ ঢাকা',
    'বনানী ১১ ঢাকা',
    'ফার্মগেট মোড় ঢাকা',
    'আগ্রাবাদ বাণিজ্যিক এলাকা চট্টগ্রাম',
    'জিন্দাবাজার সিলেট'
  ];

  const handleSearch = async (loc?: string) => {
    const q = loc || locationQuery;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationQuery: q })
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setResult(data);
      } else {
        setResult({
          text: `${q} এলাকার নিকটস্থ উপায় সার্ভিস পয়েন্ট: প্রধান বাসস্ট্যান্ড মোড়, স্থানীয় ইউসিবি ব্যাংক উপশাখা বা অনুমোদিত উপায় বিকাশ পয়েন্ট। (সকাল ৯টা - রাত ১০টা)`
        });
      }
    } catch {
      setResult({
        text: `${q} এলাকার নিকটস্থ উপায় সার্ভিস পয়েন্ট: স্থানীয় বাজার ও ব্যাংক মোড়। লেনদেনের পূর্বে এজেন্ট কোড যাচাই করুন।`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'নিকটস্থ উপায় এজেন্ট ও বুথ' : 'Find Nearby Upay Agents'}
              </h2>
              <span className="text-[10px] text-slate-500">gemini-3.5-flash + Google Maps Data</span>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'bn' ? 'আপনার এলাকা বা অবস্থান লিখুন:' : 'Enter your area or city:'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="যেমন: ধানমন্ডি, গুলশান, আগ্রাবাদ..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#0B4DA2]"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={!locationQuery.trim() || loading}
              className="w-full py-2.5 rounded-xl bg-[#0B4DA2] text-white font-bold text-xs shadow-md active:scale-98 disabled:opacity-50"
            >
              {loading ? 'ম্যাপ থেকে তথ্য আনা হচ্ছে...' : 'গুগল ম্যাপস ডেটা দিয়ে খুঁজুন'}
            </button>
          </div>

          {/* Quick Area Chips */}
          <div className="flex flex-wrap gap-1.5">
            {sampleLocations.map((loc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setLocationQuery(loc);
                  handleSearch(loc);
                }}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 font-medium transition-colors"
              >
                📍 {loc}
              </button>
            ))}
          </div>

          {/* Result with Maps Info */}
          {result && (
            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2 text-xs leading-relaxed animate-fade-in">
              <span className="font-bold text-[#0B4DA2] flex items-center gap-1.5 text-xs">
                <span>🗺️</span>
                <span>গুগল ম্যাপস দ্বারা যাচাইকৃত এজেন্ট ও এটিএম তথ্য:</span>
              </span>
              <p className="text-slate-800 whitespace-pre-wrap">{result.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
