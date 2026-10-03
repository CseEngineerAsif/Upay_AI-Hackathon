import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TransactionCategory } from '../../types';
import { OperatorLogo, detectOperator } from '../brand/OperatorConfig';

export const HistoryScreen: React.FC = () => {
  const { transactions, language } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const categories = [
    { id: 'all', labelBn: 'সবগুলো', labelEn: 'All' },
    { id: 'খাবার', labelBn: 'খাবার', labelEn: 'Food' },
    { id: 'ট্রান্সপোর্ট', labelBn: 'ট্রান্সপোর্ট', labelEn: 'Transport' },
    { id: 'বিল', labelBn: 'বিল', labelEn: 'Bills' },
    { id: 'ক্যাশ-আউট', labelBn: 'ক্যাশ-আউট', labelEn: 'Cash Out' },
    { id: 'শপিং', labelBn: 'শপিং', labelEn: 'Shopping' },
    { id: 'অন্যান্য', labelBn: 'অন্যান্য', labelEn: 'Others' }
  ];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.recipientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.note || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || tx.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full flex-1 flex flex-col bg-white overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Top Header matching Upay visual style */}
      <div className="px-5 pt-6 pb-3 border-b border-slate-100 flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#0B4DA2] tracking-tight">
          {language === 'bn' ? 'লেনদেনের হিস্টরি' : 'Transaction History'}
        </h1>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {filteredTransactions.length} টি
        </span>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-2.5">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'নম্বর, নাম বা নোট দিয়ে খুঁজুন (যেমন: রিকশা, কাচ্চি)...'
                : 'Search by phone, name or note...'
            }
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0B4DA2]"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-[#0B4DA2] text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {language === 'bn' ? c.labelBn : c.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="p-4 divide-y divide-slate-100">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            {language === 'bn' ? 'কোনো লেনদেন পাওয়া যায়নি।' : 'No transactions found.'}
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 active:bg-slate-100 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                {(() => {
                  const isRecharge = tx.category === 'বিল' || tx.note?.includes('রিচার্জ') || tx.recipientName?.includes('রিচার্জ') || tx.recipientName?.includes('Recharge');
                  const op = isRecharge ? detectOperator(tx.recipientName || tx.recipient || tx.note) : null;
                  if (op) {
                    return (
                      <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200 shadow-2xs">
                        <OperatorLogo operator={op} size={24} />
                      </div>
                    );
                  }
                  return (
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0B4DA2] flex items-center justify-center font-bold text-xs shrink-0 border border-sky-100">
                      {tx.category === 'খাবার'
                        ? '🍔'
                        : tx.category === 'ট্রান্সপোর্ট'
                        ? '🛺'
                        : tx.category === 'বিল'
                        ? '💡'
                        : tx.category === 'ক্যাশ-আউট'
                        ? '🏧'
                        : tx.category === 'শপিং'
                        ? '🛍️'
                        : '💸'}
                    </div>
                  );
                })()}

                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {tx.recipientName || tx.recipient}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDate(tx.timestamp, language)}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                      {tx.category}
                    </span>
                    {tx.riskLevel === 'high' && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700">
                        সতর্কতা
                      </span>
                    )}
                  </div>
                  {tx.note && (
                    <p className="text-[11px] text-slate-600 italic mt-0.5 line-clamp-1">
                      "{tx.note}"
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-extrabold text-slate-900 block">
                  -{formatCurrency(tx.amount, language)}
                </span>
                {tx.roundUpAmount ? (
                  <span className="text-[10px] text-amber-700 font-bold block">
                    +৳{tx.roundUpAmount} সেভিংস
                  </span>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statement Modal Detail */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
          <div className="w-full max-w-[380px] bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'bn' ? 'লেনদেনের বিস্তারিত স্টেটমেন্ট' : 'Statement Receipt'}
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <p className="text-2xl font-black text-[#0B4DA2]">
                -{formatCurrency(selectedTx.amount, language)}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                TxID: {selectedTx.id}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">প্রাপক:</span>
                <span className="font-bold text-slate-900">{selectedTx.recipientName || 'অপরিচিত'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">নম্বর:</span>
                <span className="font-mono text-slate-700 flex items-center gap-1.5">
                  <OperatorLogo operator={detectOperator(selectedTx.recipientName || selectedTx.recipient || selectedTx.note)} size={18} />
                  <span>{selectedTx.recipient}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ক্যাটাগরি:</span>
                <span className="font-bold text-[#0B4DA2]">{selectedTx.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">নোট:</span>
                <span className="text-slate-800 italic">{selectedTx.note || 'কোনো নোট নেই'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">সময়:</span>
                <span className="text-slate-800">{formatDate(selectedTx.timestamp, language)}</span>
              </div>
              {selectedTx.riskScore ? (
                <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                  <span className="text-slate-500">নিরাপত্তা স্কোর:</span>
                  <span className={selectedTx.riskScore >= 70 ? 'text-rose-600' : 'text-emerald-600'}>
                    {selectedTx.riskScore} / ১০০ ({selectedTx.riskLevel})
                  </span>
                </div>
              ) : null}
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 rounded-xl bg-[#0B4DA2] text-white font-bold text-xs"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
