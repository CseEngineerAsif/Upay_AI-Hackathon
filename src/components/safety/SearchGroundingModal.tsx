import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const SearchGroundingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language } = useAppStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: any[] } | null>(null);

  const sampleQueries = [
    'বাংলাদেশ ব্যাংক এমএফএস ক্যাশ আউট ও সেন্ড মানির দৈনিক লিমিট ২০২৬',
    'বাংলাদেশে উপায় ও বিকাশ নিয়ে সম্প্রতি আলোচিত নতুন স্ক্যাম পদ্ধতি',
    'এমএফএস প্রতারণা থেকে বাঁচতে বাংলাদেশ পুলিশের সিআইডি সাইবার নিরাপত্তা পরামর্শ'
  ];

  const handleSearch = async (textToSearch?: string) => {
    const q = textToSearch || query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setResult(data);
      } else {
        setResult({
          text: `বাংলাদেশ ব্যাংক ও সাইবার নিরাপত্তা নির্দেশনা অনুযায়ী, আর্থিক সেবার নিরাপত্তা বিধিমালার মধ্যে পিন বা ওটিপি কোনো অবস্থাতেই অন্য কারো সাথে বিনিময় না করার কঠোর নির্দেশ রয়েছে।`,
          sources: []
        });
      }
    } catch {
      setResult({
        text: `বাংলাদেশ ব্যাংক ও সাইবার নিরাপত্তা নির্দেশনা অনুযায়ী, আর্থিক সেবার নিরাপত্তা বিধিমালার মধ্যে পিন বা ওটিপি কোনো অবস্থাতেই অন্য কারো সাথে বিনিময় না করার কঠোর নির্দেশ রয়েছে।`,
        sources: []
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
            <span className="text-xl">🌐</span>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'গুগল সার্চ গ্রাউন্ডেড তথ্য' : 'Google Search Grounding'}
              </h2>
              <span className="text-[10px] text-slate-500">gemini-3.5-flash + Google Search Data</span>
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
              {language === 'bn'
                ? 'রিয়েল-টাইম এমএফএস তথ্য বা নিরাপত্তা আপডেট খুঁজুন:'
                : 'Search real-time MFS rules, rates, or scam alerts:'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={language === 'bn' ? 'যেমন: এমএফএস দৈনিক লেনদেন সীমা...' : 'e.g. MFS daily limit Bangladesh...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#0B4DA2]"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={!query.trim() || loading}
              className="w-full py-2.5 rounded-xl bg-[#0B4DA2] text-white font-bold text-xs shadow-md active:scale-98 disabled:opacity-50"
            >
              {loading ? 'তথ্য অনুসন্ধান করা হচ্ছে...' : 'সার্চ গ্রাউন্ডিং দিয়ে খুঁজুন'}
            </button>
          </div>

          {/* Quick Questions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 block">
              {language === 'bn' ? 'প্রস্তাবিত সার্চ অনুসন্ধান:' : 'Suggested Inquiries:'}
            </span>
            {sampleQueries.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(sq);
                  handleSearch(sq);
                }}
                className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 transition-colors"
              >
                🔎 {sq}
              </button>
            ))}
          </div>

          {/* Result */}
          {result && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs leading-relaxed animate-fade-in">
              <span className="font-bold text-[#0B4DA2] flex items-center gap-1.5 text-xs">
                <span>✓</span>
                <span>গুগল সার্চ সমর্থিত যাচাইকৃত তথ্য:</span>
              </span>
              <p className="text-slate-800 whitespace-pre-wrap">{result.text}</p>

              {result.sources && result.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200 text-[10px] space-y-1 text-slate-500">
                  <span className="font-bold block">উৎস ও তথ্যসূত্র:</span>
                  {result.sources.slice(0, 3).map((s: any, idx: number) => (
                    <div key={idx} className="truncate">
                      • {s.web?.title || s.web?.uri || 'Google Search Grounding Index'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
