import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatDate, toBanglaNumber } from '../../utils/formatters';
import { ImpactDashboardModal } from './ImpactDashboardModal';

export const AnalystDashboardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { analystQueue, analystAction, language } = useAppStore();
  const [mainTab, setMainTab] = useState<'queue' | 'impact'>('queue');
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'escalated'>('all');
  const [activeItemNotes, setActiveItemNotes] = useState<{ [id: string]: string }>({});

  if (mainTab === 'impact') {
    return <ImpactDashboardModal onClose={onClose} onSwitchToQueue={() => setMainTab('queue')} />;
  }

  const filteredQueue = analystQueue.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const handleAction = async (queueId: string, action: 'review' | 'dismiss' | 'escalate') => {
    const notes = activeItemNotes[queueId] || '';
    await analystAction(queueId, action, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕵️‍♂️</span>
            <div>
              <h2 className="text-sm font-bold">
                {language === 'bn' ? 'অ্যানালিস্ট ড্যাশবোর্ড' : 'Analyst Dashboard'}
              </h2>
              <span className="text-[10px] text-amber-400">রোল-বেসড কাস্টম ক্লেইম ভিউ</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Primary Tab Switcher: Queue vs Impact */}
        <div className="px-4 py-2 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMainTab('queue')}
              className="px-3 py-1 rounded-full font-bold transition-all bg-[#0B4DA2] text-white shadow-xs cursor-pointer"
            >
              {language === 'bn' ? 'ফ্রড কিউ' : 'Fraud Queue'}
            </button>
            <button
              onClick={() => setMainTab('impact')}
              className="px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1 text-amber-400 hover:text-amber-300 bg-slate-900/80 border border-amber-500/30 cursor-pointer"
            >
              <span>📊</span>
              <span>{language === 'bn' ? 'বিজনেস ইমপ্যাক্ট' : 'Business Impact'}</span>
            </button>
          </div>
          <span className="text-[8.5px] text-amber-400 font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
            SIMULATED (synthetic data)
          </span>
        </div>

        {/* Filter Pills */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {(['all', 'pending', 'reviewed', 'escalated'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-[#0B4DA2] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {status === 'all'
                ? 'সবগুলো'
                : status === 'pending'
                ? 'পেন্ডিং'
                : status === 'reviewed'
                ? 'পর্যালোচিত'
                : 'এসকেলেটেড'}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3.5">
          {filteredQueue.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              {language === 'bn' ? 'এই ফিল্টারে কোনো লেনদেন নেই।' : 'No queue items found.'}
            </div>
          ) : (
            filteredQueue.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5 text-xs shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      {item.userName} ({item.userPhone})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Tx: {item.transactionId} • {formatDate(item.timestamp, language)}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'pending'
                        ? 'bg-rose-100 text-rose-800'
                        : item.status === 'escalated'
                        ? 'bg-purple-100 text-purple-800'
                        : item.status === 'reviewed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Amount & Risk Score */}
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 text-[10px] block">প্রাপক:</span>
                    <span className="font-bold text-slate-800">{item.recipientName}</span>
                    <span className="font-mono text-slate-500 text-[11px] block">{item.recipientPhone}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900 block">
                      {formatCurrency(item.amount, language)}
                    </span>
                    <span className="text-[11px] font-bold text-rose-600">
                      স্কোর: {toBanglaNumber(item.riskScore)}/১০০
                    </span>
                  </div>
                </div>

                {/* Trigger Signals */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    সিগন্যাল ট্রেইস:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.signals.map((sig, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-medium"
                      >
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Feedback or Analyst Notes */}
                {item.analystNotes && (
                  <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-[11px] text-yellow-900">
                    <span className="font-bold block">অ্যানালিস্ট নোট:</span>
                    {item.analystNotes}
                  </div>
                )}

                {/* Note Input */}
                {item.status === 'pending' && (
                  <input
                    type="text"
                    placeholder="অ্যানালিস্ট মন্তব্য লিখুন..."
                    value={activeItemNotes[item.id] || ''}
                    onChange={(e) =>
                      setActiveItemNotes({ ...activeItemNotes, [item.id]: e.target.value })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                  />
                )}

                {/* Action Buttons */}
                {item.status === 'pending' && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => handleAction(item.id, 'dismiss')}
                      className="flex-1 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-100"
                    >
                      বাতিল (Dismiss)
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'review')}
                      className="flex-1 py-1.5 rounded-lg bg-[#0B4DA2] text-white font-bold hover:bg-blue-700"
                    >
                      পর্যালোচনা (Review)
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'escalate')}
                      className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-xs"
                    >
                      এসকেলেট (Escalate)
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
