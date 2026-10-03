import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  IncomeSourceSummary,
  IncomePassportToken
} from '../../types/incomePassport';
import {
  getIncomeSources,
  getPassportTokens,
  revokePassportToken
} from '../../utils/incomePassportManager';
import { GeneratePassportModal } from './GeneratePassportModal';
import { PassportVerificationModal } from './PassportVerificationModal';

export const IncomePassportScreen: React.FC = () => {
  const { language } = useAppStore();
  const [sources, setSources] = useState<IncomeSourceSummary[]>([]);
  const [tokens, setTokens] = useState<IncomePassportToken[]>([]);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedTokenForView, setSelectedTokenForView] = useState<IncomePassportToken | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setSources(getIncomeSources());
    setTokens(getPassportTokens());
  }, []);

  const totalAggregatedMonthly = sources.reduce((acc, curr) => acc + curr.monthlyAverage, 0);

  const handleRevoke = (id: string) => {
    revokePassportToken(id);
    const updated = getPassportTokens();
    setTokens(updated);
    if (selectedTokenForView && selectedTokenForView.id === id) {
      setSelectedTokenForView(updated.find((t) => t.id === id) || null);
    }
    setToastMsg('ইনকাম পাসপোর্টের অনুমতি সফলভাবে প্রত্যাহার করা হয়েছে। কিউআর কোডটি এখন নিষ্ক্রিয়।');
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCreateSuccess = (newToken: IncomePassportToken) => {
    setIsGenerateOpen(false);
    setTokens(getPassportTokens());
    setSelectedTokenForView(newToken);
    setToastMsg('নতুন ডিজিটাল ইনকাম পাসপোর্ট কিউআর সফলভাবে তৈরি হয়েছে!');
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Top Banner */}
      <div className="w-full bg-gradient-to-r from-[#0B4DA2] via-[#09356E] to-[#0B4DA2] text-white px-4 pt-5 pb-5 shadow-md relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-emerald-400/15 blur-xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-[#FFD600]/10 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20">
                🛂
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-black tracking-tight text-white">
                    {language === 'bn' ? 'পোর্টেবল ইনকাম পাসপোর্ট' : 'Portable Income Passport'}
                  </h1>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#FFD600] text-slate-950 text-[9px] font-black uppercase">
                    Zero Statement
                  </span>
                </div>
                <p className="text-[11px] text-blue-100 font-medium">
                  {language === 'bn'
                    ? 'স্টেটমেন্ট ছাড়া আয়ের নির্ভরযোগ্যতা ও নিয়মিততার ডিজিটাল প্রমাণ'
                    : 'Verifiable Income Regularity Proof for Rent & Microloans'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsGenerateOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#FFD600] hover:bg-yellow-400 text-slate-950 font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>+</span>
              <span>পাসপোর্ট তৈরি</span>
            </button>
          </div>

          {/* Privacy Guarantee Pill */}
          <div className="p-2.5 rounded-2xl bg-emerald-950/70 border border-emerald-400/30 text-emerald-200 flex items-center gap-2">
            <span className="text-base">🔒</span>
            <span className="text-[10px] leading-tight text-emerald-100 font-medium">
              আপনার পুরো ব্যাংক স্টেটমেন্ট বা ট্রানজেকশন কাউকে দেখানোর প্রয়োজন নেই। কিউআরে শুধু <strong>আয়ের রেঞ্জ ও নিয়মিততার স্কোর</strong> যাচাই হবে।
            </span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 text-center font-bold animate-fade-in shadow-xs">
          {toastMsg}
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4 text-xs">
        {/* SECTION 1: AGGREGATED DIGITAL INCOME PROOF METRICS */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                একত্রিত নির্ভরযোগ্যতা সূচক (Aggregated Regularity)
              </span>
              <h3 className="font-black text-slate-900 text-sm">
                মাসিক গড় আয়: ৳৮০,০০০ - ৳৯৫,০০০
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-black">
              স্কোর: ৯৬/১০০ (A+)
            </span>
          </div>

          {/* 3 Core Proof Cards */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
              <span className="text-[10px] text-slate-500 block">ধারাবাহিকতা</span>
              <span className="font-black text-slate-900 text-xs">টানা ২৮ মাস</span>
              <span className="text-[8px] text-emerald-600 font-bold block">জিরো ড্রপআউট</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
              <span className="text-[10px] text-slate-500 block">ইনকাম স্থিতিশীলতা</span>
              <span className="font-black text-emerald-700 text-xs">৯৬% স্কোর</span>
              <span className="text-[8px] text-slate-400 font-medium block">অত্যন্ত উচ্চ</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
              <span className="text-[10px] text-slate-500 block">উৎস সংখ্যা</span>
              <span className="font-black text-slate-900 text-xs">৪টি উৎস</span>
              <span className="text-[8px] text-blue-600 font-bold block">মাল্টি-ওয়ালেট</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: AGGREGATE INCOME SOURCES (Tagged: salary, freelance, remittance, business) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">💼</span>
              <div>
                <h4 className="font-black text-slate-900 text-xs">
                  {language === 'bn' ? 'আয়ের উৎস বিশ্লেষণ (Source-Tagged Incomes)' : 'Aggregated Income Sources'}
                </h4>
                <p className="text-[10px] text-slate-500">
                  একাধিক ওয়ালেট থেকে সংগৃহীত মাসিক গড় আয় (মোট ~৳{totalAggregatedMonthly.toLocaleString()})
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-sm shadow-2xs border border-slate-200">
                    {src.icon}
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{src.categoryBn}</h5>
                    <span className="text-[10px] text-slate-500 block">{src.sourceNameBn}</span>
                    <span className="text-[9px] text-slate-400">{src.walletProviderBn}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-xs text-[#0B4DA2] block">
                    ৳{src.monthlyAverage.toLocaleString()}/মাস
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold">
                    {src.percentageOfTotal}% শেয়ার
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: ACTIVE & PAST INCOME PASSPORT TOKENS */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">
              {language === 'bn' ? 'সক্রিয় পাসপোর্ট ও কিউআর তালিকা' : 'Active Passports & QR Codes'}
            </h4>
            <span className="text-[10px] text-slate-500">{tokens.length} টি পাসপোর্ট</span>
          </div>

          {tokens.map((token) => {
            const isRevoked = token.status === 'revoked';

            return (
              <div
                key={token.id}
                className={`p-3.5 rounded-2xl border shadow-2xs space-y-2.5 transition-colors ${
                  isRevoked
                    ? 'bg-slate-100 border-slate-200 opacity-70'
                    : 'bg-white border-slate-200 hover:border-[#0B4DA2]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-xs text-[#0B4DA2]">
                        {token.referenceCode}
                      </span>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                          isRevoked
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isRevoked ? 'প্রত্যাহারকৃত (Revoked)' : 'সক্রিয়'}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs mt-0.5">{token.purposeBn}</h5>
                    <p className="text-[10px] text-slate-500">প্রাপক: {token.recipientEntity}</p>
                  </div>

                  <span className="text-right text-[10px] text-slate-400">
                    মেয়াদ: {token.expiresAt}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-emerald-700 font-bold">
                    রেঞ্জ: {token.averageMonthlyRangeBn}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTokenForView(token)}
                      className="px-3 py-1 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-[11px] shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>কিউআর দেখুন</span>
                      <span>➔</span>
                    </button>

                    {!isRevoked && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(token.id)}
                        className="text-rose-600 font-bold text-[10px] hover:underline cursor-pointer"
                      >
                        প্রত্যাহার
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generate Modal */}
      {isGenerateOpen && (
        <GeneratePassportModal
          onClose={() => setIsGenerateOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Verification / View Modal */}
      {selectedTokenForView && (
        <PassportVerificationModal
          token={selectedTokenForView}
          onClose={() => setSelectedTokenForView(null)}
          onRevoke={handleRevoke}
        />
      )}
    </div>
  );
};
