import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, toBanglaNumber } from '../../utils/formatters';

export const GoalPlannerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { goals, addGoal, toggleGoalRoundUp, updateGoalDeposit, language } = useAppStore();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [category, setCategory] = useState('ইমার্জেন্সি ফান্ড');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount || Number(targetAmount) <= 0) return;

    const target = Number(targetAmount);
    const monthlySavings = Math.round(target / durationMonths);

    addGoal({
      title,
      targetAmount: target,
      currentAmount: 0,
      durationMonths,
      monthlySavings,
      roundUpActive: true,
      category
    });

    setIsAdding(false);
    setTitle('');
    setTargetAmount('');
  };

  const handleQuickDeposit = (goalId: string) => {
    updateGoalDeposit(goalId, 500);
  };

  return (
    <div className="fixed sm:absolute inset-0 z-50 flex flex-col bg-white overflow-hidden animate-scale-up">
      {/* Upay Yellow Header matching Image 9 */}
      <div className="w-full bg-[#FFD21F] px-4 py-3.5 flex items-center gap-3.5 shrink-0 shadow-xs z-10">
        <button
          onClick={isAdding ? () => setIsAdding(false) : onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-900 hover:bg-black/10 transition-colors"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          {language === 'bn' ? 'সঞ্চয়' : 'Savings'}
        </h2>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          {/* Top Card: ই-টিন ও সঞ্চয় বিবরণী (matching Image 9) */}
          <div className="w-full p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 7h8M8 11h8M8 15h4" />
                <circle cx="15" cy="15" r="2" fill="#FFD21F" stroke="#B45309" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-bold text-sm text-slate-900 block">
                {language === 'bn' ? 'ই-টিন ও সঞ্চয় বিবরণী' : 'e-TIN & Savings Statement'}
              </span>
              <span className="text-[11px] text-slate-500">
                {language === 'bn' ? 'সার্টিফিকেট ও ট্যাক্স বিবরণী ডাউনলোড করুন' : 'Download tax certificates & statements'}
              </span>
            </div>
            <span className="text-slate-400 font-bold text-base">›</span>
          </div>

          {!isAdding ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              {/* Money Tree Illustration (matching Image 9) */}
              <div className="relative w-52 h-52 flex items-center justify-center my-2">
                <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-md">
                  {/* Pot */}
                  <path d="M85 140 L155 140 L145 185 L95 185 Z" fill="#D97757" />
                  <rect x="80" y="132" width="80" height="12" rx="3" fill="#C25A38" />
                  {/* Trunk and Branches */}
                  <path d="M120 135 L120 100 Q120 70 85 65 Q120 70 120 100 Q120 70 155 65" fill="none" stroke="#8D6E63" strokeWidth="10" strokeLinecap="round" />
                  <path d="M120 90 Q100 80 80 90" fill="none" stroke="#8D6E63" strokeWidth="6" strokeLinecap="round" />
                  <path d="M120 85 Q140 75 160 85" fill="none" stroke="#8D6E63" strokeWidth="6" strokeLinecap="round" />
                  {/* Leaves */}
                  <circle cx="75" cy="65" r="14" fill="#66BB6A" opacity="0.9" />
                  <circle cx="165" cy="65" r="14" fill="#66BB6A" opacity="0.9" />
                  <circle cx="75" cy="95" r="11" fill="#4CAF50" opacity="0.9" />
                  <circle cx="165" cy="95" r="11" fill="#4CAF50" opacity="0.9" />
                  <circle cx="120" cy="55" r="13" fill="#81C784" opacity="0.9" />
                  {/* Coins on Tree */}
                  <circle cx="75" cy="65" r="11" fill="#FFD54F" stroke="#FFB300" strokeWidth="2" />
                  <text x="75" y="70" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#5D4037">৳</text>
                  <circle cx="165" cy="65" r="11" fill="#FFD54F" stroke="#FFB300" strokeWidth="2" />
                  <text x="165" y="70" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#5D4037">৳</text>
                  <circle cx="120" cy="55" r="11" fill="#FFD54F" stroke="#FFB300" strokeWidth="2" />
                  <text x="120" y="60" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#5D4037">৳</text>
                  <circle cx="85" cy="95" r="9" fill="#FFD54F" stroke="#FFB300" strokeWidth="1.5" />
                  <text x="85" y="99" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#5D4037">৳</text>
                  <circle cx="155" cy="95" r="9" fill="#FFD54F" stroke="#FFB300" strokeWidth="1.5" />
                  <text x="155" y="99" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#5D4037">৳</text>
                  {/* Big Growth Arrow */}
                  <path d="M100 135 Q135 125 180 85 L182 98 L195 80 L175 75 L178 87" fill="#81C784" stroke="#4CAF50" strokeWidth="3" strokeLinejoin="round" />
                  {/* Big Gold Coin at bottom */}
                  <circle cx="125" cy="175" r="18" fill="#FFD54F" stroke="#FFA000" strokeWidth="2.5" />
                  <text x="125" y="182" textAnchor="middle" fontSize="17" fontWeight="bold" fill="#5D4037">৳</text>
                  {/* Banknote stacks */}
                  <rect x="145" y="170" width="34" height="10" rx="1.5" fill="#C8E6C9" stroke="#81C784" strokeWidth="1.5" />
                  <rect x="143" y="180" width="38" height="10" rx="1.5" fill="#A5D6A7" stroke="#66BB6A" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Subtitle matching Image 9 */}
              <p className="text-sm font-semibold text-slate-500">
                {language === 'bn' ? 'আপনার ডিপিএস খুলুন মিনিটেই' : 'Open your DPS in minutes'}
              </p>

              {/* Active Goals List */}
              {goals.length > 0 && (
                <div className="w-full text-left space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    {language === 'bn' ? 'চলমান সেভিংস ও ডিপিএস:' : 'Active Savings & DPS:'}
                  </span>
                  {goals.map((g) => {
                    const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                    return (
                      <div key={g.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-900">{g.title}</span>
                          <span className="text-[#0B4DA2] font-extrabold">{pct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-[#FFD21F] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-600">
                          <span>জমা: {formatCurrency(g.currentAmount, language)}</span>
                          <span>লক্ষ্য: {formatCurrency(g.targetAmount, language)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => toggleGoalRoundUp(g.id)}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                              g.roundUpActive ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}
                          >
                            🪙 {g.roundUpActive ? 'রাউন্ড-আপ চালু' : 'রাউন্ড-আপ বন্ধ'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickDeposit(g.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#0B4DA2] text-white font-bold text-[11px] hover:bg-blue-800"
                          >
                            + ৫০০ টাকা জমা দিন
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Open New DPS Form */
            <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-4 animate-fade-in text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">
                  {language === 'bn' ? 'নতুন ডিপিএস / সেভিংস তথ্য' : 'New DPS / Savings Plan'}
                </span>
                <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'bn' ? 'ডিপিএস / সঞ্চয়ের শিরোনাম:' : 'DPS / Goal Title:'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: ৬ মাসে ৩০,০০০ ডিপিএস' : 'e.g. 6-Month DPS Fund'}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0B4DA2]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'bn' ? 'মোট লক্ষ্য (৳):' : 'Target (৳):'}
                  </label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="30000"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:border-[#0B4DA2]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'bn' ? 'সময়কাল:' : 'Duration:'}
                  </label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#0B4DA2]"
                  >
                    <option value={3}>৩ মাস</option>
                    <option value={6}>৬ মাস</option>
                    <option value={12}>১২ মাস</option>
                    <option value={24}>২৪ মাস</option>
                  </select>
                </div>
              </div>

              {targetAmount && Number(targetAmount) > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                  <p className="font-bold">
                    {language === 'bn' ? 'প্রস্তাবিত কিস্তি পরিকল্পনা:' : 'Installment Plan:'}
                  </p>
                  <p>
                    • {language === 'bn' ? 'মাসিক জমা:' : 'Monthly Deposit:'}{' '}
                    <span className="font-extrabold text-[#0B4DA2]">
                      {formatCurrency(Math.round(Number(targetAmount) / durationMonths), language)}
                    </span>
                  </p>
                  <p>
                    • {language === 'bn' ? 'প্রতি লেনদেনের ভাঙতি অটো-সেভ হবে' : 'Spare change auto-saved'}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#1F4FB5] text-white font-bold text-xs shadow-md hover:bg-blue-800 transition-all"
              >
                {language === 'bn' ? 'ডিপিএস শুরু করুন' : 'Start DPS'}
              </button>
            </form>
          )}
        </div>

        {/* Bottom CTA Button matching Image 9 */}
        {!isAdding && (
          <div className="w-full pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="w-full py-3.5 rounded-2xl bg-[#FFD21F] hover:bg-[#FFD600] text-slate-900 font-extrabold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>{language === 'bn' ? 'নতুন ডিপিএস খুলুন' : 'Open New DPS'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
