import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const GuardianInviteModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, guardianAlerts, acknowledgeGuardianAlert, language } = useAppStore();
  const [phone, setPhone] = useState(user?.guardianPhone || '01819234567');
  const [name, setName] = useState(user?.guardianName || 'রেহানা পারভীন (মা)');
  const [relation, setRelation] = useState('মা / পিতা');
  const [activeTab, setActiveTab] = useState<'alerts' | 'manage'>('alerts');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">👨‍👩‍👦</span>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'ট্রাস্টেড অভিভাবক নেটওয়ার্ক' : 'Trusted Guardian Network'}
              </h2>
              <span className="text-[10px] text-slate-500">
                {language === 'bn' ? 'উচ্চ ঝুঁকিপূর্ণ লেনদেনে পরিবারকে সতর্কতা' : 'Family High-Risk Alert Shield'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
              activeTab === 'alerts' ? 'border-[#0B4DA2] text-[#0B4DA2]' : 'border-transparent'
            }`}
          >
            {language === 'bn' ? 'অভিভাবক সতর্কতা ইনবক্স' : 'Guardian Alert Inbox'} ({guardianAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
              activeTab === 'manage' ? 'border-[#0B4DA2] text-[#0B4DA2]' : 'border-transparent'
            }`}
          >
            {language === 'bn' ? 'অভিভাবক সংযোগ' : 'Manage Guardian'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {/* TAB 1: ALERTS INBOX (CROSS-TAB LIVE DEMO) */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-[#0B4DA2] block mb-0.5">
                  🛡️ {language === 'bn' ? 'গোপনীয়তা নীতি রক্ষা:' : 'Privacy Protection Notice:'}
                </span>
                {language === 'bn'
                  ? 'উচ্চ ঝুঁকির লেনদেন হলে অভিভাবক কেবল সতর্কবার্তা ও পরামর্শ দেখতে পাবেন, প্রাপকের ব্যক্তিগত হিসাব নম্বর বা সংবেদনশীল তথ্য কখনোই প্রকাশ করা হয় না।'
                  : 'Guardians only receive high-risk alerts and safety advice. Private recipient details remain concealed.'}
              </div>

              {guardianAlerts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  {language === 'bn' ? 'বর্তমানে কোনো জরুরি অভিভাবক সতর্কতা নেই।' : 'No active guardian alerts.'}
                </div>
              ) : (
                guardianAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-2xl border space-y-2 text-xs transition-all ${
                      alert.status === 'pending'
                        ? 'bg-rose-50/80 border-rose-300'
                        : 'bg-slate-50 border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                        {language === 'bn' ? 'উচ্চ ঝুঁকি লেনদেন সতর্কতা' : 'High-Risk Payment Alert'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDate(alert.timestamp, language)}
                      </span>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-black/5 space-y-1">
                      <p className="font-bold text-slate-800">
                        {alert.wardName} ({alert.wardPhone})
                      </p>
                      <p className="text-slate-600">
                        {language === 'bn' ? 'লেনদেনের পরিমাণ: ' : 'Amount: '}
                        <span className="font-extrabold text-slate-900">
                          {formatCurrency(alert.amount, language)}
                        </span>
                      </p>
                      <p className="text-[11px] text-[#0B4DA2] font-semibold mt-1">
                        💡 {alert.adviceBn}
                      </p>
                    </div>

                    {alert.status === 'pending' ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => acknowledgeGuardianAlert(alert.id)}
                          className="flex-1 py-1.5 rounded-lg bg-[#0B4DA2] text-white font-bold text-xs shadow-xs active:scale-95"
                        >
                          {language === 'bn' ? 'সতর্কতা দেখেছি (স্বীকৃতি)' : 'Acknowledge Alert'}
                        </button>
                        <a
                          href={`tel:${alert.wardPhone}`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1"
                        >
                          📞 {language === 'bn' ? 'সরাসরি কল' : 'Call'}
                        </a>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-semibold block text-right">
                        ✓ {language === 'bn' ? 'স্বীকৃত হয়েছে' : 'Acknowledged'}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: MANAGE GUARDIAN */}
          {activeTab === 'manage' && (
            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'bn' ? 'অভিভাবকের নাম:' : 'Guardian Name:'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'bn' ? 'অভিভাবকের ফোন নম্বর:' : 'Guardian Phone Number:'}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'bn' ? 'সম্পর্ক:' : 'Relationship:'}
                </label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="মা / পিতা">মা / পিতা (Parents)</option>
                  <option value="স্ত্রী / স্বামী">স্ত্রী / স্বামী (Spouse)</option>
                  <option value="ভাই / বোন">ভাই / বোন (Sibling)</option>
                  <option value="সন্তান">সন্তান (Child)</option>
                </select>
              </div>

              {savedSuccess && (
                <p className="text-emerald-600 font-bold text-xs bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  ✓ {language === 'bn' ? 'অভিভাবক সফলভাবে সংযুক্ত হয়েছে!' : 'Guardian linked successfully!'}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0B4DA2] text-white font-bold text-xs shadow-md active:scale-98"
              >
                {language === 'bn' ? 'অভিভাবক তথ্য সংরক্ষণ করুন' : 'Save Guardian Settings'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
