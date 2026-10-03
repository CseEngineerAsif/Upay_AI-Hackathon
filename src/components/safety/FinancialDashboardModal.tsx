import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, toBanglaNumber } from '../../utils/formatters';

const CATEGORY_COLORS = {
  'খাবার': '#F59E0B',
  'ট্রান্সপোর্ট': '#06B6D4',
  'বিল': '#3B82F6',
  'ক্যাশ-আউট': '#EF4444',
  'শピング': '#8B5CF6',
  'অন্যান্য': '#10B981'
};

export const FinancialDashboardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, transactions, language, goals } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'whatif' | 'actions'>('overview');
  const [forecastHorizon, setForecastHorizon] = useState<7 | 14 | 30>(14);

  // What-If Simulator state
  const [expenseCutPct, setExpenseCutPct] = useState(15);
  const [incomeChangePct, setIncomeChangePct] = useState(0);
  const [extraGoalDeposit, setExtraGoalDeposit] = useState(2000);

  // Active recommendation detail popup
  const [activeExplainAction, setActiveExplainAction] = useState<string | null>(null);

  // Financial aggregates
  const currentBalance = user?.balance || 18450;
  const totalGoalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  // Group transactions by category
  const categoryTotals: { [key: string]: number } = {};
  transactions.forEach((tx) => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  });

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
  }));

  const totalExpense = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const estMonthlyIncome = 38000;
  const prevMonthExpense = Math.round(totalExpense * 1.12); // 12% higher last month

  // Explainable Financial Health Score (out of 100)
  // Components: Savings ratio (40 pts), Cash-out dependency (30 pts), Stability (30 pts)
  const savingsScore = Math.min(40, Math.round((totalGoalSavings / 40000) * 40));
  const cashOutAmount = categoryTotals['ক্যাশ-আউট'] || 0;
  const cashDependencyRatio = totalExpense > 0 ? cashOutAmount / totalExpense : 0;
  const digitalUsageScore = Math.min(30, Math.max(10, Math.round((1 - cashDependencyRatio) * 30)));
  const stabilityScore = 26; // High MFS account tenure & steady flow
  const healthScore = savingsScore + digitalUsageScore + stabilityScore;

  // Safe to spend estimate for the current week
  const safeToSpend = Math.max(0, Math.round((currentBalance - 5000) / 2));

  // Cash-Flow Moving Average Projection (7, 14, 30 days)
  const avgDailySpend = Math.round(totalExpense / 30) || 520;
  const forecastData = Array.from({ length: forecastHorizon }, (_, i) => {
    const day = i + 1;
    // Moving average depletion curve with occasional salary / deposit bump
    const baseline = currentBalance - avgDailySpend * day;
    const projectedBalance = baseline > 0 ? baseline : 500;
    return {
      day: language === 'bn' ? `দিন ${toBanglaNumber(day)}` : `Day ${day}`,
      balance: projectedBalance
    };
  });

  // What-If Projected Curve
  const whatIfData = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const effectiveDailySpend = avgDailySpend * (1 - expenseCutPct / 100);
    const dailyIncomeAdjustment = (estMonthlyIncome * (incomeChangePct / 100)) / 30;
    const balanceBeforeExtraGoal = currentBalance - effectiveDailySpend * day + dailyIncomeAdjustment * day;
    const adjustedBalance = Math.max(0, Math.round(balanceBeforeExtraGoal - (extraGoalDeposit * (day / 30))));
    return {
      day: language === 'bn' ? `দিন ${toBanglaNumber(day)}` : `D${day}`,
      regular: Math.max(0, currentBalance - avgDailySpend * day),
      simulated: adjustedBalance
    };
  });

  const nextBestActions = [
    {
      id: 'cut_food',
      type: 'Reduce',
      badgeBn: 'হ্রাস করুন',
      badgeColor: 'bg-amber-100 text-amber-800',
      titleBn: 'রেস্টুরেন্ট ও ফুড ডেলিভারি খরচ ১৫% কমান',
      titleEn: 'Reduce dining expenses by 15%',
      impactBn: 'মাসিক ৳১,৫০০ টাকা সাশ্রয় সম্ভব',
      whyBn: 'গত মাসে আপনার মোট ব্যয়ের ২৯% হয়েছে বাইরের খাবারে (কাচ্চি, ফুডপান্ডা, ক্যাফে)। এই খাতে কিছুটা সাশ্রয় করলে লক্ষ্য পূরণ ৩ সপ্তাহ দ্রুত হবে।'
    },
    {
      id: 'auto_roundup',
      type: 'Save',
      badgeBn: 'সঞ্চয় বাড়ান',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      titleBn: 'সব বিল পরিশোধে মাইক্রো-সেভিংস রাউন্ড-আপ চালু রাখুন',
      titleEn: 'Keep round-up active on utility bills',
      impactBn: 'অজান্তেই মাসে ৳৪৫০ পর্যন্ত অতিরিক্ত জমা',
      whyBn: 'ভাঙতি টাকার স্বয়ংক্রিয় রূপান্তর আপনার মূল ব্যালেন্সের ওপর চাপ না ফেলে ইমার্জেন্সি ফান্ড গড়ে তুলতে সাহায্য করছে।'
    },
    {
      id: 'cash_dependency',
      type: 'Review',
      badgeBn: 'পর্যালোচনা',
      badgeColor: 'bg-blue-100 text-blue-800',
      titleBn: 'ক্যাশ-আউটের পরিবর্তে মার্চেন্ট কিউআর পেমেন্ট ব্যবহার করুন',
      titleEn: 'Switch from cash-out to Merchant QR',
      impactBn: 'ক্যাশ আউট ফি বাবদ বার্ষিক ৳৮৫০ সাশ্রয়',
      whyBn: 'সুপারশপ ও কেনাকাটায় সরাসরি বাংলা কিউআর দিয়ে পে করলে ক্যাশ-আউট ফি লাগে না এবং ক্যাশব্যাকের সুবিধা পাওয়া যায়।'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'আর্থিক ড্যাশবোর্ড ও পূর্বাভাস' : 'Financial Dashboard & Intelligence'}
              </h2>
              <span className="text-[10px] text-slate-500">সেফ এআই ইনসাইটস ও হেলথ স্কোর</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 px-2 pt-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 text-center border-b-2 transition-all ${
              activeTab === 'overview' ? 'border-[#0B4DA2] text-[#0B4DA2]' : 'border-transparent'
            }`}
          >
            {language === 'bn' ? 'সারসংক্ষেপ' : 'Overview'}
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex-1 py-2 text-center border-b-2 transition-all ${
              activeTab === 'forecast' ? 'border-[#0B4DA2] text-[#0B4DA2]' : 'border-transparent'
            }`}
          >
            {language === 'bn' ? 'ক্যাশ-ফ্লো' : 'Cash Flow'}
          </button>
          <button
            onClick={() => setActiveTab('whatif')}
            className={`flex-1 py-2 text-center border-b-2 transition-all ${
              activeTab === 'whatif' ? 'border-[#0B4DA2] text-[#0B4DA2]' : 'border-transparent'
            }`}
          >
            {language === 'bn' ? 'হোয়াট-ইফ' : 'What-If'}
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-2 text-center border-b-2 transition-all ${
              activeTab === 'actions' ? 'border-[#0B4DA2] text-[#0B4DA2]' : 'border-transparent'
            }`}
          >
            {language === 'bn' ? 'পরামর্শ' : 'Actions'}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Financial Health Score Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0B4DA2] text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-yellow-300">
                      {language === 'bn' ? 'আর্থিক স্বাস্থ্য স্কোর' : 'Financial Health Score'}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-black">{toBanglaNumber(healthScore)}</span>
                      <span className="text-xs text-white/70">/ ১০০ (চমৎকার)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/70 block">
                      {language === 'bn' ? 'নিরাপদ ব্যয় সক্ষমতা' : 'Safe to Spend (This Week)'}
                    </span>
                    <span className="text-sm font-extrabold text-yellow-300">
                      {formatCurrency(safeToSpend, language)}
                    </span>
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15 text-[10px]">
                  <div>
                    <span className="text-white/70 block">{language === 'bn' ? 'সঞ্চয় অনুপাত' : 'Savings'}</span>
                    <span className="font-bold">{toBanglaNumber(savingsScore)}/৪০</span>
                  </div>
                  <div>
                    <span className="text-white/70 block">{language === 'bn' ? 'ডিজিটাল অভ্যাস' : 'Digital Use'}</span>
                    <span className="font-bold">{toBanglaNumber(digitalUsageScore)}/৩০</span>
                  </div>
                  <div>
                    <span className="text-white/70 block">{language === 'bn' ? 'স্থিতিশীলতা' : 'Stability'}</span>
                    <span className="font-bold">{toBanglaNumber(stabilityScore)}/৩০</span>
                  </div>
                </div>
              </div>

              {/* Monthly Spending Comparison */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-800">
                    {language === 'bn' ? 'মাসিক ব্যয়ের পর্যালোচনা' : 'Monthly Spending Review'}
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    📉 {language === 'bn' ? '১২% কম খরচ' : '12% Lower'}
                  </span>
                </div>

                {/* Recharts Pie Chart */}
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        innerRadius={35}
                        paddingAngle={3}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={(CATEGORY_COLORS as any)[entry.name] || '#94A3B8'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => formatCurrency(Number(val), language)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Legend */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 text-[10px]">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: (CATEGORY_COLORS as any)[item.name] || '#94A3B8' }}
                      />
                      <span className="text-slate-700 truncate">{item.name}</span>
                    </div>
                  ))}
                </div>

                {/* Plain Bengali Summary */}
                <p className="mt-3 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                  📢 {language === 'bn'
                    ? `চলতি মাসে খাবারে সর্বাধিক ব্যয় (৳${(categoryTotals['খাবার'] || 0).toLocaleString()}) হয়েছে। তবে গত মাসের (৳${prevMonthExpense.toLocaleString()}) চেয়ে সামগ্রিক ব্যয় ১২% কমেছে, যা প্রশংসনীয়।`
                    : `Food accounted for the highest spending (৳${(categoryTotals['খাবার'] || 0).toLocaleString()}), but overall spending is down 12% compared to last month.`}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CASH-FLOW FORECAST */}
          {activeTab === 'forecast' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">
                      {language === 'bn' ? 'ক্যাশ-ফ্লো পূর্বাভাস (মুভিং এভারেজ)' : 'Cash-Flow Moving Average'}
                    </h3>
                    <span className="text-[10px] text-slate-500">
                      দৈনিক গড় ব্যয়: ৳{avgDailySpend}
                    </span>
                  </div>

                  {/* Horizon Switcher (7, 14, 30 days) */}
                  <div className="flex rounded-lg bg-slate-200 p-0.5 text-[11px] font-bold">
                    {[7, 14, 30].map((h) => (
                      <button
                        key={h}
                        onClick={() => setForecastHorizon(h as any)}
                        className={`px-2 py-0.5 rounded-md transition-all ${
                          forecastHorizon === h ? 'bg-white text-[#0B4DA2] shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {toBanglaNumber(h)} {language === 'bn' ? 'দিন' : 'd'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Line Chart */}
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: any) => formatCurrency(Number(val), language)} />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#0B4DA2"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 leading-tight">
                  ℹ️ {language === 'bn'
                    ? `বর্তমান ব্যয়ের গতি বজায় থাকলে পরবর্তী ${toBanglaNumber(forecastHorizon)} দিনে আপনার অ্যাকাউন্টে পর্যাপ্ত উদ্বৃত্ত থাকবে। কোনো আকস্মিক ঘাটতির ঝুঁকি নেই।`
                    : `Based on your moving average, your balance will remain stable over the next ${forecastHorizon} days.`}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHAT-IF SIMULATOR */}
          {activeTab === 'whatif' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-800">
                  {language === 'bn' ? 'হোয়াট-ইফ দৃশ্যকল্প সিমুলেটর' : 'What-If Balance Scenario Simulator'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === 'bn'
                    ? 'খরচ হ্রাস বা অতিরিক্ত আয়ের স্লাইডার টেনে ব্যালেন্সের পরিবর্তন দেখুন'
                    : 'Slide to simulate expense reduction and see projected balance curve'}
                </p>

                {/* Sliders */}
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>{language === 'bn' ? 'ব্যয় সংকোচন (Expense Cut):' : 'Expense Cut:'}</span>
                      <span className="font-bold text-[#0B4DA2]">{toBanglaNumber(expenseCutPct)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={expenseCutPct}
                      onChange={(e) => setExpenseCutPct(Number(e.target.value))}
                      className="w-full accent-[#0B4DA2] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>{language === 'bn' ? 'অতিরিক্ত আয় পরিবর্তন:' : 'Income Change:'}</span>
                      <span className="font-bold text-emerald-600">+{toBanglaNumber(incomeChangePct)}%</span>
                    </div>
                    <input
                      type="range"
                      min={-10}
                      max={30}
                      value={incomeChangePct}
                      onChange={(e) => setIncomeChangePct(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>{language === 'bn' ? 'মাসিক বাড়তি সেভিংস:' : 'Extra Goal Deposit:'}</span>
                      <span className="font-bold text-amber-600">৳{toBanglaNumber(extraGoalDeposit)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10000}
                      step={500}
                      value={extraGoalDeposit}
                      onChange={(e) => setExtraGoalDeposit(Number(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Simulated Chart */}
                <div className="h-44 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={whatIfData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip formatter={(val: any) => formatCurrency(Number(val), language)} />
                      <Line
                        type="monotone"
                        dataKey="regular"
                        name={language === 'bn' ? 'স্বাভাবিক গতি' : 'Current'}
                        stroke="#94A3B8"
                        strokeDasharray="3 3"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="simulated"
                        name={language === 'bn' ? 'সিমুলেটেড ব্যালেন্স' : 'Projected'}
                        stroke="#10B981"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NEXT-BEST-ACTION CARDS */}
          {activeTab === 'actions' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800">
                {language === 'bn' ? 'পরবর্তী সেরা পদক্ষেপ (Next-Best Actions)' : 'Next-Best Action Recommendations'}
              </h3>

              <div className="space-y-2.5">
                {nextBestActions.map((act) => (
                  <div key={act.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${act.badgeColor}`}>
                        {act.badgeBn}
                      </span>
                      <button
                        onClick={() => setActiveExplainAction(activeExplainAction === act.id ? null : act.id)}
                        className="text-[11px] font-bold text-[#0B4DA2] hover:underline"
                      >
                        {language === 'bn' ? 'কেন এই পরামর্শ?' : 'Why this recommendation?'}
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">
                      {language === 'bn' ? act.titleBn : act.titleEn}
                    </h4>

                    <p className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                      ✨ {act.impactBn}
                    </p>

                    {/* "Why this recommendation?" explanation panel */}
                    {activeExplainAction === act.id && (
                      <div className="mt-2 p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 animate-fade-in">
                        <span className="font-bold text-slate-800 block mb-1">
                          📊 {language === 'bn' ? 'ব্যয় প্যাটার্ন ডেটা বিশ্লেষণ:' : 'Spending Pattern Evidence:'}
                        </span>
                        <p className="text-[11px] leading-relaxed">{act.whyBn}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
