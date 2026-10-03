import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  PaymentMandate,
  MandateExecutionLog,
  ParsedMandateRule
} from '../../types/mandateWallet';
import {
  getStoredMandates,
  saveStoredMandates,
  getStoredLogs,
  evaluateMandateBill,
  parseInstructionWithAi
} from '../../utils/mandateWalletEngine';

export const MandateWalletScreen: React.FC = () => {
  const { language } = useAppStore();

  const [activeSubTab, setActiveSubTab] = useState<'mandates' | 'create' | 'logs'>('mandates');

  // Stored state
  const [mandates, setMandates] = useState<PaymentMandate[]>([]);
  const [logs, setLogs] = useState<MandateExecutionLog[]>([]);

  // Create Mandate State
  const [instructionText, setInstructionText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isParsingAi, setIsParsingAi] = useState(false);
  const [parsedRule, setParsedRule] = useState<ParsedMandateRule | null>(null);

  // Edit Mandate Modal
  const [editingMandate, setEditingMandate] = useState<PaymentMandate | null>(null);
  const [newMaxLimit, setNewMaxLimit] = useState<number>(0);

  // Bill Simulator Modal
  const [testingMandate, setTestingMandate] = useState<PaymentMandate | null>(null);
  const [simulatedBillAmount, setSimulatedBillAmount] = useState<number>(1400);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setMandates(getStoredMandates());
    setLogs(getStoredLogs());

    // Speech Recognition setup
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInstructionText(transcript);
        handleParseInstruction(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      setToastMsg('আপনার ব্রাউজারে স্পিচ রিকগনিশন নেই। টাইপ করে লিখুন।');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInstructionText('');
      recognitionRef.current.start();
    }
  };

  const handleParseInstruction = async (textToParse: string) => {
    if (!textToParse.trim()) return;
    setIsParsingAi(true);
    try {
      const rule = await parseInstructionWithAi(textToParse);
      setParsedRule(rule);
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsingAi(false);
    }
  };

  const handleConfirmActivateMandate = () => {
    if (!parsedRule) return;

    const newMandate: PaymentMandate = {
      id: `man_${Date.now()}`,
      titleBn: `${parsedRule.billerNameBn} অটো-পে`,
      billerNameBn: parsedRule.billerNameBn,
      billerCategory: parsedRule.billerCategory,
      conditionBn: parsedRule.conditionBn,
      maxAmount: parsedRule.maxAmount,
      frequency: parsedRule.frequency,
      frequencyBn: parsedRule.frequencyBn,
      startDate: parsedRule.startDate,
      status: 'active',
      createdAt: 'এইমাত্র',
      totalExecutions: 0,
      totalPaidAmount: 0
    };

    const updated = [newMandate, ...mandates];
    setMandates(updated);
    saveStoredMandates(updated);

    setParsedRule(null);
    setInstructionText('');
    setActiveSubTab('mandates');
    setToastMsg(`✓ "${newMandate.titleBn}" ম্যান্ডেট সফলভাবে চালু করা হয়েছে!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleTogglePause = (id: string) => {
    const updated = mandates.map((m) => {
      if (m.id === id) {
        const nextStatus = m.status === 'active' ? 'paused' : 'active';
        return { ...m, status: nextStatus as 'active' | 'paused' };
      }
      return m;
    });
    setMandates(updated);
    saveStoredMandates(updated);
    setToastMsg('ম্যান্ডেট স্ট্যাটাস পরিবর্তিত হয়েছে');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDeleteMandate = (id: string) => {
    const updated = mandates.filter((m) => m.id !== id);
    setMandates(updated);
    saveStoredMandates(updated);
    setToastMsg('ম্যান্ডেট মুছে ফেলা হয়েছে');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveEditLimit = () => {
    if (!editingMandate || newMaxLimit <= 0) return;
    const updated = mandates.map((m) => {
      if (m.id === editingMandate.id) {
        return {
          ...m,
          maxAmount: newMaxLimit,
          conditionBn: `বিলের পরিমাণ সর্বোচ্চ ${newMaxLimit.toLocaleString()} টাকা বা তার নিচে হলে`
        };
      }
      return m;
    });
    setMandates(updated);
    saveStoredMandates(updated);
    setEditingMandate(null);
    setToastMsg('সর্বোচ্চ খরচের সীমা সফলভাবে আপডেট হয়েছে!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Run Deterministic Engine Check on simulated incoming bill
  const handleRunSimulatorCheck = () => {
    if (!testingMandate) return;
    try {
      const result = evaluateMandateBill(testingMandate.id, simulatedBillAmount);
      setMandates(getStoredMandates());
      setLogs(getStoredLogs());
      setTestingMandate(null);

      if (result.isAllowed) {
        setToastMsg(`✅ বিল অনুমোদিত ও পরিশোধিত! (${result.reasonBn})`);
      } else {
        setToastMsg(`⛔ বিল ব্লক করা হয়েছে! (${result.reasonBn})`);
      }
      setTimeout(() => setToastMsg(null), 5000);
    } catch (e: any) {
      setToastMsg('ত্রুটি: ' + e.message);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Top Banner */}
      <div className="w-full bg-gradient-to-r from-[#0B4DA2] via-[#08336A] to-[#0B4DA2] text-white px-4 pt-5 pb-5 shadow-md relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-cyan-400/15 blur-xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-[#FFD600]/10 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20">
                📜
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-black tracking-tight text-white">
                    {language === 'bn' ? 'ম্যান্ডেট ওয়ালেট' : 'Mandate Wallet'}
                  </h1>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#FFD600] text-slate-950 text-[9px] font-black uppercase">
                    AI Rules
                  </span>
                </div>
                <p className="text-[11px] text-blue-100 font-medium">
                  {language === 'bn'
                    ? 'এআই অনুমোদিত শর্তযুক্ত স্বয়ংক্রিয় পেমেন্ট ও নির্ধারিত বাজেট সুরক্ষা'
                    : 'AI-Permissioned Auto Payments with Deterministic Rules Engine'}
                </p>
              </div>
            </div>

            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-bold border border-cyan-400/30">
              ০% ঝুঁকি
            </span>
          </div>

          {/* Sub Navigation */}
          <div className="grid grid-cols-3 gap-1 bg-black/25 p-1 rounded-2xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('mandates')}
              className={`py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeSubTab === 'mandates'
                  ? 'bg-white text-[#0B4DA2] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              ম্যান্ডেট তালিকা ({mandates.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('create')}
              className={`py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeSubTab === 'create'
                  ? 'bg-white text-[#0B4DA2] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              + নতুন ম্যান্ডেট
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('logs')}
              className={`py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeSubTab === 'logs'
                  ? 'bg-white text-[#0B4DA2] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              এক্সিকিউশন লগ ({logs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-slate-900 text-white text-xs px-4 py-2.5 text-center font-bold animate-fade-in shadow-xs border-b border-white/15">
          {toastMsg}
        </div>
      )}

      {/* Main Body */}
      <div className="px-4 py-4 space-y-4 text-xs">
        {/* ================= TAB 1: MANDATES LIST ================= */}
        {activeSubTab === 'mandates' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                  সক্রিয় ও স্থগিত ম্যান্ডেটসমূহ
                </h3>
                <p className="text-[10px] text-slate-500">
                  নির্ধারিত সর্বোচ্চ সীমার মধ্যে আসলে বিল স্বয়ংক্রিয় পরিশোধ হয়
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveSubTab('create')}
                className="px-2.5 py-1 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-bold text-[10px] shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                + নিয়ম যোগ করুন
              </button>
            </div>

            {/* Mandates Cards */}
            <div className="space-y-2.5">
              {mandates.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">
                          {m.billerCategory === 'utility'
                            ? '⚡'
                            : m.billerCategory === 'internet'
                            ? '🌐'
                            : '👨‍👩‍👧'}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">{m.titleBn}</h4>
                        <span
                          className={`px-1.5 py-0.2 rounded-full font-bold text-[9px] ${
                            m.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {m.status === 'active' ? 'সক্রিয় ✓' : 'স্থগিত ✕'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        প্রাপক: {m.billerNameBn} • {m.frequencyBn}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-[#0B4DA2] block">
                        সর্বোচ্চ ৳{m.maxAmount.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400">বাজেট সিলিং</span>
                    </div>
                  </div>

                  {/* Condition Display */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                    🔒 <strong>শর্ত:</strong> {m.conditionBn}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePause(m.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer active:scale-95 ${
                          m.status === 'active'
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                        }`}
                      >
                        {m.status === 'active' ? 'স্থগিত করুন' : 'চালু করুন'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingMandate(m);
                          setNewMaxLimit(m.maxAmount);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer active:scale-95"
                      >
                        সীমা এডিট
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMandate(m.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold cursor-pointer active:scale-95"
                      >
                        মুছুন
                      </button>
                    </div>

                    {/* Test Simulator Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setTestingMandate(m);
                        setSimulatedBillAmount(m.maxAmount - 100);
                      }}
                      className="px-3 py-1 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-[10px] cursor-pointer active:scale-95 flex items-center gap-1 shadow-2xs"
                    >
                      <span>বিল টেস্ট</span>
                      <span>🧪</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: CREATE MANDATE (VOICE / TEXT + AI PARSER) ================= */}
        {activeSubTab === 'create' && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div>
                <h3 className="font-black text-slate-900 text-xs">
                  প্রাকৃতিক ভাষায় ম্যান্ডেটের নির্দেশনা দিন
                </h3>
                <p className="text-[10px] text-slate-500">
                  কথা বলুন বা টাইপ করুন—এআই শুধুমাত্র নিয়মটি তৈরি করবে (এআই নিজে কখনোই টাকা কাটে না)।
                </p>
              </div>

              {/* Voice and Text Input Area */}
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={instructionText}
                    onChange={(e) => setInstructionText(e.target.value)}
                    placeholder="যেমন: প্রতি মাসে গ্যাস বিল ১৫০০ টাকার নিচে হলে পরিশোধ করো"
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B4DA2] pr-12"
                  />
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    className={`w-9 h-9 rounded-xl absolute right-2.5 bottom-3 flex items-center justify-center text-base cursor-pointer shadow-xs ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-[#0B4DA2] text-white hover:bg-blue-800'
                    }`}
                    title={isListening ? 'রেকর্ডিং বন্ধ করুন' : 'মাইক্রোফোনে বলুন'}
                  >
                    {isListening ? '⏹️' : '🎙️'}
                  </button>
                </div>

                {/* Sample Presets */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block">
                    কুইক স্যাম্পল নির্দেশনাসমূহ:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      'প্রতি মাসে গ্যাস বিল ১৫০০ টাকার নিচে হলে পরিশোধ করো',
                      'প্রতি মাসের ৫ তারিখে ইন্টারনেটের বিল ১২০০ টাকা পর্যন্ত পরিশোধ করো',
                      'ডেসকো বিদ্যুৎ বিল ২০০০ টাকার মধ্যে হলে অটো পরিশোধ করো',
                      'প্রতি মাসে মাকে ৫০০০ টাকা পাঠাও'
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setInstructionText(sample);
                          handleParseInstruction(sample);
                        }}
                        className="py-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left text-[10px] font-medium text-slate-700 transition-colors cursor-pointer"
                      >
                        "{sample}"
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleParseInstruction(instructionText)}
                  disabled={isParsingAi || !instructionText.trim()}
                  className="w-full py-2.5 rounded-2xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isParsingAi ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>এআই দিয়ে নিয়ম তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>এআই দিয়ে স্ট্রাকচার্ড রুল তৈরি করুন (Parse Rule)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PARSED RULE CONFIRMATION PREVIEW (Core Requirement) */}
            {parsedRule && (
              <div className="p-4 rounded-3xl bg-white border border-blue-200 shadow-md space-y-3 animate-scale-up">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">📋</span>
                    <h4 className="font-black text-slate-900 text-xs">
                      এআই দ্বারা প্রস্তুতকৃত নিয়ম (সক্রিয় করার আগে যাচাই করুন)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                    যাচাইকৃত রুল
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">প্রাপক / বিলার:</span>
                    <span className="font-bold text-slate-900">{parsedRule.billerNameBn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">সর্বোচ্চ অনুমোদিত সীমা:</span>
                    <span className="font-mono font-black text-xs text-[#0B4DA2]">
                      ৳{parsedRule.maxAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">পেমেন্ট ফ্রিকোয়েন্সি:</span>
                    <span className="font-bold text-slate-900">{parsedRule.frequencyBn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">কার্যকর শুরুর দিন:</span>
                    <span className="font-bold text-slate-900">{parsedRule.startDate}</span>
                  </div>
                  <div className="pt-1 border-t border-blue-200 text-slate-700">
                    🔒 <strong>শর্তের বিবরণ:</strong> {parsedRule.conditionBn}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-950 flex items-start gap-1.5">
                  <span className="text-base leading-none">🛡️</span>
                  <p>
                    <strong>ডিটারমিনিস্টিক সুরক্ষা:</strong> এআই শুধুমাত্র নির্দেশনা সাজিয়েছে। ভবিষ্যৎ যেকোনো বিল পেমেন্টের সময় আমাদের কোর রুল ইঞ্জিন গাণিতিকভাবে যাচাই করবে—বিলের পরিমাণ ৳{parsedRule.maxAmount.toLocaleString()} টাকার ১ পয়সাও বেশি হলে কোনো পেমেন্ট কার্যকর হবে না।
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setParsedRule(null)}
                    className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer active:scale-95"
                  >
                    সংশোধন
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmActivateMandate}
                    className="py-2.5 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-xs shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>✓ নিশ্চিত ও সক্রিয় করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: EXECUTION LOGS (PAID & BLOCKED WITH REASON) ================= */}
        {activeSubTab === 'logs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                  ম্যান্ডেট এক্সিকিউশন ও ব্লকিং হিস্ট্রি
                </h3>
                <p className="text-[10px] text-slate-500">
                  শর্ত অনুযায়ী বিল পরিশোধ অথবা সীমা লঙ্ঘনে স্বয়ংক্রিয় ব্লকের রেকর্ড
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-2xl bg-white border shadow-2xs space-y-1.5 ${
                    log.status === 'paid' ? 'border-emerald-200' : 'border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{log.mandateTitleBn}</h4>
                      <span className="text-[9px] text-slate-400 font-mono">{log.executedAt}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-slate-900 block">
                        ৳{log.attemptedAmount.toLocaleString()}
                      </span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                          log.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.statusBn}
                      </span>
                    </div>
                  </div>

                  {/* DETERMINISTIC REASON (Core Requirement) */}
                  <div
                    className={`p-2 rounded-xl text-[11px] font-medium leading-relaxed ${
                      log.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-950'
                        : 'bg-rose-50 text-rose-950'
                    }`}
                  >
                    <strong>কারণ:</strong> {log.reasonBn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EDIT MAX LIMIT MODAL */}
      {editingMandate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 select-none">
          <div className="w-full max-w-[360px] bg-slate-50 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up border border-slate-200">
            <div className="px-5 py-3.5 bg-[#0B4DA2] text-white flex items-center justify-between">
              <h3 className="font-black text-xs text-white">সর্বোচ্চ খরচের সীমা সংশোধন</h3>
              <button
                onClick={() => setEditingMandate(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-800 block text-xs">
                  {editingMandate.titleBn}
                </span>
                <span className="text-[10px] text-slate-500">
                  বর্তমান সীমা: ৳{editingMandate.maxAmount.toLocaleString()}
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">নতুন সর্বোচ্চ সীমা (৳):</label>
                <input
                  type="number"
                  value={newMaxLimit}
                  onChange={(e) => setNewMaxLimit(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveEditLimit}
                className="w-full py-2.5 rounded-xl bg-[#0B4DA2] text-white font-black text-xs shadow-xs active:scale-95 cursor-pointer"
              >
                আপডেট সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BILL SIMULATOR MODAL (Allows user to test within limit vs over limit) */}
      {testingMandate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 select-none">
          <div className="w-full max-w-[380px] bg-slate-50 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up border border-slate-200">
            <div className="px-5 py-3.5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span>🧪</span>
                <h3 className="font-black text-xs text-white">বিল পেমেন্ট সিমুলেটর</h3>
              </div>
              <button
                onClick={() => setTestingMandate(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  পরীক্ষাধীন ম্যান্ডেট:
                </span>
                <h4 className="font-bold text-slate-900 text-xs">{testingMandate.titleBn}</h4>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>অনুমোদিত সর্বোচ্চ সীমা:</span>
                  <span className="font-mono font-bold text-[#0B4DA2]">
                    ৳{testingMandate.maxAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>স্ট্যাটাস:</span>
                  <span className="font-bold text-slate-900">{testingMandate.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  পরীক্ষামূলক আগত বিলের পরিমাণ (৳):
                </label>
                <div className="grid grid-cols-2 gap-2 mb-1">
                  <button
                    type="button"
                    onClick={() => setSimulatedBillAmount(testingMandate.maxAmount - 150)}
                    className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px] cursor-pointer"
                  >
                    সীমার নিচে (৳{testingMandate.maxAmount - 150})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedBillAmount(testingMandate.maxAmount + 350)}
                    className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold text-[10px] cursor-pointer"
                  >
                    সীমা অতিক্রম (৳{testingMandate.maxAmount + 350})
                  </button>
                </div>
                <input
                  type="number"
                  value={simulatedBillAmount}
                  onChange={(e) => setSimulatedBillAmount(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleRunSimulatorCheck}
                className="w-full py-2.5 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>রুল ইঞ্জিন চেক করুন ➔</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
