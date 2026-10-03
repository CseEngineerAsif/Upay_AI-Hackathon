import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ScamCheckResult } from '../../types';
import { toBanglaNumber } from '../../utils/formatters';
import { analyzeScamMessage } from '../../../functions/scamChecker';

export const ScamCheckerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language } = useAppStore();
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScamCheckResult | null>(null);

  const sampleMessages = [
    {
      titleBn: 'লটারি ও পুরস্কার স্ক্যাম',
      titleEn: 'Lottery Scam',
      text: 'অভিনন্দন! আপনি রিকার্শন পে লটারিতে ২৫ লাখ টাকা জিতেছেন। পুরস্কারের টাকা পেতে এখনই রেজিস্ট্রেশন ফি ৫০০ টাকা এই নম্বরে পাঠান এবং পিন কোড যাচাই করুন।'
    },
    {
      titleBn: 'অ্যাকাউন্ট ব্লক ভীতি',
      titleEn: 'Account Freeze Scam',
      text: 'জরুরি নোটিশ: আপনার রিকার্শন পে অ্যাকাউন্ট সাময়িক স্থগিত করা হয়েছে। ২৪ ঘণ্টার মধ্যে আনব্লক করতে লিংকে ক্লিক করে পিন দিন: http://recursionpay-verify-bd.xyz/login'
    },
    {
      titleBn: 'নিরাপদ অফিশিয়াল নোটিফিকেশন',
      titleEn: 'Legitimate SMS',
      text: 'আপনার রিকার্শন পে অ্যাকাউন্টে ৫০০ টাকা সফলভাবে যোগ হয়েছে। বর্তমান ব্যালেন্স ১৮,৪৫০ টাকা। লেনদেন আইডি: REC998124।'
    }
  ];

  const handleCheck = async (textToCheck?: string) => {
    const text = textToCheck || inputText;
    if (!text.trim()) return;

    setIsAnalyzing(true);
    let checkResult: ScamCheckResult | null = null;
    try {
      const res = await fetch('/api/safety/scam-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        checkResult = await res.json();
      }
    } catch (err) {
      console.warn('API scam-check failed, running client analyzer', err);
    }

    if (!checkResult) {
      checkResult = analyzeScamMessage(text);
    }

    setResult(checkResult);
    setIsAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'স্ক্যাম ও ফিশিং মেসেজ চেকার' : 'Scam Message & Link Checker'}
              </h2>
              <span className="text-[10px] text-slate-500">TF-IDF ও প্যাটার্ন অ্যানালাইজার</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {language === 'bn'
                ? 'সন্দেহজনক SMS, বার্তা বা ওয়েবলিংক পেস্ট করুন:'
                : 'Paste suspicious SMS, message or web link:'}
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'যেমন: "আপনি লটারি জিতেছেন, এই লিংকে গিয়ে পিন দিন..."'
                  : 'e.g. "You won lottery, click link and enter PIN..."'
              }
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0B4DA2] text-slate-800"
            />

            <button
              onClick={() => handleCheck()}
              disabled={!inputText.trim() || isAnalyzing}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#0B4DA2] text-white font-bold text-xs shadow-md active:scale-98 disabled:opacity-50 hover:bg-blue-700 transition-all"
            >
              {isAnalyzing
                ? (language === 'bn' ? 'পরীক্ষা করা হচ্ছে...' : 'Analyzing...')
                : (language === 'bn' ? 'বার্তাটি পরীক্ষা করুন' : 'Analyze Message')}
            </button>
          </div>

          {/* Quick Samples */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
              {language === 'bn' ? 'বা ডেমো নমুনা মেসেজে ক্লিক করুন:' : 'Or tap a demo sample message:'}
            </span>
            <div className="space-y-1.5">
              {sampleMessages.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(sample.text);
                    handleCheck(sample.text);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-xs"
                >
                  <span className="font-bold text-slate-800 block text-[11px]">
                    {language === 'bn' ? sample.titleBn : sample.titleEn}
                  </span>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {sample.text}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Result */}
          {result && (
            <div
              className={`p-4 rounded-2xl border space-y-2.5 animate-fade-in ${
                result.riskLevel === 'danger'
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : result.riskLevel === 'suspicious'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider">
                  {language === 'bn' ? result.verdictBn : result.verdictEn}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/80 shadow-2xs">
                  স্কোর: {toBanglaNumber(result.riskScore)}/১০০
                </span>
              </div>

              <p className="text-xs font-medium leading-relaxed bg-white/70 p-2.5 rounded-xl border border-black/5">
                {result.explanationBn}
              </p>

              {/* Detected Triggers */}
              {result.detectedTriggers.length > 0 && (
                <div className="text-xs space-y-1">
                  <span className="font-bold block text-slate-800">
                    {language === 'bn' ? 'শনাক্তকরণ কারণসমূহ:' : 'Detection Reasons:'}
                  </span>
                  {result.detectedTriggers.map((trig, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                      <span>⚠️</span>
                      <span>{trig}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended Action */}
              <div className="p-2.5 rounded-xl bg-white border border-black/5 text-xs text-[#0B4DA2]">
                <span className="font-bold block mb-0.5">
                  🛡️ {language === 'bn' ? 'করণীয়:' : 'Recommended Action:'}
                </span>
                <span className="text-[11px] font-medium leading-tight">
                  {result.recommendedActionBn}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
