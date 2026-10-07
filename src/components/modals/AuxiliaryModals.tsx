import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { BanglaQRButton } from '../brand/UpayIcons';
import { formatCurrency, formatDate } from '../../utils/formatters';

// 1. BANGLA QR SCANNER MODAL
export const BanglaQrScanModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language, setCurrentModal } = useAppStore();

  const handleScanSample = (name: string, phone: string, amount: number) => {
    onClose();
    // Launch payment flow with prefilled data
    setCurrentModal('send_money');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-slate-900 text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📷</span>
            <h2 className="text-sm font-bold">
              {language === 'bn' ? 'বাংলা কিউআর স্ক্যান করুন' : 'Scan Bangla QR'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Viewfinder simulation */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-60 h-60 rounded-3xl border-2 border-dashed border-[#FFD600] flex items-center justify-center bg-black/40 overflow-hidden">
            <div className="absolute inset-x-0 h-1 bg-[#FFD600] shadow-[0_0_8px_#FFD600] animate-[bounce_2s_infinite]" />
            <BanglaQRButton />
          </div>
          <p className="text-xs text-slate-400 text-center">
            {language === 'bn'
              ? 'যেকোনো মার্চেন্ট বা দোকানের বাংলা কিউআর কোডের সামনে ক্যামেরা ধরুন'
              : 'Point your camera at any Bangla QR merchant code'}
          </p>

          {/* Quick Demo Scan Buttons */}
          <div className="w-full space-y-2 pt-2">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">
              {language === 'bn' ? 'বা ডেমো মার্চেন্ট কিউআর ট্যাপ করুন:' : 'Or tap a demo merchant:'}
            </span>
            <button
              onClick={() => handleScanSample('স্বপ্ন সুপারশপ', '01777889900', 850)}
              className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-white block">🛒 স্বপ্ন সুপারশপ (বনানী ব্রাঞ্চ)</span>
                <span className="text-[10px] text-slate-400">মার্চেন্ট কোড: 01777889900</span>
              </div>
              <span className="text-xs font-bold text-yellow-400">ট্যাপ স্ক্যান</span>
            </button>
            <button
              onClick={() => handleScanSample('কাচ্চি ভাই', '01912987654', 620)}
              className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-white block">🍛 কাচ্চি ভাই রেস্টুরেন্ট</span>
                <span className="text-[10px] text-slate-400">মার্চেন্ট কোড: 01912987654</span>
              </div>
              <span className="text-xs font-bold text-yellow-400">ট্যাপ স্ক্যান</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. CHANGE PIN MODAL
export const ChangePinModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language, changePin } = useAppStore();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', isError: false });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      setMsg({ text: 'নতুন পিন অবশ্যই ৪ ডিজিট হতে হবে', isError: true });
      return;
    }
    if (newPin !== confirmPin) {
      setMsg({ text: 'নতুন পিন দুটি মেলেনি', isError: true });
      return;
    }

    setIsSaving(true);
    const res = await changePin(oldPin, newPin);
    setIsSaving(false);

    if (!res.success) {
      setMsg({ text: res.error || 'বর্তমান পিন সঠিক নয়', isError: true });
      return;
    }

    setMsg({ text: 'পিন সফলভাবে সার্ভার-সাইড scrypt হ্যাশে আপডেট হয়েছে!', isError: false });
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[380px] bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800">
            {language === 'bn' ? 'পিন পরিবর্তন করুন' : 'Change 4-Digit PIN'}
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {language === 'bn' ? 'বর্তমান ৪ ডিজিটের পিন:' : 'Current 4-Digit PIN:'}
            </label>
            <input
              type="password"
              maxLength={4}
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-center font-mono text-base tracking-widest"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">নতুন ৪ ডিজিটের পিন:</label>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-center font-mono text-base tracking-widest"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">নতুন পিন পুনরায় নিশ্চিত করুন:</label>
            <input
              type="password"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-center font-mono text-base tracking-widest"
              required
            />
          </div>

          {msg.text && (
            <p className={`p-2 rounded-lg font-bold text-xs ${msg.isError ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {msg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 rounded-xl bg-[#0B4DA2] text-white font-bold text-xs shadow-md disabled:opacity-60"
          >
            {isSaving ? (language === 'bn' ? 'যাচাই হচ্ছে...' : 'Verifying...') : 'পিন আপডেট করুন'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 3. AI CONSENT & PERMISSIONS MODAL
export const PermissionsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, language, grantAiConsent } = useAppStore();
  const [consentActive, setConsentActive] = useState(user?.aiConsentGiven ?? true);

  const handleToggle = () => {
    setConsentActive(!consentActive);
    grantAiConsent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[390px] bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800">
            {language === 'bn' ? 'অনুমতি ও এআই সম্মতি' : 'Permissions & AI Consent'}
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                {language === 'bn' ? 'সেফ এআই সুরক্ষা সম্মতি (AI Safety Consent)' : 'Safe AI Data Consent'}
              </span>
              <input
                type="checkbox"
                checked={consentActive}
                onChange={handleToggle}
                className="w-5 h-5 accent-[#0B4DA2]"
              />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {language === 'bn'
                ? 'লেনদেন বিশ্লেষণের সময় প্রাপকের ফোন নম্বর ও নাম মাস্ক করা থাকে এবং কোনো পিন কখনো এআই বা ক্লাউডে পাঠানো হয় না।'
                : 'All risk signals are strictly anonymized. PINs are never transmitted.'}
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span>বায়োমেট্রিক সেন্সর (ফিঙ্গারপ্রিন্ট):</span>
              <span className="font-bold text-emerald-600">অনুমোদিত</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span>নোটিফিকেশন ও জরুরি অ্যালার্ট:</span>
              <span className="font-bold text-emerald-600">অনুমোদিত</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span>ক্যামেরা (বাংলা কিউআর):</span>
              <span className="font-bold text-emerald-600">অনুমোদিত</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#0B4DA2] text-white font-bold text-xs"
          >
            সংরক্ষণ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. NOTIFICATIONS MODAL
export const NotificationsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language, guardianAlerts } = useAppStore();

  const notifications = [
    {
      id: 'notif_1',
      title: 'রিকার্শন পে সেফ এআই সুরক্ষা সক্রিয় আছে',
      time: 'আজ, দুপুর ১২:৩০',
      desc: 'আপনার অ্যাকাউন্টে কোনো সন্দেহজনক লেনদেন ঘটলে তা স্বয়ংক্রিয়ভাবে সতর্ক করা হবে।'
    },
    {
      id: 'notif_2',
      title: 'রবি ক্যাশব্যাক অফার চালু হয়েছে!',
      time: 'গতকাল, সন্ধ্যা ৭:৪৫',
      desc: '৭০ জিবি ও ১০০ জিবি রিচার্জে ৫০ থেকে ৭৫ টাকা তাৎক্ষণিক ক্যাশব্যাক।'
    },
    {
      id: 'notif_3',
      title: 'মাসিক সঞ্চয় লক্ষ্য সফল',
      time: '৩ দিন আগে',
      desc: 'আপনার "৬ মাসে ৩০,০০০" ইমার্জেন্সি ফান্ডে গত সপ্তাহে অতিরিক্ত ৫০০ টাকা জমা হয়েছে।'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[400px] bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span>🔔</span>
            <span>{language === 'bn' ? 'নোটিফিকেশন ও নোটিশ' : 'Notifications'}</span>
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 text-xs">
          {notifications.map((n) => (
            <div key={n.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-900 leading-tight">{n.title}</h4>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.time}</span>
              </div>
              <p className="text-[11px] text-slate-600">{n.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
